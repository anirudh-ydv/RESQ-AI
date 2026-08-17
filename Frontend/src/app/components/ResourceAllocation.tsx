'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Select } from './ui/Select';
import { Progress } from './ui/Progress';
import { Input } from './ui/Input';

interface Resource {
  id: number;
  resource_id: string;
  name: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_load: number;
  personnel_count: number;
  equipment: string[];
  incident_id: number | null;
}

interface Incident {
  id: number;
  incident_id: string;
  title: string;
  priority: string;
  latitude: number;
  longitude: number;
}

export function ResourceAllocation() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesRes, incidentsRes] = await Promise.all([
        fetch('/api/resources?limit=50'),
        fetch('/api/incidents?limit=20&status=active'),
      ]);
      const resourcesData = await resourcesRes.json();
      const incidentsData = await incidentsRes.json();
      setResources(resourcesData);
      setIncidents(incidentsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  const handleDeploy = async (resourceId: string, incidentId: number) => {
    setDeploying(resourceId);
    try {
      await fetch(`/api/resources/${resources.find(r => r.resource_id === resourceId)?.id}/deploy/${incidentId}`, {
        method: 'POST',
      });
      fetchData();
    } catch (err) {
      console.error('Deploy failed:', err);
    } finally {
      setDeploying(null);
    }
  };

  const handleReturn = async (resourceId: string) => {
    try {
      await fetch(`/api/resources/${resources.find(r => r.resource_id === resourceId)?.id}/return`, {
        method: 'POST',
      });
      fetchData();
    } catch (err) {
      console.error('Return failed:', err);
    }
  };

  const types = ['all', 'medical', 'fire', 'police', 'search_rescue', 'evacuation', 'supply', 'engineering'];
  const statuses = ['all', 'available', 'deployed', 'en_route', 'maintenance'];

  const typeColors: Record<string, string> = {
    medical: '#ef4444', fire: '#f59e0b', police: '#06b6d4',
    search_rescue: '#a855f7', evacuation: '#10b981', supply: '#84cc16',
    engineering: '#ec4899',
  };

  const statusColors = {
    available: 'emerald', deployed: 'amber', en_route: 'blue', maintenance: 'slate',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse h-48">
            <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-2" />
            <div className="h-8 bg-slate-700/50 rounded w-1/4" />
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mt-4" />
          </Card>
        ))}
      </div>
    );
  }

  const filteredResources = resources.filter(r => {
    const typeMatch = filterType === 'all' || r.type === filterType;
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const stats = {
    total: resources.length,
    available: resources.filter(r => r.status === 'available').length,
    deployed: resources.filter(r => r.status === 'deployed').length,
    enRoute: resources.filter(r => r.status === 'en_route').length,
    maintenance: resources.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Resource Allocation</h2>
          <p className="text-slate-400 mt-1">Track and deploy emergency response resources</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType} options={types.map(t => ({ value: t, label: t === 'all' ? 'All Types' : t.replace('_', ' ').toUpperCase() }))} className="w-40" />
          <Select value={filterStatus} onValueChange={setFilterStatus} options={statuses.map(s => ({ value: s, label: s === 'all' ? 'All Status' : s.replace('_', ' ').toUpperCase() }))} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <StatCard title="Total" value={stats.total} color="emerald" icon="Package" />
        <StatCard title="Available" value={stats.available} color="emerald" icon="CheckCircle" />
        <StatCard title="Deployed" value={stats.deployed} color="amber" icon="Truck" />
        <StatCard title="En Route" value={stats.enRoute} color="blue" icon="Navigation" />
        <StatCard title="Maintenance" value={stats.maintenance} color="slate" icon="Wrench" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel-emerald lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Resource Inventory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/50">
                  <th className="text-left p-3">Resource ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Capacity</th>
                  <th className="text-left p-3">Personnel</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map(resource => (
                  <ResourceTableRow
                    key={resource.resource_id}
                    resource={resource}
                    incidents={incidents}
                    onDeploy={handleDeploy}
                    onReturn={handleReturn}
                    deploying={deploying === resource.resource_id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="glass-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Deployment Map</h3>
          <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-800/50 flex items-center justify-center">
            <DeploymentMap resources={resources} incidents={incidents} />
          </div>
        </Card>

        <Card className="glass-panel-amber">
          <h3 className="text-lg font-semibold text-white mb-4">Type Distribution</h3>
          <div className="space-y-3">
            {Object.entries(typeColors).map(([type, color]) => {
              const count = resources.filter(r => r.type === type).length;
              const available = resources.filter(r => r.type === type && r.status === 'available').length;
              return (
                <div key={type} className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded" style={{ backgroundColor: color }} />
                      <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="slate">{count} total</Badge>
                  </div>
                  <Progress value={count > 0 ? (available / count) * 100 : 0} className="h-1.5" color={color as 'emerald' | 'amber' | 'crimson'} />
                  <p className="text-xs text-slate-400 mt-1">{available} available / {count - available} deployed</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) {
  const icons: Record<string, JSX.Element> = {
    Package: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    CheckCircle: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Truck: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6 1a1 1 0 001 1h1M5 17a2 2 0 104 0 2 2 0 00-4 0zm12 0a2 2 0 104 0 2 2 0 00-4 0z" /></svg>,
    Navigation: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Wrench: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  };

  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    crimson: 'text-crimson-400 bg-crimson-500/10 border-crimson-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <Card className={`glass-panel ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          {icons[icon]}
        </div>
      </div>
    </Card>
  );
}

function ResourceTableRow({ resource, incidents, onDeploy, onReturn, deploying }: {
  resource: Resource;
  incidents: Incident[];
  onDeploy: (resourceId: string, incidentId: number) => void;
  onReturn: (resourceId: string) => void;
  deploying: boolean;
}) {
  const typeColor = {
    medical: '#ef4444', fire: '#f59e0b', police: '#06b6d4',
    search_rescue: '#a855f7', evacuation: '#10b981', supply: '#84cc16',
    engineering: '#ec4899',
  }[resource.type] || '#64748b';

  const statusColor = {
    available: 'emerald', deployed: 'amber', en_route: 'blue', maintenance: 'slate',
  }[resource.status] || 'slate';

  return (
    <tr className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
      <td className="p-3 font-mono text-xs text-emerald-400">{resource.resource_id}</td>
      <td className="p-3 font-medium text-white">{resource.name}</td>
      <td className="p-3">
        <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${typeColor}20`, color: typeColor }}>
          {resource.type.replace('_', ' ').toUpperCase()}
        </span>
      </td>
      <td className="p-3">
        <Badge variant={statusColor as 'emerald' | 'amber' | 'blue' | 'slate'} className="capitalize">
          {resource.status.replace('_', ' ')}
        </Badge>
      </td>
      <td className="p-3">
        <Progress value={(resource.current_load / resource.capacity) * 100} className="w-24 h-1.5" color={statusColor as 'emerald' | 'amber' | 'crimson'} showLabel />
        <span className="text-xs text-slate-400 ml-1">{resource.current_load}/{resource.capacity}</span>
      </td>
      <td className="p-3 text-slate-300">{resource.personnel_count}</td>
      <td className="p-3 font-mono text-xs text-slate-400">{resource.latitude.toFixed(4)}, {resource.longitude.toFixed(4)}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          {resource.status === 'available' && incidents.length > 0 && (
            <Select
              placeholder="Deploy to..."
              options={incidents.map(i => ({ value: String(i.id), label: `${i.incident_id} (${i.priority})` }))}
              onValueChange={val => onDeploy(resource.resource_id, Number(val))}
              className="w-40"
              disabled={deploying}
            />
          )}
          {resource.status !== 'available' && (
            <Button size="sm" variant="secondary" onClick={() => onReturn(resource.resource_id)} disabled={deploying}>
              Return
            </Button>
          )}
          {deploying && <span className="text-xs text-amber-400 animate-pulse">Deploying...</span>}
        </div>
      </td>
    </tr>
  );
}

function DeploymentMap({ resources, incidents }: { resources: Resource[]; incidents: Incident[] }) {
  return (
    <div className="relative w-full h-full p-4">
      <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(16,185,129,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#grid)" />

        {incidents.map((incident, i) => {
          const x = 50 + (incident.longitude + 180) * 0.8;
          const y = 200 - (incident.latitude + 90) * 0.8;
          return (
            <g key={incident.id}>
              <circle cx={x} cy={y} r={8} fill="#ef4444" opacity="0.8" filter="drop-shadow(0 0 6px #ef4444)" />
              <circle cx={x} cy={y} r={14} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" className="animate-pulse" />
              <text x={x} y={y - 18} textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="bold">{incident.incident_id}</text>
            </g>
          );
        })}

        {resources.map(resource => {
          const x = 50 + (resource.longitude + 180) * 0.8;
          const y = 200 - (resource.latitude + 90) * 0.8;
          const color = resource.status === 'available' ? '#10b981' : resource.status === 'deployed' ? '#f59e0b' : '#06b6d4';
          return (
            <g key={resource.resource_id}>
              <polygon points={`${x},${y - 6} ${x - 5},${y + 4} ${x + 5},${y + 4}`} fill={color} filter="drop-shadow(0 0 4px {color})" />
              <circle cx={x} cy={y} r={2} fill="#0a0f1a" />
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 justify-center">
        <span className="flex items-center gap-1 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-crimson-500" /> Incidents</span>
        <span className="flex items-center gap-1 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available</span>
        <span className="flex items-center gap-1 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-amber-500" /> Deployed</span>
        <span className="flex items-center gap-1 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-blue-500" /> En Route</span>
      </div>
    </div>
  );
}