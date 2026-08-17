import asyncio
import random
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Incident, Zone, Resource, Prediction, IncidentType, IncidentStatus, PriorityLevel, ResourceType, ResourceStatus, ZoneType
from app.ai_engine import RescuePriorityEngine, MultilingualSummarizer, PredictiveRiskEngine
from app.database import AsyncSessionLocal


MOCK_INCIDENTS = [
    {
        "type": IncidentType.FLOOD,
        "title": "Flash Flood - Downtown District",
        "description": "Rapid water rise trapping residents in basements. Multiple cars submerged.",
        "latitude": 40.7128, "longitude": -74.0060,
        "address": "Downtown Manhattan, NY",
        "severity": 8,
        "language": "en",
        "keywords": ["trapped", "basement", "submerged", "emergency", "evacuation"],
        "reported_by": "911-caller-001"
    },
    {
        "type": IncidentType.EARTHQUAKE,
        "title": "Magnitude 6.2 Quake - Metro Area",
        "description": "Buildings collapsed, gas leaks reported. Aftershocks every 15 minutes.",
        "latitude": 34.0522, "longitude": -118.2437,
        "address": "Los Angeles Metro, CA",
        "severity": 9,
        "language": "es",
        "keywords": ["collapsed", "gas leak", "aftershocks", "trapped", "casualties"],
        "reported_by": "seismic-station-LA"
    },
    {
        "type": IncidentType.FIRE,
        "title": "Wildfire - Canyon Region",
        "description": "Fast-moving fire threatening residential areas. Zero containment.",
        "latitude": 37.7749, "longitude": -122.4194,
        "address": "San Francisco Bay Area, CA",
        "severity": 7,
        "language": "en",
        "keywords": ["spreading", "homes threatened", "zero containment", "wind driven", "evacuation"],
        "reported_by": "fire-watch-tower-3"
    },
    {
        "type": IncidentType.HURRICANE,
        "title": "Category 4 Hurricane Approach",
        "description": "Landfall in 18 hours. Storm surge 4-6 feet expected. Mandatory evacuation.",
        "latitude": 25.7617, "longitude": -80.1918,
        "address": "Miami-Dade County, FL",
        "severity": 9,
        "language": "en",
        "keywords": ["landfall", "storm surge", "mandatory evacuation", "category 4", "storm surge"],
        "reported_by": "national-hurricane-center"
    },
    {
        "type": IncidentType.LANDSLIDE,
        "title": "Major Landslide - Mountain Highway",
        "description": "Highway 101 blocked. 12 vehicles buried. Heavy rain continues.",
        "latitude": 47.6062, "longitude": -122.3321,
        "address": "Seattle Mountain Pass, WA",
        "severity": 8,
        "language": "en",
        "keywords": ["blocked", "vehicles buried", "heavy rain", "secondary risk", "rescue difficult"],
        "reported_by": "highway-patrol-7"
    },
    {
        "type": IncidentType.FLOOD,
        "title": "बाढ़ आपातकाल - मुंबई उपनगर",
        "description": "भारी बारिश से जलभराव। 500+ परिवार फंसे। बचाव कार्य जारी।",
        "latitude": 19.0760, "longitude": 72.8777,
        "address": "Mumbai Suburbs, Maharashtra",
        "severity": 8,
        "language": "hi",
        "keywords": ["फंसे", "बचाव", "आपातकाल", "जलभराव", "परिवार"],
        "reported_by": "mumbai-control-room"
    },
{
        "type": IncidentType.EARTHQUAKE,
        "title": "தமிழ்நாட்டில் நிலநடுக்கம்",
        "description": "6.5 அளவு நிலநடுக்கம். கட்டிடங்கள் உடைந்து விழுந்தன. பிறநடுக்கங்கள் தொடருகின்றன.",
        "latitude": 13.0827, "longitude": 80.2707,
        "address": "Chennai, Tamil Nadu",
        "severity": 7,
        "language": "ta",
        "keywords": ["உடைந்து விழுந்தன", "பிறநடுக்கங்கள்", "காயமடைந்த", "உதவி"],
        "reported_by": "chennai-seismic"
    },
    {
        "type": IncidentType.FIRE,
        "title": "Industrial Fire - Chemical Plant",
        "description": "Toxic smoke affecting nearby villages. Wind blowing toward residential zone.",
        "latitude": 22.5726, "longitude": 88.3639,
        "address": "Kolkata Industrial Belt, WB",
        "severity": 8,
        "language": "bn",
        "keywords": ["toxic", "chemical", "villages affected", "wind direction", "evacuation"],
        "reported_by": "kolkata-fire-dept"
    },
    {
        "type": IncidentType.TSUNAMI,
        "title": "Tsunami Warning - Pacific Coast",
        "description": "8.1 magnitude quake offshore. Wave arrival in 25 minutes. Vertical evacuation.",
        "latitude": -33.8688, "longitude": 151.2093,
        "address": "Sydney Coastal Zone, Australia",
        "severity": 10,
        "language": "en",
        "keywords": ["tsunami", "offshore quake", "25 minutes", "vertical evacuation", "wave height"],
        "reported_by": "pacific-tsunami-center"
    },
    {
        "type": IncidentType.TORNADO,
        "title": "EF3 Tornado Touchdown - Plains",
        "description": "Tornado on ground for 15 minutes. Path 2km wide. Mobile home park destroyed.",
        "latitude": 39.7392, "longitude": -104.9903,
        "address": "Denver Metro Plains, CO",
        "severity": 9,
        "language": "en",
        "keywords": ["touchdown", "mobile home park", "destroyed", "debris", "search grids"],
        "reported_by": "storm-chaser-network"
    }
]

MOCK_ZONES = [
    {"zone_id": "ZONE-NYC-001", "name": "Manhattan Central", "type": ZoneType.URBAN, "latitude": 40.7580, "longitude": -73.9855, "radius_km": 3.0, "population": 1600000, "historical_incidents": 12},
    {"zone_id": "ZONE-LA-001", "name": "LA Metro Core", "type": ZoneType.URBAN, "latitude": 34.0522, "longitude": -118.2437, "radius_km": 5.0, "population": 3900000, "historical_incidents": 18},
    {"zone_id": "ZONE-SF-001", "name": "Bay Area Hills", "type": ZoneType.MOUNTAINOUS, "latitude": 37.7749, "longitude": -122.4194, "radius_km": 8.0, "population": 870000, "historical_incidents": 8},
    {"zone_id": "ZONE-MIA-001", "name": "Miami Coastal", "type": ZoneType.COASTAL, "latitude": 25.7617, "longitude": -80.1918, "radius_km": 10.0, "population": 440000, "historical_incidents": 15},
    {"zone_id": "ZONE-SEA-001", "name": "Seattle Mountain Pass", "type": ZoneType.MOUNTAINOUS, "latitude": 47.6062, "longitude": -122.3321, "radius_km": 6.0, "population": 730000, "historical_incidents": 6},
    {"zone_id": "ZONE-MUM-001", "name": "Mumbai Suburban", "type": ZoneType.URBAN, "latitude": 19.0760, "longitude": 72.8777, "radius_km": 4.0, "population": 20000000, "historical_incidents": 25},
    {"zone_id": "ZONE-CHE-001", "name": "Chennai Coastal", "type": ZoneType.COASTAL, "latitude": 13.0827, "longitude": 80.2707, "radius_km": 7.0, "population": 11000000, "historical_incidents": 10},
    {"zone_id": "ZONE-KOL-001", "name": "Kolkata Industrial", "type": ZoneType.INDUSTRIAL, "latitude": 22.5726, "longitude": 88.3639, "radius_km": 5.0, "population": 14000000, "historical_incidents": 14},
    {"zone_id": "ZONE-SYD-001", "name": "Sydney Harbour", "type": ZoneType.COASTAL, "latitude": -33.8688, "longitude": 151.2093, "radius_km": 8.0, "population": 5300000, "historical_incidents": 7},
    {"zone_id": "ZONE-DEN-001", "name": "Denver Plains", "type": ZoneType.RURAL, "latitude": 39.7392, "longitude": -104.9903, "radius_km": 12.0, "population": 715000, "historical_incidents": 9},
]

MOCK_RESOURCES = [
    {"resource_id": "RES-MED-001", "name": "Emergency Medical Team Alpha", "type": ResourceType.MEDICAL, "latitude": 40.7500, "longitude": -73.9900, "capacity": 20, "personnel_count": 12, "equipment": ["ambulance", "trauma_kit", "ventilator"], "contact_info": "med-alpha@resq.ai"},
    {"resource_id": "RES-FIR-001", "name": "Fire Suppression Unit 1", "type": ResourceType.FIRE, "latitude": 40.7600, "longitude": -73.9800, "capacity": 15, "personnel_count": 10, "equipment": ["fire_engine", "ladder", "hazmat"], "contact_info": "fire-1@resq.ai"},
    {"resource_id": "RES-SAR-001", "name": "Search & Rescue Team Bravo", "type": ResourceType.SEARCH_RESCUE, "latitude": 40.7400, "longitude": -73.9950, "capacity": 12, "personnel_count": 8, "equipment": ["drone", "thermal_camera", "rope_kit"], "contact_info": "sar-bravo@resq.ai"},
    {"resource_id": "RES-EVA-001", "name": "Evacuation Bus Fleet", "type": ResourceType.EVACUATION, "latitude": 34.0600, "longitude": -118.2500, "capacity": 50, "personnel_count": 5, "equipment": ["bus_x10", "stretcher", "oxygen"], "contact_info": "eva-fleet@resq.ai"},
    {"resource_id": "RES-SUP-001", "name": "Relief Supply Convoy", "type": ResourceType.SUPPLY, "latitude": 37.7800, "longitude": -122.4100, "capacity": 1000, "personnel_count": 6, "equipment": ["water_truck", "food_pallets", "generator"], "contact_info": "sup-convoy@resq.ai"},
    {"resource_id": "RES-ENG-001", "name": "Structural Engineering Corps", "type": ResourceType.ENGINEERING, "latitude": 25.7700, "longitude": -80.1900, "capacity": 8, "personnel_count": 8, "equipment": ["crane", "shoring", "concrete_cutter"], "contact_info": "eng-corps@resq.ai"},
    {"resource_id": "RES-MED-002", "name": "Field Hospital Unit", "type": ResourceType.MEDICAL, "latitude": 47.6100, "longitude": -122.3300, "capacity": 30, "personnel_count": 15, "equipment": ["surgical", "icu_beds", "pharmacy"], "contact_info": "med-field@resq.ai"},
    {"resource_id": "RES-POL-001", "name": "Security Perimeter Unit", "type": ResourceType.POLICE, "latitude": 19.0800, "longitude": 72.8800, "capacity": 25, "personnel_count": 20, "equipment": ["crowd_control", "comms", "barriers"], "contact_info": "pol-perimeter@resq.ai"},
    {"resource_id": "RES-SAR-002", "name": "Urban Search Rescue India", "type": ResourceType.SEARCH_RESCUE, "latitude": 13.0900, "longitude": 80.2800, "capacity": 15, "personnel_count": 10, "equipment": ["listening_device", "camera_probe", "cutter"], "contact_info": "sar-india@resq.ai"},
    {"resource_id": "RES-EVA-002", "name": "Marine Evacuation Craft", "type": ResourceType.EVACUATION, "latitude": -33.8700, "longitude": 151.2100, "capacity": 40, "personnel_count": 4, "equipment": ["hovercraft", "life_rafts", "gps"], "contact_info": "eva-marine@resq.ai"},
]


async def seed_database():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Incident))
        if result.scalars().first():
            return

        zone_objects = {}
        for z_data in MOCK_ZONES:
            zone = Zone(**z_data)
            zone.weather_data = PredictiveRiskEngine.generate_mock_weather(z_data["type"])
            zone.risk_score = random.uniform(0.2, 0.8)
            db.add(zone)
            await db.flush()
            zone_objects[z_data["zone_id"]] = zone

        for i, inc_data in enumerate(MOCK_INCIDENTS):
            keywords = inc_data.pop("keywords", [])
            zone = zone_objects.get(f"ZONE-{inc_data['address'].split(',')[-1].strip().replace(' ', '-').upper()[:3]}-001")
            if not zone:
                zone = random.choice(list(zone_objects.values()))

            priority = RescuePriorityEngine.calculate_priority(
                inc_data["severity"], keywords, random.randint(1, 5)
            )

            summary_en, summary_native = MultilingualSummarizer.generate_summary(
                inc_data["type"], inc_data["address"], inc_data["severity"],
                keywords, inc_data["language"]
            )
            translated = MultilingualSummarizer.translate_to_english(
                inc_data["description"], inc_data["language"]
            ) if inc_data["language"] != "en" else inc_data["description"]

            incident = Incident(
                incident_id=f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{i+1:04d}",
                zone_id=zone.id,
                keywords=keywords,
                ai_summary=summary_en,
                translated_text=translated,
                priority=priority,
                **inc_data
            )
            db.add(incident)

        for r_data in MOCK_RESOURCES:
            resource = Resource(**r_data)
            resource.status = random.choice([ResourceStatus.AVAILABLE, ResourceStatus.AVAILABLE, ResourceStatus.DEPLOYED])
            db.add(resource)

        for zone in zone_objects.values():
            weather = zone.weather_data or PredictiveRiskEngine.generate_mock_weather(zone.type)
            predictions_data = PredictiveRiskEngine.analyze_risk(
                zone.type, zone.historical_incidents, weather, 24
            )
            for p_data in predictions_data:
                prediction = Prediction(
                    prediction_id=f"PRED-{zone.zone_id}-{p_data['incident_type'].value}-{datetime.utcnow().strftime('%H%M')}",
                    zone_id=zone.id,
                    expires_at=datetime.utcnow() + timedelta(hours=24),
                    **p_data
                )
                db.add(prediction)

        await db.commit()


class SimulationEngine:
    def __init__(self):
        self.running = False
        self.task = None
        self.connected_clients = set()

    async def start(self):
        self.running = True
        self.task = asyncio.create_task(self._run_simulation())

    async def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass

    def register_client(self, websocket):
        self.connected_clients.add(websocket)

    def unregister_client(self, websocket):
        self.connected_clients.discard(websocket)

    async def broadcast(self, message: dict):
        if not self.connected_clients:
            return
        dead = set()
        for client in self.connected_clients:
            try:
                await client.send_json(message)
            except Exception:
                dead.add(client)
        for d in dead:
            self.connected_clients.discard(d)

    async def _run_simulation(self):
        incident_counter = len(MOCK_INCIDENTS)
        sos_templates = [
            ("Help! Water rising fast in basement. Family trapped!", "en", 40.7128, -74.0060),
            ("¡Auxilio! Inundación en mi casa. Los niños están atrapados!", "es", 25.7617, -80.1918),
            ("बचाओ! बाढ़ में फंसे हैं। पानी गले तक पहुँच गया।", "hi", 19.0760, 72.8777),
            ("உதவி! மண் இடிசல் உண்டு. கார்கள் தக்கிவிட்டன!", "ta", 13.0827, 80.2707),
            ("সাহায্য! বন্যা ঘেরে ধরা। বাড়ি জলমগ্ন!", "bn", 22.5726, 88.3639),
            ("Fire spreading to my street! Need evacuation now!", "en", 37.7749, -122.4194),
            ("Building shaking! Cracks in walls! People trapped!", "en", 34.0522, -118.2437),
            ("Landslide blocked road! Cars buried! Hear screaming!", "en", 47.6062, -122.3321),
        ]

        while self.running:
            await asyncio.sleep(5)

            template = random.choice(sos_templates)
            text, lang, lat, lon = template

            incident_counter += 1
            incident_id = f"INC-SOS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

            keywords = RescuePriorityEngine.HIGH_KEYWORDS[:3] + RescuePriorityEngine.MEDIUM_KEYWORDS[:2]
            severity = random.randint(6, 10)
            inc_type = random.choice(list(IncidentType))

            async with AsyncSessionLocal() as db:
                result = await db.execute(select(Zone))
                zones = result.scalars().all()
                zone = random.choice(zones) if zones else None

                priority = RescuePriorityEngine.calculate_priority(severity, keywords, 1)
                summary_en, summary_native = MultilingualSummarizer.generate_summary(
                    inc_type, f"SOS Location {incident_counter}", severity, keywords, lang
                )
                translated = MultilingualSummarizer.translate_to_english(text, lang) if lang != "en" else text

                incident = Incident(
                    incident_id=incident_id,
                    type=inc_type,
                    title=f"SOS Report - {inc_type.value.title()}",
                    description=text,
                    latitude=lat + random.uniform(-0.01, 0.01),
                    longitude=lon + random.uniform(-0.01, 0.01),
                    severity=severity,
                    priority=priority,
                    language=lang,
                    keywords=keywords,
                    ai_summary=summary_en,
                    translated_text=translated,
                    reported_by="citizen-sos",
                    zone_id=zone.id if zone else None
                )
                db.add(incident)
                await db.commit()
                await db.refresh(incident)

                await self.broadcast({
                    "type": "new_incident",
                    "data": {
                        "id": incident.id,
                        "incident_id": incident.incident_id,
                        "type": incident.type.value,
                        "title": incident.title,
                        "latitude": incident.latitude,
                        "longitude": incident.longitude,
                        "severity": incident.severity,
                        "priority": incident.priority.value,
                        "status": incident.status.value,
                        "ai_summary": incident.ai_summary,
                        "created_at": incident.created_at.isoformat()
                    }
                })

                if random.random() < 0.3:
                    await self._update_resource_positions()

                if random.random() < 0.2:
                    await self._update_zone_risk()

    async def _update_resource_positions(self):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Resource).where(Resource.status == ResourceStatus.DEPLOYED))
            resources = result.scalars().all()

            for resource in resources:
                resource.latitude += random.uniform(-0.005, 0.005)
                resource.longitude += random.uniform(-0.005, 0.005)
                resource.last_heartbeat = datetime.utcnow()

            await db.commit()

            for resource in resources:
                await self.broadcast({
                    "type": "resource_update",
                    "data": {
                        "resource_id": resource.resource_id,
                        "latitude": resource.latitude,
                        "longitude": resource.longitude,
                        "status": resource.status.value
                    }
                })

    async def _update_zone_risk(self):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Zone))
            zones = result.scalars().all()

            for zone in zones:
                old_score = zone.risk_score
                zone.risk_score = max(0.0, min(1.0, zone.risk_score + random.uniform(-0.1, 0.1)))
                zone.weather_data = PredictiveRiskEngine.generate_mock_weather(zone.type)

                if abs(zone.risk_score - old_score) > 0.15:
                    await self.broadcast({
                        "type": "zone_risk_update",
                        "data": {
                            "zone_id": zone.zone_id,
                            "risk_score": zone.risk_score,
                            "weather_data": zone.weather_data
                        }
                    })

            await db.commit()


simulation_engine = SimulationEngine()