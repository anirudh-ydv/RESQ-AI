'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface Zone {
  id: number;
  zone_id: string;
  name: string;
  type: string;
  risk_score: number;
  latitude: number;
  longitude: number;
  population: number;
  historical_incidents: number;
  weather_data: any;
  is_active: boolean;
}

interface Incident {
  id: number;
  incident_id: string;
  type: string;
  title: string;
  severity: number;
  priority: string;
  status: string;
  zone_id: number;
}

export function ActiveZonesPanel() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [zonesRes, incidentsRes] = await Promise.all([
        fetch('/api/zones?limit=20'),
        fetch('/api/incidents?limit=100'),
      ]);
      const zonesData = await zonesRes.json();
      const incidentsData = await incidentsRes.json();
      setZones(zonesData);
      setIncidents(incidentsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
      setLoading(false);
    }
  };

  const zoneTypes = ['all', 'urban', 'rural', 'coastal', 'mountainous', 'industrial'];

  const getRiskLevel = (score: number) => score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
  const riskColors = { high: 'crimson', medium: 'amber', low: 'emerald' };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse h-56">
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-700/50 rounded w-1/2" />
            <div className="h-16 bg-slate-700/50 rounded mt-4" />
          </Card>
        ))}
      </div>
    );
  }

  const filteredZones = filterType === 'all' ? zones : zones.filter(z => z.type === filterType);

  const activeIncidentsCount = incidents.filter(i => i.status === 'active' || i.status === 'responding').length;
  const highRiskZones = zones.filter(z => z.risk_score > 0.7).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Active Zones Monitor</h2>
          <p className="text-slate-400 mt-1">Real-time risk assessment across operational zones</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType} options={zoneTypes.map(t => ({ value: t, label: t === 'all' ? 'All Zones' : t.toUpperCase() }))} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard title="Active Zones" value={zones.filter(z => z.is_active).length} color="emerald" trend={`${highRiskZones} high risk`} />
        <StatCard title="Total Population" value={zones.reduce((a, z) => a + z.population, 0)} color="blue" format="compact" />
        <StatCard title="Active Incidents" value={activeIncidentsCount} color="amber" urgent />
        <StatCard title="Avg Risk Score" value={Math.round(zones.reduce((a, z) => a + z.risk_score, 0) / zones.length * 100)} color="crimson" suffix="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-panel-emerald">
          <h3 className="text-lg font-semibold text-white mb-4">Zone Risk Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/50">
                  <th className="text-left p-3">Zone</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Risk Score</th>
                  <th className="text-left p-3">Active Incidents</th>
                  <th className="text-left p-3">Population</th>
                  <th className="text-left p-3">Weather</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map(zone => (
                  <ZoneTableRow
                    key={zone.zone_id}
                    zone={zone}
                    incidents={incidents.filter(i => i.zone_id === zone.id)}
                    selected={selectedZone?.zone_id === zone.zone_id}
                    onSelect={() => setSelectedZone(zone)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="glass-panel-amber">
          <h3 className="text-lg font-semibold text-white mb-4">Zone Details</h3>
          {selectedZone ? (
            <ZoneDetailPanel zone={selectedZone} incidents={incidents.filter(i => i.zone_id === selectedZone.id)} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p>Select a zone to view details</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="glass-panel">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Heatmap</h3>
        <div className="h-48 bg-slate-900/50 rounded-lg border border-slate-800/50 relative overflow-hidden">
          <RiskHeatmap zones={zones} />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, color, trend, urgent, format, suffix }: { title: string; value: number; color: string; trend?: string; urgent?: boolean; format?: string; suffix?: string }) {
  const formatValue = (v: number) => {
    if (format === 'compact') return v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : String(v);
    return String(v);
  };

  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    crimson: 'text-crimson-400 bg-crimson-500/10 border-crimson-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <Card className={`glass-panel ${colorClasses[color as keyof typeof colorClasses]} ${urgent ? 'animate-pulse-glow' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{formatValue(value)}{suffix}</p>
          {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
        </div>
      </div>
    </Card>
  );
}

function ZoneTableRow({ zone, incidents, selected, onSelect }: { zone: Zone; incidents: Incident[]; selected: boolean; onSelect: () => void }) {
  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'responding');
  const highPriority = incidents.filter(i => i.priority === 'high').length;
  const riskLevel = zone.risk_score > 0.7 ? 'high' : zone.risk_score > 0.4 ? 'medium' : 'low';
  const riskColor = riskLevel === 'high' ? 'crimson' : riskLevel === 'medium' ? 'amber' : 'emerald';

  return (
    <tr className={`${selected ? 'bg-emerald-500/5' : ''} hover:bg-slate-800/30 transition-colors cursor-pointer`} onClick={onSelect}>
      <td className="p-3">
        <div className="font-medium text-white">{zone.name}</div>
        <div className="text-xs text-slate-400 font-mono">{zone.zone_id}</div>
      </td>
      <td className="p-3">
        <Badge variant="slate" className="capitalize">{zone.type}</Badge>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Progress value={zone.risk_score * 100} className="w-24 h-2" color={riskColor as 'emerald' | 'amber' | 'crimson'} />
          <span className={`text-sm font-bold ${riskColor}`}>{(zone.risk_score * 100).toFixed(0)}%</span>
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Badge variant="emerald">{activeIncidents.length} active</Badge>
          {highPriority > 0 && <Badge variant="crimson">{highPriority} high</Badge>}
        </div>
      </td>
      <td className="p-3 text-slate-300">{zone.population.toLocaleString()}</td>
      <td className="p-3">
        <WeatherBadge weather={zone.weather_data} />
      </td>
      <td className="p-3">
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onSelect(); }}>
          {selected ? 'Selected' : 'View'}
        </Button>
      </td>
    </tr>
  );
}

function WeatherBadge({ weather }: { weather: any }) {
  if (!weather) return <span className="text-slate-500">No data</span>;
  const temp = weather.temperature ? `${weather.temperature}°C` : '';
  const rain = weather.precipitation ? `${weather.precipitation}mm` : '';
  const wind = weather.wind_speed ? `${weather.wind_speed}km/h` : '';
  return <span className="text-xs text-slate-400">{[temp, rain, wind].filter(Boolean).join(' · ')}</span>;
}

function ZoneDetailPanel({ zone, incidents }: { zone: Zone; incidents: Incident[] }) {
  const riskLevel = zone.risk_score > 0.7 ? 'high' : zone.risk_score > 0.4 ? 'medium' : 'low';
  const riskColor = riskLevel === 'high' ? 'crimson' : riskLevel === 'medium' ? 'amber' : 'emerald';

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white">{zone.name}</h4>
          <Badge variant={riskColor}>{riskLevel.toUpperCase()} RISK</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-400">Zone ID</span><br /><span className="font-mono">{zone.zone_id}</span></div>
          <div><span className="text-slate-400">Type</span><br /><span className="capitalize">{zone.type}</span></div>
          <div><span className="text-slate-400">Population</span><br /><span>{zone.population.toLocaleString()}</span></div>
          <div><span className="text-slate-400">Historical Incidents</span><br /><span>{zone.historical_incidents}</span></div>
          <div className="col-span-2">
            <span className="text-slate-400">Risk Score</span>
            <Progress value={zone.risk_score * 100} className="mt-1 h-2" color={riskColor as 'emerald' | 'amber' | 'crimson'} showLabel />
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-lg">
        <h4 className="font-semibold text-white mb-3">Weather Conditions</h4>
        <WeatherDetails weather={zone.weather_data} />
      </div>

      <div className="glass-panel p-4 rounded-lg">
        <h4 className="font-semibold text-white mb-3">Active Incidents ({incidents.length})</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {incidents.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No active incidents</p>
          ) : (
            incidents.map(incident => (
              <div key={incident.id} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Badge variant={incident.priority === 'high' ? 'crimson' : incident.priority === 'medium' ? 'amber' : 'emerald'} className="text-xs">{incident.priority}</Badge>
                  <span className="text-sm font-medium">{incident.title}</span>
                </div>
                <Badge variant={incident.status === 'active' ? 'emerald' : incident.status === 'responding' ? 'amber' : 'slate'} className="text-xs">{incident.status}</Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function WeatherDetails({ weather }: { weather: any }) {
  if (!weather) return <p className="text-slate-500">No weather data available</p>;

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <WeatherMetric label="Temperature" value={`${weather.temperature || 'N/A'}°C`} icon="🌡️" />
      <WeatherMetric label="Humidity" value={`${weather.humidity || 'N/A'}%`} icon="💧" />
      <WeatherMetric label="Wind Speed" value={`${weather.wind_speed || 'N/A'} km/h`} icon="💨" />
      <WeatherMetric label="Pressure" value={`${weather.pressure || 'N/A'} hPa`} icon="📊" />
      <WeatherMetric label="Precipitation" value={`${weather.precipitation || 0} mm`} icon="🌧️" />
      <WeatherMetric label="Air Quality" value={weather.air_quality ? `${weather.air_quality} AQI` : 'N/A'} icon="🌫️" />
    </div>
  );
}

function WeatherMetric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

function RiskHeatmap({ zones }: { zones: Zone[] }) {
  return (
    <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
      <defs>
        <filter id="blur"><feGaussianBlur stdDeviation="15" /></filter>
      </defs>
      {zones.map(zone => {
        const x = 50 + (zone.longitude + 180) * 1.3;
        const y = 250 - (zone.latitude + 90) * 1.3;
        const clampedX = Math.max(50, Math.min(550, x));
        const clampedY = Math.max(30, Math.min(270, y));
        const riskColor = zone.risk_score > 0.7 ? '#ef4444' : zone.risk_score > 0.4 ? '#f59e0b' : '#10b981';
        const radius = 30 + zone.risk_score * 50 + zone.population / 1000000 * 20;

        return (
          <g key={zone.zone_id} filter="url(#blur)">
            <circle cx={clampedX} cy={clampedY} r={Math.min(radius, 80)} fill={riskColor} opacity="0.15" />
            <circle cx={clampedX} cy={clampedY} r={Math.min(radius * 0.6, 50)} fill={riskColor} opacity="0.1" />
            <circle cx={clampedX} cy={clampedY} r={8} fill={riskColor} opacity="0.8" />
            <text x={clampedX} y={clampedY - radius - 5} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)" fontWeight="bold">{zone.name}</text>
          </g>
        );
      })}
    </svg>
  );
}