<div align="center">

# 🚨 RESQ-AI

### AI-Powered Disaster Intelligence & Autonomous Rescue Coordination Platform

**From scattered disaster information to prioritized rescue decisions in seconds.**

<p>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Python%203.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
</p>

<p>
  🚀 <strong>Live Demo & Production Deployment:</strong><br>
  Frontend (Vercel): <a href="https://resqai-tau.vercel.app" target="_blank"><code>https://resqai-tau.vercel.app</code></a> •
  Backend API / Docs (Render): <a href="https://resq-ai-1-co8y.onrender.com/docs" target="_blank"><code>https://resq-ai-1-co8y.onrender.com/docs</code></a>
</p>

<p>
  <a href="#-overview">Overview</a> •
  <a href="#-live-platforms">Live Platforms</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-ai-intelligence">AI Intelligence</a> •
  <a href="#-installation--local-development">Installation</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-deployment">Deployment</a>
</p>

</div>

---

## 🌐 Live Platforms

RESQ-AI is fully deployed in production using a decoupled architecture:

| Component | Platform | Live Endpoint / URL |
|---|---|---|
| **Frontend Dashboard** | Vercel | [https://resqai-tau.vercel.app](https://resqai-tau.vercel.app) |
| **Backend & WebSockets** | Render | [https://resq-ai-1-co8y.onrender.com](https://resq-ai-1-co8y.onrender.com) |
| **API Documentation** | FastAPI Swagger UI | [https://resq-ai-1-co8y.onrender.com/docs](https://resq-ai-1-co8y.onrender.com/docs) |
| **Database** | Supabase PostgreSQL | Connected via Pooler / Direct Connection |

---

## 📌 Overview

During critical natural disasters, emergency response systems often face **information fragmentation**, delayed decision-making, and disconnected communication channels.

Emergency calls, citizen distress reports, environmental data, satellite information, and social media signals can arrive from multiple sources without a unified intelligence layer.

**RESQ-AI** is designed to bridge this operational gap.

It combines:

- 🤖 Artificial Intelligence
- 🚨 Emergency incident prioritization
- 🗺️ Geospatial intelligence
- 🌐 Multilingual communication
- 📊 Predictive risk analysis
- ⚡ Real-time WebSocket communication
- 🚑 Rescue resource coordination
- 📡 Citizen SOS reporting

The platform transforms incoming disaster information into **prioritized, actionable rescue intelligence**.

---

# 🎯 Problem Statement

Traditional disaster response can struggle with:

- Fragmented emergency information
- Manual incident prioritization
- Delayed emergency response
- Lack of real-time situational awareness
- Language barriers
- Difficulty tracking rescue resources
- Limited predictive analysis
- Information overload for emergency operators

RESQ-AI addresses these challenges through a unified AI-powered disaster intelligence platform.

---

# 💡 Our Solution

RESQ-AI provides a centralized command platform where disaster-related information can be:

1. **Collected**
2. **Analyzed**
3. **Prioritized**
4. **Summarized**
5. **Mapped**
6. **Predicted**
7. **Dispatched**
8. **Monitored in real time**

This allows emergency teams to focus on **what requires immediate attention** rather than manually processing large amounts of scattered information.

---

# ⚡ Key Differentiators

| Capability | Traditional Approach | RESQ-AI |
|---|---|---|
| **Data Ingestion** | Fragmented reports | Unified multi-source ingestion |
| **Incident Triage** | Manual review | AI-assisted priority scoring |
| **Response Speed** | Delayed decision-making | Priority generation in seconds |
| **Geospatial Awareness** | Static maps | Interactive GIS visualization |
| **Citizen Communication** | Web forms / phone calls | Multimodal SOS portal |
| **Language Support** | Limited | Multilingual processing |
| **Decision Support** | Reactive | AI-assisted predictive analysis |
| **Resource Management** | Manual tracking | Digital rescue resource tracking |
| **Situation Reports** | Manually prepared | AI-generated tactical summaries |
| **Real-Time Updates** | Limited | WebSocket-based updates |

---

# ✨ Key Features

## 🖥️ 1. Tactical Command Dashboard

A centralized command-center interface providing real-time visibility into:

- Active incidents
- Critical zones
- Rescue resources
- Unit availability
- Incident severity
- Active simulations
- Emergency response status

The interface uses a modern tactical **glassmorphism UI** for better information organization.

---

## 🗺️ 2. Interactive GIS Dashboard

The platform provides geospatial visualization for:

- Disaster locations
- Incident markers
- Risk zones
- Threat heatmaps
- Rescue unit locations
- Spatial incident distribution

This helps operators understand **where incidents are concentrated** and where resources may be required.

---

## 🚨 3. Citizen SOS Portal

Citizens can submit emergency information through the SOS interface.

Features include:

- Emergency incident reporting
- Browser-based speech-to-text
- Multilingual input support
- Structured SOS information
- Offline/SMS fallback concept
- Real-time incident submission

---

## 🤖 4. AI-Powered Incident Prioritization

Incoming incidents are analyzed and assigned priority levels:

- 🔴 **High**
- 🟡 **Medium**
- 🟢 **Low**

The system considers severity, keywords, and local incident density to determine priority.

---

## 🌐 5. Multilingual AI Summarization

The AI intelligence layer can process multilingual distress information and generate standardized tactical summaries.

Example supported languages include:

- Hindi
- Tamil
- Bengali
- Spanish
- French
- Arabic

The summarization engine focuses on extracting actionable information such as:

- Location
- Number of affected people
- Injuries
- Infrastructure damage
- Emergency requirements

---

## 📈 6. Predictive Risk Analysis

The predictive risk engine evaluates environmental and geographical information.

Environmental factors can include:

- Precipitation
- Barometric pressure
- Wind speed

Geographical factors can include:

- Coastal elevation
- Urban density
- Mountainous terrain

The system can assign prospective risk probabilities to nearby zones.

---

## 🚑 7. Rescue Resource Management

Emergency resources can be tracked and coordinated, including:

- Rescue teams
- Medical units
- Emergency supplies
- Resource availability
- Deployment status

Resources can be dispatched to specific incidents and returned to an available state.

---

## 📄 8. AI Situation Reports

RESQ-AI can generate tactical situation reports containing:

- Current incident status
- Critical locations
- Priority incidents
- Resource requirements
- AI-generated summaries

Reports can be exported in:

- Markdown
- JSON

---

## ⚡ 9. Real-Time WebSocket Communication

The backend provides a live WebSocket stream:

```text
wss://[resq-ai-1-co8y.onrender.com/ws](https://resq-ai-1-co8y.onrender.com/ws)
This allows connected dashboards to receive real-time incident and dispatch updates without repeatedly refreshing the application.

---

## 🧪 10. Disaster Simulation Engine

The project includes a simulation engine capable of generating multi-hazard scenarios.

Example scenarios include:

- 🌊 Urban flash floods
- 🌋 Seismic events
- 🔥 Wildfires
- 🌀 Coastal cyclones

The simulator helps demonstrate how the platform behaves during changing disaster conditions.

---

# 🧠 AI Intelligence

RESQ-AI contains three major intelligence engines.

---

## 1️⃣ Rescue Priority Engine

The priority engine uses deterministic scoring to classify incoming emergency incidents.

### Priority Formula

```text
Priority Score =
(Severity × 4)
+ Σ(Keyword Weights)
+ Volume Bonus
```

### 🔴 High-Impact Keywords

**+25 points**

- trapped
- dying
- critical
- buried
- drowning
- gas leak

### 🟠 Urgent Hazard Keywords

**+10 points**

- flooded
- evacuate
- damaged
- fire
- blocked road

### 🟢 Low / Controlled Keywords

**-5 points**

- minor
- contained
- safe
- monitoring

### 📊 Surge Multiplier

The system can add up to **+20 points** based on incident density in a local cluster.

---

# 2️⃣ Multilingual Summarizer

The multilingual intelligence engine is designed to:

- Extract important entities
- Identify locations
- Detect affected-person counts
- Identify infrastructure failures
- Translate multilingual distress reports
- Generate standardized tactical reports
- Produce concise dispatch summaries

The engine can process inputs from multiple languages and convert them into actionable emergency information.

---

# 3️⃣ Predictive Risk Engine

The predictive engine combines environmental and geographical factors to estimate potential disaster risk.

### Environmental Inputs

```text
Precipitation Rate
Barometric Pressure
Wind Speed
```

### Geographical Inputs

```text
Coastal Elevation
Urban Density
Mountainous Slopes
```

The engine can identify potentially affected adjacent zones before an emergency escalates.

---

# 🏗️ System Architecture

```text
                       ┌─────────────────────────────┐
                       │    MULTI-SOURCE INGESTION   │
                       └──────────────┬──────────────┘
                                      │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ Emergency Calls │           │ Citizen SOS     │           │ External Data   │
│ / Audio Streams │           │ Portal          │           │ Weather / GIS   │
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
         │                             │                             │
         └────────────────────────────┼─────────────────────────────┘
                                      │
                                      ▼
                       ┌───────────────────────────┐
                       │     FASTAPI BACKEND       │
                       │ Real-Time API + WebSocket │
                       └─────────────┬─────────────┘
                                     │
                    ┌────────────────┴──────────────────┐
                    │                                   │
                    ▼                                   ▼
         ┌──────────────────┐               ┌──────────────────────┐
         │    PostgreSQL    │               │ AI Intelligence      │
         │                  │               │ Engine               │
         │ Incidents        │               │                      │
         │ Zones            │               │ Priority Engine      │
         │ Resources        │               │ Summarizer           │
         │ Units            │               │ Predictive Risk      │
         └──────────────────┘               └───────────┬──────────┘
                                                        │
                                                        ▼
                                           ┌────────────────────────┐
                                           │ WebSocket Broadcast    │
                                           │ Layer                  │
                                           └────────────┬───────────┘
                                                        │
                                                        ▼
                                           ┌────────────────────────┐
                                           │    NEXT.JS FRONTEND    │
                                           └────────────┬───────────┘
                                                        │
                         ┌───────────────────────────────┼────────────────────────────┐
                         │                               │                            │
                         ▼                               ▼                            ▼
                  ┌─────────────────┐             ┌─────────────────┐          ┌─────────────────┐
                  │ Command Center  │             │ GIS Map View    │          │ SitRep Export   │
                  └─────────────────┘             └─────────────────┘          └─────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14** | Frontend framework |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | UI styling |
| **Web Speech API** | Browser speech-to-text |
| **WebSocket** | Real-time communication (`wss://`) |

## Backend

| Technology | Purpose |
|---|---|
| **Python 3.11+** | Backend language |
| **FastAPI** | REST API and WebSocket backend |
| **SQLAlchemy** | ORM (Async SQLAlchemy) |
| **Alembic** | Database migrations |
| **asyncio** | Asynchronous processing |
| **PostgreSQL / Supabase** | Production Database |

## AI / Intelligence

| Component | Purpose |
|---|---|
| **Priority Engine** | Incident prioritization |
| **Multilingual Summarizer** | Emergency report summarization |
| **Predictive Risk Engine** | Disaster risk analysis |
| **Simulation Engine** | Disaster scenario generation |

---

# 📁 Project Structure

```text
RESQ-AI/
│
├── Backend/
│   │
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── ai_engine.py
│   │   ├── simulation.py
│   │   │
│   │   └── routers/
│   │       ├── incidents.py
│   │       ├── zones.py
│   │       └── resources.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── Frontend/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   │
│   │   │   └── components/
│   │   │       ├── CommandDashboard.tsx
│   │   │       ├── GISLiveDashboard.tsx
│   │   │       ├── CitizenSOSPortal.tsx
│   │   │       ├── PredictiveRiskPanel.tsx
│   │   │       ├── AISituationSummary.tsx
│   │   │       ├── ResourceAllocation.tsx
│   │   │       ├── ActiveZonesPanel.tsx
│   │   │       ├── IncidentFeed.tsx
│   │   │       └── ui/
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useSpeechRecognition.ts
│   │   │
│   │   └── lib/
│   │       ├── api.ts
│   │       └── utils.ts
│   │
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.local.example
│
└── README.md
```

---

# 💻 Installation & Local Development

## Prerequisites

Make sure the following are installed:

- Python `3.11+`
- Node.js `18+`
- PostgreSQL `15+` (or Supabase account)
- Git
- npm

---

# ⚙️ Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/akashverma4518/RESQ-AI.git
cd RESQ-AI
```

### 2. Navigate to Backend

```bash
cd Backend
```

### 3. Create a Python virtual environment

```bash
python -m venv venv
```

### 4. Activate the virtual environment

#### Windows

```powershell
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Configure environment variables

Create your local `.env` file from the example:

```bash
cp .env.example .env
```

Add your database configuration values (e.g., PostgreSQL or Supabase connection string) to `.env`.

### 7. Run database migrations

```bash
alembic upgrade head
```

### 8. Start the backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

FastAPI interactive API documentation:

```text
http://localhost:8000/docs
```

---

# 🎨 Frontend Setup

Open a **new terminal**.

### 1. Navigate to Frontend

From the project root:

```bash
cd Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.local.example .env.local
```

Set your local or production backend URLs:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

# 🔐 Environment Variables

Environment files may contain sensitive credentials and **must not be committed to GitHub**.

For local development:

```text
Backend/.env
Frontend/.env.local
```

### Important

Never commit:

```text
.env
.env.local
```

Never expose:

- API keys
- Database passwords
- Secret keys
- Authentication credentials

For production, configure secrets through Vercel and Render's respective environment-variable settings dashboards.

---

# 📡 API Reference

## 🚨 Incident Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/incidents` | List all reported incidents |
| `POST` | `/api/incidents` | Report a new emergency incident |
| `GET` | `/api/incidents/{id}` | Retrieve a specific incident |
| `POST` | `/api/incidents/{id}/summary` | Generate an AI tactical summary |
| `POST` | `/api/sos` | Submit a structured citizen SOS |

---

## 🗺️ Zones & Predictive Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/zones` | Retrieve designated rescue zones |
| `GET` | `/api/zones/{id}/predictions` | Retrieve prospective weather-impact predictions |
| `POST` | `/api/predictive-risk` | Trigger predictive risk calculation |

---

## 🚑 Dispatch & Resources

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resources` | List rescue teams, medical units, and supplies |
| `POST` | `/api/resources/{id}/deploy/{incident_id}` | Dispatch a resource to an incident |
| `POST` | `/api/resources/{id}/return` | Return/reassign a resource to available |

---

# ⚡ Real-Time Communication

| Protocol | Endpoint | Description |
|---|---|---|
| `WebSocket` | `/ws` (or `wss://resq-ai-1-co8y.onrender.com/ws`) | Real-time incident and dispatch updates |

---

# 🧪 Disaster Simulation

RESQ-AI includes a built-in disaster simulation system for demonstrating emergency scenarios.

## 🌊 Urban Flash Flood

Example characteristics:

- Metropolitan valley floor
- Severe road blockage
- Flood-related emergency incidents

## 🌋 Seismic Event

Example characteristics:

- Magnitude 6.4 earthquake
- Structural collapses
- Gas main ruptures

## 🔥 Wildfire Interface

Example characteristics:

- Forest fringe encroachment
- Evacuation requirements
- Fire-related incidents

## 🌀 Coastal Cyclone

Example characteristics:

- Category 4 storm surge
- Power-grid failures
- Emergency shelter routing

---

# 🐳 Docker Deployment

The platform can optionally be run using containerized services.

Build and start the containers:

```bash
docker-compose up --build
```

---

# 🌐 Deployment & Live Hosting

RESQ-AI is structured as a separate frontend and backend application.

```text
                        RESQ-AI
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
        ┌──────────┐                ┌──────────┐
        │  Vercel  │                │  Render  │
        │ Frontend │                │ Backend  │
        └────┬─────┘                └────┬─────┘
             │                           │
             ▼                           ▼
          Next.js                     FastAPI
                                         │
                                         ▼
                                     PostgreSQL
```

## Frontend Deployment (Vercel)

The Next.js frontend is deployed on **Vercel** (`https://resqai-tau.vercel.app`).

- **Root Directory:** `Frontend`
- **Build Command:** `npm run build`
- **Output:** Next.js static/serverless deployment
- **Environment Variables configured in Vercel:**
  - `NEXT_PUBLIC_API_URL` = `https://resq-ai-1-co8y.onrender.com`
  - `NEXT_PUBLIC_WS_URL` = `wss://resq-ai-1-co8y.onrender.com/ws`

---

## Backend Deployment (Render)

The FastAPI backend is deployed as a Python web service on **Render** (`https://resq-ai-1-co8y.onrender.com`).

- **Root Directory:** `Backend`
- **Runtime:** Python 3.11.9
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- **Environment Variables configured in Render:**
  - `DATABASE_URL` = `postgresql+asyncpg://postgres.iyrlgztawgqquhjydqln:RESQ-Ai%40%401234567890@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`
  - `SECRET_KEY` = `66bba630c70a1040b136928a9ce16bdad290bd1b37cfb627aa5b58eb33ee3c9e`
  - `DEBUG` = `false`

---

# 🔄 Production Data Flow

```text
Citizen / External Data
          │
          ▼
     FastAPI Backend
          │
    ┌─────┴─────┐
    ▼           ▼
PostgreSQL     AI Engines
    │           │
    └─────┬─────┘
          ▼
     WebSocket (wss://)
          │
          ▼
    Next.js Dashboard
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
   GIS   SOS   SitRep
```

---

# 🛡️ Security

RESQ-AI should be deployed with appropriate security controls.

### Recommended practices

- Never commit `.env` files.
- Never expose API keys in frontend code.
- Use environment variables for production secrets.
- Use HTTPS and WSS in production.
- Configure CORS correctly.
- Protect database credentials.
- Restrict database access where possible.
- Validate all incoming API requests.
- Apply authentication and authorization before production use.
- Monitor backend logs and service health.

---

# 📊 Future Improvements

Potential future improvements include:

- Real-time satellite data integration
- Live weather API integration
- Government emergency-system integration
- Advanced AI-based disaster forecasting
- Computer vision for satellite/drone imagery
- Automated SMS emergency alerts
- Dedicated mobile application
- Advanced authentication and role-based access
- Live rescue-team GPS tracking
- Advanced resource optimization
- Multi-agency coordination
- Historical disaster analytics

---

# 🎯 Project Vision

RESQ-AI aims to transform disaster response from a **fragmented and reactive process** into an **intelligent, coordinated, and data-driven rescue ecosystem**.

By combining artificial intelligence, real-time communication, geospatial intelligence, multilingual processing, predictive analytics, and resource coordination, RESQ-AI is designed to help emergency teams move from:

```text
Information Overload
        ↓
AI Analysis
        ↓
Incident Prioritization
        ↓
Actionable Intelligence
        ↓
Faster Rescue Coordination
```

---

# 🤝 Contributing

Contributions are welcome.

### Basic workflow

```bash
# Clone the repository
git clone https://github.com/akashverma4518/RESQ-AI.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes

# Stage changes
git add .

# Commit changes
git commit -m "Add: your feature description"

# Push your branch
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

# 📄 License

This project is currently intended as a project/demo platform.

---



# 🚨 RESQ-AI

### AI-Powered Disaster Intelligence & Autonomous Rescue Coordination

**From scattered information to prioritized action.**

---

🌐 **Live App:** https://resqai-tau.vercel.app • 📡 **API Docs:** https://resq-ai-1-co8y.onrender.com/docs

Built with ❤️ using **FastAPI • Next.js • TypeScript • Python • PostgreSQL • AI**


