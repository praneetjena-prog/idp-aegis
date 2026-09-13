import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Shield, Activity, MapPin, Clock, Zap, Cpu, Layers, Radio, ChevronRight, ArrowLeft, Printer, FileJson, FileSpreadsheet, Thermometer, Waves, Volume2, Search, Filter, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

import { OperationalReality } from './components/workflow/OperationalReality';
import { ComparisonMatrix } from './components/workflow/ComparisonMatrix';
import { Pillars } from './components/workflow/Pillars';
import { ArchitectureDiagram } from './components/workflow/ArchitectureDiagram';
import { HardwareTable } from './components/workflow/HardwareTable';
import { RootCauseInspector } from './components/workflow/RootCauseInspector';
import { MaintenanceChecklist } from './components/workflow/MaintenanceChecklist';

const SectionLabel = ({ k, title, id }) => (
  <div id={id} className="flex items-center gap-3 mb-6 scroll-mt-[120px]">
    <div className="w-8 h-8 rounded bg-[#1E2638] border border-[#26324D] flex items-center justify-center font-mono text-[11px] font-bold text-slate-400">{k}</div>
    <h2 className="font-mono text-[13px] font-bold tracking-[0.15em] uppercase text-white">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-[#1E2638] to-transparent ml-4" />
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
  const [liveValues, setLiveValues] = useState({ vib: 6.8, cur: 17.6, temp: 71.8, acoustic: 12 });
  const [telemetryFilter, setTelemetryFilter] = useState('all');

  const overviewRef = useRef(null);
  const telemetryRef = useRef(null);
  const rootCauseRef = useRef(null);
  const actionRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Live simulation loop
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveValues(prev => {
        if (feedMode === 'fault') {
          return {
            vib: +(6.5 + Math.random() * 0.7).toFixed(1),
            cur: +(17.2 + Math.random() * 0.9).toFixed(1),
            temp: +(70 + Math.random() * 4).toFixed(1),
            acoustic: Math.floor(10 + Math.random() * 5)
          };
        } else {
          return {
            vib: +(2.0 + Math.random() * 0.4).toFixed(1),
            cur: +(14.0 + Math.random() * 0.4).toFixed(1),
            temp: +(53 + Math.random() * 2.5).toFixed(1),
            acoustic: Math.floor(Math.random() * 3)
          };
        }
      });
    }, 1800);
    return () => clearInterval(iv);
  }, [feedMode]);

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
    scrollTo(telemetryRef);
    showToast('Focused on trend telemetry • Correlation view');
  };

  const detailData = useMemo(() => {
    const isFault = feedMode === 'fault' || scenarioMode === 'degradation';
    return {
      vibration: isFault ? `${liveValues.vib} mm/s` : `${liveValues.vib} mm/s RMS`,
      current: isFault ? `${liveValues.cur} A` : `${liveValues.cur} A`,
      temp: isFault ? `${liveValues.temp}°C` : `${liveValues.temp}°C`,
      acoustic: isFault ? `+${liveValues.acoustic} dB` : `+${liveValues.acoustic} dB`,
      thresholdVib: '2.5 mm/s',
      nominalCurrent: '14.2 A',
      nominalTemp: '52°C'
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
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 selection:bg-[#0EA5E9]/30">
      {/* Top Integrity Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0E14]/90 border-b border-[#1E2638]">
        <div className="h-[32px] px-4 flex items-center justify-between border-b border-[#1E2638]/60 bg-[#121721]/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#0EA5E9] flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
              <span className="font-mono text-[11px] font-bold tracking-wider text-white uppercase">Aegis</span>
              <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">Facility Operations Engine</span>
            </div>
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#1E2638]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono text-[10px] tracking-wide text-[#10B981] uppercase">Aegis Open Engine — Telemetry Source: Simulated Demonstration Bus</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-500 hidden lg:inline">v0.9.5 • Open Non-Profit • MIT Licensed • Explainable AI</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1E2638] border border-[#26324D]">
              <div className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono text-[9px] text-slate-400 uppercase">Live Bus • {liveValues.vib}mm/s</span>
            </div>
          </div>
        </div>

        {/* Global Control Bar */}
        <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-500" />
              <span className="font-mono text-[11px] font-semibold text-white">Central Campus / Facility Unit 01</span>
              <Badge variant="neutral">UNIT-01</Badge>
            </div>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#1E2638]">
              <Clock size={12} className="text-slate-500" />
              <span className="font-mono text-[10px] text-slate-400">Shift: Active Logged View • Tech: J. Rivera • 06:00-14:00 • {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-1 mr-3 pr-3 border-r border-[#1E2638]">
              {[
                { label: 'Overview', ref: overviewRef },
                { label: 'Telemetry', ref: telemetryRef },
                { label: 'Root Cause', ref: rootCauseRef },
                { label: 'Action', ref: actionRef },
              ].map((item, i) => (
                <button key={i} onClick={() => scrollTo(item.ref)} className="font-mono text-[10px] px-2 py-1 rounded hover:bg-[#1E2638] text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative hidden md:flex items-center">
              <Search size={12} className="absolute left-2 text-slate-600" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter subsystems..."
                className="pl-7 pr-2 py-1 w-[160px] bg-[#0B0E14] border border-[#1E2638] rounded-md font-mono text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#26324D]"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#0B0E14] border border-[#1E2638] rounded-lg">
              {['1H', '24H', '7D'].map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`font-mono text-[11px] px-2.5 py-1 rounded-md transition-all ${range === r ? 'bg-[#1E2638] text-white border border-[#26324D]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#0B0E14] border border-[#1E2638] rounded-lg">
              <button onClick={() => setFeedMode('normal')} className={`font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${feedMode === 'normal' ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' : 'text-slate-500 hover:text-slate-400'}`}>
                <div className={`w-1 h-1 rounded-full ${feedMode === 'normal' ? 'bg-[#10B981]' : 'bg-slate-600'}`} /> Normal Run
              </button>
              <button onClick={() => setFeedMode('fault')} className={`font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${feedMode === 'fault' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' : 'text-slate-500 hover:text-slate-400'}`}>
                <div className={`w-1 h-1 rounded-full ${feedMode === 'fault' ? 'bg-[#EF4444] animate-pulse' : 'bg-slate-600'}`} /> Induced Fault
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="secondary" size="xs" onClick={() => handleExport('json')}><FileJson size={12} className="mr-1" /> JSON</Button>
              <Button variant="secondary" size="xs" onClick={() => handleExport('csv')}><FileSpreadsheet size={12} className="mr-1" /> CSV</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 py-6 space-y-10">

        {/* Platform Header & Mission Overview */}
        <section ref={overviewRef} className="space-y-6 scroll-mt-[120px]">
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[#0EA5E9] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0EA5E9]/20">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="font-mono text-[22px] font-bold tracking-tight text-white leading-none">Aegis Facility Operations Engine</h1>
                  <p className="mt-2 font-mono text-[13px] leading-relaxed text-slate-400 max-w-[720px]">
                    Democratizing predictive maintenance and building health through open, explainable telemetry intelligence.
                  </p>
                  <p className="mt-3 font-mono text-[11px] leading-[1.7] text-slate-500 max-w-[720px] bg-[#121721] border border-[#1E2638] rounded-lg p-3">
                    <span className="text-slate-300 font-semibold">Core Mission:</span> "Existing building management systems are proprietary, costly, and alert-heavy. Aegis is a non-profit, open intelligence layer that unifies multi-parameter monitoring, explainable anomaly detection, and predictive maintenance to empower maintenance teams and protect shared infrastructure."
                    <br /><br />
                    <span className="text-[#14B8A6]">Technician-First Flow:</span> Observe Multi-Parameter Data → Understand True Baselines → Flag Early Drift → Correlate Physical Systems → Explain Probable Failure → Generate Field Maintenance Plan
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded text-[#0EA5E9]">Open Hardware • ESP32 • MQTT</span>
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded text-[#14B8A6]">Explainable AI • No Black Box</span>
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#10B981]/10 border border-[#10B981]/20 rounded text-[#10B981]">94% Pre-Failure Catch Rate</span>
                    <span className="font-mono text-[9px] px-2 py-1 bg-[#1E2638] border border-[#26324D] rounded text-slate-400">MIT Licensed • Non-Profit</span>
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
                  <Card key={i} className="p-3 hover:border-[#26324D] transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={12} className="text-[#0EA5E9]" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 leading-none">{m.label}</span>
                    </div>
                    <div className="font-mono text-[14px] font-bold text-white">{m.value}</div>
                    <div className="font-mono text-[9px] text-slate-500 mt-1">{m.delta}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          <LiveTelemetryTicker mode={feedMode} />

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
        </section>

        {/* Central Operations Console */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#0EA5E9]">Live Operations Console</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[#1E2638] to-transparent" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-500">Range: {range} • Mode: {feedMode.toUpperCase()} • Refresh: 1.8s • Bus: MQTT • Live: {liveValues.vib}mm/s {liveValues.cur}A {liveValues.temp}°C</span>
              <div className="flex items-center gap-1 p-0.5 bg-[#0B0E14] border border-[#1E2638] rounded-md">
                {['all', 'critical', 'nominal'].map(f => (
                  <button key={f} onClick={() => setTelemetryFilter(f)} className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase ${telemetryFilter === f ? 'bg-[#1E2638] text-white' : 'text-slate-600'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <div ref={telemetryRef} className="grid lg:grid-cols-12 gap-4 scroll-mt-[120px]">
            <div className="lg:col-span-4 space-y-4">
              <FacilityHealth mode={feedMode} />
              <FailureForecast mode={feedMode} />
            </div>
            <div className="lg:col-span-8 space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Subsystem Telemetry • Click for Deep-Dive • {filteredSubsystems.length} filtered</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{range} Window</Badge>
                    <div className="flex items-center gap-1">
                      <Filter size={10} className="text-slate-600" />
                      <span className="font-mono text-[10px] text-slate-500">{telemetryFilter}</span>
                    </div>
                  </div>
                </CardHeader>
                <SubsystemGrid mode={feedMode} onSelect={(id) => setActiveSubsystem(id)} />
                {searchQuery && (
                  <div className="mt-3 font-mono text-[10px] text-slate-500">Filtered {filteredSubsystems.length} subsystems for "{searchQuery}" • <button onClick={() => setSearchQuery('')} className="text-[#0EA5E9] underline">Clear</button></div>
                )}
              </Card>
              <WorkOrderHistory workOrders={workOrders} onExport={handleExport} />
            </div>
          </div>

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

          <div ref={actionRef} className="grid lg:grid-cols-12 gap-4 scroll-mt-[120px]">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle>24-Hour Operational Telemetry Chart • Baseline vs Actual • Correlation View</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={feedMode === 'fault' ? 'attention' : 'nominal'}>{feedMode === 'fault' ? 'Anomaly Detected' : 'Nominal'}</Badge>
                    <span className="font-mono text-[10px] text-slate-500">AHU-03 • Power Envelope • Live: {liveValues.cur}A</span>
                  </div>
                </CardHeader>
                <TelemetryChart mode={feedMode} range={range} />
              </Card>
            </div>
            <div className="lg:col-span-4">
              <MaintenanceChecklist onExport={handleExport} />
            </div>
          </div>
        </section>

        {/* Subsystem Detail View */}
        {activeSubsystem && (
          <section className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <button onClick={() => setActiveSubsystem(null)} className="flex items-center gap-1 hover:text-white transition-colors"><ArrowLeft size={12} /> Return to Facility Console</button>
              <ChevronRight size={12} />
              <span>Console</span>
              <ChevronRight size={12} />
              <span>Equipment</span>
              <ChevronRight size={12} />
              <span className="text-white">{activeSubsystem.toUpperCase()} Detailed Analysis</span>
              {activeSubsystem === 'mechanical' || activeSubsystem === 'hvac' ? <Badge variant="critical">AHU-03 Focus • Live {liveValues.vib}mm/s</Badge> : null}
            </div>

            <div className="grid lg:grid-cols-12 gap-4">
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
                    <div className={`bg-[#0B0E14] border rounded-lg p-3 transition-all ${parseFloat(liveValues.vib) > 4 ? 'border-[#EF4444]/50 bg-[#EF4444]/5' : 'border-[#1E2638]'}`}>
                      <div className="flex items-center gap-1.5 mb-1"><Waves size={12} className={parseFloat(liveValues.vib) > 4 ? 'text-[#EF4444]' : 'text-slate-400'} /><span className="font-mono text-[9px] uppercase text-slate-500">Vibration Velocity</span></div>
                      <div className={`font-mono text-[18px] font-bold ${parseFloat(liveValues.vib) > 4 ? 'text-[#EF4444]' : 'text-white'}`}>{detailData.vibration}</div>
                      <div className="font-mono text-[10px] text-slate-500">Threshold: {detailData.thresholdVib} • <span className={parseFloat(liveValues.vib) > 4 ? 'text-[#EF4444]' : 'text-[#10B981]'}>{parseFloat(liveValues.vib) > 4 ? `+${Math.round((liveValues.vib/2.5-1)*100)}% over` : 'Nominal'}</span></div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#EF4444] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.vib/8)*100)}%` }} /></div>
                    </div>
                    <div className={`bg-[#0B0E14] border rounded-lg p-3 transition-all ${liveValues.cur > 16 ? 'border-[#F59E0B]/50 bg-[#F59E0B]/5' : 'border-[#1E2638]'}`}>
                      <div className="flex items-center gap-1.5 mb-1"><Zap size={12} className={liveValues.cur > 16 ? 'text-[#F59E0B]' : 'text-slate-400'} /><span className="font-mono text-[9px] uppercase text-slate-500">Drive Current</span></div>
                      <div className={`font-mono text-[18px] font-bold ${liveValues.cur > 16 ? 'text-[#F59E0B]' : 'text-white'}`}>{detailData.current}</div>
                      <div className="font-mono text-[10px] text-slate-500">Nominal: {detailData.nominalCurrent} • <span className={liveValues.cur > 16 ? 'text-[#F59E0B]' : 'text-[#10B981]'}>{liveValues.cur > 16 ? `+${Math.round((liveValues.cur/14.2-1)*100)}% surge` : 'Nominal'}</span></div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#F59E0B] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.cur/20)*100)}%` }} /></div>
                    </div>
                    <div className={`bg-[#0B0E14] border rounded-lg p-3 transition-all ${liveValues.temp > 65 ? 'border-[#EF4444]/30 bg-[#EF4444]/5' : 'border-[#1E2638]'}`}>
                      <div className="flex items-center gap-1.5 mb-1"><Thermometer size={12} className={liveValues.temp > 65 ? 'text-[#EF4444]' : 'text-slate-400'} /><span className="font-mono text-[9px] uppercase text-slate-500">Bearing Temp</span></div>
                      <div className="font-mono text-[18px] font-bold text-white">{detailData.temp}</div>
                      <div className="font-mono text-[10px] text-slate-500">Nominal: {detailData.nominalTemp} • <span className={liveValues.temp > 65 ? 'text-[#EF4444]' : 'text-[#10B981]'}>{liveValues.temp > 65 ? 'Overheat' : 'Nominal'}</span></div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#EF4444] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.temp/90)*100)}%` }} /></div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Volume2 size={12} className="text-slate-400" /><span className="font-mono text-[9px] uppercase text-slate-500">Acoustic HF Noise</span></div>
                      <div className="font-mono text-[18px] font-bold text-white">{detailData.acoustic}</div>
                      <div className="font-mono text-[10px] text-slate-500">Baseline 0 dB • Spectral peak 3.2kHz</div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#0EA5E9] transition-all duration-700" style={{ width: `${feedMode === 'fault' ? 80 : 20}%` }} /></div>
                    </div>
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Multi-line Trend • Last 24H • Correlation: Current ↑ + Vibration ↑</div>
                      <TelemetryChart mode={feedMode} range="24H" />
                    </div>
                    <div>
                      <FailureForecast mode={feedMode} />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-4 space-y-3">
                <Card className="border-[#EF4444]/20">
                  <CardTitle>Root Cause Chain • Explainable</CardTitle>
                  <div className="mt-3 space-y-3 font-mono text-[11px]">
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-2.5">
                      <div className="text-slate-500 text-[10px] uppercase mb-1">Observed Pattern • Live</div>
                      <div className="text-slate-200 leading-relaxed">Vibration ↑ ({liveValues.vib} mm/s) + Current Draw ↑ ({liveValues.cur}A) + Delta-T ↓ (3.1°C) → <span className="text-[#EF4444] font-bold">Mechanical Drag & Bearing Wear</span></div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-2.5">
                      <div className="text-slate-500 text-[10px] uppercase mb-1">Explainability • Transparent</div>
                      <div className="text-slate-400">Model: Multivariate Isolation Forest + FFT • Spectral defect at 3.2x RPM (outer race) • Confidence 91% • RUL 168h ±24h • No black box • Seasonal ARIMA baseline 8–10 kWh</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="critical" size="sm" onClick={() => handleCreateWorkOrder('AHU-03', '8821')}>Create WO #8821</Button>
                      <Button variant="secondary" size="sm" onClick={() => setShowFieldSheet(true)}>Print Field Sheet</Button>
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardTitle>Asset Context • Open Data</CardTitle>
                  <div className="mt-2 space-y-2 font-mono text-[10px] text-slate-400">
                    <div className="flex justify-between"><span>Location</span><span className="text-white">East Wing • Roof Level 3</span></div>
                    <div className="flex justify-between"><span>Model</span><span className="text-white">Trane M-Series • 2018</span></div>
                    <div className="flex justify-between"><span>Last PM</span><span className="text-white">2026-08-14 • 29 days ago</span></div>
                    <div className="flex justify-between"><span>Motor</span><span className="text-white">15 kW • 3-Phase • 1750 RPM</span></div>
                    <div className="flex justify-between"><span>Bearing</span><span className="text-white">6205-2RS • SKF • 2x • Stock: 4</span></div>
                    <div className="flex justify-between"><span>MQTT Topic</span><span className="text-[#0EA5E9]">facility/unit01/ahu03/telemetry</span></div>
                    <div className="flex justify-between"><span>Sampling</span><span className="text-white">{range} @ {range === '1H' ? '1m' : range === '24H' ? '15m' : '1h'}</span></div>
                  </div>
                </Card>
                <MaintenanceChecklist onExport={handleExport} />
              </div>
            </div>
          </section>
        )}

        {/* Interactive Scenario Simulator */}
        <section className="space-y-4 pb-10">
          <SectionLabel k="07" title='Interactive Scenario Simulator: "Normal Run" vs. "Mechanical Degradation"' id="simulator" />
          <Card className="border-[#0EA5E9]/20 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9]">
                  <Layers size={16} />
                </div>
                <div>
                  <div className="font-mono text-[12px] font-bold uppercase text-white">Technician Decision Aid • Live Simulator • Explainable AI</div>
                  <div className="font-mono text-[10px] text-slate-500">Toggle to see how Aegis converts raw math into actionable field work • No vendor lock-in</div>
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#0B0E14] border border-[#1E2638] rounded-lg">
                <button onClick={() => setScenarioMode('normal')} className={`px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${scenarioMode === 'normal' ? 'bg-[#10B981] text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${scenarioMode === 'normal' ? 'bg-white' : 'bg-slate-600'}`} /> Normal Baseline
                </button>
                <button onClick={() => setScenarioMode('degradation')} className={`px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${scenarioMode === 'degradation' ? 'bg-[#EF4444] text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${scenarioMode === 'degradation' ? 'bg-white animate-pulse' : 'bg-slate-600'}`} /> Mechanical Degradation
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 space-y-3">
                <div className={`rounded-lg border p-4 transition-all ${scenarioMode === 'normal' ? 'bg-[#10B981]/5 border-[#10B981]/20' : 'bg-[#EF4444]/5 border-[#EF4444]/20'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Mode {scenarioMode === 'normal' ? 'A: Normal Baseline Operating State' : 'B: Mechanical Degradation (Induced Fault)'}</span>
                    <Badge variant={scenarioMode === 'normal' ? 'nominal' : 'critical'}>{scenarioMode === 'normal' ? 'Nominal' : 'Action Required'}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-slate-500">Vibration</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 transition-all ${scenarioMode === 'normal' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{scenarioMode === 'normal' ? '2.1 mm/s RMS' : `${liveValues.vib} mm/s RMS`}</div>
                      <div className="font-mono text-[8px] text-slate-600 mt-1">Threshold 2.5</div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-slate-500">Current</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 transition-all ${scenarioMode === 'normal' ? 'text-white' : 'text-[#F59E0B]'}`}>{scenarioMode === 'normal' ? '14.2 A' : `${liveValues.cur} A (+24%)`}</div>
                      <div className="font-mono text-[8px] text-slate-600 mt-1">Nominal 14.2A</div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-slate-500">Temp</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 transition-all ${scenarioMode === 'normal' ? 'text-white' : 'text-[#EF4444]'}`}>{scenarioMode === 'normal' ? '54.2°C' : `${liveValues.temp}°C`}</div>
                      <div className="font-mono text-[8px] text-slate-600 mt-1">Nominal 52°C</div>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded bg-[#0B0E14] border border-[#1E2638] font-mono text-[11px] leading-relaxed">
                    {scenarioMode === 'normal' ? (
                      <span className="text-[#10B981] flex gap-1.5"><CheckCircle2 size={12} className="shrink-0 mt-0.5" /> System Readout: "All variables tracking within learned seasonal boundaries. Zero technician intervention required. Envelope deviation +0.8%. Next PM in 12 days."</span>
                    ) : (
                      <span className="text-[#F59E0B] flex gap-1.5"><AlertTriangle size={12} className="shrink-0 mt-0.5" /> System Readout: "Cross-parameter correlation confirms mechanical binding. Outer race defect 91% confidence. RUL 168h ±24h. Generating technician triage steps. Action window 7 days."</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Telemetry Mini-Trend • Live Simulation • {range}</div>
                  <div className="h-[80px] w-full relative">
                    <svg viewBox="0 0 200 80" className="w-full h-full">
                      <path d={scenarioMode === 'normal' ? "M0 40 Q 50 38, 100 40 T 200 40" : `M0 40 Q 30 38, 60 35 T 110 ${20 + Math.random()*5} T 160 ${15 + Math.random()*3} T 200 ${12 + Math.random()*4}`} fill="none" stroke={scenarioMode === 'normal' ? "#10B981" : "#EF4444"} strokeWidth="2" className="transition-all duration-700" />
                      <path d={scenarioMode === 'normal' ? "M0 50 Q 50 48, 100 50 T 200 50" : `M0 50 Q 30 48, 60 45 T 110 ${35 + Math.random()*3} T 160 ${30 + Math.random()*3} T 200 ${28 + Math.random()*2}`} fill="none" stroke="#0EA5E9" strokeWidth="1.5" opacity="0.7" className="transition-all duration-700" />
                    </svg>
                  </div>
                  <div className="flex gap-3 font-mono text-[9px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#EF4444]" />Vibration • Live {liveValues.vib}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#0EA5E9]" />Current • Live {liveValues.cur}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="h-full bg-[#0B0E14] border border-[#1E2638] rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9]/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-2 mb-3">
                    <Printer size={14} className="text-slate-500" />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white">Instant Maintenance Ticket • Printable Field Sheet • Exportable Checklist</span>
                    <Badge variant="neutral">WO-#8821</Badge>
                    <Badge variant="info">Live Bus</Badge>
                  </div>

                  {scenarioMode === 'normal' ? (
                    <div className="space-y-3 font-mono text-[11px] text-slate-400">
                      <div className="p-8 text-center border border-dashed border-[#1E2638] rounded-lg">
                        <div className="w-10 h-10 mx-auto rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-2">✓</div>
                        <div className="text-[#10B981] font-semibold">No action required • System nominal</div>
                        <div className="text-[10px] text-slate-500 mt-1">Next scheduled PM in 12 days • All 1,428 points within envelope • 99.8% uptime</div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-[9px]">
                          <div className="bg-[#121721] border border-[#1E2638] rounded p-2"><span className="text-slate-500">Envelope Dev</span><br /><span className="text-[#10B981] font-bold">+0.8%</span></div>
                          <div className="bg-[#121721] border border-[#1E2638] rounded p-2"><span className="text-slate-500">Model Conf</span><br /><span className="text-white font-bold">94%</span></div>
                          <div className="bg-[#121721] border border-[#1E2638] rounded p-2"><span className="text-slate-500">RUL</span><br /><span className="text-white font-bold">720h+</span></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                        <div><span className="text-slate-500 uppercase">Asset:</span><span className="text-white ml-2">AHU-03 Supply Fan • East Wing</span></div>
                        <div><span className="text-slate-500 uppercase">Priority:</span><span className="text-[#EF4444] ml-2">Critical • 7 Day Window • Live {liveValues.vib}mm/s</span></div>
                        <div><span className="text-slate-500 uppercase">Diagnosis:</span><span className="text-[#F59E0B] ml-2">Bearing Outer Race • 91% • 3.2x RPM</span></div>
                        <div><span className="text-slate-500 uppercase">RUL:</span><span className="text-white ml-2">168h ±24h • Slope 0.12A/day</span></div>
                      </div>

                      <div className="bg-[#121721] border border-[#1E2638] rounded-lg p-3">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-2">Step-by-Step Resolution Tasks • Field Ready • High Contrast</div>
                        <ol className="space-y-2 font-mono text-[11px] text-slate-300 list-decimal list-inside">
                          <li className="leading-relaxed"><span className="text-white font-semibold">Lockout/Tagout</span> • Isolate AHU-03 at disconnect • Verify zero energy • PPE: gloves, goggles • SOP-EL-03</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Lubricate & Inspect</span> • Bearing housing grease condition • Check for metal particulate • NLGI #2 • 2 pumps • Photo log</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Mechanical Check</span> • Pulley alignment (straight edge) • Belt tension (45-55 Hz) • Set screw torque 8 Nm • Loctite 243</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Electrical Verification</span> • Phase current under manual bypass • Expected 14.2A ±0.5A • Check imbalance &lt;2% • Fluke 376</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Post-Repair Validation</span> • Run 10min • Vibration target &lt;2.5 mm/s • Current &lt;14.8A • Log to Aegis • Close WO</li>
                        </ol>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#121721] border border-[#1E2638] rounded p-2">
                          <div className="font-mono text-[9px] uppercase text-slate-500">Tools Required • Field Kit</div>
                          <div className="mt-1 font-mono text-[10px] text-slate-300 leading-relaxed">• Grease gun + NLGI2 • Stock: 12<br />• Vibration meter • Calibrated<br />• Clamp meter Fluke 376 • OK<br />• Straight edge, tension gauge • OK</div>
                        </div>
                        <div className="bg-[#121721] border border-[#1E2638] rounded p-2">
                          <div className="font-mono text-[9px] uppercase text-slate-500">Parts • Stock Check • Open Inventory</div>
                          <div className="mt-1 font-mono text-[10px] text-slate-300 leading-relaxed">• Bearing 6205-2RS (x2) • Stock: 4 • $12/ea<br />• Belt B-62 • Stock: 6 • $18<br />• Grease cartridge • Stock: 12 • $5<br />• Total kit &lt;$180/asset</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="teal" size="sm" className="flex-1" onClick={() => { handleCreateWorkOrder('AHU-03', '8821'); setShowFieldSheet(true); }}><Printer size={12} className="mr-1.5" /> Print Field Sheet (PDF) • Checklist</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>Export Ticket JSON</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleExport('checklist')}>Checklist JSON</Button>
                      </div>
                      {workOrders.find(w => w.id === '8821') && (
                        <div className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded p-2 flex items-center gap-2">
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

        {/* Footer */}
        <footer className="border-t border-[#1E2638] pt-6 pb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-[#0EA5E9]" />
              <span>Aegis Open Engine • Non-Profit • Open Access Facility Intelligence • MIT License • github.com/aegis-open • Built for field technicians, not boardrooms</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-2 py-0.5 bg-[#1E2638] border border-[#26324D] rounded text-slate-400">Simulated Demonstration Bus • 1,428 points • 38 assets • {range} • Live {liveValues.vib}mm/s</span>
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-4 gap-3 font-mono text-[9px] text-slate-600">
            <div>• Open hardware: DHT22, ACS712, MPU6050, YF-S201, ESP32, MQTT</div>
            <div>• Explainable models: Seasonal ARIMA, Isolation Forest, FFT spectral</div>
            <div>• No vendor lock-in • No proprietary gateway • $180/asset</div>
            <div>• High-contrast industrial dark • Mobile field tablets • Offline capable</div>
          </div>
        </footer>
      </div>

      {/* Field Sheet Modal */}
      {showFieldSheet && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[720px] max-h-[90vh] overflow-auto bg-[#121721] border border-[#26324D] rounded-[12px] shadow-2xl">
            <div className="sticky top-0 bg-[#121721] border-b border-[#1E2638] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer size={16} className="text-[#0EA5E9]" />
                <span className="font-mono text-[12px] font-bold uppercase text-white">Field Sheet • WO #8821 • AHU-03 • Printable</span>
                <Badge variant="critical">Critical</Badge>
              </div>
              <button onClick={() => setShowFieldSheet(false)} className="w-7 h-7 rounded bg-[#1E2638] border border-[#26324D] flex items-center justify-center text-slate-400 hover:text-white"><X size={14} /></button>
            </div>
            <div className="p-6 space-y-4 font-mono text-[11px]">
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#0B0E14] border border-[#1E2638] rounded-lg">
                <div><span className="text-slate-500 uppercase">Asset:</span><span className="text-white ml-2">AHU-03 Primary Supply Fan (East Wing)</span></div>
                <div><span className="text-slate-500 uppercase">Location:</span><span className="text-white ml-2">Roof Level 3 • East Wing</span></div>
                <div><span className="text-slate-500 uppercase">Diagnosis:</span><span className="text-[#EF4444] ml-2">Bearing Outer Race • 91% Confidence</span></div>
                <div><span className="text-slate-500 uppercase">RUL:</span><span className="text-white ml-2">168h ±24h • Action &lt;7D</span></div>
                <div><span className="text-slate-500 uppercase">Live Reading:</span><span className="text-[#F59E0B] ml-2">{liveValues.vib} mm/s • {liveValues.cur}A • {liveValues.temp}°C</span></div>
                <div><span className="text-slate-500 uppercase">Model:</span><span className="text-white ml-2">Trane M-Series • 15kW • 1750 RPM</span></div>
              </div>
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Checklist • 9 Tasks • {Math.round((2/9)*100)}% Complete Example</div>
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
                  <div key={i} className="flex gap-2 p-2 bg-[#0B0E14] border border-[#1E2638] rounded">
                    <div className="w-5 h-5 rounded border border-[#26324D] flex items-center justify-center text-[10px]">{i < 2 ? '✓' : '☐'}</div>
                    <span className="text-slate-300">{i+1}. {t}</span>
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
        <div className="fixed bottom-4 right-4 z-[100] bg-[#121721] border border-[#26324D] text-white px-3 py-2.5 rounded-lg shadow-xl flex items-center gap-2 font-mono text-[11px] animate-in slide-in-from-bottom-2 max-w-[360px]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span className="leading-relaxed">{toast}</span>
        </div>
      )}

      {/* Mobile jump nav */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#121721]/95 backdrop-blur border-t border-[#1E2638] p-2 flex gap-1 overflow-x-auto z-40">
        {[
          { label: 'Overview', ref: overviewRef },
          { label: 'Telemetry', ref: telemetryRef },
          { label: 'Root Cause', ref: rootCauseRef },
          { label: 'Action', ref: actionRef },
        ].map((item, i) => (
          <button key={i} onClick={() => scrollTo(item.ref)} className="whitespace-nowrap font-mono text-[10px] px-3 py-1.5 rounded bg-[#1E2638] border border-[#26324D] text-slate-300 uppercase hover:bg-[#26324D] transition-colors">{item.label}</button>
        ))}
        <div className="ml-auto flex items-center gap-1 pl-2 border-l border-[#1E2638]">
          <div className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-mono text-[9px] text-slate-500 whitespace-nowrap">Live {liveValues.vib}mm/s</span>
        </div>
      </div>
    </div>
  );
}
