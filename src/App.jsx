import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Shield, Activity, MapPin, Clock, Zap, Cpu, Layers, Radio, ChevronRight, ArrowLeft, Printer, FileJson, FileSpreadsheet, Thermometer, Waves, Volume2, Search, Filter, X, AlertTriangle, CheckCircle2, Settings, LayoutDashboard, ChartNoAxesCombined, Gauge, Cable, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

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
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useFacilityParams } from './lib/facility';
import { useLiveFeed } from './lib/liveFeed';

import { OperationalReality } from './components/workflow/OperationalReality';
import { ComparisonMatrix } from './components/workflow/ComparisonMatrix';
import { Pillars } from './components/workflow/Pillars';
import { ArchitectureDiagram } from './components/workflow/ArchitectureDiagram';
import { HardwareTable } from './components/workflow/HardwareTable';
import { RootCauseInspector } from './components/workflow/RootCauseInspector';
import { MaintenanceChecklist } from './components/workflow/MaintenanceChecklist';

const SectionLabel = ({ k, title, id }) => (
  <div id={id} className="flex items-center gap-3 mb-4 scroll-mt-[112px]">
    <div className="w-7 h-7 bg-[#F1EDE6] border border-[#D2C9BA] flex items-center justify-center font-mono text-[10px] font-bold text-[#6E6558]">{k}</div>
    <h2 className="font-display text-[12px] font-bold uppercase text-[#1F2933]">{title}</h2>
    <div className="flex-1 h-px bg-[#E6E0D6] ml-3" />
  </div>
);

const TABS = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { id: 'console', label: 'Live Console', shortLabel: 'Console', icon: Radio },
  { id: 'analysis', label: 'Analysis & Action', shortLabel: 'Analysis', icon: ChartNoAxesCombined },
  { id: 'simulator', label: 'Scenario Simulator', shortLabel: 'Simulator', icon: Gauge },
  { id: 'platform', label: 'Platform & Hardware', shortLabel: 'Platform', icon: Cable },
];

const TabBar = ({ tab, setTab }) => (
  <div className="flex xl:hidden overflow-x-auto items-center bg-[#FFFFFF] border border-[#E6E0D6]">
    {TABS.map(t => (
      <button
        key={t.id}
        onClick={() => setTab(t.id)}
        className={`whitespace-nowrap font-display text-[10px] font-bold uppercase px-3.5 py-2.5 border-b-2 transition-colors ${tab === t.id ? 'border-[#2C6E9B] text-[#2C6E9B] bg-[#2C6E9B]/5' : 'border-transparent text-[#6E6558] hover:bg-[#F1EDE6] hover:text-[#1F2933]'}`}
      >
        {t.shortLabel}
      </button>
    ))}
  </div>
);

const SideRail = ({ tab, setTab, onSettings, collapsed, darkMode, toggleTheme }) => (
  <div className={`hidden xl:block transition-[width] duration-300 ${collapsed ? 'w-0' : 'w-[76px]'}`}>
  <aside className={`hidden xl:flex fixed inset-y-0 left-0 z-[60] w-[76px] flex-col items-center bg-[#FFFFFF] border-r-2 border-[#1F2933] transition-transform duration-300 ${collapsed ? '-translate-x-full' : 'translate-x-0'}`}>
    <div className="h-[76px] w-full flex items-center justify-center border-b-2 border-[#1F2933]">
      <button type="button" onClick={toggleTheme} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="w-9 h-9 bg-[#2C6E9B] flex items-center justify-center shadow-[3px_3px_0_#1F2933] hover:bg-[#2E7D5B] transition-colors">
        <Shield size={19} className="text-[#FFFFFF]" />
      </button>
    </div>
    <nav className="w-full py-4 flex flex-col items-center gap-2" aria-label="Primary workspace navigation">
      {TABS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            title={item.label}
            aria-label={item.label}
            aria-current={tab === item.id ? 'page' : undefined}
            className={`relative w-12 h-12 flex items-center justify-center border transition-colors ${tab === item.id ? 'bg-[#2C6E9B] border-[#1F2933] text-[#FFFFFF] shadow-[3px_3px_0_#D2C9BA]' : 'bg-[#FAF8F4] border-[#E6E0D6] text-[#6E6558] hover:border-[#2C6E9B] hover:text-[#2C6E9B]'}`}
          >
            <Icon size={18} />
            {tab === item.id && <span className="absolute -left-[15px] h-6 w-1 bg-[#2C6E9B]" />}
          </button>
        );
      })}
    </nav>
    <button type="button" onClick={onSettings} title="Settings" aria-label="Settings" className="mt-auto mb-5 w-12 h-12 flex items-center justify-center border border-[#E6E0D6] bg-[#FAF8F4] text-[#6E6558] hover:border-[#2C6E9B] hover:text-[#2C6E9B] transition-colors">
      <Settings size={18} />
    </button>
  </aside>
  </div>
);

export default function App() {
  const [range, setRange] = useState('24H');
  const [feedMode, setFeedMode] = useState('fault');
  const [scenarioMode, setScenarioMode] = useState('degradation');
  const [activeSubsystem, setActiveSubsystem] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFieldSheet, setShowFieldSheet] = useState(false);
  const [telemetryFilter, setTelemetryFilter] = useState('all');
  const [tab, setTab] = useState('console');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
    setWorkOrders(prev => [...prev, wo]);
    showToast(`Work Order #${id} created for ${asset} • Shift lead notified`);
  };

  const handleAcknowledge = (key) => {
    setAcknowledged(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
    showToast(acknowledged.has(key) ? 'Unacknowledged' : 'Acknowledged • Logged to shift • Audit trail updated');
  };

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

  const detailData = useMemo(() => {
    const isFault = feedMode === 'fault' || scenarioMode === 'degradation';
    return {
      vibration: isFault ? `${liveValues.vib} mm/s` : `${liveValues.vib} mm/s RMS`,
      current: isFault ? `${liveValues.cur} A` : `${liveValues.cur} A`,
      temp: isFault ? `${liveValues.temp}°C` : `${liveValues.temp}°C`,
      acoustic: isFault ? `+${liveValues.acoustic} dB` : `+${liveValues.acoustic} dB`,
      thresholdVib: `${params.vibrationCritical} mm/s`,
      nominalCurrent: `${params.ratedCurrentA} A`,
      nominalTemp: `${params.tempCritical}°C`
    };
  }, [feedMode, scenarioMode, liveValues]);

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
      <SideRail tab={tab} setTab={setTab} onSettings={() => setSettingsOpen(true)} collapsed={railCollapsed} darkMode={darkMode} toggleTheme={toggleTheme} />
      <div className={`min-w-0 transition-[margin] duration-300 ${railCollapsed ? 'xl:ml-0' : 'xl:ml-[76px]'}`}>
      {/* Top Integrity Bar */}
      <div className="sticky top-0 z-50 bg-[#FFFFFF] border-b-2 border-[#1F2933] shadow-[0_2px_0_rgba(31,41,51,0.06)]">
        <div className="min-h-[46px] px-3 lg:px-5 flex items-center justify-between gap-3 border-b border-[#E6E0D6] bg-[#FAF8F4]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRailCollapsed((value) => !value)}
              className="hidden xl:flex w-8 h-8 items-center justify-center border border-[#D2C9BA] bg-[#FFFFFF] text-[#6E6558] hover:text-[#2C6E9B] hover:border-[#2C6E9B] transition-colors"
              aria-label={railCollapsed ? 'Show navigation panel' : 'Hide navigation panel'}
              title={railCollapsed ? 'Show navigation panel' : 'Hide navigation panel'}
            >
              {railCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleTheme} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="w-5 h-5 bg-[#2C6E9B] flex items-center justify-center xl:hidden hover:bg-[#2E7D5B] transition-colors">
                <Shield size={12} className="text-[#FFFFFF]" />
              </button>
              <span className="font-display text-[20px] sm:text-[24px] leading-none font-bold text-[#1F2933] uppercase">AEGIS</span>
            </div>
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#E6E0D6]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse" />
                <span className="font-mono text-[10px] tracking-wide text-[#2E7D5B]">Sensor status: {isLive ? 'Connected and receiving readings' : 'Using demonstration readings'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#8A8175] hidden lg:inline">{"\n"}</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E6E0D6] border border-[#D2C9BA]">
              <div className="w-1 h-1 rounded-full bg-[#2E7D5B] animate-pulse" />
               <span className="font-mono text-[9px] text-[#6E6558]">Vibration {liveValues.vib} mm/s</span>
            </div>
          </div>
        </div>

        {/* Global Control Bar */}
        <div className="min-h-[58px] px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#8A8175]" />
              <div>
                 <div className="text-[9px] font-bold uppercase text-[#8A8175]">Facility</div>
                <span className="font-display text-[14px] font-bold text-[#1F2933]">Central Campus / Facility Unit 01</span>
              </div>
              <Badge variant="neutral">UNIT-01</Badge>
            </div>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E6E0D6]">
              <Clock size={12} className="text-[#8A8175]" />
               <span className="font-mono text-[10px] text-[#6E6558]">Active shift · J. Rivera · 06:00–14:00 · {clock}</span>
            </div>
          </div>

          <div className="w-full lg:w-auto flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">



            <div className="relative hidden md:flex items-center">
              <Search size={12} className="absolute left-2 text-[#A99F90]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter subsystems..."
                className="pl-7 pr-2 py-1 w-[160px] bg-[#F1EDE6] border border-[#E6E0D6] rounded-md font-mono text-[10px] text-[#1F2933] placeholder:text-[#A99F90] focus:outline-none focus:border-[#D2C9BA]"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg">
              {['1H', '24H', '7D'].map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`font-mono text-[11px] px-2.5 py-1 rounded-md transition-all ${range === r ? 'bg-[#E6E0D6] text-[#1F2933] border border-[#D2C9BA]' : 'text-[#8A8175] hover:text-[#3E4650]'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg">
              <button onClick={() => setFeedMode('normal')} className={`font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${feedMode === 'normal' ? 'bg-[#2E7D5B]/20 text-[#2E7D5B] border border-[#2E7D5B]/30' : 'text-[#8A8175] hover:text-[#6E6558]'}`}>
                <div className={`w-1 h-1 rounded-full ${feedMode === 'normal' ? 'bg-[#2E7D5B]' : 'bg-[#C9C0B2]'}`} /> Normal Run
              </button>
              <button onClick={() => setFeedMode('fault')} className={`font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${feedMode === 'fault' ? 'bg-[#C05043]/20 text-[#C05043] border border-[#C05043]/30' : 'text-[#8A8175] hover:text-[#6E6558]'}`}>
                <div className={`w-1 h-1 rounded-full ${feedMode === 'fault' ? 'bg-[#C05043] animate-pulse' : 'bg-[#C9C0B2]'}`} /> Induced Fault
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="secondary" size="xs" onClick={() => handleExport('json')}><FileJson size={12} className="mr-1" /> JSON</Button>
              <Button variant="secondary" size="xs" onClick={() => handleExport('csv')}><FileSpreadsheet size={12} className="mr-1" /> CSV</Button>
              <Button variant="primary" size="xs" onClick={() => setSettingsOpen(true)}><Settings size={12} className="mr-1" /> Settings</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-4 space-y-5">

        <TabBar tab={tab} setTab={setTab} />

        {/* Platform Header & Mission Overview */}
        <section ref={overviewRef} className="space-y-6 scroll-mt-[120px]">
          {tab === 'overview' && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[#2C6E9B] to-[#2F8A7E] flex items-center justify-center shadow-lg shadow-[#2C6E9B]/20">
                  <Shield size={24} className="text-[#1F2933]" />
                </div>
                <div>
                  <h1 className="font-display text-[34px] sm:text-[42px] font-bold text-[#1F2933] leading-none uppercase">AEGIS</h1>
                  <p className="mt-2 font-mono text-[13px] leading-relaxed text-[#6E6558] max-w-[720px]">
                    Democratizing predictive maintenance and building health through open, explainable telemetry intelligence.
                  </p>
                  <p className="mt-3 font-mono text-[11px] leading-[1.7] text-[#8A8175] max-w-[720px] bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
                    <span className="text-[#3E4650] font-semibold">Core Mission:</span> "Existing building management systems are proprietary, costly, and alert-heavy. Aegis is a non-profit, open intelligence layer that unifies multi-parameter monitoring, explainable anomaly detection, and predictive maintenance to empower maintenance teams and protect shared infrastructure."
                    <br /><br />
                    <span className="text-[#2F8A7E]">Technician-First Flow:</span> Observe Multi-Parameter Data → Understand True Baselines → Flag Early Drift → Correlate Physical Systems → Explain Probable Failure → Generate Field Maintenance Plan
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#2C6E9B]/10 border border-[#2C6E9B]/20 rounded text-[#2C6E9B]">Open Hardware • ESP32 • MQTT</span>
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#2F8A7E]/10 border border-[#2F8A7E]/20 rounded text-[#2F8A7E]">Explainable AI • No Black Box</span>
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 rounded text-[#2E7D5B]">94% Pre-Failure Catch Rate</span>
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#E6E0D6] border border-[#D2C9BA] rounded text-[#6E6558]">MIT Licensed • Non-Profit</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              {[
                { label: "Total Assets Monitored", value: "38 Units", icon: Cpu, delta: "+2 this week" },
                { label: "Active Sensory Data Streams", value: "1,428 Points", icon: Radio, delta: "1m avg sampling" },
                { label: "Operational Uptime", value: "99.8%", icon: Activity, delta: "30D rolling" },
                { label: "Preventative Intervention Rate", value: "94% pre-failure catch", icon: Shield, delta: "vs 22% industry" },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <Card key={i} className="p-3 hover:border-[#D2C9BA] transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={12} className="text-[#2C6E9B]" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] leading-none">{m.label}</span>
                    </div>
                    <div className="font-mono text-[14px] font-bold text-[#1F2933]">{m.value}</div>
                    <div className="font-mono text-[9px] text-[#8A8175] mt-1">{m.delta}</div>
                  </Card>
                );
              })}
            </div>
          </div>
          )}


          {tab === 'platform' && (
          <div className="space-y-6">
          <SectionLabel k="01" title="The Operational Reality — Workflow Bottlenecks" id="bottlenecks" />
          <OperationalReality />

          <SectionLabel k="02" title="Existing Approaches vs. Aegis Workflow Matrix" id="matrix" />
          <ComparisonMatrix />

          <SectionLabel k="03" title="The 5 Operational Pillars — Data → Maintenance Action" id="pillars" />
          <Pillars />

          <SectionLabel k="04" title="System Architecture — Transparent & Open Flow" id="architecture" />
          <ArchitectureDiagram />

          <SectionLabel k="05" title="Hardware Layer — Democratized Sensor Kit" id="hardware" />
          <HardwareTable />
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
                <WorkOrderHistory workOrders={workOrders} onExport={handleExport} />
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
              <Card>
                <CardHeader>
                  <CardTitle>Public Good Guardrail • Open Access</CardTitle>
                  <Badge variant="nominal">MIT Licensed</Badge>
                </CardHeader>
                <div className="space-y-2 font-mono text-[10px] leading-relaxed text-[#6E6558]">
                  <div>• Democratizes predictive maintenance using low-cost COTS sensors • No vendor lock-in</div>
                  <div>• Transparent algorithms: Seasonal ARIMA, Isolation Forest, FFT — no black box</div>
                  <div>• Eliminates alert fatigue: learns normal, flags subtle multi-param drift</div>
                  <div>• Built for resource-constrained public infrastructure: schools, municipal, community hubs</div>
                  <div className="mt-2 p-2 bg-[#2C6E9B]/5 border border-[#2C6E9B]/20 rounded text-[#2C6E9B]">Open Architecture: github.com/aegis-open • Docs • Sensor Kit • Edge Gateway • MIT</div>
                </div>
              </Card>
            </div>
          </div>
          </div>
          )}
        </section>

        {/* Subsystem Detail View */}
        {tab === 'console' && activeSubsystem && (
          <section className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#8A8175]">
              <button onClick={() => setActiveSubsystem(null)} className="flex items-center gap-1 hover:text-[#1F2933] transition-colors"><ArrowLeft size={12} /> Return to Facility Console</button>
              <ChevronRight size={12} />
              <span>Console</span>
              <ChevronRight size={12} />
              <span>Equipment</span>
              <ChevronRight size={12} />
              <span className="text-[#1F2933]">{activeSubsystem.toUpperCase()} Detailed Analysis</span>
              {activeSubsystem === 'mechanical' || activeSubsystem === 'hvac' ? <Badge variant="critical">AHU-03 Focus • Live {liveValues.vib}mm/s</Badge> : null}
            </div>

            <div className="grid lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Sensor Tiles • {activeSubsystem.toUpperCase()} • AHU-03 Primary Supply Fan • Real-Time</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="xs" onClick={() => setActiveSubsystem(null)}>← Return</Button>
                      <Button variant="secondary" size="xs" onClick={() => setShowFieldSheet(true)}><Printer size={10} className="mr-1" /> Field Sheet</Button>
                    </div>
                  </CardHeader>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className={`bg-[#F1EDE6] border rounded-lg p-3 transition-all ${parseFloat(liveValues.vib) > 4 ? 'border-[#C05043]/50 bg-[#C05043]/5' : 'border-[#E6E0D6]'}`}>
                      <div className="flex items-center gap-1.5 mb-1"><Waves size={12} className={parseFloat(liveValues.vib) > 4 ? 'text-[#C05043]' : 'text-[#6E6558]'} /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Vibration Velocity</span></div>
                      <div className={`font-mono text-[18px] font-bold ${parseFloat(liveValues.vib) > 4 ? 'text-[#C05043]' : 'text-[#1F2933]'}`}>{detailData.vibration}</div>
                      <div className="font-mono text-[10px] text-[#8A8175]">Threshold: {detailData.thresholdVib} • <span className={parseFloat(liveValues.vib) > 4 ? 'text-[#C05043]' : 'text-[#2E7D5B]'}>{parseFloat(liveValues.vib) > 4 ? `+${Math.round((liveValues.vib/2.5-1)*100)}% over` : 'Nominal'}</span></div>
                      <div className="mt-2 h-1 bg-[#E6E0D6] rounded-full overflow-hidden"><div className="h-full bg-[#C05043] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.vib/8)*100)}%` }} /></div>
                    </div>
                    <div className={`bg-[#F1EDE6] border rounded-lg p-3 transition-all ${liveValues.cur > 16 ? 'border-[#B07B1C]/50 bg-[#B07B1C]/5' : 'border-[#E6E0D6]'}`}>
                      <div className="flex items-center gap-1.5 mb-1"><Zap size={12} className={liveValues.cur > 16 ? 'text-[#B07B1C]' : 'text-[#6E6558]'} /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Drive Current</span></div>
                      <div className={`font-mono text-[18px] font-bold ${liveValues.cur > 16 ? 'text-[#B07B1C]' : 'text-[#1F2933]'}`}>{detailData.current}</div>
                      <div className="font-mono text-[10px] text-[#8A8175]">Nominal: {detailData.nominalCurrent} • <span className={liveValues.cur > 16 ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}>{liveValues.cur > 16 ? `+${Math.round((liveValues.cur/14.2-1)*100)}% surge` : 'Nominal'}</span></div>
                      <div className="mt-2 h-1 bg-[#E6E0D6] rounded-full overflow-hidden"><div className="h-full bg-[#B07B1C] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.cur/20)*100)}%` }} /></div>
                    </div>
                    <div className={`bg-[#F1EDE6] border rounded-lg p-3 transition-all ${liveValues.temp > 65 ? 'border-[#C05043]/30 bg-[#C05043]/5' : 'border-[#E6E0D6]'}`}>
                      <div className="flex items-center gap-1.5 mb-1"><Thermometer size={12} className={liveValues.temp > 65 ? 'text-[#C05043]' : 'text-[#6E6558]'} /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Bearing Temp</span></div>
                      <div className="font-mono text-[18px] font-bold text-[#1F2933]">{detailData.temp}</div>
                      <div className="font-mono text-[10px] text-[#8A8175]">Nominal: {detailData.nominalTemp} • <span className={liveValues.temp > 65 ? 'text-[#C05043]' : 'text-[#2E7D5B]'}>{liveValues.temp > 65 ? 'Overheat' : 'Nominal'}</span></div>
                      <div className="mt-2 h-1 bg-[#E6E0D6] rounded-full overflow-hidden"><div className="h-full bg-[#C05043] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.temp/90)*100)}%` }} /></div>
                    </div>
                    <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Volume2 size={12} className="text-[#6E6558]" /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Acoustic HF Noise</span></div>
                      <div className="font-mono text-[18px] font-bold text-[#1F2933]">{detailData.acoustic}</div>
                      <div className="font-mono text-[10px] text-[#8A8175]">Baseline 0 dB • Spectral peak 3.2kHz</div>
                      <div className="mt-2 h-1 bg-[#E6E0D6] rounded-full overflow-hidden"><div className="h-full bg-[#2C6E9B] transition-all duration-700" style={{ width: `${feedMode === 'fault' ? 80 : 20}%` }} /></div>
                    </div>
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] mb-2">Multi-line Trend • Last 24H • Correlation: Current ↑ + Vibration ↑</div>
                      <TelemetryChart mode={feedMode} range="24H" />
                    </div>
                    <div className="space-y-4">
                      <FailureForecast mode={feedMode} />
                      <CorrelationChart mode={feedMode} />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-4 space-y-3">
                <Card className="border-[#C05043]/20">
                  <CardTitle>Root Cause Chain • Explainable</CardTitle>
                  <div className="mt-3 space-y-3 font-mono text-[11px]">
                    <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded p-2.5">
                      <div className="text-[#8A8175] text-[10px] uppercase mb-1">Observed Pattern • Live</div>
                      <div className="text-[#2A3138] leading-relaxed">Vibration ↑ ({liveValues.vib} mm/s) + Current Draw ↑ ({liveValues.cur}A) + Delta-T ↓ (3.1°C) → <span className="text-[#C05043] font-bold">Mechanical Drag & Bearing Wear</span></div>
                    </div>
                    <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded p-2.5">
                      <div className="text-[#8A8175] text-[10px] uppercase mb-1">Explainability • Transparent</div>
                      <div className="text-[#6E6558]">Model: Multivariate Isolation Forest + FFT • Spectral defect at 3.2x RPM (outer race) • Confidence 91% • RUL 168h ±24h • No black box • Seasonal ARIMA baseline 8–10 kWh</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="critical" size="sm" onClick={() => handleCreateWorkOrder('AHU-03', '8821')}>Create WO #8821</Button>
                      <Button variant="secondary" size="sm" onClick={() => setShowFieldSheet(true)}>Print Field Sheet</Button>
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardTitle>Asset Context • Open Data</CardTitle>
                  <div className="mt-2 space-y-2 font-mono text-[10px] text-[#6E6558]">
                    <div className="flex justify-between"><span>Location</span><span className="text-[#1F2933]">East Wing • Roof Level 3</span></div>
                    <div className="flex justify-between"><span>Model</span><span className="text-[#1F2933]">Trane M-Series • 2018</span></div>
                    <div className="flex justify-between"><span>Last PM</span><span className="text-[#1F2933]">2026-08-14 • 29 days ago</span></div>
                    <div className="flex justify-between"><span>Motor</span><span className="text-[#1F2933]">15 kW • 3-Phase • 1750 RPM</span></div>
                    <div className="flex justify-between"><span>Bearing</span><span className="text-[#1F2933]">6205-2RS • SKF • 2x • Stock: 4</span></div>
                    <div className="flex justify-between"><span>MQTT Topic</span><span className="text-[#2C6E9B]">facility/unit01/ahu03/telemetry</span></div>
                    <div className="flex justify-between"><span>Sampling</span><span className="text-[#1F2933]">{range} @ {range === '1H' ? '1m' : range === '24H' ? '15m' : '1h'}</span></div>
                  </div>
                </Card>
                <MaintenanceChecklist onExport={handleExport} />
              </div>
            </div>
          </section>
        )}

        {/* Interactive Scenario Simulator */}
        {tab === 'simulator' && (
        <section className="space-y-4 pb-10">
          <SectionLabel k="07" title='Interactive Scenario Simulator: "Normal Run" vs. "Mechanical Degradation"' id="simulator" />
          <PredictiveSimulator params={params} liveValues={liveValues} isLive={isLive} />
          <Card className="border-[#2C6E9B]/20 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2C6E9B]/20 border border-[#2C6E9B]/30 flex items-center justify-center text-[#2C6E9B]">
                  <Layers size={16} />
                </div>
                <div>
                  <div className="font-mono text-[12px] font-bold uppercase text-[#1F2933]">Technician Decision Aid • Live Simulator • Explainable AI</div>
                  <div className="font-mono text-[10px] text-[#8A8175]">Toggle to see how Aegis converts raw math into actionable field work • No vendor lock-in</div>
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg">
                <button onClick={() => setScenarioMode('normal')} className={`px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${scenarioMode === 'normal' ? 'bg-[#2E7D5B] text-[#FFFFFF] shadow' : 'text-[#8A8175] hover:text-[#3E4650]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${scenarioMode === 'normal' ? 'bg-white' : 'bg-[#C9C0B2]'}`} /> Normal Baseline
                </button>
                <button onClick={() => setScenarioMode('degradation')} className={`px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${scenarioMode === 'degradation' ? 'bg-[#C05043] text-[#FFFFFF] shadow' : 'text-[#8A8175] hover:text-[#3E4650]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${scenarioMode === 'degradation' ? 'bg-white animate-pulse' : 'bg-[#C9C0B2]'}`} /> Mechanical Degradation
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-5 space-y-3">
                <div className={`rounded-lg border p-4 transition-all ${scenarioMode === 'normal' ? 'bg-[#2E7D5B]/5 border-[#2E7D5B]/20' : 'bg-[#C05043]/5 border-[#C05043]/20'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175]">Mode {scenarioMode === 'normal' ? 'A: Normal Baseline Operating State' : 'B: Mechanical Degradation (Induced Fault)'}</span>
                    <Badge variant={scenarioMode === 'normal' ? 'nominal' : 'critical'}>{scenarioMode === 'normal' ? 'Nominal' : 'Action Required'}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-[#8A8175]">Vibration</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 transition-all ${scenarioMode === 'normal' ? 'text-[#2E7D5B]' : 'text-[#C05043]'}`}>{scenarioMode === 'normal' ? '2.1 mm/s RMS' : `${liveValues.vib} mm/s RMS`}</div>
                      <div className="font-mono text-[8px] text-[#A99F90] mt-1">Threshold 2.5</div>
                    </div>
                    <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-[#8A8175]">Current</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 transition-all ${scenarioMode === 'normal' ? 'text-[#1F2933]' : 'text-[#B07B1C]'}`}>{scenarioMode === 'normal' ? '14.2 A' : `${liveValues.cur} A (+24%)`}</div>
                      <div className="font-mono text-[8px] text-[#A99F90] mt-1">Nominal 14.2A</div>
                    </div>
                    <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-[#8A8175]">Temp</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 transition-all ${scenarioMode === 'normal' ? 'text-[#1F2933]' : 'text-[#C05043]'}`}>{scenarioMode === 'normal' ? '54.2°C' : `${liveValues.temp}°C`}</div>
                      <div className="font-mono text-[8px] text-[#A99F90] mt-1">Nominal 52°C</div>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded bg-[#F1EDE6] border border-[#E6E0D6] font-mono text-[11px] leading-relaxed">
                    {scenarioMode === 'normal' ? (
                      <span className="text-[#2E7D5B] flex gap-1.5"><CheckCircle2 size={12} className="shrink-0 mt-0.5" /> System Readout: "All variables tracking within learned seasonal boundaries. Zero technician intervention required. Envelope deviation +0.8%. Next PM in 12 days."</span>
                    ) : (
                      <span className="text-[#B07B1C] flex gap-1.5"><AlertTriangle size={12} className="shrink-0 mt-0.5" /> System Readout: "Cross-parameter correlation confirms mechanical binding. Outer race defect 91% confidence. RUL 168h ±24h. Generating technician triage steps. Action window 7 days."</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] mb-2">Telemetry Mini-Trend • Live Simulation • {range}</div>
                  <div className="h-[80px] w-full relative">
                    <svg viewBox="0 0 200 80" className="w-full h-full">
                      <path d={scenarioMode === 'normal' ? "M0 40 Q 50 38, 100 40 T 200 40" : `M0 40 Q 30 38, 60 35 T 110 ${20 + Math.random()*5} T 160 ${15 + Math.random()*3} T 200 ${12 + Math.random()*4}`} fill="none" stroke={scenarioMode === 'normal' ? "#2E7D5B" : "#C05043"} strokeWidth="2" className="transition-all duration-700" />
                      <path d={scenarioMode === 'normal' ? "M0 50 Q 50 48, 100 50 T 200 50" : `M0 50 Q 30 48, 60 45 T 110 ${35 + Math.random()*3} T 160 ${30 + Math.random()*3} T 200 ${28 + Math.random()*2}`} fill="none" stroke="#2C6E9B" strokeWidth="1.5" opacity="0.7" className="transition-all duration-700" />
                    </svg>
                  </div>
                  <div className="flex gap-3 font-mono text-[9px] text-[#8A8175]">
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#C05043]" />Vibration • Live {liveValues.vib}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#2C6E9B]" />Current • Live {liveValues.cur}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="h-full bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#2C6E9B]/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-2 mb-3">
                    <Printer size={14} className="text-[#8A8175]" />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#1F2933]">Instant Maintenance Ticket • Printable Field Sheet • Exportable Checklist</span>
                    <Badge variant="neutral">WO-#8821</Badge>
                    <Badge variant="info">Live Bus</Badge>
                  </div>

                  {scenarioMode === 'normal' ? (
                    <div className="space-y-3 font-mono text-[11px] text-[#6E6558]">
                      <div className="p-8 text-center border border-dashed border-[#E6E0D6] rounded-lg">
                        <div className="w-10 h-10 mx-auto rounded-full bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 flex items-center justify-center text-[#2E7D5B] mb-2">✓</div>
                        <div className="text-[#2E7D5B] font-semibold">No action required • System nominal</div>
                        <div className="text-[10px] text-[#8A8175] mt-1">Next scheduled PM in 12 days • All 1,428 points within envelope • 99.8% uptime</div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-[9px]">
                          <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2"><span className="text-[#8A8175]">Envelope Dev</span><br /><span className="text-[#2E7D5B] font-bold">+0.8%</span></div>
                          <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2"><span className="text-[#8A8175]">Model Conf</span><br /><span className="text-[#1F2933] font-bold">94%</span></div>
                          <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2"><span className="text-[#8A8175]">RUL</span><br /><span className="text-[#1F2933] font-bold">720h+</span></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                        <div><span className="text-[#8A8175] uppercase">Asset:</span><span className="text-[#1F2933] ml-2">AHU-03 Supply Fan • East Wing</span></div>
                        <div><span className="text-[#8A8175] uppercase">Priority:</span><span className="text-[#C05043] ml-2">Critical • 7 Day Window • Live {liveValues.vib}mm/s</span></div>
                        <div><span className="text-[#8A8175] uppercase">Diagnosis:</span><span className="text-[#B07B1C] ml-2">Bearing Outer Race • 91% • 3.2x RPM</span></div>
                        <div><span className="text-[#8A8175] uppercase">RUL:</span><span className="text-[#1F2933] ml-2">168h ±24h • Slope 0.12A/day</span></div>
                      </div>

                      <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E6558] mb-2">Step-by-Step Resolution Tasks • Field Ready • High Contrast</div>
                        <ol className="space-y-2 font-mono text-[11px] text-[#3E4650] list-decimal list-inside">
                          <li className="leading-relaxed"><span className="text-[#1F2933] font-semibold">Lockout/Tagout</span> • Isolate AHU-03 at disconnect • Verify zero energy • PPE: gloves, goggles • SOP-EL-03</li>
                          <li className="leading-relaxed"><span className="text-[#1F2933] font-semibold">Lubricate & Inspect</span> • Bearing housing grease condition • Check for metal particulate • NLGI #2 • 2 pumps • Photo log</li>
                          <li className="leading-relaxed"><span className="text-[#1F2933] font-semibold">Mechanical Check</span> • Pulley alignment (straight edge) • Belt tension (45-55 Hz) • Set screw torque 8 Nm • Loctite 243</li>
                          <li className="leading-relaxed"><span className="text-[#1F2933] font-semibold">Electrical Verification</span> • Phase current under manual bypass • Expected 14.2A ±0.5A • Check imbalance &lt;2% • Fluke 376</li>
                          <li className="leading-relaxed"><span className="text-[#1F2933] font-semibold">Post-Repair Validation</span> • Run 10min • Vibration target &lt;2.5 mm/s • Current &lt;14.8A • Log to Aegis • Close WO</li>
                        </ol>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2">
                          <div className="font-mono text-[9px] uppercase text-[#8A8175]">Tools Required • Field Kit</div>
                          <div className="mt-1 font-mono text-[10px] text-[#3E4650] leading-relaxed">• Grease gun + NLGI2 • Stock: 12<br />• Vibration meter • Calibrated<br />• Clamp meter Fluke 376 • OK<br />• Straight edge, tension gauge • OK</div>
                        </div>
                        <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2">
                          <div className="font-mono text-[9px] uppercase text-[#8A8175]">Parts • Stock Check • Open Inventory</div>
                          <div className="mt-1 font-mono text-[10px] text-[#3E4650] leading-relaxed">• Bearing 6205-2RS (x2) • Stock: 4 • $12/ea<br />• Belt B-62 • Stock: 6 • $18<br />• Grease cartridge • Stock: 12 • $5<br />• Total kit &lt;$180/asset</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="teal" size="sm" className="flex-1" onClick={() => { handleCreateWorkOrder('AHU-03', '8821'); setShowFieldSheet(true); }}><Printer size={12} className="mr-1.5" /> Print Field Sheet (PDF) • Checklist</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>Export Ticket JSON</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleExport('checklist')}>Checklist JSON</Button>
                      </div>
                      {workOrders.find(w => w.id === '8821') && (
                        <div className="font-mono text-[10px] text-[#2E7D5B] bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 rounded p-2 flex items-center gap-2">
                          <CheckCircle2 size={12} /> Ticket generated and dispatched • Shift lead J. Rivera notified • ETA Today 14:30 • Audit logged
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
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
      {showFieldSheet && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[720px] max-h-[90vh] overflow-auto bg-[#FFFFFF] border border-[#D2C9BA] rounded-[12px] shadow-2xl">
            <div className="sticky top-0 bg-[#FFFFFF] border-b border-[#E6E0D6] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer size={16} className="text-[#2C6E9B]" />
                <span className="font-mono text-[12px] font-bold uppercase text-[#1F2933]">Field Sheet • WO #8821 • AHU-03 • Printable</span>
                <Badge variant="critical">Critical</Badge>
              </div>
              <button onClick={() => setShowFieldSheet(false)} className="w-7 h-7 rounded bg-[#E6E0D6] border border-[#D2C9BA] flex items-center justify-center text-[#6E6558] hover:text-[#1F2933]"><X size={14} /></button>
            </div>
            <div className="p-6 space-y-4 font-mono text-[11px]">
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg">
                <div><span className="text-[#8A8175] uppercase">Asset:</span><span className="text-[#1F2933] ml-2">AHU-03 Primary Supply Fan (East Wing)</span></div>
                <div><span className="text-[#8A8175] uppercase">Location:</span><span className="text-[#1F2933] ml-2">Roof Level 3 • East Wing</span></div>
                <div><span className="text-[#8A8175] uppercase">Diagnosis:</span><span className="text-[#C05043] ml-2">Bearing Outer Race • 91% Confidence</span></div>
                <div><span className="text-[#8A8175] uppercase">RUL:</span><span className="text-[#1F2933] ml-2">168h ±24h • Action &lt;7D</span></div>
                <div><span className="text-[#8A8175] uppercase">Live Reading:</span><span className="text-[#B07B1C] ml-2">{liveValues.vib} mm/s • {liveValues.cur}A • {liveValues.temp}°C</span></div>
                <div><span className="text-[#8A8175] uppercase">Model:</span><span className="text-[#1F2933] ml-2">Trane M-Series • 15kW • 1750 RPM</span></div>
              </div>
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E6558]">Checklist • 9 Tasks • {Math.round((2/9)*100)}% Complete Example</div>
                {[
                  "LOTO • Isolate AHU-03 • Verify zero energy • PPE",
                  "Inspect grease • Metal particulate check • Photo",
                  "Lubricate NLGI #2 • 2 pumps",
                  "Pulley alignment <0.5mm • Straight edge",
                  "Belt tension 45-55 Hz",
                  "Torque 8 Nm • Loctite 243",
                  "Phase current 14.2A ±0.5A • Imbalance <2%",
                  "10min run • Vib <2.5 mm/s • Current <14.8A",
                  "Log to Aegis • Close WO"
                ].map((t, i) => (
                  <div key={i} className="flex gap-2 p-2 bg-[#F1EDE6] border border-[#E6E0D6] rounded">
                    <div className="w-5 h-5 rounded border border-[#D2C9BA] flex items-center justify-center text-[10px]">{i < 2 ? '✓' : '☐'}</div>
                    <span className="text-[#3E4650]">{i+1}. {t}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="teal" size="sm" className="flex-1" onClick={() => { handleExport('checklist'); showToast('Field sheet printed • PDF ready for tablet'); }}><Printer size={12} className="mr-1.5" /> Print PDF • High Contrast</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowFieldSheet(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
