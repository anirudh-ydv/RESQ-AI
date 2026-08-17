# Backend Development Setup

## Quick Start

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL connection
# DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/resq_ai

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database Setup

### Option 1: PostgreSQL (Production)
```bash
# Create database
createdb resq_ai

# Run migrations
alembic upgrade head
```

### Option 2: SQLite (Development)
```bash
# Update .env
DATABASE_URL=sqlite+aiosqlite:///./resq_ai.db
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Simulation Control

```bash
# Start simulation
curl -X POST http://localhost:8000/api/simulation/start

# Stop simulation
curl -X POST http://localhost:8000/api/simulation/stop

# Trigger single incident
curl -X POST http://localhost:8000/api/simulation/trigger \
  -H "Content-Type: application/json" \
  -d '{"event_type": "incident"}'

# Trigger predictive analysis
curl -X POST http://localhost:8000/api/simulation/trigger \
  -H "Content-Type: application/json" \
  -d '{"event_type": "predictive"}'
```

## Testing Endpoints

```bash
# Create citizen SOS report
curl -X POST http://localhost:8000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Emergency",
    "description": "Fire in building",
    "latitude": 40.7580,
    "longitude": -73.9855,
    "incident_type": "fire",
    "reporter_name": "John Doe"
  }'

# Get live incident feed
curl http://localhost:8000/api/incidents/feed

# Get dashboard stats
curl http://localhost:8000/api/dashboard/stats

# Run predictive risk analysis
curl -X POST http://localhost:8000/api/zones/predictive-risk \
  -H "Content-Type: application/json" \
  -d '{"zone_id": 1, "include_weather": true, "include_historical": true}'
```

## WebSocket Test

```javascript
// Browser console
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## Project Structure

```
Backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database connection
│   ├── config.py            # Settings
│   ├── ai_engine.py         # AI engines (priority, summarizer, predictive)
│   ├── simulation.py        # Background simulation task
│   └── routers/
│       ├── incidents.py     # Incident endpoints
│       ├── zones.py         # Zone & resource endpoints
│       └── resources.py     # Resource management
├── requirements.txt
├── .env.example
└── alembic/                 # Database migrations
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql+asyncpg://postgres:postgres@localhost:5432/resq_ai | Database connection string |
| SECRET_KEY | dev-secret-key-change-in-production | JWT secret (not used in demo) |
| ENVIRONMENT | development | Environment mode |

## Dependencies

- **FastAPI 0.109** - Modern web framework
- **SQLAlchemy 2.0** - Async ORM
- **asyncpg** - PostgreSQL driver
- **Pydantic 2.5** - Data validation
- **Uvicorn** - ASGI server
- **WebSockets** - Real-time communication