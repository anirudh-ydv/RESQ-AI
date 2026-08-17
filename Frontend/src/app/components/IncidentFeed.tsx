'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';

interface Incident {
  id: number;
  incident_id: string;
  type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  severity: number;
  priority: string;
  status: string;
  ai_summary: string;
  translated_text: string;
  language: string;
  keywords: string[];
  reported_by: string;
  created_at: string;
  updated_at: string;
}

export function IncidentFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity' | 'priority'>('newest');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleFilterTypeChange = (value: string) => setFilterType(value);
  const handleFilterPriorityChange = (value: string) => setFilterPriority(value);
  const handleFilterStatusChange = (value: string) => setFilterStatus(value);
  const handleSortByChange = (value: string) => setSortBy(value as 'newest' | 'oldest' | 'severity' | 'priority');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents?limit=100');
      const data = await res.json();
      setIncidents(data);
      setFilteredIncidents(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...incidents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.incident_id.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.keywords?.some(k => k.toLowerCase().includes(q))
      );
    }

    if (filterType !== 'all') result = result.filter(i => i.type === filterType);
    if (filterPriority !== 'all') result = result.filter(i => i.priority === filterPriority);
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus);

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'severity': return b.severity - a.severity;
        case 'priority': {
          const pOrder = { high: 3, medium: 2, low: 1 };
          return pOrder[b.priority as keyof typeof pOrder] - pOrder[a.priority as keyof typeof pOrder];
        }
      }
    });

    setFilteredIncidents(result);
    setPage(1);
  }, [incidents, searchQuery, filterType, filterPriority, filterStatus, sortBy]);

  const totalPages = Math.ceil(filteredIncidents.length / pageSize);
  const paginatedIncidents = filteredIncidents.slice((page - 1) * pageSize, page * pageSize);

  const priorityColors = { high: 'crimson', medium: 'amber', low: 'emerald' };
  const statusColors = { active: 'emerald', responding: 'amber', resolved: 'slate', cancelled: 'slate' };
  const typeIcons: Record<string, string> = {
    flood: '🌊', earthquake: '🏚️', fire: '🔥',
    hurricane: '🌀', landslide: '🪨', tsunami: '🌊',
    tornado: '🌪️', other: '📍',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-700/50 rounded w-48" />
              <div className="h-6 bg-slate-700/50 rounded w-24" />
            </div>
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mt-2" />
            <div className="h-4 bg-slate-700/50 rounded w-1/2 mt-1" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Incident Feed</h2>
          <p className="text-slate-400 mt-1">Real-time incident tracking and management</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="emerald" className="text-sm">LIVE</Badge>
          <span className="text-sm text-slate-400">{filteredIncidents.length} incidents</span>
        </div>
      </div>

      <Card className="glass-panel">
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={handleFilterTypeChange} options={[
            { value: 'all', label: 'All Types' },
            { value: 'flood', label: 'Flood' },
            { value: 'earthquake', label: 'Earthquake' },
            { value: 'fire', label: 'Fire' },
            { value: 'hurricane', label: 'Hurricane' },
            { value: 'landslide', label: 'Landslide' },
            { value: 'tsunami', label: 'Tsunami' },
            { value: 'tornado', label: 'Tornado' },
          ]} className="w-40" placeholder="Type" />
          <Select value={filterPriority} onValueChange={handleFilterPriorityChange} options={[
            { value: 'all', label: 'All Priority' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]} className="w-36" placeholder="Priority" />
          <Select value={filterStatus} onValueChange={handleFilterStatusChange} options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'responding', label: 'Responding' },
            { value: 'resolved', label: 'Resolved' },
          ]} className="w-36" placeholder="Status" />
          <Select value={sortBy} onValueChange={handleSortByChange} options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'severity', label: 'Severity' },
            { value: 'priority', label: 'Priority' },
          ]} className="w-36" placeholder="Sort" />
        </div>
      </Card>

      <div className="space-y-3">
        {paginatedIncidents.length === 0 ? (
          <Card className="glass-panel text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-slate-400">No incidents match your filters</p>
          </Card>
        ) : (
          paginatedIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => setSelectedIncident(incident)}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-slate-400">Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {selectedIncident && (
        <IncidentDetailModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
      )}
    </div>
  );
}

function IncidentCard({ incident, onClick }: { incident: Incident; onClick: () => void }) {
  const priorityColors = { high: 'crimson', medium: 'amber', low: 'emerald' };
  const statusColors = { active: 'emerald', responding: 'amber', resolved: 'slate', cancelled: 'slate' };
  const typeIcons: Record<string, string> = {
    flood: '🌊', earthquake: '🏚️', fire: '🔥',
    hurricane: '🌀', landslide: '🪨', tsunami: '🌊',
    tornado: '🌪️', other: '📍',
  };

  const priorityColor = priorityColors[incident.priority as keyof typeof priorityColors] || 'slate';
  const statusColor = statusColors[incident.status as keyof typeof statusColors] || 'slate';

  return (
    <Card className="glass-panel hover:glass-panel-hover cursor-pointer transition-all" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-lg">{typeIcons[incident.type] || '📍'}</span>
            <span className="font-mono text-xs text-emerald-400">{incident.incident_id}</span>
            <Badge variant={priorityColor}>{incident.priority.toUpperCase()}</Badge>
            <Badge variant={statusColor}>{incident.status.toUpperCase()}</Badge>
            <span className="px-2 py-1 text-xs rounded bg-slate-800/50 text-slate-400 capitalize">{incident.type}</span>
            <span className="px-2 py-1 text-xs rounded bg-slate-800/50 text-slate-400">{incident.language?.toUpperCase()}</span>
            <span className="text-xs text-slate-500 ml-auto font-mono">{new Date(incident.created_at).toLocaleString()}</span>
          </div>
          <h3 className="font-semibold text-white mb-1">{incident.title}</h3>
          <p className="text-sm text-slate-300 line-clamp-2">{incident.description || incident.ai_summary}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
            <span className="flex items-center gap-1"><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Severity: {incident.severity}/10</span>
            <span className="flex items-center gap-1"><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Reported by: {incident.reported_by}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: priorityColor }}>{incident.severity}/10</p>
            <p className="text-xs text-slate-400">Severity</p>
          </div>
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onClick(); }}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

function IncidentDetailModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const priorityColors = { high: 'crimson', medium: 'amber', low: 'emerald' };
  const statusColors = { active: 'emerald', responding: 'amber', resolved: 'slate', cancelled: 'slate' };
  const priorityColor = priorityColors[incident.priority as keyof typeof priorityColors] || 'slate';
  const statusColor = statusColors[incident.status as keyof typeof statusColors] || 'slate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] glass-panel-emerald rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-emerald-400">{incident.incident_id}</span>
            <h3 className="text-lg font-bold text-white">{incident.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={priorityColor}>{incident.priority.toUpperCase()} PRIORITY</Badge>
            <Badge variant={statusColor}>{incident.status.toUpperCase()}</Badge>
            <Badge variant="slate" className="capitalize">{incident.type}</Badge>
            <Badge variant="slate">{incident.language?.toUpperCase()}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 glass-panel p-4 rounded-lg">
            <div><p className="text-xs text-slate-400">Severity</p><p className="text-2xl font-bold text-white">{incident.severity}/10</p></div>
            <div><p className="text-xs text-slate-400">Coordinates</p><p className="font-mono text-sm text-slate-300">{incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}</p></div>
            <div><p className="text-xs text-slate-400">Address</p><p className="text-sm text-slate-300 truncate">{incident.address || 'Not specified'}</p></div>
            <div><p className="text-xs text-slate-400">Reported By</p><p className="font-medium text-white">{incident.reported_by}</p></div>
            <div><p className="text-xs text-slate-400">Created</p><p className="text-sm text-slate-300">{new Date(incident.created_at).toLocaleString()}</p></div>
            <div><p className="text-xs text-slate-400">Updated</p><p className="text-sm text-slate-300">{incident.updated_at ? new Date(incident.updated_at).toLocaleString() : 'N/A'}</p></div>
          </div>

          <div className="glass-panel p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">AI Tactical Summary</p>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{incident.ai_summary || 'No AI summary available'}</p>
          </div>

          {incident.translated_text && incident.translated_text !== incident.description && (
            <div className="glass-panel p-4 rounded-lg border-l-4 border-amber-500/50">
              <p className="text-xs text-slate-400 mb-2">Translated Text ({incident.language})</p>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{incident.translated_text}</p>
            </div>
          )}

          {incident.keywords && incident.keywords.length > 0 && (
            <div className="glass-panel p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {incident.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800/50">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="danger">Assign Resources</Button>
          <Button variant="primary">Update Status</Button>
        </div>
      </div>
    </div>
  );
}