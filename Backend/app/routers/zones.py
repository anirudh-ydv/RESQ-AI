from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from app.database import get_db
from app.models import Zone, ZoneType, Prediction, IncidentType, PriorityLevel
from app.schemas import ZoneCreate, ZoneUpdate, ZoneResponse, PredictionResponse, PredictiveRiskRequest, PredictiveRiskResponse
from app.ai_engine import PredictiveRiskEngine
from datetime import datetime, timedelta


router = APIRouter(prefix="/api", tags=["zones"])


@router.get("/zones", response_model=List[ZoneResponse])
async def get_zones(
    type: Optional[ZoneType] = None,
    active_only: bool = True,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    query = select(Zone).order_by(desc(Zone.risk_score))
    if type:
        query = query.where(Zone.type == type)
    if active_only:
        query = query.where(Zone.is_active == True)
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/zones/{zone_id}", response_model=ZoneResponse)
async def get_zone(zone_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Zone).where(Zone.id == zone_id))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@router.post("/zones", response_model=ZoneResponse, status_code=201)
async def create_zone(zone: ZoneCreate, db: AsyncSession = Depends(get_db)):
    from app.ai_engine import PredictiveRiskEngine
    weather = PredictiveRiskEngine.generate_mock_weather(zone.type)
    risk_score = PredictiveRiskEngine.analyze_risk(zone.type, 0, weather, 24)
    initial_risk = max([p["probability"] for p in risk_score], default=0.1)

    db_zone = Zone(
        risk_score=initial_risk,
        weather_data=weather,
        **zone.model_dump()
    )
    db.add(db_zone)
    await db.commit()
    await db.refresh(db_zone)
    return db_zone


@router.patch("/zones/{zone_id}", response_model=ZoneResponse)
async def update_zone(zone_id: int, update: ZoneUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Zone).where(Zone.id == zone_id))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)

    await db.commit()
    await db.refresh(zone)
    return zone


@router.delete("/zones/{zone_id}")
async def delete_zone(zone_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Zone).where(Zone.id == zone_id))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    await db.delete(zone)
    await db.commit()
    return {"message": "Zone deleted"}


@router.post("/predictive-risk", response_model=PredictiveRiskResponse)
async def get_predictive_risk(request: PredictiveRiskRequest, db: AsyncSession = Depends(get_db)):
    if request.zone_id:
        result = await db.execute(select(Zone).where(Zone.id == request.zone_id))
        zone = result.scalar_one_or_none()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        zones = [zone]
    elif request.latitude and request.longitude:
        result = await db.execute(select(Zone))
        all_zones = result.scalars().all()
        zones = []
        for z in all_zones:
            dist = ((z.latitude - request.latitude) ** 2 + (z.longitude - request.longitude) ** 2) ** 0.5
            if dist * 111 <= request.radius_km:
                zones.append(z)
    else:
        result = await db.execute(select(Zone).where(Zone.is_active == True))
        zones = result.scalars().all()

    all_predictions = []
    overall_risk = 0.0

    for zone in zones:
        weather = zone.weather_data or PredictiveRiskEngine.generate_mock_weather(zone.type)
        predictions_data = PredictiveRiskEngine.analyze_risk(zone.type, zone.historical_incidents, weather, 24)

        for p_data in predictions_data:
            if request.incident_types and p_data["incident_type"] not in request.incident_types:
                continue

            prediction = Prediction(
                prediction_id=f"PRED-{zone.zone_id}-{p_data['incident_type'].value}-{datetime.utcnow().strftime('%H%M')}",
                zone_id=zone.id,
                expires_at=datetime.utcnow() + timedelta(hours=24),
                **p_data
            )
            db.add(prediction)
            all_predictions.append(prediction)

        if predictions_data:
            zone_risk = max(p["probability"] for p in predictions_data)
            overall_risk = max(overall_risk, zone_risk)

    await db.commit()

    for p in all_predictions:
        await db.refresh(p)

    risk_factors = {
        "weather_severity": "high" if overall_risk > 0.7 else "moderate" if overall_risk > 0.4 else "low",
        "historical_activity": "high" if any(z.historical_incidents > 10 for z in zones) else "moderate",
        "population_density": "high" if any(z.population > 1000000 for z in zones) else "moderate",
        "infrastructure_vulnerability": "assessing"
    }

    return PredictiveRiskResponse(
        zone_id=zones[0].id if zones else 0,
        zone_name=zones[0].name if zones else "Unknown",
        predictions=all_predictions,
        overall_risk_score=overall_risk,
        risk_factors=risk_factors
    )


@router.get("/zones/{zone_id}/predictions", response_model=List[PredictionResponse])
async def get_zone_predictions(zone_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Zone).where(Zone.id == zone_id))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    result = await db.execute(
        select(Prediction).where(Prediction.zone_id == zone_id).order_by(desc(Prediction.created_at))
    )
    return result.scalars().all()