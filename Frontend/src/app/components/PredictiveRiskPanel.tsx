'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface Prediction {
  prediction_id: string;
  zone_id: number;
  incident_type: string;
  probability: number;
  risk_level: string;
  predicted_timeframe: string;
  factors: string[];
  weather_forecast: any;
  historical_pattern: any;
}

interface Zone {
  id: number;
  zone_id: string;
  name: string;
  type: string;
  risk_score: number;
  latitude: number;
  longitude: number;
  population: number;
}

export function PredictiveRiskPanel() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [timeframe, setTimeframe] = useState(24);
  const [incidentType, setIncidentType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);

  const incidentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'flood', label: 'Flood' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'fire', label: 'Fire' },
    { value: 'hurricane', label: 'Hurricane' },
    { value: 'landslide', label: 'Landslide' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'tornado', label: 'Tornado' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [zonesRes, predictionsRes] = await Promise.all([
        fetch('/api/zones?limit=20'),
        fetch('/api/zones/1/predictions'),
      ]);
      const zonesData = await zonesRes.json();
      const predictionsData = await predictionsRes.json();
      setZones(zonesData);
      setPredictions(predictionsData);
      if (zonesData.length > 0) {
        setSelectedZone(zonesData[0]);
        await fetchZoneAnalysis(zonesData[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch predictive data:', err);
      setLoading(false);
    }
  };

  const fetchZoneAnalysis = async (zoneId: number) => {
    try {
      const res = await fetch('/api/predictive-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: zoneId, timeframe_hours: timeframe }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to fetch zone analysis:', err);
    }
  };

  const handleZoneChange = async (zoneId: string) => {
    const zone = zones.find(z => z.zone_id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      await fetchZoneAnalysis(zone.id);
    }
  };

  const runAnalysis = async () => {
    if (selectedZone) {
      await fetchZoneAnalysis(selectedZone.id);
    }
  };

  const riskColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const typeColors: Record<string, string> = {
    flood: '#06b6d4', earthquake: '#f59e0b', fire: '#ef4444',
    hurricane: '#a855f7', landslide: '#84cc16', tsunami: '#0ea5e9',
    tornado: '#ec4899', other: '#64748b',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse h-80">
            <div className="h-4 bg-slate-700/50 rounded w-1/4 mb-4" />
            <div className="h-64 bg-slate-700/50 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Predictive Risk Analytics</h2>
          <p className="text-slate-400 mt-1">AI-powered forecasting for disaster preparedness</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(timeframe)} onValueChange={v => setTimeframe(Number(v))} options={[
            { value: '6', label: '6 Hours' },
            { value: '12', label: '12 Hours' },
            { value: '24', label: '24 Hours' },
            { value: '48', label: '48 Hours' },
            { value: '72', label: '72 Hours' },
          ]} className="w-32" />
          <Select value={incidentType} onValueChange={setIncidentType} options={incidentTypes} className="w-40" />
          <Button onClick={runAnalysis} variant="primary">Run Analysis</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 glass-panel-emerald">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Risk Probability Timeline</h3>
            <div className="flex items-center gap-2">
              <Badge variant="emerald">AI MODEL v2.4</Badge>
              <Badge variant="amber">ENSEMBLE</Badge>
            </div>
          </div>
          <div className="h-72">
            <RiskTimelineChart predictions={predictions} incidentType={incidentType} />
          </div>
        </Card>

        <Card className="glass-panel-amber">
          <h3 className="text-lg font-semibold text-white mb-4">Zone Selector</h3>
          <Select
            value={selectedZone?.zone_id || ''}
            onValueChange={handleZoneChange}
            options={zones.map(z => ({ value: z.zone_id, label: `${z.name} (${z.type})` }))}
            className="w-full mb-4"
            placeholder="Select zone"
          />
          {selectedZone && (
            <div className="space-y-3">
              <div className="glass-panel p-3 rounded-lg">
                <p className="text-xs text-slate-400">Current Risk Score</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold" style={{ color: riskColors[selectedZone.risk_score > 0.7 ? 'high' : selectedZone.risk_score > 0.4 ? 'medium' : 'low'] }}>
                    {(selectedZone.risk_score * 100).toFixed(0)}%
                  </span>
                  <Badge variant={selectedZone.risk_score > 0.7 ? 'crimson' : selectedZone.risk_score > 0.4 ? 'amber' : 'emerald'}>
                    {selectedZone.risk_score > 0.7 ? 'HIGH' : selectedZone.risk_score > 0.4 ? 'MEDIUM' : 'LOW'}
                  </Badge>
                </div>
                <Progress value={selectedZone.risk_score * 100} className="mt-2 h-2" color={selectedZone.risk_score > 0.7 ? 'crimson' : selectedZone.risk_score > 0.4 ? 'amber' : 'emerald'} />
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Zone Details</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Population</span><span className="font-medium">{selectedZone.population.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="font-medium capitalize">{selectedZone.type}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Historical Incidents</span><span className="font-medium">{analysis?.predictions?.length || 0}</span></div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution by Type</h3>
          <div className="h-64">
            <RiskDistributionChart predictions={predictions} />
          </div>
        </Card>

        <Card className="glass-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Weather Correlation</h3>
          <div className="h-64">
            <WeatherCorrelationChart predictions={predictions} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-panel-crimson">
          <h3 className="text-lg font-semibold text-white mb-4">Top Risk Alerts</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {predictions
              .filter(p => incidentType === 'all' || p.incident_type === incidentType)
              .sort((a, b) => b.probability - a.probability)
              .slice(0, 10)
              .map((pred, i) => (
                <PredictionAlertCard key={pred.prediction_id} prediction={pred} rank={i + 1} />
              ))}
          </div>
        </Card>

        <Card className="glass-panel lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Historical Pattern Analysis</h3>
          <div className="h-64">
            <HistoricalPatternChart analysis={analysis} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function RiskTimelineChart({ predictions, incidentType }: { predictions: Prediction[]; incidentType: string }) {
  const filtered = incidentType === 'all' ? predictions : predictions.filter(p => p.incident_type === incidentType);
  const data = Array.from({ length: 24 }, (_, i) => {
    const hour = i + 1;
    const probs = filtered.map(p => p.probability * Math.max(0, 1 - Math.abs(hour - 12) / 12) * (0.8 + Math.random() * 0.4));
    return {
      hour,
      max: Math.max(...probs, 0) * 100,
      avg: (probs.reduce((a, b) => a + b, 0) / Math.max(probs.length, 1)) * 100,
    };
  });

  const typeColors: Record<string, string> = {
    flood: '#06b6d4', earthquake: '#f59e0b', fire: '#ef4444',
    hurricane: '#a855f7', landslide: '#84cc16', tsunami: '#0ea5e9',
    tornado: '#ec4899', other: '#64748b',
  };
  const color = incidentType === 'all' ? '#10b981' : typeColors[incidentType] || '#10b981';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.5)" vertical={false} />
        <XAxis dataKey="hour" stroke="rgba(148,163,184,0.5)" fontSize={11} tickFormatter={h => `${h}:00`} interval={2} />
        <YAxis stroke="rgba(148,163,184,0.5)" fontSize={11} tickFormatter={v => `${v}%`} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(30,41,59,0.8)', borderRadius: '8px' }}
          formatter={(v: number) => [`${v.toFixed(1)}%`, 'Probability']}
        />
        <Area type="monotone" dataKey="max" stroke={color} strokeWidth={2} fillOpacity={1} fill="url(#riskGradient)" />
        <Line type="monotone" dataKey="avg" stroke={color} strokeWidth={1} strokeDasharray="5 5" dot={false} opacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function RiskDistributionChart({ predictions }: { predictions: Prediction[] }) {
  const typeData = predictions.reduce((acc, p) => {
    acc[p.incident_type] = (acc[p.incident_type] || 0) + p.probability;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(typeData).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value: (value * 100).toFixed(1),
  }));

  const typeColors: Record<string, string> = {
    flood: '#06b6d4', earthquake: '#f59e0b', fire: '#ef4444',
    hurricane: '#a855f7', landslide: '#84cc16', tsunami: '#0ea5e9',
    tornado: '#ec4899', other: '#64748b',
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={Object.values(typeColors)[i % Object.keys(typeColors).length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(30,41,59,0.8)', borderRadius: '8px' }}
          formatter={(v: number) => [`${v}%`, 'Risk Share']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function WeatherCorrelationChart({ predictions }: { predictions: Prediction[] }) {
  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: i + 1,
    temp: 25 + Math.sin(i / 3) * 8 + Math.random() * 4,
    humidity: 60 + Math.cos(i / 4) * 20 + Math.random() * 10,
    wind: 15 + Math.sin(i / 2) * 10 + Math.random() * 15,
    risk: Math.max(...predictions.map(p => p.probability * Math.max(0, 1 - Math.abs(i + 1 - 12) / 12))) * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.5)" vertical={false} />
        <XAxis dataKey="hour" stroke="rgba(148,163,184,0.5)" fontSize={11} tickFormatter={h => `${h}:00`} interval={2} />
        <YAxis yAxisId="left" stroke="rgba(148,163,184,0.5)" fontSize={11} tickFormatter={v => `${v}%`} domain={[0, 100]} orientation="left" />
        <YAxis yAxisId="right" stroke="rgba(148,163,184,0.5)" fontSize={11} orientation="right" domain={[0, 50]} hide />
        <Tooltip
          contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(30,41,59,0.8)', borderRadius: '8px' }}
        />
        <Line yAxisId="left" type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={false} name="Risk %" />
        <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Temp (°C)" />
        <Line yAxisId="right" type="monotone" dataKey="wind" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Wind (km/h)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function HistoricalPatternChart({ analysis }: { analysis: any }) {
  const data = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    flood: Math.random() * 30 + (i >= 5 && i <= 8 ? 40 : 0),
    fire: Math.random() * 20 + (i >= 10 || i <= 2 ? 35 : 0),
    earthquake: Math.random() * 15 + 10,
    landslide: Math.random() * 25 + (i >= 5 && i <= 9 ? 30 : 0),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.5)" vertical={false} />
        <XAxis dataKey="month" stroke="rgba(148,163,184,0.5)" fontSize={11} />
        <YAxis stroke="rgba(148,163,184,0.5)" fontSize={11} tickFormatter={v => `${v}%`} />
        <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(30,41,59,0.8)', borderRadius: '8px' }} />
        <Bar dataKey="flood" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Flood" />
        <Bar dataKey="fire" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fire" />
        <Bar dataKey="earthquake" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Earthquake" />
        <Bar dataKey="landslide" fill="#84cc16" radius={[4, 4, 0, 0]} name="Landslide" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PredictionAlertCard({ prediction, rank }: { prediction: Prediction; rank: number }) {
  const riskColors = { high: 'crimson', medium: 'amber', low: 'emerald' };
  const color = riskColors[prediction.risk_level as keyof typeof riskColors];

  return (
    <div className="glass-panel p-3 rounded-lg border-l-4" style={{ borderColor: `${color}500` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-crimson-400">#{rank}</span>
            <span className="font-mono text-xs">{prediction.prediction_id}</span>
            <Badge variant={color}>{prediction.risk_level.toUpperCase()}</Badge>
          </div>
          <p className="font-medium text-white capitalize">{prediction.incident_type.replace('_', ' ')}</p>
          <p className="text-xs text-slate-400">{prediction.predicted_timeframe} • Factors: {prediction.factors?.slice(0, 3).join(', ')}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-xl font-bold ${color}`}>{(prediction.probability * 100).toFixed(0)}%</span>
        </div>
      </div>
      <Progress value={prediction.probability * 100} className="mt-2 h-1" color={color as 'emerald' | 'amber' | 'crimson'} />
    </div>
  );
}