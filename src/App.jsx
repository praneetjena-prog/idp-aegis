import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Shield, Activity, MapPin, Clock, Zap, Cpu, Layers, Radio, ChevronRight, ArrowLeft, Printer, FileJson, FileSpreadsheet, Thermometer, Waves, Volume2, Search, Filter, X, AlertTriangle, CheckCircle2, Settings, LayoutDashboard, ChartNoAxesCombined, Gauge, Cable, PanelLeftClose, PanelLeftOpen, Menu, Sun, Moon } from 'lucide-react';

import { Card, CardHeader, CardTitle } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';

import { FacilityHealth } from './components/dashboard/FacilityHealth';
import { SubsystemGrid } from './components/dashboard/SubsystemGrid';
import { TriageQueue } from './components/dashboard/TriageQueue';
import { TelemetryChart } from './components/dashboard/TelemetryChart';
import { LiveTelemetryTicker } from './components/dashboard/LiveTelemetryTicker';
import { FailureForecast } from './components/dashboard/FailureForecast';
import { WorkOrderHistory } from './components/dashboard/WorkOrderHistory';
import { CorrelationChart } from './components/dashboard/CorrelationChart';
import { PredictiveSimulator } from './components/dashboard/PredictiveSimulator';
import { FacilityOverview } from './components/dashboard/FacilityOverview';
import { FieldSheetModal } from './components/dashboard/FieldSheetModal';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useFacilityParams } from './lib/facility';
import { useLiveFeed } from './lib/liveFeed';
import { playDispatchChime, playAlertChime } from './lib/sound';

import { SideRail, TabBar, TABS } from './components/layout/SideRail';
import { TopHeader } from './components/layout/TopHeader';

import { PlatformReference } from './components/workflow/PlatformReference';
import { AssetDetailView } from './components/dashboard/AssetDetailView';
import { RootCauseInspector } from './components/workflow/RootCauseInspector';
import { MaintenanceChecklist } from './components/workflow/MaintenanceChecklist';

const SectionLabel = ({ k, title, id }) => (
  <div id={id} className="flex items-center gap-3 mb-4 scroll-mt-[112px]">
    <div className="w-7 h-7 bg-[#F1EDE6] border border-[#D2C9BA] flex items-center justify-center font-mono text-[10px] font-bold text-[#6E6558]">{k}</div>
    <h2 className="font-display text-[12px] font-bold uppercase text-[#1F2933]">{title}</h2>
    <div className="flex-1 h-px bg-[#E6E0D6] ml-3" />
  </div>
);

const VALID_TABS = ['overview', 'console', 'analysis', 'simulator', 'platform'];
const STORAGE_WORK_ORDERS = 'aegis-work-orders';
const STORAGE_ACKNOWLEDGED = 'aegis-acknowledged-alerts';

function getInitialTab() {
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.replace(/^#/, '').toLowerCase();
    if (VALID_TABS.includes(hash)) return hash;
  }
  return 'overview';
}

function getInitialWorkOrders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_WORK_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getInitialAcknowledged() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_ACKNOWLEDGED);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export default function App() {
  const [range, setRange] = useState('24H');
  const [feedMode, setFeedMode] = useState('fault');
  const [activeSubsystem, setActiveSubsystem] = useState(null);
  const [workOrders, setWorkOrders] = useState(getInitialWorkOrders);
  const [acknowledged, setAcknowledged] = useState(getInitialAcknowledged);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFieldSheet, setShowFieldSheet] = useState(false);
  const [telemetryFilter, setTelemetryFilter] = useState('all');
  const [tab, setTabState] = useState(getInitialTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Sync tab changes to URL hash (deep linking)
  const setTab = (nextTab) => {
    if (!VALID_TABS.includes(nextTab)) return;
    setTabState(nextTab);
    if (typeof window !== 'undefined' && window.location.hash !== `#${nextTab}`) {
      window.history.replaceState(null, '', `#${nextTab}`);
    }
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (VALID_TABS.includes(hash)) {
        setTabState(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Persist work orders across sessions
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_WORK_ORDERS, JSON.stringify(workOrders));
    } catch (e) {
      console.error('Failed to persist work orders', e);
    }
  }, [workOrders]);

  // Persist acknowledged alerts across sessions
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_ACKNOWLEDGED, JSON.stringify(Array.from(acknowledged)));
    } catch (e) {
      console.error('Failed to persist acknowledged alerts', e);
    }
  }, [acknowledged]);

  const { params, save: saveParams, saving } = useFacilityParams();
  const { values: liveValues, isLive, lastSeen } = useLiveFeed(feedMode, params);

  const overviewRef = useRef(null);
  const telemetryRef = useRef(null);
  const rootCauseRef = useRef(null);
  const actionRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Readings arrive from the sensor node via useLiveFeed; the demonstration
  // bus is used only while no hardware is reporting.

  // Shift clock: only after hydration, so server and client markup agree.
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString());
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('aegis-theme');
    const useDark = storedTheme === 'dark';
    setDarkMode(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle('dark', next);
      window.localStorage.setItem('aegis-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleCreateWorkOrder = (asset, id) => {
    if (workOrders.find(w => w.id === id)) {
      showToast(`Work Order #${id} already dispatched`);
      return;
    }
    const wo = {
      id,
      asset,
      created: new Date().toISOString(),
      status: 'dispatched',
      priority: id === '8821' ? 'critical' : 'advisory',
      diagnosis: asset === 'AHU-03' ? 'Bearing Degradation (Outer Race) 91%' : 'Strainer clogging 84%'
    };
    setWorkOrders(prev => [wo, ...prev]);
    playDispatchChime();
    showToast(`Work Order #${id} created for ${asset} • Shift lead notified`);
  };

  const handleClearWorkOrders = () => {
    setWorkOrders([]);
    playDispatchChime();
    showToast('Dispatched work orders cleared');
  };

  const handleAcknowledge = (key) => {
    setAcknowledged(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
    playDispatchChime();
    showToast(acknowledged.has(key) ? 'Unacknowledged' : 'Acknowledged • Logged to shift • Audit trail updated');
  };

  useEffect(() => {
    if (feedMode === 'fault') {
      playAlertChime();
    }
  }, [feedMode]);

  const handleExport = (type) => {
    const timestamp = new Date().toISOString();
    const data = {
      station: "Central Campus / Facility Unit 01",
      timestamp,
      mode: feedMode,
      range,
      assets: 38,
      points: 1428,
      health: feedMode === 'fault' ? 74 : 87,
      live_telemetry: liveValues,
      subsystems: [
        { id: 'hvac', health: feedMode === 'fault' ? 79 : 91, load: '242 kW', status: feedMode === 'fault' ? 'Attention' : 'Nominal' },
        { id: 'electrical', health: feedMode === 'fault' ? 74 : 82, balance: '94.1%', status: 'Attention' },
        { id: 'water', health: 95, pressure: '4.2 bar', status: 'Nominal' },
        { id: 'mechanical', health: feedMode === 'fault' ? 61 : 74, units: 38, status: feedMode === 'fault' ? 'Critical' : 'Action Required' },
        { id: 'energy', health: 88, pf: 0.96, status: 'Nominal' }
      ],
      anomalies: [
        { asset: 'AHU-03', vibration: `${liveValues.vib} mm/s`, current: `${liveValues.cur} A`, temp: `${liveValues.temp}°C`, diagnosis: 'Bearing Degradation', conf: 0.91, rul: '168h ±24h' },
        { asset: 'CW-Pump-02', flow: '4.1 L/s', diagnosis: 'Strainer clogging', conf: 0.84 },
        { asset: 'VAV-4B', damper: '20-80% hunting', diagnosis: 'Calibration drift' }
      ],
      work_orders: workOrders,
      checklist: type === 'checklist' ? [
        "Lockout/Tagout • Isolate AHU-03",
        "Inspect bearing grease • Check particulate",
        "Lubricate NLGI #2 • 2 pumps",
        "Pulley alignment <0.5mm",
        "Belt tension 45-55 Hz",
        "Phase current 14.2A ±0.5A",
        "10min validation <2.5 mm/s",
        "Log to Aegis"
      ] : undefined
    };

    if (type === 'json' || type === 'checklist') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-${type}-${range}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${type.toUpperCase()} • ${type === 'checklist' ? '8 tasks' : '1,428 points'}`);
    } else {
      const csv = `timestamp,asset,parameter,value,unit,status,confidence,rul
${timestamp},AHU-03,vibration,${liveValues.vib},mm/s,critical,91%,168h
${timestamp},AHU-03,current,${liveValues.cur},A,critical,91%,168h
${timestamp},AHU-03,temperature,${liveValues.temp},C,warning,91%,168h
${timestamp},CW-Pump-02,flow,4.1,L/s,advisory,84%,-
${timestamp},VAV-4B,damper,20-80,%,optimization,-,-`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-telemetry-${range}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported CSV • 5 anomalies • Multi-param correlated');
    }
  };

  const handleViewTelemetry = () => {
    setTab('console');
    setTimeout(() => scrollTo(telemetryRef), 60);
    showToast('Focused on trend telemetry • Correlation view');
  };

  const filteredSubsystems = useMemo(() => {
    const all = [
      { id: 'hvac', name: 'HVAC Network' },
      { id: 'electrical', name: 'Electrical Infrastructure' },
      { id: 'water', name: 'Hydraulic / Water Loops' },
      { id: 'mechanical', name: 'Mechanical Equipment' },
      { id: 'energy', name: 'Overall Energy Efficiency' },
    ];
    if (!searchQuery) return all;
    return all.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#F1EDE6] text-[#2A3138] selection:bg-[#2C6E9B]/30 transition-colors duration-300">
      <SideRail 
        tab={tab} 
        setTab={setTab} 
        onSettings={() => setSettingsOpen(true)} 
        settingsOpen={settingsOpen} 
        isLive={isLive} 
        feedMode={feedMode}
        collapsed={railCollapsed} 
        onToggleCollapse={() => setRailCollapsed(true)} 
        expanded={railExpanded}
        onToggleExpand={() => setRailExpanded(v => !v)}
      />

      <div className={`min-w-0 transition-[margin] duration-300 ${railCollapsed ? 'xl:ml-0' : (railExpanded ? 'xl:ml-[230px]' : 'xl:ml-[76px]')}`}>
        <TopHeader
          railCollapsed={railCollapsed}
          setRailCollapsed={setRailCollapsed}
          isLive={isLive}
          feedMode={feedMode}
          vibration={liveValues.vib}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          clock={clock}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          range={range}
          setRange={setRange}
          setFeedMode={setFeedMode}
          handleExport={handleExport}
          setSettingsOpen={setSettingsOpen}
        />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-4 space-y-5">

        <TabBar tab={tab} setTab={setTab} onSettings={() => setSettingsOpen(true)} />

        {/* Platform Header & Mission Overview */}
        <section ref={overviewRef} className="space-y-6 scroll-mt-[120px]">
          {tab === 'overview' && (
            <FacilityOverview
              feedMode={feedMode}
              liveValues={liveValues}
              isLive={isLive}
              setTab={setTab}
              onCreateWorkOrder={handleCreateWorkOrder}
              workOrders={workOrders}
              onExport={handleExport}
            />
          )}


          {tab === 'platform' && (
            <div className="space-y-4">
              <SectionLabel k="01" title="System Architecture & Hardware Reference" id="platform-ref" />
              <PlatformReference />
            </div>
          )}
        </section>

        {/* Central Operations Console */}
        <section className="space-y-6">
          {tab === 'console' && (
          <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="self-start px-3 py-1 bg-[#2C6E9B]/10 border border-[#2C6E9B]/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2C6E9B] animate-pulse" />
               <span className="font-display text-[12px] font-semibold text-[#2C6E9B]">Facility status</span>
            </div>
            <div className="hidden sm:block h-px flex-1 bg-[#E6E0D6]" />
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
               <span className="font-mono text-[10px] text-[#8A8175]">Showing {range} · {feedMode === 'fault' ? 'Fault example' : 'Normal operation'} · Updates every 1.8s</span>
              <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded-md">
                {['all', 'critical', 'nominal'].map(f => (
                  <button key={f} onClick={() => setTelemetryFilter(f)} className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase ${telemetryFilter === f ? 'bg-[#E6E0D6] text-[#1F2933]' : 'text-[#A99F90]'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <LiveTelemetryTicker mode={feedMode} values={isLive ? liveValues : null} params={params} isLive={isLive} />

          <div ref={telemetryRef} className="space-y-4 scroll-mt-[120px]">
            <FacilityHealth mode={feedMode} />

            <Card>
              <CardHeader>
                 <div>
                   <CardTitle>Building systems</CardTitle>
                   <p className="mt-1 text-[10px] text-[#8A8175]">Select a system to see its equipment and sensor details.</p>
                 </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{range} Window</Badge>
                  <div className="flex items-center gap-1">
                    <Filter size={10} className="text-[#A99F90]" />
                     <span className="font-mono text-[10px] text-[#8A8175]">{telemetryFilter === 'all' ? 'All systems' : telemetryFilter}</span>
                  </div>
                </div>
              </CardHeader>
              <SubsystemGrid mode={feedMode} onSelect={(id) => setActiveSubsystem(id)} />
              {searchQuery && (
                <div className="mt-3 font-mono text-[10px] text-[#8A8175]">Filtered {filteredSubsystems.length} subsystems for "{searchQuery}" • <button onClick={() => setSearchQuery('')} className="text-[#2C6E9B] underline">Clear</button></div>
              )}
            </Card>

            <div className="grid lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-5">
                <FailureForecast mode={feedMode} />
              </div>
              <div className="lg:col-span-7">
                <WorkOrderHistory workOrders={workOrders} onExport={handleExport} onClear={handleClearWorkOrders} />
              </div>
            </div>
          </div>


          </div>
          )}

          {tab === 'analysis' && (
          <div className="space-y-6">
          <div ref={rootCauseRef} className="space-y-4 scroll-mt-[120px]">
            <SectionLabel k="06" title="Root Cause Inspector & Active Triage Queue" />
            <RootCauseInspector mode={feedMode} />
            <TriageQueue
              onCreateWorkOrder={handleCreateWorkOrder}
              onViewTelemetry={handleViewTelemetry}
              acknowledged={acknowledged}
              onAcknowledge={handleAcknowledge}
              workOrders={workOrders}
              onOpenFieldSheet={() => setShowFieldSheet(true)}
            />
          </div>

          <div ref={actionRef} className="grid lg:grid-cols-12 gap-4 items-start scroll-mt-[120px]">
            <div className="lg:col-span-8 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>24-Hour Operational Telemetry Chart • Baseline vs Actual • Correlation View</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={feedMode === 'fault' ? 'attention' : 'nominal'}>{feedMode === 'fault' ? 'Anomaly Detected' : 'Nominal'}</Badge>
                    <span className="font-mono text-[10px] text-[#8A8175]">AHU-03 • Power Envelope • Live: {liveValues.cur}A</span>
                  </div>
                </CardHeader>
                <TelemetryChart mode={feedMode} range={range} />
              </Card>
              <CorrelationChart mode={feedMode} />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <MaintenanceChecklist onExport={handleExport} />
              <Card className="bg-[#FFFFFF] border-[#E6E0D6] p-4">
                <CardHeader className="p-0 pb-2 mb-2 border-b border-[#E6E0D6]">
                  <CardTitle>Engineering Standards & Compliance</CardTitle>
                  <Badge variant="nominal">MIT Open Source</Badge>
                </CardHeader>
                <div className="space-y-2 font-mono text-[10px] text-[#6E6558]">
                  <div className="flex justify-between py-0.5 border-b border-[#E6E0D6]/60">
                    <span className="text-[#8A8175]">Vibration Severity</span>
                    <strong className="text-[#1F2933]">ISO 10816-3 (Class II)</strong>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#E6E0D6]/60">
                    <span className="text-[#8A8175]">Safety Standard</span>
                    <strong className="text-[#C05043]">OSHA 1910.147 (LOTO)</strong>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#E6E0D6]/60">
                    <span className="text-[#8A8175]">Telemetry Bus</span>
                    <strong className="text-[#2C6E9B]">MQTT v3.1.1 / TLS 1.3</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#8A8175]">Audit Trail</span>
                    <strong className="text-[#2E7D5B]">SHA-256 Verified</strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          </div>
          )}
        </section>

        {/* Subsystem Detail View */}
        {tab === 'console' && activeSubsystem && (
          <AssetDetailView
            subsystemId={activeSubsystem}
            onBack={() => setActiveSubsystem(null)}
            liveValues={liveValues}
            feedMode={feedMode}
            range={range}
            onPrintFieldSheet={() => setShowFieldSheet(true)}
            onCreateWorkOrder={handleCreateWorkOrder}
            isDispatched={workOrders.some(w => w.id === '8821')}
          />
        )}

        {/* Interactive Scenario Simulator */}
        {tab === 'simulator' && (
          <section className="space-y-4 pb-6">
            <SectionLabel k="07" title="Predictive Digital Twin & What-If Simulation" id="simulator" />
            <PredictiveSimulator 
              params={params} 
              liveValues={liveValues} 
              isLive={isLive}
              onCreateWorkOrder={handleCreateWorkOrder}
              onOpenFieldSheet={() => setShowFieldSheet(true)}
              onExport={handleExport}
              isDispatched={workOrders.some(w => w.id === '8821')}
            />
          </section>
        )}

        {/* Footer */}
        <footer className="border-t-2 border-[#1F2933] pt-4 pb-20 xl:pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-[#8A8175]">
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-[#2C6E9B]" />
              <span>Aegis • Non-Profit • Open Access Facility Intelligence • MIT License • github.com/aegis-open • Built for field technicians, not boardrooms</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-2 py-0.5 bg-[#E6E0D6] border border-[#D2C9BA] rounded text-[#6E6558]">Simulated Demonstration Bus • 1,428 points • 38 assets • {range} • Live {liveValues.vib}mm/s</span>
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-4 gap-3 font-mono text-[9px] text-[#A99F90]">
            <div>• Open hardware: DHT22, ACS712, MPU6050, YF-S201, ESP32, MQTT</div>
            <div>• Explainable models: Seasonal ARIMA, Isolation Forest, FFT spectral</div>
            <div>• No vendor lock-in • No proprietary gateway • $180/asset</div>
            <div>• High-contrast industrial dark • Mobile field tablets • Offline capable</div>
          </div>
        </footer>
      </div>
      </div>

      {/* Field Sheet Modal */}
      <FieldSheetModal
        open={showFieldSheet}
        onClose={() => setShowFieldSheet(false)}
        liveValues={liveValues}
        params={params}
        onExport={handleExport}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-[#FFFFFF] border border-[#D2C9BA] text-[#1F2933] px-3 py-2.5 rounded-lg shadow-xl flex items-center gap-2 font-mono text-[11px] animate-in slide-in-from-bottom-2 max-w-[360px]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse shrink-0" />
          <span className="leading-relaxed">{toast}</span>
        </div>
      )}

      {/* Mobile jump nav */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF]/95 backdrop-blur border-t border-[#E6E0D6] p-2 flex gap-1 overflow-x-auto z-40">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`whitespace-nowrap font-mono text-[10px] px-3 py-1.5 rounded border uppercase transition-colors ${tab === t.id ? 'bg-[#2C6E9B] border-[#2C6E9B] text-[#FFFFFF]' : 'bg-[#E6E0D6] border-[#D2C9BA] text-[#3E4650] hover:bg-[#D2C9BA]'}`}>{t.label}</button>
        ))}
        <div className="ml-auto flex items-center gap-1 pl-2 border-l border-[#E6E0D6]">
          <div className="w-1 h-1 rounded-full bg-[#2E7D5B] animate-pulse" />
          <span className="font-mono text-[9px] text-[#8A8175] whitespace-nowrap">Live {liveValues.vib}mm/s</span>
        </div>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        params={params}
        onSave={saveParams}
        saving={saving}
        isLive={isLive}
        lastSeen={lastSeen}
      />
    </div>
  );
}
