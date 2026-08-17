# Frontend Development Setup

## Quick Start

```bash
cd Frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start development server
npm run dev
```

## Development Server

- **Local**: http://localhost:3000
- **Network**: http://[your-ip]:3000

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:8000 | Backend API base URL |
| NEXT_PUBLIC_WS_URL | ws://localhost:8000/ws | WebSocket URL |

## Project Structure

```
Frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Tailwind + custom styles
│   │   └── components/           # React components
│   │       ├── CommandDashboard.tsx
│   │       ├── ActiveZonesPanel.tsx
│   │       ├── ResourceAllocation.tsx
│   │       ├── AISituationSummary.tsx
│   │       ├── PredictiveRiskPanel.tsx
│   │       ├── GISLiveDashboard.tsx
│   │       ├── CitizenSOSPortal.tsx
│   │       ├── IncidentFeed.tsx
│   │       └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── api.ts                # Axios API client
│   │   ├── websocket.ts          # WebSocket client
│   │   └── utils.ts              # Utility functions
│   └── hooks/
│       ├── useWebSocket.ts       # Real-time data hooks
│       └── useSpeechRecognition.ts # Voice-to-text hook
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

## Key Components

### CommandDashboard
Real-time statistics panel with 8 metric cards showing incidents, resources, zones, response times.

### ActiveZonesPanel
Interactive zone cards with expandable incident details, risk levels, and deployed resources.

### ResourceAllocation
Filterable resource grid with deployment controls, capacity tracking, and status indicators.

### AISituationSummary
Expandable AI-generated tactical reports with confidence scores and source attribution.

### PredictiveRiskPanel
Risk scoring visualization with contributing factors and recommended actions.

### GISLiveDashboard
MapLibre-ready placeholder with incident markers, heatmap toggle, and cluster view.

### CitizenSOSPortal
Emergency reporting form with **Web Speech API voice-to-text**, GPS location, and quick-select templates.

### IncidentFeed
Real-time streaming incident list with priority/type filters and expandable details.

## Custom Hooks

### useWebSocket()
Connects to backend WebSocket, provides real-time incident/zone/resource updates.

### useIncidentFeed()
Returns live incident stream and history for feed components.

### useZoneUpdates()
Returns zone status changes for panel updates.

### useResourceUpdates()
Returns resource movement events.

### useSpeechRecognition()
Wrapper for browser Web Speech API with:
- Continuous recognition
- Interim results
- Error handling
- Auto-restart on end

## Tailwind Theme

Custom `command` color palette in `tailwind.config.ts`:
- `command.bg` - Main background
- `command.panel` - Panel backgrounds
- `command.accent` - Primary amber/gold
- `command.critical` - Critical red
- `command.high` - High orange
- `command.medium` - Medium amber
- `command.low` - Low green
- `command.info` - Info blue

Custom animations: `pulse-slow`, `blink`, `scan`, `fade-in`, `slide-up`, `slide-in-right`

## Building for Production

```bash
npm run build
npm start
```

## API Proxy

Next.js rewrites in `next.config.js` proxy `/api/backend/*` to `http://localhost:8000/api/*`

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Web Speech API requires HTTPS in production