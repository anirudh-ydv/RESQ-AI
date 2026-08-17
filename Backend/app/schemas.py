from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models import (
    IncidentType, IncidentStatus, PriorityLevel,
    ResourceType, ResourceStatus, ZoneType
)


class IncidentBase(BaseModel):
    type: IncidentType
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    severity: int = Field(..., ge=1, le=10)
    reported_by: Optional[str] = None
    language: Optional[str] = None
    keywords: Optional[List[str]] = None


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[int] = None
    priority: Optional[PriorityLevel] = None
    status: Optional[IncidentStatus] = None
    ai_summary: Optional[str] = None
    translated_text: Optional[str] = None


class IncidentResponse(IncidentBase):
    id: int
    incident_id: str
    priority: PriorityLevel
    status: IncidentStatus
    ai_summary: Optional[str] = None
    translated_text: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    zone_id: Optional[int] = None

    class Config:
        from_attributes = True


class ZoneBase(BaseModel):
    name: str = Field(..., max_length=200)
    type: ZoneType
    latitude: float
    longitude: float
    radius_km: float = 5.0
    population: int = 0


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    risk_score: Optional[float] = None
    weather_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ZoneResponse(ZoneBase):
    id: int
    zone_id: str
    risk_score: float
    weather_data: Optional[Dict[str, Any]] = None
    historical_incidents: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResourceBase(BaseModel):
    name: str = Field(..., max_length=200)
    type: ResourceType
    latitude: float
    longitude: float
    capacity: int = 1
    equipment: Optional[List[str]] = None
    personnel_count: int = 0
    contact_info: Optional[str] = None


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    status: Optional[ResourceStatus] = None
    current_load: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ResourceResponse(ResourceBase):
    id: int
    resource_id: str
    status: ResourceStatus
    current_load: int
    last_heartbeat: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    incident_id: Optional[int] = None

    class Config:
        from_attributes = True


class PredictionBase(BaseModel):
    zone_id: int
    incident_type: IncidentType
    probability: float = Field(..., ge=0, le=1)
    risk_level: PriorityLevel
    predicted_timeframe: str
    factors: Optional[List[str]] = None
    weather_forecast: Optional[Dict[str, Any]] = None
    historical_pattern: Optional[Dict[str, Any]] = None


class PredictionCreate(PredictionBase):
    pass


class PredictionResponse(PredictionBase):
    id: int
    prediction_id: str
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AISummaryRequest(BaseModel):
    incident_id: int


class AISummaryResponse(BaseModel):
    incident_id: int
    summary: str
    translated_text: Optional[str] = None
    priority: PriorityLevel
    keywords: List[str]


class PredictionRequest(BaseModel):
    zone_id: int
    incident_type: Optional[IncidentType] = None
    timeframe_hours: int = 24


class PredictionAnalysisResponse(BaseModel):
    zone_id: int
    zone_name: str
    predictions: List[PredictionResponse]
    overall_risk: PriorityLevel
    recommendation: str


class PredictiveRiskRequest(BaseModel):
    zone_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: float = 50.0
    incident_types: Optional[List[IncidentType]] = None


class PredictiveRiskResponse(BaseModel):
    zone_id: int
    zone_name: str
    predictions: List[PredictionResponse]
    overall_risk_score: float
    risk_factors: Dict[str, str]


class BatchSummaryRequest(BaseModel):
    incident_ids: List[int]
    format: str = "markdown"
    language: str = "en"


class SOSReport(BaseModel):
    text: str
    latitude: float
    longitude: float
    language: Optional[str] = "en"
    contact: Optional[str] = None


class SOSResponse(BaseModel):
    incident_id: str
    message: str
    priority: PriorityLevel
    estimated_response_time: str


class DashboardStats(BaseModel):
    total_incidents: int
    active_incidents: int
    high_priority: int
    medium_priority: int
    low_priority: int
    deployed_resources: int
    available_resources: int
    high_risk_zones: int


class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)