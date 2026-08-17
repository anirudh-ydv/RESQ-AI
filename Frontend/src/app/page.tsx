'use client';

import { useEffect, useState } from 'react';
import { CommandDashboard } from './components/CommandDashboard';
import { GISLiveDashboard } from './components/GISLiveDashboard';
import { CitizenSOSPortal } from './components/CitizenSOSPortal';
import { PredictiveRiskPanel } from './components/PredictiveRiskPanel';
import { AISituationSummary } from './components/AISituationSummary';
import { ResourceAllocation } from './components/ResourceAllocation';
import { ActiveZonesPanel } from './components/ActiveZonesPanel';
import { IncidentFeed } from './components/IncidentFeed';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'command' | 'gis' | 'sos' | 'predictive' | 'summary' | 'resources' | 'zones' | 'incidents'>('command');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'command', label: 'Command Center', icon: 'LayoutDashboard' },
    { id: 'gis', label: 'GIS Live', icon: 'MapPin' },
    { id: 'sos', label: 'Citizen SOS', icon: 'Phone' },
    { id: 'predictive', label: 'Predictive Risk', icon: 'Brain' },
    { id: 'summary', label: 'AI SitRep', icon: 'FileText' },
    { id: 'resources', label: 'Resources', icon: 'Truck' },
    { id: 'zones', label: 'Active Zones', icon: 'Map' },
    { id: 'incidents', label: 'Incident Feed', icon: 'Activity' },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed left-0 top-0 z-50 h-screen transition-all duration-300 bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-neon-emerald">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-resq-bg animate-pulse" />
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold text-gradient-emerald">RESQ-AI</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Main navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-white border border-emerald-500/30 shadow-neon-emerald'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <TabIcon name={tab.icon} className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-800/50">
            <div className="glass-panel p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500">System Status</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 rounded-lg bg-slate-800/50">
                  <div className="text-emerald-400 font-bold text-lg">99.9%</div>
                  <div className="text-slate-500">Uptime</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-800/50">
                  <div className="text-amber-400 font-bold text-lg">12ms</div>
                  <div className="text-slate-500">Latency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/50">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gradient-emerald">{tabs.find(t => t.id === activeTab)?.label}</h1>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary hidden sm:flex">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Generate SitRep
              </button>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm">
                <span className="text-slate-400">UTC</span>
                <span className="font-mono text-emerald-400" id="utc-time">--:--:--</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'command' && <CommandDashboard />}
          {activeTab === 'gis' && <GISLiveDashboard />}
          {activeTab === 'sos' && <CitizenSOSPortal />}
          {activeTab === 'predictive' && <PredictiveRiskPanel />}
          {activeTab === 'summary' && <AISituationSummary />}
          {activeTab === 'resources' && <ResourceAllocation />}
          {activeTab === 'zones' && <ActiveZonesPanel />}
          {activeTab === 'incidents' && <IncidentFeed />}
        </div>
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            function updateUTC() {
              const now = new Date();
              const time = now.toISOString().substr(11, 8);
              document.getElementById('utc-time').textContent = time;
            }
            setInterval(updateUTC, 1000);
            updateUTC();
          `
        }}
      />
    </div>
  );
}

function TabIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    LayoutDashboard: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ),
    MapPin: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
    Phone: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    ),
    Brain: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    ),
    FileText: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
    Truck: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6 1a1 1 0 001 1h1M5 17a2 2 0 104 0 2 2 0 00-4 0zm12 0a2 2 0 104 0 2 2 0 00-4 0z" /></svg>
    ),
    Map: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-5.447A1 1 0 013 13.383V5a1 1 0 011-1h2.793a1 1 0 01.707.293L18 7.414V19a1 1 0 01-1 1H5a1 1 0 01-1-1v-3.383z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 16a2 2 0 114 0 2 2 0 01-4 0z" /></svg>
    ),
    Activity: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
  };
  return <span className={className}>{icons[name]}</span>;
}