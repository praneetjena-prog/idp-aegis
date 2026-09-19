import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Shield, Activity, MapPin, Clock, Zap, Cpu, Layers, Radio, ChevronRight, ArrowLeft, Printer, FileJson, FileSpreadsheet, Thermometer, Waves, Volume2, Search, Filter, X, AlertTriangle, CheckCircle2, Settings, LayoutDashboard, ChartNoAxesCombined, Gauge, Cable, PanelLeftClose, PanelLeftOpen, Menu, Sun, Moon, QrCode } from 'lucide-react';

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
import { AssetPassport } from './components/asset/AssetPassport';
import { AssetQrModal } from './components/asset/AssetQrModal';
import { useFacilityParams } from './lib/facility';
import { useLiveFeed } from './lib/liveFeed';
import { playDispatchChime, playAlertChime } from './lib/sound';

import { SideRail, TabBar, TABS } from './components/layout/SideRail';
import { TopHeader } from './components/layout/TopHeader';

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

const VALID_TABS = ['overview', 'console', 'analysis', 'simulator', 'platform', 'asset'];
const STORAGE_WORK_ORDERS = 'aegis-work-orders';
const STORAGE_ACKNOWLEDGED = 'aegis-acknowledged-alerts';

function parseHash() {
  if (typeof window === 'undefined' || !window.location.hash) {
    return { tab: 'overview', assetId: 'ahu-03' };
  }
  const clean = window.location.hash.replace(/^#/, '');
  const parts = clean.split('/');
  const tabName = parts[0]?.toLowerCase();
  if (tabName === 'asset') {
    return { tab: 'asset', assetId: parts[1]?.toLowerCase() || 'ahu-03' };
  }
  if (VALID_TABS.includes(tabName)) {
    return { tab: tabName, assetId: 'ahu-03' };
  }
  return { tab: 'overview', assetId: 'ahu-03' };
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
  const initialNav = useMemo(() => parseHash(), []);
  const [tab, setTabState] = useState(initialNav.tab);
  const [selectedAssetId, setSelectedAssetId] = useState(initialNav.assetId);
  const [showQrModal, setShowQrModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { params, setParams, save: saveParams, saving } = useFacilityParams();

  // Sync tab changes to URL hash (deep linking)
  const setTab = (nextTab, assetId) => {
    if (!VALID_TABS.includes(nextTab)) return;
    setTabState(nextTab);
    const targetAsset = assetId || selectedAssetId || 'ahu-03';
    if (assetId) {
      setSelectedAssetId(assetId);
    }
    if (typeof window !== 'undefined') {
      const newHash = nextTab === 'asset' 
        ? `#asset/${targetAsset}` 
        : `#${nextTab}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    }
  };

  const handleSelectAsset = (assetId) => {
    setSelectedAssetId(assetId);
    if (tab === 'asset' && typeof window !== 'undefined') {
      const newHash = `#asset/${assetId}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    }
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash();
      setTabState(parsed.tab);
      if (parsed.assetId) {
        setSelectedAssetId(parsed.assetId);
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

  const { 
    values: liveValues, 
    isLive, 
    lastSeen, 
    backendStatus, 
    backendAnomalies, 
    recordCount 
  } = useLiveFeed(feedMode);

  // When live backend is streaming, automatically reflect real hardware status
  const effectiveFeedMode = isLive && backendStatus
    ? (backendStatus === 'Alert' || backendStatus === 'Warning' ? 'fault' : 'normal')
    : feedMode;

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

  const handleExport = (type = 'csv') => {
    const timestamp = new Date().toISOString();
    const isFault = feedMode === 'fault';
    const data = {
      station: "Central Campus / Facility Unit 01",
      timestamp,
      mode: feedMode,
      range,
      assets: 38,
      points: 1428,
      health: isFault ? 74 : 91,
      live_telemetry: liveValues,
      subsystems: [
        { id: 'hvac', name: 'HVAC Air Handlers', health: isFault ? 79 : 92, status: isFault ? 'Warning' : 'Good', load: '242 kW' },
        { id: 'electrical', name: 'Electrical Panels', health: isFault ? 84 : 95, status: 'Balanced', balance: '94.1%' },
        { id: 'water', name: 'Chilled Water Loops', health: 95, status: 'Nominal', pressure: '4.2 bar' },
        { id: 'mechanical', name: 'Mechanical Pumps', health: isFault ? 61 : 88, status: isFault ? 'Action Required' : 'Good' },
        { id: 'energy', name: 'Energy Efficiency', health: 88, status: 'Optimal', pf: 0.96 }
      ],
      anomalies: [
        { asset: 'AHU-03', vibration: `${liveValues.vib} mm/s`, current: `${liveValues.cur} A`, temp: `${liveValues.temp}°C`, acoustic: `+${liveValues.acoustic} dB`, diagnosis: 'Bearing Outer Race Wear', conf: 0.91, rul: '168h (7 days)' },
        { asset: 'CW-Pump-02', flow: '4.1 L/s', pressure: '4.5 bar', diagnosis: 'Strainer basket partial clog', conf: 0.84, rul: 'Inspection scheduled' },
        { asset: 'VAV-4B', damper: '20-80% hunting', diagnosis: 'Actuator calibration drift', conf: 0.79, rul: 'Optimal' }
      ],
      work_orders: workOrders,
      checklist: type === 'checklist' ? [
        "Lockout/Tagout • Isolate AHU-03 at disconnect • Verify zero energy (SOP-EL-03)",
        "Inspect bearing grease • Check for metal particulate (take photo log)",
        "Lubricate bearing • NLGI #2 • 2 pumps • Wipe excess",
        "Check pulley alignment (laser/straight-edge <0.5mm offset)",
        "Verify belt tension • 45-55 Hz with acoustic tension gauge",
        "Torque mounting bolts to 8 Nm • Apply Loctite 243",
        "Phase current under manual bypass • Expected 14.2A ±0.5A • Check imbalance <2%",
        "10-minute spin validation • Vibration target <2.5 mm/s • Current <14.8A",
        "Log completion to Aegis • Close WO #8821"
      ] : undefined
    };

    if (type === 'json' || type === 'checklist') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-${type}-${range}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
      showToast(`✓ Exported ${type.toUpperCase()} • ${type === 'checklist' ? '9 tasks' : '1,428 points'}`);
    } else {
      const csvRows = [
        ['# AEGIS FACILITY INTELLIGENCE — TELEMETRY & SHIFT REPORT'],
        ['# Station', 'Central Campus / Facility Unit 01'],
        ['# Generated', timestamp],
        ['# Time Window', range],
        ['# Operational Mode', isFault ? 'Induced Fault / Anomaly Active' : 'Normal Baseline Run'],
        ['# Overall Health Score', `${data.health}%`],
        [],
        ['TIMESTAMP', 'SUBSYSTEM', 'ASSET_ID', 'PARAMETER', 'VALUE', 'UNIT', 'LIMIT_BASELINE', 'STATUS', 'CONFIDENCE', 'RUL_ESTIMATE'],
        [timestamp, 'HVAC Air Handlers', 'AHU-03', 'Vibration Velocity RMS', liveValues.vib, 'mm/s', '2.5 mm/s', isFault ? 'CRITICAL' : 'NOMINAL', '91%', isFault ? '168h (7 days)' : '720h+'],
        [timestamp, 'HVAC Air Handlers', 'AHU-03', 'Motor Phase Current', liveValues.cur, 'A', '14.2 A', isFault ? 'ATTENTION' : 'NOMINAL', '91%', isFault ? '168h' : '720h+'],
        [timestamp, 'HVAC Air Handlers', 'AHU-03', 'Bearing Outer Race Temp', liveValues.temp, 'C', '65.0 C', isFault ? 'WARNING' : 'NOMINAL', '91%', isFault ? '168h' : '720h+'],
        [timestamp, 'HVAC Air Handlers', 'AHU-03', 'Acoustic HF Emission', `+${liveValues.acoustic}`, 'dB', '0.0 dB', isFault ? 'ATTENTION' : 'NOMINAL', '88%', '-'],
        [timestamp, 'Hydraulic / Water Loops', 'CW-Pump-02', 'Cooling Flow Rate', '4.1', 'L/s', '5.8 L/s', isFault ? 'ADVISORY' : 'NOMINAL', '84%', 'Strainer Inspect'],
        [timestamp, 'Hydraulic / Water Loops', 'CW-Pump-02', 'Discharge Pressure', '4.5', 'bar', '4.2 bar', isFault ? 'DEVIATION' : 'NOMINAL', '84%', '-'],
        [timestamp, 'HVAC Network', 'VAV-4B', 'Damper Modulation', '20-80', '%', 'Continuous', isFault ? 'HUNTING' : 'NOMINAL', '79%', 'Recalibrate'],
        [timestamp, 'Electrical Infrastructure', 'SW-Panel-01', '3-Phase Current Balance', '94.1', '%', '>92.0%', 'NOMINAL', '95%', '-'],
        [timestamp, 'Overall Energy Efficiency', 'Facility Bus', 'Power Factor (PF)', '0.96', 'pf', '>0.95', 'OPTIMAL', '98%', '-'],
        [],
        ['# ACTIVE DISPATCHED WORK ORDERS'],
        ['WO_ID', 'ASSET', 'DESCRIPTION', 'STATUS', 'LOG_DATE', 'TECHNICIAN'],
        ...workOrders.map(wo => [
          wo.id,
          wo.asset,
          `"${(wo.diagnosis || (wo.asset === 'AHU-03' ? 'Bearing outer race wear — lubrication & belt tension' : 'Strainer partial clog')).replace(/"/g, '""')}"`,
          wo.status,
          wo.created ? new Date(wo.created).toLocaleDateString() : 'Today',
          'J. Rivera'
        ]),
        ['8818', 'AHU-02', '"Belt tension adjustment"', 'completed', '2026-09-08', 'M. Singh'],
        ['8819', 'ELEC-E3', '"Phase imbalance correction L2"', 'completed', '2026-09-09', 'J. Rivera'],
        ['8820', 'CW-P01', '"Seal replacement"', 'in_progress', '2026-09-11', 'A. Kumar']
      ];

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-telemetry-${range}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
      showToast('✓ Exported CSV • Full Telemetry & Work Order Log');
    }
  };

  const handleViewTelemetry = () => {
    setTab('console');
    setTimeout(() => scrollTo(telemetryRef), 60);
    showToast('Focused on trend telemetry • Correlation view');
  };

  const detailData = useMemo(() => {
    const isFault = feedMode === 'fault';
    return {
      vibration: isFault ? `${liveValues.vib} mm/s` : `${liveValues.vib} mm/s RMS`,
      current: isFault ? `${liveValues.cur} A` : `${liveValues.cur} A`,
      temp: isFault ? `${liveValues.temp}°C` : `${liveValues.temp}°C`,
      acoustic: isFault ? `+${liveValues.acoustic} dB` : `+${liveValues.acoustic} dB`,
      thresholdVib: `${params.vibrationCritical} mm/s`,
      nominalCurrent: `${params.ratedCurrentA} A`,
      nominalTemp: `${params.tempCritical}°C`
    };
  }, [feedMode, liveValues, params]);

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
        feedMode={effectiveFeedMode}
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
          feedMode={effectiveFeedMode}
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
          onPrintFieldSheet={() => setShowFieldSheet(true)}
          onOpenQrTags={() => setShowQrModal(true)}
        />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-4 space-y-5">

        <TabBar tab={tab} setTab={setTab} onSettings={() => setSettingsOpen(true)} />

        {/* Mobile / Direct Equipment Passport View (via QR Scan or Deep Link) */}
        {tab === 'asset' && (
          <AssetPassport
            assetId={selectedAssetId}
            onSelectAsset={handleSelectAsset}
            onBack={() => setTab('console')}
            liveValues={liveValues}
            feedMode={effectiveFeedMode}
            isLive={isLive}
            workOrders={workOrders}
            onCreateWorkOrder={handleCreateWorkOrder}
            onShowQrModal={() => setShowQrModal(true)}
            onPrintFieldSheet={() => setShowFieldSheet(true)}
            showToast={showToast}
          />
        )}

        {/* Platform Header & Mission Overview */}
        <section ref={overviewRef} className="space-y-6 scroll-mt-[120px]">
          {tab === 'overview' && (
            <FacilityOverview
              feedMode={effectiveFeedMode}
              liveValues={liveValues}
              isLive={isLive}
              setTab={setTab}
              onCreateWorkOrder={handleCreateWorkOrder}
              workOrders={workOrders}
              onExport={handleExport}
            />
          )}


          {tab === 'platform' && (
          <div className="space-y-6">
            {/* System Setup & Monitored Capacity Metrics */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Monitored Machines</span>
                  <Cpu size={16} className="text-[#2C6E9B]" />
                </div>
                <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
                  38 <span className="text-[13px] font-normal text-[#8A8175]">Units</span>
                </div>
                <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
                  Air handling units, water pumps, cooling towers, and switchboards.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Sensors Online</span>
                  <Radio size={16} className="text-[#2C6E9B]" />
                </div>
                <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
                  1,428 <span className="text-[13px] font-normal text-[#8A8175]">Points</span>
                </div>
                <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
                  Actively measuring vibration, surface heat, current draw, and noise.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Early Warning Window</span>
                  <Clock size={16} className="text-[#2C6E9B]" />
                </div>
                <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
                  7–14 <span className="text-[13px] font-normal text-[#8A8175]">Days</span>
                </div>
                <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
                  Average lead time given to technicians before a motor stops running.
                </p>
              </Card>
            </div>

            {/* Technician 101: How Aegis Works (Onboarding Help) */}
            <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-5 rounded-xl">
              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">Technician 101 • Onboarding Guide</span>
                <h3 className="font-display text-[16px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  How Aegis Predictive Monitoring Works
                </h3>
                <p className="text-[12px] text-[#6E6558] dark:text-[#A0988A] mt-0.5">
                  A simple 3-step guide for apprentices and facility maintenance staff.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
                  <div className="w-7 h-7 rounded-md bg-[#2C6E9B]/10 text-[#2C6E9B] flex items-center justify-center font-mono text-[12px] font-bold mb-2">
                    01
                  </div>
                  <h4 className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Sensors Listen 24/7</h4>
                  <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-relaxed">
                    Inexpensive sensor nodes measure mechanical vibration (mm/s), motor temperature (°C), and electrical current (Amps) every second.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
                  <div className="w-7 h-7 rounded-md bg-[#2F8A7E]/10 text-[#2F8A7E] flex items-center justify-center font-mono text-[12px] font-bold mb-2">
                    02
                  </div>
                  <h4 className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Detects Tiny Drifts</h4>
                  <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-relaxed">
                    When grease dries up or a belt loosens, vibration rises before anyone can hear or smell it. Aegis catches this drift days before failure.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
                  <div className="w-7 h-7 rounded-md bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center font-mono text-[12px] font-bold mb-2">
                    03
                  </div>
                  <h4 className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Step-by-Step Fix</h4>
                  <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-relaxed">
                    Instead of guessing or replacing entire machines, you get a clear checklist: what grease to pump, what bolts to tighten, and what to log.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform & License Information */}
            <Card className="p-4 border-[#2C6E9B]/30 bg-[#FAF8F4] dark:bg-[#141B22]">
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-[#1F2933] dark:text-[#FAF8F4] font-semibold">
                  <Shield size={16} className="text-[#2C6E9B]" />
                  <span>Aegis Open Facility Intelligence • MIT License</span>
                </div>
                <div className="flex items-center gap-2 text-[#6E6558] dark:text-[#A0988A]">
                  <span>$180/Asset COTS Hardware</span>
                  <span>•</span>
                  <span>github.com/aegis-open</span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-[#8A8175] mt-2 leading-relaxed">
                Open hardware: DHT22, ACS712, MPU6050, YF-S201, ESP32, MQTT • Explainable models: Seasonal ARIMA, Isolation Forest, FFT spectral analysis • Built for field technicians, not boardrooms.
              </p>
            </Card>

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

           <LiveTelemetryTicker mode={effectiveFeedMode} values={isLive ? liveValues : null} params={params} isLive={isLive} />

          <div ref={telemetryRef} className="space-y-4 scroll-mt-[120px]">
            <FacilityHealth mode={effectiveFeedMode} />

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
              <SubsystemGrid mode={effectiveFeedMode} onSelect={(id) => setActiveSubsystem(id)} />
              {searchQuery && (
                <div className="mt-3 font-mono text-[10px] text-[#8A8175]">Filtered {filteredSubsystems.length} subsystems for "{searchQuery}" • <button onClick={() => setSearchQuery('')} className="text-[#2C6E9B] underline">Clear</button></div>
              )}
            </Card>

            <div className="grid lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-5">
                <FailureForecast mode={effectiveFeedMode} />
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
            <RootCauseInspector mode={effectiveFeedMode} />
            <TriageQueue
              onCreateWorkOrder={handleCreateWorkOrder}
              onViewTelemetry={handleViewTelemetry}
              acknowledged={acknowledged}
              onAcknowledge={handleAcknowledge}
              workOrders={workOrders}
              onPrintFieldSheet={() => setShowFieldSheet(true)}
            />
          </div>

          <div ref={actionRef} className="grid lg:grid-cols-12 gap-4 items-start scroll-mt-[120px]">
            <div className="lg:col-span-8 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>24-Hour Operational Telemetry Chart • Baseline vs Actual • Correlation View</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={effectiveFeedMode === 'fault' ? 'attention' : 'nominal'}>{effectiveFeedMode === 'fault' ? 'Anomaly Detected' : 'Nominal'}</Badge>
                    <span className="font-mono text-[10px] text-[#8A8175]">AHU-03 • Power Envelope • Live: {liveValues.cur}A</span>
                  </div>
                </CardHeader>
                <TelemetryChart mode={effectiveFeedMode} range={range} />
              </Card>
              <CorrelationChart mode={effectiveFeedMode} />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <MaintenanceChecklist onExport={handleExport} onPrintFieldSheet={() => setShowFieldSheet(true)} />
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
                      <Button 
                        variant="secondary" 
                        size="xs" 
                        onClick={() => {
                          const assetMap = {
                            water: 'cw-pump-02',
                            electrical: 'elec-01',
                            hvac: 'ahu-03',
                            mechanical: 'ahu-03',
                            energy: 'vav-4b'
                          };
                          const target = assetMap[activeSubsystem] || 'ahu-03';
                          setSelectedAssetId(target);
                          setShowQrModal(true);
                        }}
                      >
                        <QrCode size={10} className="mr-1" /> QR Tag
                      </Button>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedAssetId('ahu-03');
                          setTab('asset', 'ahu-03');
                        }}
                        className="col-span-2 flex items-center justify-center gap-1.5 font-mono text-[10px]"
                      >
                        <QrCode size={12} className="text-[#2C6E9B]" />
                        <span>Open AHU-03 Asset Passport</span>
                      </Button>
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
                <MaintenanceChecklist onExport={handleExport} onPrintFieldSheet={() => setShowFieldSheet(true)} />
              </div>
            </div>
          </section>
        )}

        {/* Interactive Scenario Simulator */}
        {tab === 'simulator' && (
        <section className="space-y-4 pb-10">
          <SectionLabel k="07" title='Interactive Scenario Simulator: "Normal Run" vs. "Mechanical Degradation"' id="simulator" />
          <PredictiveSimulator params={params} liveValues={liveValues} isLive={isLive} />
        </section>
        )}
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

      {/* Machine QR Asset Tag Modal */}
      <AssetQrModal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        assetId={selectedAssetId}
        onSelectAsset={handleSelectAsset}
        onOpenPassport={(id) => {
          setSelectedAssetId(id);
          setTab('asset', id);
        }}
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
