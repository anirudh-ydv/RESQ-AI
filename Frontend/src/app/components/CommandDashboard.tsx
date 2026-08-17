'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';

interface DashboardStats {
  total_incidents: number;
  active_incidents: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  deployed_resources: number;
  available_resources: number;
  active_zones: number;
  predictions_count: number;
}

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
  created_at: string;
}

interface Resource {
  resource_id: string;
  name: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_load: number;
}

interface Zone {
  zone_id: string;
  name: string;
  type: string;
  risk_score: number;
  latitude: number;
  longitude: number;
}

interface Prediction {
  prediction_id: string;
  incident_type: string;
  probability: number;
  risk_level: string;
  predicted_timeframe: string;
}

export function CommandDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    fetchStats();
    fetchData();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchData = async () => {
    try {
      const [incidentsRes, resourcesRes, zonesRes, predictionsRes] = await Promise.all([
        fetch('/api/incidents?limit=5'),
        fetch('/api/resources?limit=10'),
        fetch('/api/zones?limit=10'),
        fetch('/api/zones/1/predictions'),
      ]);

      const incidentsData = await incidentsRes.json();
      const resourcesData = await resourcesRes.json();
      const zonesData = await zonesRes.json();
      const predictionsData = await predictionsRes.json();

      setRecentIncidents(incidentsData);
      setResources(resourcesData);
      setZones(zonesData);
      setPredictions(predictionsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    if (message.type === 'new_incident') {
      setRecentIncidents(prev => [message.data, ...prev.slice(0, 4)]);
      fetchStats();
    } else if (message.type === 'resource_update') {
      setResources(prev => prev.map(r =>
        r.resource_id === message.data.resource_id ? { ...r, ...message.data } : r
      ));
    } else if (message.type === 'zone_risk_update') {
      setZones(prev => prev.map(z =>
        z.zone_id === message.data.zone_id ? { ...z, ...message.data } : z
      ));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'crimson';
      case 'medium': return 'amber';
      case 'low': return 'emerald';
      default: return 'slate';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'emerald';
      case 'responding': return 'amber';
      case 'resolved': return 'slate';
      default: return 'slate';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
            <div className="h-8 bg-slate-700/50 rounded w-1/4" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={stats?.total_incidents ?? 0}
          icon="AlertTriangle"
          color="emerald"
          trend="+12%"
        />
        <StatCard
          title="Active Incidents"
          value={stats?.active_incidents ?? 0}
          icon="Activity"
          color="amber"
          trend="+3"
          urgent
        />
        <StatCard
          title="High Priority"
          value={stats?.high_priority ?? 0}
          icon="AlertCircle"
          color="crimson"
          trend="+2"
          urgent
        />
        <StatCard
          title="Deployed Resources"
          value={stats?.deployed_resources ?? 0}
          icon="Truck"
          color="blue"
          trend={`${stats?.available_resources ?? 0} available`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-panel-emerald">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
            <Badge variant="emerald">LIVE</Badge>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No incidents reported</div>
            ) : (
              recentIncidents.map((incident, index) => (
                <IncidentRow key={incident.id} incident={incident} index={index} />
              ))
            )}
          </div>
        </Card>

        <Card className="glass-panel-amber">
          <h3 className="text-lg font-semibold text-white mb-4">Resource Status</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {resources.slice(0, 8).map((resource, index) => (
              <ResourceRow key={resource.resource_id} resource={resource} index={index} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Active Zones Risk Monitor</h3>
          <div className="space-y-3">
            {zones.slice(0, 6).map((zone, index) => (
              <ZoneRiskRow key={zone.zone_id} zone={zone} index={index} />
            ))}
          </div>
        </Card>

        <Card className="glass-panel-crimson">
          <h3 className="text-lg font-semibold text-white mb-4">Predictive Risk Alerts</h3>
          <div className="space-y-3">
            {predictions.slice(0, 5).map((pred, index) => (
              <PredictionRow key={pred.prediction_id} prediction={pred} index={index} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, urgent }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend: string;
  urgent?: boolean;
}) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    crimson: 'text-crimson-400 bg-crimson-500/10 border-crimson-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  const icons: Record<string, JSX.Element> = {
    AlertTriangle: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Activity: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    AlertCircle: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Truck: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6 1a1 1 0 001 1h1M5 17a2 2 0 104 0 2 2 0 00-4 0zm12 0a2 2 0 104 0 2 2 0 00-4 0z" /></svg>,
  };

  return (
    <Card className={`glass-panel relative overflow-hidden ${colors[color]} ${urgent ? 'animate-pulse-glow' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
            <span className={`text-${color}-400`}>▲</span>
            <span>{trend}</span>
          </p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color].replace('text-', 'bg-').replace('border-', 'bg-')}`}>
          {icons[icon]}
        </div>
      </div>
    </Card>
  );
}

function IncidentRow({ incident, index }: { incident: Incident; index: number }) {
  return (
    <div className="card-entrance glass-panel p-3 rounded-lg hover:glass-panel-hover transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-emerald-400">{incident.incident_id}</span>
            <Badge variant={incident.priority as 'high' | 'medium' | 'low'}>{incident.priority.toUpperCase()}</Badge>
            <Badge variant={incident.status as 'active' | 'responding' | 'resolved'}>{incident.status}</Badge>
          </div>
          <p className="font-medium text-white truncate">{incident.title}</p>
          <p className="text-xs text-slate-400 truncate">{incident.ai_summary?.substring(0, 80)}...</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span>Severity: <span className="text-white font-medium">{incident.severity}/10</span></span>
            <span className="font-mono">{new Date(incident.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="flex-shrink-0">View</Button>
      </div>
    </div>
  );
}

function ResourceRow({ resource, index }: { resource: Resource; index: number }) {
  const statusColors = {
    available: 'emerald',
    deployed: 'amber',
    en_route: 'blue',
    maintenance: 'slate',
  };

  return (
    <div className="card-entrance glass-panel p-3 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${statusColors[resource.status as keyof typeof statusColors] || 'slate'} animate-pulse`} />
          <div>
            <p className="font-medium text-white text-sm">{resource.name}</p>
            <p className="text-xs text-slate-400 capitalize">{resource.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant={statusColors[resource.status as keyof typeof statusColors] as 'emerald' | 'amber' | 'blue' | 'slate'} className="text-xs">
            {resource.status.replace('_', ' ')}
          </Badge>
          <div className="mt-1 text-xs text-slate-500">
            {resource.current_load}/{resource.capacity}
          </div>
        </div>
      </div>
      <Progress value={(resource.current_load / resource.capacity) * 100} className="mt-2 h-1" color={statusColors[resource.status as keyof typeof statusColors] as 'emerald' | 'amber' | 'crimson'} />
    </div>
  );
}

function ZoneRiskRow({ zone, index }: { zone: Zone; index: number }) {
  const riskLevel = zone.risk_score > 0.7 ? 'high' : zone.risk_score > 0.4 ? 'medium' : 'low';
  const riskColors = { high: 'crimson', medium: 'amber', low: 'emerald' };

  return (
    <div className="card-entrance glass-panel p-3 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${riskColors[riskLevel]}`} />
          <div>
            <p className="font-medium text-white text-sm">{zone.name}</p>
            <p className="text-xs text-slate-400 capitalize">{zone.type}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${riskColors[riskLevel]}`}>{(zone.risk_score * 100).toFixed(0)}%</span>
          <Badge variant={riskColors[riskLevel] as 'crimson' | 'amber' | 'emerald'} className="ml-2 text-xs">
            {riskLevel.toUpperCase()}
          </Badge>
        </div>
      </div>
      <Progress value={zone.risk_score * 100} className="mt-2 h-1" color={riskColors[riskLevel] as 'emerald' | 'amber' | 'crimson'} />
    </div>
  );
}

function PredictionRow({ prediction, index }: { prediction: Prediction; index: number }) {
  const riskColors = { high: 'crimson', medium: 'amber', low: 'emerald' };

  return (
    <div className="card-entrance glass-panel p-3 rounded-lg border-l-4 border-crimson-500/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-crimson-400">{prediction.prediction_id}</span>
            <Badge variant={riskColors[prediction.risk_level as keyof typeof riskColors]}>{prediction.risk_level.toUpperCase()}</Badge>
          </div>
          <p className="font-medium text-white capitalize">{prediction.incident_type.replace('_', ' ')}</p>
          <p className="text-xs text-slate-400">Timeframe: {prediction.predicted_timeframe}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-2xl font-bold ${riskColors[prediction.risk_level as keyof typeof riskColors]}`}>{(prediction.probability * 100).toFixed(0)}%</span>
        </div>
      </div>
      <Progress value={prediction.probability * 100} className="mt-2 h-1" color={riskColors[prediction.risk_level as keyof typeof riskColors] as 'emerald' | 'amber' | 'crimson'} />
    </div>
  );
}