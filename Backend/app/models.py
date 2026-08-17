from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from datetime import datetime


class IncidentStatus(str, enum.Enum):
    ACTIVE = "active"
    RESPONDING = "responding"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class IncidentType(str, enum.Enum):
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    FIRE = "fire"
    HURRICANE = "hurricane"
    LANDSLIDE = "landslide"
    TSUNAMI = "tsunami"
    TORNADO = "tornado"
    OTHER = "other"


class PriorityLevel(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ResourceType(str, enum.Enum):
    MEDICAL = "medical"
    FIRE = "fire"
    POLICE = "police"
    SEARCH_RESCUE = "search_rescue"
    EVACUATION = "evacuation"
    SUPPLY = "supply"
    ENGINEERING = "engineering"


class ResourceStatus(str, enum.Enum):
    AVAILABLE = "available"
    DEPLOYED = "deployed"
    EN_ROUTE = "en_route"
    MAINTENANCE = "maintenance"


class ZoneType(str, enum.Enum):
    URBAN = "urban"
    RURAL = "rural"
    COASTAL = "coastal"
    MOUNTAINOUS = "mountainous"
    INDUSTRIAL = "industrial"


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), unique=True, index=True, nullable=False)
    type = Column(Enum(IncidentType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    severity = Column(Integer, nullable=False)
    priority = Column(Enum(PriorityLevel), nullable=False, default=PriorityLevel.MEDIUM)
    status = Column(Enum(IncidentStatus), nullable=False, default=IncidentStatus.ACTIVE)
    reported_by = Column(String(100), nullable=True)
    language = Column(String(50), nullable=True)
    keywords = Column(JSON, nullable=True)
    ai_summary = Column(Text, nullable=True)
    translated_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    zone = relationship("Zone", back_populates="incidents")

    assigned_resources = relationship("Resource", back_populates="incident")


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(Enum(ZoneType), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=5.0)
    population = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    weather_data = Column(JSON, nullable=True)
    historical_incidents = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    incidents = relationship("Incident", back_populates="zone")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(Enum(ResourceType), nullable=False)
    status = Column(Enum(ResourceStatus), nullable=False, default=ResourceStatus.AVAILABLE)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=1)
    current_load = Column(Integer, default=0)
    equipment = Column(JSON, nullable=True)
    personnel_count = Column(Integer, default=0)
    contact_info = Column(String(200), nullable=True)
    last_heartbeat = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    incident = relationship("Incident", back_populates="assigned_resources")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(String(50), unique=True, index=True, nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    incident_type = Column(Enum(IncidentType), nullable=False)
    probability = Column(Float, nullable=False)
    risk_level = Column(Enum(PriorityLevel), nullable=False)
    predicted_timeframe = Column(String(100), nullable=False)
    factors = Column(JSON, nullable=True)
    weather_forecast = Column(JSON, nullable=True)
    historical_pattern = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    zone = relationship("Zone")