'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';

interface Incident {
  id: number;
  incident_id: string;
  type: string;
  title: string;
  latitude: number;
  longitude: number;
  severity: number;
  priority: string;
  status: string;
  ai_summary: string;
}

interface Resource {
  resource_id: string;
  name: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
}

export function GISLiveDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'terrain'>('dark');
  const [viewMode, setViewMode] = useState<'incidents' | 'resources' | 'zones' | 'heatmap'>('incidents');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleMapStyleChange = (value: string) => {
    setMapStyle(value as 'dark' | 'satellite' | 'terrain');
  };

  const handleViewModeChange = (value: string) => {
    setViewMode(value as 'incidents' | 'resources' | 'zones' | 'heatmap');
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, resourcesRes] = await Promise.all([
        fetch('/api/incidents?limit=50'),
        fetch('/api/resources?limit=50'),
      ]);
      const incidentsData = await incidentsRes.json();
      const resourcesData = await resourcesRes.json();
      setIncidents(incidentsData);
      setResources(resourcesData);
    } catch (err) {
      console.error('Failed to fetch GIS data:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      flood: '🌊',
      earthquake: '🏚️',
      fire: '🔥',
      hurricane: '🌀',
      landslide: '🪨',
      tsunami: '🌊',
      tornado: '🌪️',
    };
    return icons[type] || '📍';
  };

  const handleDeployClick = (incident: Incident) => {
    alert(`Deploying nearest resources to ${incident.incident_id} at ${incident.title}`);
  };

  return (
    <div className="h-[calc(100vh-280px)] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">GIS Live Dashboard</h2>
          <Badge variant="emerald">LIVE</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={mapStyle}
            onValueChange={handleMapStyleChange}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'satellite', label: 'Satellite' },
              { value: 'terrain', label: 'Terrain' },
            ]}
            className="w-36"
          />
          <Select
            value={viewMode}
            onValueChange={handleViewModeChange}
            options={[
              { value: 'incidents', label: 'Incidents' },
              { value: 'resources', label: 'Resources' },
              { value: 'zones', label: 'Zones' },
              { value: 'heatmap', label: 'Heatmap' },
            ]}
            className="w-36"
          />
        </div>
      </div>

      <div className="flex-1 relative">
        <div
          ref={mapContainerRef}
          className="w-full h-full rounded-xl overflow-hidden border border-slate-800/50 bg-slate-900 relative"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <MapPlaceholder
              incidents={incidents}
              resources={resources}
              viewMode={viewMode}
              onIncidentClick={setSelectedIncident}
            />
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="glass-panel p-3 rounded-lg min-w-[180px]">
              <h4 className="text-sm font-semibold text-white mb-2">Legend</h4>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'High Priority', color: '#ef4444' },
                  { label: 'Medium Priority', color: '#f59e0b' },
                  { label: 'Low Priority', color: '#10b981' },
                  { label: 'Available Resource', color: '#10b981' },
                  { label: 'Deployed Resource', color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-10 glass-panel p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-400 font-mono">📍</span>
              <span className="text-slate-300">{incidents.length} incidents | {resources.length} resources</span>
            </div>
          </div>
        </div>

        {selectedIncident && (
          <IncidentDetailPanel
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onDeploy={handleDeployClick}
          />
        )}
      </div>
    </div>
  );
}

function MapPlaceholder({ incidents, resources, viewMode, onIncidentClick }: {
  incidents: Incident[];
  resources: Resource[];
  viewMode: string;
  onIncidentClick: (incident: Incident) => void;
}) {
  return (
    <div className="relative w-full h-full p-8">
      <svg className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid)" />

        {viewMode === 'incidents' && incidents.map((incident, i) => (
          <IncidentMarker
            key={incident.id}
            incident={incident}
            index={i}
            onClick={onIncidentClick}
          />
        ))}

        {viewMode === 'resources' && resources.map((resource, i) => (
          <ResourceMarker key={resource.resource_id} resource={resource} index={i} />
        ))}

        {viewMode === 'heatmap' && (
          <>
            <ellipse cx="200" cy="150" rx="120" ry="80" fill="rgba(239,68,68,0.15)" filter="url(#blur)" />
            <ellipse cx="550" cy="350" rx="100" ry="100" fill="rgba(245,158,11,0.15)" filter="url(#blur)" />
            <ellipse cx="400" cy="250" rx="150" ry="100" fill="rgba(16,185,129,0.1)" filter="url(#blur)" />
            <defs>
              <filter id="blur"><feGaussianBlur stdDeviation="30" /></filter>
            </defs>
          </>
        )}
      </svg>

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center text-slate-600">
          <p className="text-lg font-medium">MapLibre GL / Leaflet Integration Point</p>
          <p className="text-sm mt-1">Replace this SVG with actual map tiles</p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-500">
            <div className="glass-panel p-2 rounded">Lat: 40.7128</div>
            <div className="glass-panel p-2 rounded">Lng: -74.0060</div>
            <div className="glass-panel p-2 rounded">Zoom: 10</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentMarker({ incident, index, onClick }: { incident: Incident; index: number; onClick: (incident: Incident) => void }) {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const color = colors[incident.priority as keyof typeof colors] || '#64748b';
  const x = 100 + (incident.longitude + 180) * 1.5;
  const y = 400 - (incident.latitude + 90) * 1.5;
  const clampedX = Math.max(50, Math.min(750, x));
  const clampedY = Math.max(50, Math.min(450, y));

  return (
    <g>
      <circle
        cx={clampedX}
        cy={clampedY}
        r={incident.priority === 'high' ? 12 : incident.priority === 'medium' ? 10 : 8}
        fill={color}
        opacity="0.9"
        filter="drop-shadow(0 0 8px currentColor)"
        className="cursor-pointer transition-all hover:scale-125"
        onClick={() => onClick(incident)}
      />
      <circle
        cx={clampedX}
        cy={clampedY}
        r={incident.priority === 'high' ? 18 : incident.priority === 'medium' ? 15 : 12}
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.5"
        className="animate-pulse"
      />
      <text x={clampedX} y={clampedY + 4} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" pointerEvents="none">
        {incident.severity}
      </text>
    </g>
  );
}

function ResourceMarker({ resource, index }: { resource: Resource; index: number }) {
  const colors = { available: '#10b981', deployed: '#f59e0b', en_route: '#06b6d4', maintenance: '#64748b' };
  const color = colors[resource.status as keyof typeof colors] || '#64748b';
  const x = 100 + (resource.longitude + 180) * 1.5;
  const y = 400 - (resource.latitude + 90) * 1.5;
  const clampedX = Math.max(50, Math.min(750, x));
  const clampedY = Math.max(50, Math.min(450, y));

  return (
    <g>
      <polygon
        points={`${clampedX},${clampedY - 10} ${clampedX - 8},${clampedY + 6} ${clampedX + 8},${clampedY + 6}`}
        fill={color}
        filter="drop-shadow(0 0 6px currentColor)"
        className="cursor-pointer transition-all hover:scale-110"
      />
      <circle cx={clampedX} cy={clampedY} r={4} fill="#0a0f1a" />
    </g>
  );
}

function IncidentDetailPanel({ incident, onClose, onDeploy }: {
  incident: Incident;
  onClose: () => void;
  onDeploy: (incident: Incident) => void;
}) {
  const priorities = { high: 'crimson', medium: 'amber', low: 'emerald' };
  const priorityColor = priorities[incident.priority as keyof typeof priorities] || 'slate';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end md:justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md md:max-w-lg glass-panel-emerald rounded-2xl p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="font-mono text-xs text-emerald-400">{incident.incident_id}</span>
            <h3 className="text-lg font-bold text-white mt-1">{incident.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={priorityColor as 'crimson' | 'amber' | 'emerald'}>{incident.priority.toUpperCase()} PRIORITY</Badge>
            <Badge variant={incident.status === 'active' ? 'emerald' : incident.status === 'responding' ? 'amber' : 'slate'}>{incident.status.toUpperCase()}</Badge>
            <Badge variant="slate">{incident.type.toUpperCase()}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 glass-panel p-3 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Severity</p>
              <p className="text-xl font-bold text-white">{incident.severity}/10</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Coordinates</p>
              <p className="font-mono text-sm text-slate-300">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</p>
            </div>
          </div>

          <div className="glass-panel p-3 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">AI Tactical Summary</p>
            <p className="text-sm text-slate-200">{incident.ai_summary || 'No summary available'}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => onDeploy(incident)} className="flex-1" variant="danger">
              Deploy Nearest Unit
            </Button>
            <Button onClick={onClose} variant="secondary" className="flex-1">
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}