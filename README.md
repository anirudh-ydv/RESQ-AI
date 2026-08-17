# RESQ-AI - Disaster Response Intelligence Platform

A real-time disaster response command center with AI-powered analytics, built for hackathon demonstration.

## 🚀 Features

### Backend (FastAPI + SQLAlchemy + PostgreSQL)
- **REST API** with endpoints for incidents, zones, resources, predictions
- **WebSocket** real-time updates for live dashboard
- **Background Simulation** generating mock SOS reports every 5 seconds
- **AI Engines**:
  - **Rescue Priority Engine** - Calculates priority (High/Medium/Low) based on keywords, severity, volume
  - **Multilingual Summarizer** - Translates regional languages to English, generates tactical reports
  - **Predictive Risk Engine** - Analyzes weather/historical data for future risk zones

### Frontend (Next.js 14 + TypeScript + Tailwind CSS)
- **Glassmorphism Design System** - Deep dark ambient, frosted glass panels, neon accents
- **Command Dashboard** - Real-time command center with stats, incidents, resources, zones, predictions
- **GIS Live Dashboard** - Interactive map with incident markers, resource tracking, heatmap view
- **Citizen SOS Portal** - Voice-to-text using Web Speech API, multilingual support, offline/SMS fallback
- **Predictive Risk Panel** - Charts for risk timeline, distribution, weather correlation, historical patterns
- **AI Situation Summary** - Generate formal SitRep reports with export (Markdown/JSON)
- **Resource Allocation** - Track and deploy resources with map visualization
- **Active Zones Monitor** - Risk heatmap, zone details, weather conditions
- **Incident Feed** - Searchable, filterable incident list with detail modals

## 🏗️ Project Structure

```
RESQ-AI/
├── Backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app with all endpoints
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # Database connection
│   │   ├── config.py            # Settings management
│   │   ├── ai_engine.py         # AI engines (priority, summarizer, predictive)
│   │   ├── simulation.py        # Live simulation background task
│   │   └── routers/
│   │       ├── incidents.py     # Incident endpoints
│   │       ├── zones.py         # Zone & prediction endpoints
│   │       └── resources.py     # Resource endpoints
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic/env.py
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout with sidebar
│   │   │   ├── page.tsx         # Main dashboard with tabs
│   │   │   ├── globals.css      # Glassmorphism styles
│   │   │   └── components/
│   │   │       ├── CommandDashboard.tsx
│   │   │       ├── GISLiveDashboard.tsx
│   │   │       ├── CitizenSOSPortal.tsx
│   │   │       ├── PredictiveRiskPanel.tsx
│   │   │       ├── AISituationSummary.tsx
│   │   │       ├── ResourceAllocation.tsx
│   │   │       ├── ActiveZonesPanel.tsx
│   │   │       ├── IncidentFeed.tsx
│   │   │       └── ui/          # Reusable UI components
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   └── utils.ts         # Utility functions
│   │   └── hooks/
│   │       ├── useWebSocket.ts  # WebSocket hook
│   │       └── useSpeechRecognition.ts  # Speech recognition hook
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local.example
└── README.md
```

## 🛠️ Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations (if using Alembic)
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd Frontend
npm install

# Copy environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎨 Design System

### Colors
- **Background**: `#0a0f1a` (Deep dark ambient)
- **Panel**: `rgba(15, 23, 42, 0.6)` with `backdrop-blur-xl`
- **Borders**: `rgba(30, 41, 59, 0.6)`
- **Neon Accents**:
  - Emerald: `#10b981` (Success, available, low priority)
  - Amber: `#f59e0b` (Warning, medium priority, deployed)
  - Crimson: `#ef4444` (Danger, high priority, critical)

### Components
- **Glass Panels**: Frosted glass with subtle borders and glow effects
- **Buttons**: Primary (emerald), Secondary (slate), Danger (crimson), Ghost
- **Badges**: Priority-based with pulse animations
- **Progress Bars**: Color-coded with smooth animations
- **Inputs/Selects**: Dark theme with emerald focus states

## 📡 API Endpoints

### Incidents
- `GET /api/incidents` - List incidents (filterable)
- `GET /api/incidents/{id}` - Get incident
- `POST /api/incidents` - Create incident
- `PATCH /api/incidents/{id}` - Update incident
- `POST /api/incidents/{id}/summary` - Generate AI summary
- `POST /api/sos` - Submit citizen SOS

### Zones
- `GET /api/zones` - List zones
- `POST /api/zones` - Create zone
- `GET /api/zones/{id}/predictions` - Get zone predictions
- `POST /api/predictive-risk` - Analyze predictive risk

### Resources
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `POST /api/resources/{id}/deploy/{incident_id}` - Deploy resource
- `POST /api/resources/{id}/return` - Return resource

### Real-time
- `WS /ws` - WebSocket for live updates

### Stats
- `GET /api/stats` - Dashboard statistics

## 🤖 AI Engines

### Rescue Priority Engine
Calculates priority based on:
- Severity (1-10) weighted at 40%
- High-priority keywords (trapped, dying, critical, etc.) +25 each
- Medium-priority keywords (flooded, evacuate, damaged, etc.) +10 each
- Low-priority keywords (minor, contained, monitoring, etc.) -5 each
- Report volume bonus up to +20

### Multilingual Summarizer
Supports 20+ languages including Hindi, Tamil, Bengali, Spanish, French, Chinese, Arabic
- Detects language from text
- Translates regional keywords to English
- Generates 2-sentence tactical reports with incident-specific templates

### Predictive Risk Engine
Analyzes:
- Weather data (precipitation, wind, pressure, temperature)
- Historical incident patterns by season
- Zone type vulnerability (coastal, mountainous, urban, industrial)
- Generates probability scores for each incident type

## 🗺️ Mock Data Scenarios

The simulation includes realistic disaster scenarios:
- **Flood**: Manhattan flash flood, Mumbai monsoon flooding
- **Earthquake**: LA magnitude 6.2, Chennai seismic event
- **Fire**: SF Bay Area wildfire, Kolkata industrial fire
- **Hurricane**: Miami Category 4 approach
- **Landslide**: Seattle mountain highway blockage
- **Tsunami**: Sydney Pacific coast warning
- **Tornado**: Denver EF3 touchdown

Languages: English, Hindi, Tamil, Bengali, Spanish, French, Portuguese, Chinese, Arabic, Russian, Japanese, Korean, Vietnamese

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/resq_ai
SECRET_KEY=your-secret-key
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## 📦 Deployment

### Docker (Recommended)
```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set `DEBUG=false`
- Use strong `SECRET_KEY`
- Configure production `DATABASE_URL`
- Set up reverse proxy (nginx) for WebSocket support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests/linting
5. Submit PR

## 📄 License

MIT License - Built for hackathon demonstration

## 🙏 Acknowledgments

- FastAPI for the excellent async framework
- Next.js team for the React framework
- Tailwind CSS for the utility-first styling
- Lucide for the beautiful icons
- Recharts for the charting library