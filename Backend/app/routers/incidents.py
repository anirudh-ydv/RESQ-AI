from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from app.database import get_db
from app.models import Incident, Zone, Resource, Prediction, IncidentType, IncidentStatus, PriorityLevel, ResourceType, ResourceStatus
from app.schemas import (
    IncidentCreate, IncidentUpdate, IncidentResponse,
    ZoneCreate, ZoneUpdate, ZoneResponse,
    ResourceCreate, ResourceUpdate, ResourceResponse,
    PredictionCreate, PredictionResponse,
    DashboardStats, SOSReport, SOSResponse,
    AISummaryRequest, AISummaryResponse,
    PredictiveRiskRequest, PredictiveRiskResponse,
    BatchSummaryRequest
)
from app.ai_engine import RescuePriorityEngine, MultilingualSummarizer, PredictiveRiskEngine
from datetime import datetime


router = APIRouter(prefix="/api", tags=["incidents"])


@router.get("/incidents", response_model=List[IncidentResponse])
async def get_incidents(
    status: Optional[IncidentStatus] = None,
    priority: Optional[PriorityLevel] = None,
    type: Optional[IncidentType] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    query = select(Incident).order_by(desc(Incident.created_at))
    if status:
        query = query.where(Incident.status == status)
    if priority:
        query = query.where(Incident.priority == priority)
    if type:
        query = query.where(Incident.type == type)
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.post("/incidents", response_model=IncidentResponse, status_code=201)
async def create_incident(incident: IncidentCreate, db: AsyncSession = Depends(get_db)):
    priority = RescuePriorityEngine.calculate_priority(
        incident.severity, incident.keywords or [], 1
    )

    summary_en, summary_native = MultilingualSummarizer.generate_summary(
        incident.type, incident.address or "Unknown", incident.severity,
        incident.keywords or [], incident.language or "en"
    )
    translated = MultilingualSummarizer.translate_to_english(
        incident.description or "", incident.language or "en"
    ) if incident.language != "en" else incident.description

    db_incident = Incident(
        incident_id=f"INC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        priority=priority,
        ai_summary=summary_en,
        translated_text=translated,
        **incident.model_dump()
    )
    db.add(db_incident)
    await db.commit()
    await db.refresh(db_incident)
    return db_incident


@router.patch("/incidents/{incident_id}", response_model=IncidentResponse)
async def update_incident(incident_id: int, update: IncidentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)

    if update.status == IncidentStatus.RESOLVED:
        incident.resolved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(incident)
    return incident


@router.delete("/incidents/{incident_id}")
async def delete_incident(incident_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    await db.delete(incident)
    await db.commit()
    return {"message": "Incident deleted"}


@router.post("/incidents/{incident_id}/summary", response_model=AISummaryResponse)
async def generate_summary(incident_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    summary_en, summary_native = MultilingualSummarizer.generate_summary(
        incident.type, incident.address or "Unknown", incident.severity,
        incident.keywords or [], incident.language or "en"
    )
    incident.ai_summary = summary_en
    incident.translated_text = summary_native
    await db.commit()

    return AISummaryResponse(
        incident_id=incident.id,
        summary=summary_en,
        translated_text=summary_native,
        priority=incident.priority,
        keywords=incident.keywords or []
    )


@router.post("/sos", response_model=SOSResponse)
async def submit_sos(report: SOSReport, db: AsyncSession = Depends(get_db)):
    keywords = ["help", "emergency", "trapped", "urgent", "sos"]
    severity = 8
    priority = RescuePriorityEngine.calculate_priority(severity, keywords, 1)

    inc_type = IncidentType.FLOOD
    if "fire" in report.text.lower() or "burning" in report.text.lower():
        inc_type = IncidentType.FIRE
    elif "earthquake" in report.text.lower() or "shaking" in report.text.lower():
        inc_type = IncidentType.EARTHQUAKE
    elif "landslide" in report.text.lower() or "mudslide" in report.text.lower():
        inc_type = IncidentType.LANDSLIDE

    summary_en, summary_native = MultilingualSummarizer.generate_summary(
        inc_type, f"SOS Location {report.latitude},{report.longitude}", severity, keywords, report.language
    )
    translated = MultilingualSummarizer.translate_to_english(report.text, report.language) if report.language != "en" else report.text

    incident = Incident(
        incident_id=f"SOS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        type=inc_type,
        title=f"Citizen SOS - {inc_type.value.title()}",
        description=report.text,
        latitude=report.latitude,
        longitude=report.longitude,
        severity=severity,
        priority=priority,
        language=report.language,
        keywords=keywords,
        ai_summary=summary_en,
        translated_text=translated,
        reported_by=report.contact or "anonymous"
    )
    db.add(incident)
    await db.commit()
    await db.refresh(incident)

    return SOSResponse(
        incident_id=incident.incident_id,
        message="SOS received. Rescue team dispatched.",
        priority=priority,
        estimated_response_time="5-15 minutes"
    )


@router.post("/summary")
async def generate_batch_summary(request: BatchSummaryRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id.in_(request.incident_ids)))
    incidents = result.scalars().all()
    if not incidents:
        raise HTTPException(status_code=404, detail="No incidents found")

    high = sum(1 for i in incidents if i.priority == PriorityLevel.HIGH)
    medium = sum(1 for i in incidents if i.priority == PriorityLevel.MEDIUM)
    low = sum(1 for i in incidents if i.priority == PriorityLevel.LOW)

    return {
        "id": f"SITREP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "generated_at": datetime.utcnow().isoformat(),
        "incidents_covered": len(incidents),
        "high_priority": high,
        "medium_priority": medium,
        "low_priority": low,
        "resources_deployed": 0,
        "zones_affected": len({i.zone_id for i in incidents if i.zone_id}),
        "executive_summary": f"Situation report covering {len(incidents)} incidents. {high} high-priority incidents require immediate attention.",
        "detailed_sections": {
            "situation_overview": " ".join(i.ai_summary or "" for i in incidents if i.priority == PriorityLevel.HIGH),
            "resource_status": "Resource data pending integration.",
            "predictive_outlook": "See /api/predictive-risk for zone-level forecasts.",
            "recommendations": [
                "Prioritize high-severity incidents for immediate resource deployment.",
                "Monitor medium-priority incidents for escalation."
            ]
        }
    }