import random
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.models import (
    IncidentType, PriorityLevel, IncidentStatus, ZoneType,
    ResourceType, ResourceStatus
)


class RescuePriorityEngine:
    HIGH_KEYWORDS = [
        "trapped", "dying", "critical", "emergency", "urgent", "help", "sos",
        "collapsed", "buried", "drowning", "burning", "bleeding", "unconscious",
        "missing", "stranded", "isolated", "cut off", "no escape", "imminent",
        "casualties", "fatalities", "mass casualty", "explosion", "gas leak",
        "chemical", "radiation", "nuclear", "dam breach", "levee break"
    ]

    MEDIUM_KEYWORDS = [
        "flooded", "damaged", "evacuate", "evacuation", "shelter", "power outage",
        "water rising", "road blocked", "bridge out", "communication down",
        "medical needed", "supplies low", "food shortage", "water shortage",
        "injured", "wounded", "displaced", "homeless", "property damage"
    ]

    LOW_KEYWORDS = [
        "minor", "small", "contained", "controlled", "monitoring", "precaution",
        "advisory", "watch", "alert", "standby", "preparation", "readiness"
    ]

    SEVERITY_WEIGHTS = {1: 0.1, 2: 0.15, 3: 0.2, 4: 0.3, 5: 0.4, 6: 0.5, 7: 0.6, 8: 0.7, 9: 0.85, 10: 1.0}

    @classmethod
    def calculate_priority(cls, severity: int, keywords: List[str], volume: int = 1) -> PriorityLevel:
        score = 0.0

        severity_score = cls.SEVERITY_WEIGHTS.get(severity, 0.5) * 40
        score += severity_score

        keyword_text = " ".join(keywords).lower() if keywords else ""

        high_matches = sum(1 for kw in cls.HIGH_KEYWORDS if kw in keyword_text)
        medium_matches = sum(1 for kw in cls.MEDIUM_KEYWORDS if kw in keyword_text)
        low_matches = sum(1 for kw in cls.LOW_KEYWORDS if kw in keyword_text)

        score += high_matches * 25
        score += medium_matches * 10
        score -= low_matches * 5

        volume_bonus = min(volume * 5, 20)
        score += volume_bonus

        if score >= 70:
            return PriorityLevel.HIGH
        elif score >= 40:
            return PriorityLevel.MEDIUM
        else:
            return PriorityLevel.LOW


class MultilingualSummarizer:
    LANGUAGE_MAP = {
        "hi": "Hindi", "ta": "Tamil", "bn": "Bengali", "te": "Telugu",
        "mr": "Marathi", "gu": "Gujarati", "kn": "Kannada", "ml": "Malayalam",
        "pa": "Punjabi", "or": "Odia", "as": "Assamese", "es": "Spanish",
        "fr": "French", "pt": "Portuguese", "zh": "Chinese", "ar": "Arabic",
        "ru": "Russian", "ja": "Japanese", "ko": "Korean", "vi": "Vietnamese"
    }

    INCIDENT_TEMPLATES = {
        IncidentType.FLOOD: [
            "Rapid flooding reported in {location}. Water levels rising at {rate} cm/hour affecting {population} residents. Immediate evacuation recommended for zones {zones}.",
            "Flash flood emergency in {location}. {count} structures inundated. Rescue teams deployed to {zones}. Critical infrastructure at risk including {infrastructure}."
        ],
        IncidentType.EARTHQUAKE: [
            "Magnitude {magnitude} earthquake struck {location} at {time}. {count} buildings collapsed, {casualties} reported trapped. Aftershocks continuing. Search and rescue operations underway.",
            "Seismic event in {location} measuring {magnitude}. Epicenter at {epicenter}. Major structural damage in {zones}. Hospitals overwhelmed. International aid requested."
        ],
        IncidentType.FIRE: [
            "Wildfire spreading rapidly in {location}. {area} hectares burned. {count} homes threatened. Wind speed {wind} km/h driving flames toward {direction}. Air support activated.",
            "Industrial fire at {location}. Chemical storage involved. Toxic smoke plume heading toward {zones}. {count} workers evacuated. Hazmat teams en route."
        ],
        IncidentType.HURRICANE: [
            "Category {category} hurricane approaching {location}. Landfall expected in {hours} hours. Sustained winds {wind} km/h. Storm surge {surge}m predicted. Mandatory evacuation for {zones}.",
            "Hurricane {name} intensifying near {location}. Current trajectory threatens {population} coastal residents. Emergency shelters opened at {shelters}. Supply lines pre-positioned."
        ],
        IncidentType.LANDSLIDE: [
            "Massive landslide in {location} blocked {road}. {count} vehicles buried. Heavy rainfall saturated soil. Geological teams assessing secondary slide risk in {zones}.",
            "Slope failure in {location} destroyed {count} homes. {casualties} missing. Rescue difficult due to unstable terrain. Drone surveillance deployed for survivor detection."
        ],
        IncidentType.TSUNAMI: [
            "Tsunami warning issued for {location} after {magnitude} quake. Wave height {height}m estimated. Arrival in {minutes} minutes. Vertical evacuation to {zones} initiated.",
            "Tsunami advisory for {location} coast. Abnormal sea level recession observed. First wave impact in {minutes} min. Fishing vessels recalled. Port operations suspended."
        ],
        IncidentType.TORNADO: [
            "EF{ef_scale} tornado touched down in {location}. Path width {width}m, length {length}km. {count} structures destroyed. Debris field hazardous. Search grids established.",
            "Tornado watch upgraded to warning for {location}. Rotation confirmed at {coordinates}. Mobile home parks at extreme risk. Sirens activated. Shelter-in-place ordered."
        ]
    }

    @classmethod
    def detect_language(cls, text: str) -> str:
        hindi_chars = set("अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह")
        tamil_chars = set("அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவழளறன")
        bengali_chars = set("অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ")

        text_chars = set(text)
        if text_chars & hindi_chars:
            return "hi"
        if text_chars & tamil_chars:
            return "ta"
        if text_chars & bengali_chars:
            return "bn"
        return "en"

    @classmethod
    def translate_to_english(cls, text: str, source_lang: str) -> str:
        translations = {
            "hi": {
                "बाढ़": "flood", "भूकंप": "earthquake", "आग": "fire", "तूफान": "storm",
                "फंसे": "trapped", "मदद": "help", "आपातकाल": "emergency", "घायल": "injured",
                "मरने": "dying", "गंभीर": "critical", "तत्काल": "urgent", "बचाव": "rescue"
            },
            "ta": {
                "வெள்ளம்": "flood", "நிலநடுக்கம்": "earthquake", "தீ": "fire", "புயல்": "storm",
                "கുടுங்கப்பட்ட": "trapped", "உதவி": "help", "அவசரம்": "emergency", "காயம்": "injured",
                "மரணம்": "dying", "தீவிர": "critical", "உடனடி": "urgent", "இயக்கம்": "rescue"
            },
            "bn": {
                "বন্যা": "flood", "ভূচাল": "earthquake", "আগুন": "fire", "ঝড়": "storm",
                "আটকে": "trapped", "সাহায্য": "help", "জরুরি": "emergency", "আহত": "injured",
                "মরণ": "dying", "গভীর": "critical", "অবিলম্বে": "urgent", "উদ্ধার": "rescue"
            }
        }

        lang_dict = translations.get(source_lang, {})
        result = text
        for native, english in lang_dict.items():
            result = result.replace(native, english)
        return result

    @classmethod
    def generate_summary(cls, incident_type: IncidentType, location: str, severity: int,
                         keywords: List[str], language: str = "en") -> tuple[str, str]:
        templates = cls.INCIDENT_TEMPLATES.get(incident_type, cls.INCIDENT_TEMPLATES[IncidentType.FLOOD])
        template = random.choice(templates)

        magnitude = round(random.uniform(4.0, 8.5), 1)
        count = random.randint(5, 200)
        population = random.randint(100, 50000)
        zones = f"Sector {random.randint(1, 10)}-{random.randint(1, 5)}"
        infrastructure = random.choice(["power plant", "water treatment", "hospital", "bridge", "highway"])
        rate = random.randint(10, 100)
        wind = random.randint(50, 250)
        direction = random.choice(["north", "south", "east", "west", "northeast", "southwest"])
        area = random.randint(10, 5000)
        category = random.randint(1, 5)
        hours = random.randint(6, 48)
        surge = round(random.uniform(1.0, 6.0), 1)
        name = random.choice(["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"])
        shelters = f"Center {random.randint(1, 20)}"
        road = random.choice(["Highway 101", "Route 66", "Main St", "Coastal Rd", "Mountain Pass"])
        casualties = random.randint(0, 50)
        epicenter = f"{random.uniform(-180, 180):.2f}, {random.uniform(-90, 90):.2f}"
        height = round(random.uniform(2.0, 15.0), 1)
        minutes = random.randint(5, 60)
        ef_scale = random.randint(0, 5)
        width = random.randint(50, 500)
        length = random.randint(1, 50)
        coordinates = f"{random.uniform(-180, 180):.2f}, {random.uniform(-90, 90):.2f}"

        summary = template.format(
            location=location, magnitude=magnitude, count=count, population=population,
            zones=zones, infrastructure=infrastructure, rate=rate, wind=wind,
            direction=direction, area=area, category=category, hours=hours, surge=surge,
            name=name, shelters=shelters, road=road, casualties=casualties, epicenter=epicenter,
            height=height, minutes=minutes, ef_scale=ef_scale, width=width, length=length,
            coordinates=coordinates, time=datetime.utcnow().strftime("%H:%M UTC")
        )

        if language != "en":
            native_summary = cls._to_native_language(summary, language)
            return summary, native_summary

        return summary, summary

    @classmethod
    def _to_native_language(cls, text: str, lang: str) -> str:
        translations = {
            "hi": {
                "Rapid flooding reported in": "में तेज बाढ़ की सूचना",
                "Water levels rising at": "जल स्तर बढ़ रहा है",
                "affecting": "प्रभावित",
                "residents": "निवासी",
                "Immediate evacuation recommended for": "के लिए तत्काल निकासी की सिफारिश",
                "Flash flood emergency in": "में अचानक बाढ़ आपातकाल",
                "structures inundated": "संरचनाएं जलमग्न",
                "Rescue teams deployed to": "बचाव दल तैनात",
                "Critical infrastructure at risk": "महत्वपूर्ण बुनियादी ढांचा खतरे में"
            },
"ta": {
                "Rapid flooding reported in": "விரைவு வெள்ளம் அறிவிப்பு",
                "Water levels rising at": "நீரின் நிலை அதிகரிக்கிறது",
                "affecting": "பாதிக்கப்படும்",
                "residents": "குடியிருப்பர்கள்"
            },
            "bn": {
                "Rapid flooding reported in": "এতে দ্রুত বন্যার খবর",
                "Water levels rising at": "জলস্তর বাড়ছে",
                "affecting": "প্রভাবিত",
                "residents": "বাসিন্দা"
            }
        }
        lang_dict = translations.get(lang, {})
        result = text
        for eng, native in lang_dict.items():
            result = result.replace(eng, native)
        return result


class PredictiveRiskEngine:
    WEATHER_RISK_FACTORS = {
        IncidentType.FLOOD: ["heavy_rain", "storm_surge", "river_overflow", "snow_melt", "dam_risk"],
        IncidentType.HURRICANE: ["low_pressure", "high_wind", "warm_water", "humidity", "pressure_drop"],
        IncidentType.LANDSLIDE: ["prolonged_rain", "soil_saturation", "slope_angle", "deforestation", "seismic_activity"],
        IncidentType.FIRE: ["drought", "high_temp", "low_humidity", "high_wind", "lightning"],
        IncidentType.EARTHQUAKE: ["seismic_gaps", "foreshocks", "strain_accumulation", "fault_activity"],
        IncidentType.TSUNAMI: ["undersea_quake", "volcanic_eruption", "landslide", "pressure_anomaly"],
        IncidentType.TORNADO: ["wind_shear", "instability", "moisture", "lift", "supercell"]
    }

    HISTORICAL_PATTERNS = {
        "coastal_monsoon": {"months": [6, 7, 8, 9], "types": [IncidentType.FLOOD, IncidentType.HURRICANE], "multiplier": 2.5},
        "dry_season_fire": {"months": [11, 12, 1, 2, 3], "types": [IncidentType.FIRE], "multiplier": 3.0},
        "earthquake_zone": {"months": list(range(1, 13)), "types": [IncidentType.EARTHQUAKE], "multiplier": 1.5},
        "landslide_season": {"months": [6, 7, 8, 9, 10], "types": [IncidentType.LANDSLIDE], "multiplier": 2.0},
    }

    @classmethod
    def generate_mock_weather(cls, zone_type: ZoneType) -> Dict[str, Any]:
        base = {
            "temperature": round(random.uniform(15, 40), 1),
            "humidity": random.randint(30, 95),
            "wind_speed": round(random.uniform(5, 120), 1),
            "pressure": round(random.uniform(980, 1030), 1),
            "precipitation": round(random.uniform(0, 300), 1),
            "forecast": []
        }

        for i in range(24):
            base["forecast"].append({
                "hour": i,
                "temp": round(base["temperature"] + random.uniform(-5, 5), 1),
                "rain": round(random.uniform(0, 50), 1) if random.random() > 0.7 else 0,
                "wind": round(base["wind_speed"] + random.uniform(-10, 20), 1)
            })

        if zone_type == ZoneType.COASTAL:
            base["storm_surge_risk"] = random.random() > 0.7
            base["tide_level"] = round(random.uniform(0.5, 3.0), 1)
        elif zone_type == ZoneType.MOUNTAINOUS:
            base["soil_moisture"] = random.randint(40, 100)
            base["slope_stability"] = random.choice(["stable", "marginal", "unstable"])
        elif zone_type == ZoneType.URBAN:
            base["air_quality"] = random.randint(50, 300)
            base["infrastructure_stress"] = random.choice(["normal", "elevated", "critical"])

        return base

    @classmethod
    def analyze_risk(cls, zone_type: ZoneType, historical_count: int,
                     weather_data: Dict[str, Any], timeframe_hours: int = 24) -> List[Dict[str, Any]]:
        predictions = []
        current_month = datetime.utcnow().month

        for pattern_name, pattern in cls.HISTORICAL_PATTERNS.items():
            if current_month in pattern["months"]:
                for inc_type in pattern["types"]:
                    base_prob = min(0.15 * historical_count * pattern["multiplier"], 0.9)
                    weather = weather_data or cls.generate_mock_weather(zone_type)
                    weather_bonus = cls._calculate_weather_bonus(inc_type, weather)
                    prob = min(base_prob + weather_bonus, 0.95)

                    if prob > 0.15:
                        risk_level = PriorityLevel.HIGH if prob > 0.7 else PriorityLevel.MEDIUM if prob > 0.4 else PriorityLevel.LOW
                        predictions.append({
                            "incident_type": inc_type,
                            "probability": round(prob, 2),
                            "risk_level": risk_level,
                            "predicted_timeframe": f"{timeframe_hours} hours",
                            "factors": cls.WEATHER_RISK_FACTORS.get(inc_type, [])[:3],
                            "weather_forecast": weather,
                            "historical_pattern": {"pattern": pattern_name, "multiplier": pattern["multiplier"]}
                        })

        return sorted(predictions, key=lambda x: x["probability"], reverse=True)[:5]

    @classmethod
    def _calculate_weather_bonus(cls, inc_type: IncidentType, weather: Dict[str, Any]) -> float:
        bonus = 0.0
        if inc_type == IncidentType.FLOOD:
            bonus += weather.get("precipitation", 0) * 0.001
            if weather.get("storm_surge_risk"): bonus += 0.2
        elif inc_type == IncidentType.HURRICANE:
            bonus += weather.get("wind_speed", 0) * 0.002
            if weather.get("pressure", 1013) < 990: bonus += 0.25
        elif inc_type == IncidentType.FIRE:
            bonus += max(0, (weather.get("temperature", 25) - 30)) * 0.01
            bonus += max(0, (60 - weather.get("humidity", 50))) * 0.005
            bonus += weather.get("wind_speed", 0) * 0.001
        elif inc_type == IncidentType.LANDSLIDE:
            bonus += weather.get("soil_moisture", 50) * 0.002
            if weather.get("slope_stability") == "unstable": bonus += 0.3
        elif inc_type == IncidentType.TORNADO:
            bonus += weather.get("wind_speed", 0) * 0.0015
        return min(bonus, 0.4)