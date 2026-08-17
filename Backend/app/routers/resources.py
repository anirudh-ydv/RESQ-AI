from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from app.database import get_db
from app.models import Resource, ResourceType, ResourceStatus, Incident
from app.schemas import ResourceCreate, ResourceUpdate, ResourceResponse
from datetime import datetime


router = APIRouter(prefix="/api", tags=["resources"])


@router.get("/resources", response_model=List[ResourceResponse])
async def get_resources(
    type: Optional[ResourceType] = None,
    status: Optional[ResourceStatus] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    query = select(Resource).order_by(desc(Resource.created_at))
    if type:
        query = query.where(Resource.type == type)
    if status:
        query = query.where(Resource.status == status)
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/resources/{resource_id}", response_model=ResourceResponse)
async def get_resource(resource_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.post("/resources", response_model=ResourceResponse, status_code=201)
async def create_resource(resource: ResourceCreate, db: AsyncSession = Depends(get_db)):
    db_resource = Resource(
        resource_id=f"RES-{resource.type.value.upper()}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        **resource.model_dump()
    )
    db.add(db_resource)
    await db.commit()
    await db.refresh(db_resource)
    return db_resource


@router.patch("/resources/{resource_id}", response_model=ResourceResponse)
async def update_resource(resource_id: int, update: ResourceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(resource, field, value)

    await db.commit()
    await db.refresh(resource)
    return resource


@router.post("/resources/{resource_id}/deploy/{incident_id}")
async def deploy_resource(resource_id: int, incident_id: int, db: AsyncSession = Depends(get_db)):
    resource_result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = resource_result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    incident_result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = incident_result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    resource.status = ResourceStatus.EN_ROUTE
    resource.incident_id = incident_id
    resource.current_load = min(resource.current_load + 1, resource.capacity)
    await db.commit()

    return {"message": f"Resource {resource.name} deployed to incident {incident.incident_id}"}


@router.post("/resources/{resource_id}/return")
async def return_resource(resource_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource.status = ResourceStatus.AVAILABLE
    resource.incident_id = None
    resource.current_load = 0
    await db.commit()

    return {"message": f"Resource {resource.name} returned to base"}