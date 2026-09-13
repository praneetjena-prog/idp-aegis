import React, { useState, useRef, useMemo } from 'react';
import { Shield, Activity, MapPin, Clock, Download, Zap, Cpu, Layers, Radio, Settings, ChevronRight, ArrowLeft, Printer, FileJson, FileSpreadsheet, Thermometer, Gauge as GaugeIcon, Waves, Volume2 } from 'lucide-react';

import { Card, CardHeader, CardTitle } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Gauge } from './components/ui/Gauge';

import { FacilityHealth } from './components/dashboard/FacilityHealth';
import { SubsystemGrid } from './components/dashboard/SubsystemGrid';
import { TriageQueue } from './components/dashboard/TriageQueue';
import { TelemetryChart } from './components/dashboard/TelemetryChart';

import { OperationalReality } from './components/workflow/OperationalReality';
import { ComparisonMatrix } from './components/workflow/ComparisonMatrix';
import { Pillars } from './components/workflow/Pillars';
import { ArchitectureDiagram } from './components/workflow/ArchitectureDiagram';
import { HardwareTable } from './components/workflow/HardwareTable';

const SectionLabel = ({ k, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded bg-[#1E2638] border border-[#26324D] flex items-center justify-center font-mono text-[11px] font-bold text-slate-400">{k}</div>
    <h2 className="font-mono text-[13px] font-bold tracking-[0.15em] uppercase text-white">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-[#1E2638] to-transparent ml-4" />
  </div>
);

export default function App() {
  const [range, setRange] = useState('24H');
  const [feedMode, setFeedMode] = useState('fault'); // normal vs fault
  const [scenarioMode, setScenarioMode] = useState('degradation'); // for bottom simulator
  const [activeSubsystem, setActiveSubsystem] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [toast, setToast] = useState(null);

  const overviewRef = useRef(null);
  const telemetryRef = useRef(null);
  const rootCauseRef = useRef(null);
  const actionRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
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
      priority: id === '8821' ? 'critical' : 'advisory'
    };
    setWorkOrders(prev => [...prev, wo]);
    showToast(`Work Order #${id} created for ${asset}`);
  };

  const handleAcknowledge = (key) => {
    setAcknowledged(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
    showToast(acknowledged.has(key) ? 'Unacknowledged' : 'Acknowledged • Logged to shift');
  };

  const handleExport = (type) => {
    const data = {
      station: "Central Campus / Facility Unit 01",
      timestamp: new Date().toISOString(),
      mode: feedMode,
      range,
      assets: 38,
      points: 1428,
      health: feedMode === 'fault' ? 74 : 87,
      subsystems: [
        { id: 'hvac', health: feedMode === 'fault' ? 79 : 91, load: '242 kW' },
        { id: 'electrical', health: feedMode === 'fault' ? 74 : 82, balance: '94.1%' },
        { id: 'water', health: 95, pressure: '4.2 bar' },
        { id: 'mechanical', health: feedMode === 'fault' ? 61 : 74, units: 38 },
        { id: 'energy', health: 88, pf: 0.96 }
      ],
      anomalies: [
        { asset: 'AHU-03', vibration: '6.8 mm/s', current: '17.6 A', temp: '71.8°C', diagnosis: 'Bearing Degradation', conf: 0.91 }
      ]
    };

    if (type === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-telemetry-${range}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported JSON • 1,428 points');
    } else {
      const csv = `timestamp,asset,parameter,value,unit,status
${new Date().toISOString()},AHU-03,vibration,6.8,mm/s,critical
${new Date().toISOString()},AHU-03,current,17.6,A,critical
${new Date().toISOString()},AHU-03,temperature,71.8,C,warning
${new Date().toISOString()},CW-Pump-02,flow,4.1,L/s,advisory
${new Date().toISOString()},VAV-4B,damper,20-80,%,optimization`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-telemetry-${range}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported CSV • 5 anomalies');
    }
  };

  const handleViewTelemetry = () => {
    scrollTo(telemetryRef);
    showToast('Focused on trend telemetry');
  };

  // Subsystem detail data
  const detailData = useMemo(() => {
    const isFault = feedMode === 'fault' || scenarioMode === 'degradation';
    return {
      vibration: isFault ? '6.8 mm/s' : '2.1 mm/s RMS',
      current: isFault ? '17.6 A' : '14.2 A',
      temp: isFault ? '71.8°C' : '54.2°C',
      acoustic: isFault ? '+12 dB' : '+1.2 dB',
      thresholdVib: '2.5 mm/s',
      nominalCurrent: '14.2 A',
      nominalTemp: '52°C'
    };
  }, [feedMode, scenarioMode]);

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
              <span className="font-mono text-[10px] text-slate-500">Facility Operations Engine</span>
            </div>
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#1E2638]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono text-[10px] tracking-wide text-[#10B981] uppercase">Aegis Open Engine — Telemetry Source: Simulated Demonstration Bus</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-500 hidden lg:inline">v0.9.4 • Open Non-Profit • MIT Licensed</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1E2638] border border-[#26324D]">
              <div className="w-1 h-1 rounded-full bg-[#10B981]" />
              <span className="font-mono text-[9px] text-slate-400 uppercase">Live Bus</span>
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
              <span className="font-mono text-[10px] text-slate-400">Shift: Active Logged View • Tech: J. Rivera • 06:00-14:00</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Jump Nav */}
            <div className="hidden xl:flex items-center gap-1 mr-3 pr-3 border-r border-[#1E2638]">
              {[
                { label: 'Operations Overview', ref: overviewRef },
                { label: 'Subsystem Telemetry', ref: telemetryRef },
                { label: 'Root Cause Inspector', ref: rootCauseRef },
                { label: 'Technician Action', ref: actionRef },
              ].map((item, i) => (
                <button key={i} onClick={() => scrollTo(item.ref)} className="font-mono text-[10px] px-2 py-1 rounded hover:bg-[#1E2638] text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
                  {item.label}
                </button>
              ))}
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
              <button onClick={() => setFeedMode('normal')} className={`font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 ${feedMode === 'normal' ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' : 'text-slate-500'}`}>
                <div className={`w-1 h-1 rounded-full ${feedMode === 'normal' ? 'bg-[#10B981]' : 'bg-slate-600'}`} /> Normal Run
              </button>
              <button onClick={() => setFeedMode('fault')} className={`font-mono text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 ${feedMode === 'fault' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' : 'text-slate-500'}`}>
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
        <section ref={overviewRef} className="space-y-6">
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
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              {[
                { label: "Total Assets Monitored", value: "38 Units", icon: Cpu },
                { label: "Active Sensory Data Streams", value: "1,428 Points", icon: Radio },
                { label: "Operational Uptime", value: "99.8%", icon: Activity },
                { label: "Preventative Intervention Rate", value: "94% pre-failure catch", icon: Shield },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <Card key={i} className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={12} className="text-[#0EA5E9]" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 leading-none">{m.label}</span>
                    </div>
                    <div className="font-mono text-[14px] font-bold text-white">{m.value}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          <SectionLabel k="01" title="The Operational Reality — Workflow Bottlenecks" />
          <OperationalReality />

          <SectionLabel k="02" title="Existing Approaches vs. Aegis Workflow Matrix" />
          <ComparisonMatrix />

          <SectionLabel k="03" title="The 5 Operational Pillars — Data → Maintenance Action" />
          <Pillars />

          <SectionLabel k="04" title="System Architecture — Transparent & Open Flow" />
          <ArchitectureDiagram />

          <SectionLabel k="05" title="Hardware Layer — Democratized Sensor Kit" />
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
            <span className="font-mono text-[10px] text-slate-500">Range: {range} • Mode: {feedMode.toUpperCase()} • Refresh: 15s • Bus: MQTT</span>
          </div>

          <div ref={telemetryRef} className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <FacilityHealth mode={feedMode} />
            </div>
            <div className="lg:col-span-8">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Subsystem Telemetry • Click for Deep-Dive</CardTitle>
                  <Badge variant="neutral">{range} Window</Badge>
                </CardHeader>
                <SubsystemGrid mode={feedMode} onSelect={(id) => setActiveSubsystem(id)} />
              </Card>
            </div>
          </div>

          <div ref={rootCauseRef} className="space-y-4">
            <SectionLabel k="06" title="Active Triage & Field Work Order Queue" />
            <TriageQueue
              onCreateWorkOrder={handleCreateWorkOrder}
              onViewTelemetry={handleViewTelemetry}
              acknowledged={acknowledged}
              onAcknowledge={handleAcknowledge}
              workOrders={workOrders}
            />
          </div>

          <div ref={actionRef}>
            <Card>
              <CardHeader>
                <CardTitle>24-Hour Operational Telemetry Chart • Baseline vs Actual</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={feedMode === 'fault' ? 'attention' : 'nominal'}>{feedMode === 'fault' ? 'Anomaly Detected' : 'Nominal'}</Badge>
                  <span className="font-mono text-[10px] text-slate-500">AHU-03 • Power Envelope</span>
                </div>
              </CardHeader>
              <TelemetryChart mode={feedMode} range={range} />
            </Card>
          </div>
        </section>

        {/* Subsystem Detail View - Inline if active */}
        {activeSubsystem && (
          <section className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <button onClick={() => setActiveSubsystem(null)} className="flex items-center gap-1 hover:text-white"><ArrowLeft size={12} /> Return to Facility Console</button>
              <ChevronRight size={12} />
              <span>Console</span>
              <ChevronRight size={12} />
              <span>Equipment</span>
              <ChevronRight size={12} />
              <span className="text-white">{activeSubsystem.toUpperCase()} Detailed Analysis</span>
              {activeSubsystem === 'mechanical' || activeSubsystem === 'hvac' ? <Badge variant="critical">AHU-03 Focus</Badge> : null}
            </div>

            <div className="grid lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Sensor Tiles • {activeSubsystem.toUpperCase()} • AHU-03 Primary Supply Fan</CardTitle>
                    <Button variant="ghost" size="xs" onClick={() => setActiveSubsystem(null)}>← Return to Facility Console</Button>
                  </CardHeader>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#0B0E14] border border-[#EF4444]/30 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Waves size={12} className="text-[#EF4444]" /><span className="font-mono text-[9px] uppercase text-slate-500">Vibration Velocity</span></div>
                      <div className="font-mono text-[18px] font-bold text-[#EF4444]">{detailData.vibration}</div>
                      <div className="font-mono text-[10px] text-slate-500">Threshold: {detailData.thresholdVib} • <span className="text-[#EF4444]">+172% over</span></div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#EF4444]" style={{ width: '85%' }} /></div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#F59E0B]/30 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Zap size={12} className="text-[#F59E0B]" /><span className="font-mono text-[9px] uppercase text-slate-500">Drive Current</span></div>
                      <div className="font-mono text-[18px] font-bold text-[#F59E0B]">{detailData.current}</div>
                      <div className="font-mono text-[10px] text-slate-500">Nominal: {detailData.nominalCurrent} • <span className="text-[#F59E0B]">+24% surge</span></div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#F59E0B]" style={{ width: '72%' }} /></div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#EF4444]/20 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Thermometer size={12} className="text-[#EF4444]" /><span className="font-mono text-[9px] uppercase text-slate-500">Bearing Temp</span></div>
                      <div className="font-mono text-[18px] font-bold text-white">{detailData.temp}</div>
                      <div className="font-mono text-[10px] text-slate-500">Nominal: {detailData.nominalTemp} • <span className="text-[#EF4444]">Overheat</span></div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#EF4444]" style={{ width: '68%' }} /></div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Volume2 size={12} className="text-slate-400" /><span className="font-mono text-[9px] uppercase text-slate-500">Acoustic HF Noise</span></div>
                      <div className="font-mono text-[18px] font-bold text-white">{detailData.acoustic}</div>
                      <div className="font-mono text-[10px] text-slate-500">Baseline 0 dB • Spectral peak 3.2kHz</div>
                      <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden"><div className="h-full bg-[#0EA5E9]" style={{ width: feedMode === 'fault' ? '80%' : '20%' }} /></div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Multi-line Trend • Last 24H • Correlation: Current ↑ + Vibration ↑</div>
                    <TelemetryChart mode={feedMode} range="24H" />
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-4 space-y-3">
                <Card className="border-[#EF4444]/20">
                  <CardTitle>Breadcrumbs & Correlation</CardTitle>
                  <div className="mt-3 space-y-3 font-mono text-[11px]">
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-2.5">
                      <div className="text-slate-500 text-[10px] uppercase mb-1">Root Cause Chain</div>
                      <div className="text-slate-200 leading-relaxed">Vibration ↑ (6.8 mm/s) + Current Draw ↑ (17.6A) + Delta-T ↓ (3.1°C) → <span className="text-[#EF4444] font-bold">Mechanical Drag & Bearing Wear</span></div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-2.5">
                      <div className="text-slate-500 text-[10px] uppercase mb-1">Explainability</div>
                      <div className="text-slate-400">Model: Multivariate Isolation Forest + FFT • Spectral defect at 3.2x RPM (outer race) • Confidence 91% • RUL 168h ±24h</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="critical" size="sm" onClick={() => handleCreateWorkOrder('AHU-03', '8821')}>Create WO #8821</Button>
                      <Button variant="secondary" size="sm" onClick={() => { setActiveSubsystem(null); scrollTo(actionRef); }}>Print Field Sheet</Button>
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardTitle>Asset Context</CardTitle>
                  <div className="mt-2 space-y-2 font-mono text-[10px] text-slate-400">
                    <div className="flex justify-between"><span>Location</span><span className="text-white">East Wing • Roof Level 3</span></div>
                    <div className="flex justify-between"><span>Model</span><span className="text-white">Trane M-Series • 2018</span></div>
                    <div className="flex justify-between"><span>Last PM</span><span className="text-white">2026-08-14 • 29 days ago</span></div>
                    <div className="flex justify-between"><span>Motor</span><span className="text-white">15 kW • 3-Phase • 1750 RPM</span></div>
                    <div className="flex justify-between"><span>Bearing</span><span className="text-white">6205-2RS • SKF • 2x</span></div>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Interactive Scenario Simulator */}
        <section className="space-y-4 pb-10">
          <SectionLabel k="07" title='Interactive Scenario Simulator: "Normal Run" vs. "Mechanical Degradation"' />
          <Card className="border-[#0EA5E9]/20 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9]">
                  <Layers size={16} />
                </div>
                <div>
                  <div className="font-mono text-[12px] font-bold uppercase text-white">Technician Decision Aid • Live Simulator</div>
                  <div className="font-mono text-[10px] text-slate-500">Toggle to see how Aegis converts raw math into actionable field work</div>
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#0B0E14] border border-[#1E2638] rounded-lg">
                <button onClick={() => setScenarioMode('normal')} className={`px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${scenarioMode === 'normal' ? 'bg-[#10B981] text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${scenarioMode === 'normal' ? 'bg-white' : 'bg-slate-600'}`} /> Normal Baseline
                </button>
                <button onClick={() => setScenarioMode('degradation')} className={`px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${scenarioMode === 'degradation' ? 'bg-[#EF4444] text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${scenarioMode === 'degradation' ? 'bg-white animate-pulse' : 'bg-slate-600'}`} /> Mechanical Degradation
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 space-y-3">
                <div className={`rounded-lg border p-4 ${scenarioMode === 'normal' ? 'bg-[#10B981]/5 border-[#10B981]/20' : 'bg-[#EF4444]/5 border-[#EF4444]/20'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Mode {scenarioMode === 'normal' ? 'A: Normal Baseline Operating State' : 'B: Mechanical Degradation (Induced Fault)'}</span>
                    <Badge variant={scenarioMode === 'normal' ? 'nominal' : 'critical'}>{scenarioMode === 'normal' ? 'Nominal' : 'Action Required'}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-slate-500">Vibration</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 ${scenarioMode === 'normal' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{scenarioMode === 'normal' ? '2.1 mm/s RMS' : '6.8 mm/s RMS'}</div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-slate-500">Current</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 ${scenarioMode === 'normal' ? 'text-white' : 'text-[#F59E0B]'}`}>{scenarioMode === 'normal' ? '14.2 A' : '17.6 A (+24%)'}</div>
                    </div>
                    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[9px] uppercase text-slate-500">Temp</div>
                      <div className={`font-mono text-[14px] font-bold mt-1 ${scenarioMode === 'normal' ? 'text-white' : 'text-[#EF4444]'}`}>{scenarioMode === 'normal' ? '54.2°C' : '71.8°C'}</div>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded bg-[#0B0E14] border border-[#1E2638] font-mono text-[11px] leading-relaxed">
                    {scenarioMode === 'normal' ? (
                      <span className="text-[#10B981]">✓ System Readout: "All variables tracking within learned seasonal boundaries. Zero technician intervention required. Envelope deviation +0.8%."</span>
                    ) : (
                      <span className="text-[#F59E0B]">⚠ System Readout: "Cross-parameter correlation confirms mechanical binding. Outer race defect 91% confidence. RUL 168h. Generating technician triage steps."</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Telemetry Mini-Trend</div>
                  <div className="h-[80px] w-full relative">
                    <svg viewBox="0 0 200 80" className="w-full h-full">
                      <path d={scenarioMode === 'normal' ? "M0 40 Q 50 38, 100 40 T 200 40" : "M0 40 Q 30 38, 60 35 T 110 20 T 160 15 T 200 12"} fill="none" stroke={scenarioMode === 'normal' ? "#10B981" : "#EF4444"} strokeWidth="2" />
                      <path d={scenarioMode === 'normal' ? "M0 50 Q 50 48, 100 50 T 200 50" : "M0 50 Q 30 48, 60 45 T 110 35 T 160 30 T 200 28"} fill="none" stroke="#0EA5E9" strokeWidth="1.5" opacity="0.7" />
                    </svg>
                  </div>
                  <div className="flex gap-2 font-mono text-[9px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#EF4444]" />Vibration</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#0EA5E9]" />Current</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="h-full bg-[#0B0E14] border border-[#1E2638] rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9]/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-2 mb-3">
                    <Printer size={14} className="text-slate-500" />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white">Instant Maintenance Ticket • Printable Field Sheet</span>
                    <Badge variant="neutral">WO-#8821</Badge>
                  </div>

                  {scenarioMode === 'normal' ? (
                    <div className="space-y-3 font-mono text-[11px] text-slate-400">
                      <div className="p-8 text-center border border-dashed border-[#1E2638] rounded-lg">
                        <div className="w-10 h-10 mx-auto rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-2">✓</div>
                        <div className="text-[#10B981] font-semibold">No action required</div>
                        <div className="text-[10px] text-slate-500 mt-1">System nominal • Next scheduled PM in 12 days</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                        <div><span className="text-slate-500 uppercase">Asset:</span><span className="text-white ml-2">AHU-03 Supply Fan</span></div>
                        <div><span className="text-slate-500 uppercase">Priority:</span><span className="text-[#EF4444] ml-2">Critical • 7 Day Window</span></div>
                        <div><span className="text-slate-500 uppercase">Diagnosis:</span><span className="text-[#F59E0B] ml-2">Bearing Outer Race • 91%</span></div>
                        <div><span className="text-slate-500 uppercase">RUL:</span><span className="text-white ml-2">168h ±24h</span></div>
                      </div>

                      <div className="bg-[#121721] border border-[#1E2638] rounded-lg p-3">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-2">Step-by-Step Resolution Tasks</div>
                        <ol className="space-y-2 font-mono text-[11px] text-slate-300 list-decimal list-inside">
                          <li className="leading-relaxed"><span className="text-white font-semibold">Lockout/Tagout</span> • Isolate AHU-03 at disconnect • Verify zero energy • PPE: gloves, goggles</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Lubricate & Inspect</span> • Bearing housing grease condition • Check for metal particulate • NLGI #2 • 2 pumps</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Mechanical Check</span> • Pulley alignment (straight edge) • Belt tension (45-55 Hz) • Set screw torque 8 Nm</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Electrical Verification</span> • Phase current under manual bypass • Expected 14.2A ±0.5A • Check imbalance &lt;2%</li>
                          <li className="leading-relaxed"><span className="text-white font-semibold">Post-Repair Validation</span> • Run 10min • Vibration target &lt;2.5 mm/s • Current &lt;14.8A • Log to Aegis</li>
                        </ol>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#121721] border border-[#1E2638] rounded p-2">
                          <div className="font-mono text-[9px] uppercase text-slate-500">Tools Required</div>
                          <div className="mt-1 font-mono text-[10px] text-slate-300 leading-relaxed">• Grease gun + NLGI2<br />• Vibration meter<br />• Clamp meter Fluke 376<br />• Straight edge, tension gauge</div>
                        </div>
                        <div className="bg-[#121721] border border-[#1E2638] rounded p-2">
                          <div className="font-mono text-[9px] uppercase text-slate-500">Parts • Stock Check</div>
                          <div className="mt-1 font-mono text-[10px] text-slate-300 leading-relaxed">• Bearing 6205-2RS (x2) • Stock: 4<br />• Belt B-62 • Stock: 6<br />• Grease cartridge • Stock: 12</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="teal" size="sm" className="flex-1" onClick={() => handleCreateWorkOrder('AHU-03', '8821')}><Printer size={12} className="mr-1.5" /> Print Field Sheet (PDF)</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>Export Ticket JSON</Button>
                      </div>
                      {workOrders.find(w => w.id === '8821') && (
                        <div className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded p-2">✓ Ticket generated and dispatched • Shift lead notified • ETA Today 14:30</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1E2638] pt-6 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-[#0EA5E9]" />
              <span>Aegis Open Engine • Non-Profit • Open Access Facility Intelligence • MIT License • github.com/aegis-open</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Built for field technicians, not boardrooms</span>
              <span className="px-2 py-0.5 bg-[#1E2638] border border-[#26324D] rounded text-slate-400">Simulated Demonstration Bus • 1,428 points • 38 assets</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-[#121721] border border-[#26324D] text-white px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 font-mono text-[11px] animate-in slide-in-from-bottom-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          {toast}
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
          <button key={i} onClick={() => scrollTo(item.ref)} className="whitespace-nowrap font-mono text-[10px] px-3 py-1.5 rounded bg-[#1E2638] border border-[#26324D] text-slate-300 uppercase">{item.label}</button>
        ))}
      </div>
    </div>
  );
}
