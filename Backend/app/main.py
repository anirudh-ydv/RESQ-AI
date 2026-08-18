from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import incidents, zones, resources
from app.simulation import simulation_engine
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    from app.simulation import seed_database
    await seed_database()

    await simulation_engine.start()

    yield

    await simulation_engine.stop()


app = FastAPI(
    title="RESQ-AI API",
    description="Disaster Response Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(incidents.router)
app.include_router(zones.router)
app.include_router(resources.router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "RESQ-AI API"
    }


@app.get("/api/stats")
async def get_dashboard_stats():
    from sqlalchemy import select, func
    from app.database import AsyncSessionLocal
    from app.models import (
        Incident,
        Resource,
        Zone,
        Prediction,
        IncidentStatus,
        ResourceStatus,
        PriorityLevel
    )

    async with AsyncSessionLocal() as db:
        total_incidents = await db.scalar(
            select(func.count(Incident.id))
        )

        active_incidents = await db.scalar(
            select(func.count(Incident.id)).where(
                Incident.status == IncidentStatus.ACTIVE
            )
        )

        high_priority = await db.scalar(
            select(func.count(Incident.id)).where(
                Incident.priority == PriorityLevel.HIGH
            )
        )

        medium_priority = await db.scalar(
            select(func.count(Incident.id)).where(
                Incident.priority == PriorityLevel.MEDIUM
            )
        )

        low_priority = await db.scalar(
            select(func.count(Incident.id)).where(
                Incident.priority == PriorityLevel.LOW
            )
        )

        deployed_resources = await db.scalar(
            select(func.count(Resource.id)).where(
                Resource.status == ResourceStatus.DEPLOYED
            )
        )

        available_resources = await db.scalar(
            select(func.count(Resource.id)).where(
                Resource.status == ResourceStatus.AVAILABLE
            )
        )

        active_zones = await db.scalar(
            select(func.count(Zone.id)).where(
                Zone.is_active == True
            )
        )

        predictions_count = await db.scalar(
            select(func.count(Prediction.id))
        )

        return {
            "total_incidents": total_incidents or 0,
            "active_incidents": active_incidents or 0,
            "high_priority": high_priority or 0,
            "medium_priority": medium_priority or 0,
            "low_priority": low_priority or 0,
            "deployed_resources": deployed_resources or 0,
            "available_resources": available_resources or 0,
            "active_zones": active_zones or 0,
            "predictions_count": predictions_count or 0
        }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    from app.simulation import simulation_engine

    await websocket.accept()

    simulation_engine.register_client(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            if data == "ping":
                await websocket.send_text("pong")

    except Exception:
        pass

    finally:
        simulation_engine.unregister_client(websocket)