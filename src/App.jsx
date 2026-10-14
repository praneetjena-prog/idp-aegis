import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Zap, 
  Cpu, 
  Layers, 
  Radio, 
  ChevronRight, 
  ArrowLeft, 
  Printer, 
  Thermometer, 
  Waves, 
  Volume2, 
  Filter, 
  CheckCircle2, 
  Gauge, 
  QrCode,
  CalendarDays,
  Microscope,
  AlertTriangle,
  LayoutDashboard
} from 'lucide-react';

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
import { isSoundEnabled, setSoundEnabled, playDispatchChime, playAlertChime } from './lib/sound';

import { SideRail } from './components/layout/SideRail';
import { TopHeader } from './components/layout/TopHeader';
import { AlertsTriageView } from './components/analysis/AlertsTriageView';
import { ReliabilityAuditView } from './components/analysis/ReliabilityAuditView';
import { MaintenanceCalendarPage } from './components/dashboard/MaintenanceCalendarPage';

import { RootCauseInspector } from './components/workflow/RootCauseInspector';
import { MaintenanceChecklist } from './components/workflow/MaintenanceChecklist';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleSignInModal } from './components/auth/GoogleSignInModal';
import { RoleAssignmentModal } from './components/auth/RoleAssignmentModal';
import { FeatureOnlyPage } from './components/auth/FeatureOnlyPage';
import { HomePage } from './components/home/HomePage';
import { RoleContextBanner } from './components/layout/RoleContextBanner';

const SectionLabel = ({ k, title, id }) => (
  <div id={id} className="flex items-center gap-3 mb-4 scroll-mt-[112px]">
    <div className="w-7 h-7 bg-[#F1EDE6] border border-[#D2C9BA] flex items-center justify-center font-mono text-[10px] font-bold text-[#6E6558]">{k}</div>
    <h2 className="font-display text-[12px] font-bold uppercase text-[#1F2933]">{title}</h2>
    <div className="flex-1 h-px bg-[#E6E0D6] ml-3" />
  </div>
);

const VALID_TABS = [
  'home',
  'overview',
  'console',
  'alerts',
  'analysis',
  'calendar',
  'maintenance-calendar',
  'audit',
  'compliance',
  'simulator',
  'asset',
  'platform'
];
const STORAGE_WORK_ORDERS = 'aegis-work-orders';
const STORAGE_ACKNOWLEDGED = 'aegis-acknowledged-alerts';

function parseHash() {
  if (typeof window === 'undefined' || !window.location.hash) {
    return { tab: 'home', assetId: 'ahu-03' };
  }
  const clean = window.location.hash.replace(/^#/, '');
  const parts = clean.split('/');
  const tabName = parts[0]?.toLowerCase();
  if (tabName === 'asset') {
    return { tab: 'asset', assetId: parts[1]?.toLowerCase() || 'ahu-03' };
  }
  if (['features', 'roles'].includes(tabName)) {
    return { tab: 'home', assetId: 'ahu-03', scrollTo: tabName };
  }
  if (tabName === 'calendar' || tabName === 'maintenance-calendar') {
    return { tab: 'calendar', assetId: 'ahu-03' };
  }
  if (tabName === 'audit' || tabName === 'compliance') {
    return { tab: 'audit', assetId: 'ahu-03' };
  }
  if (tabName === 'alerts' || tabName === 'analysis') {
    return { tab: 'alerts', assetId: 'ahu-03' };
  }
  if (VALID_TABS.includes(tabName)) {
    return { tab: tabName, assetId: 'ahu-03' };
  }
  return { tab: 'home', assetId: 'ahu-03' };
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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    hasFacilityAccess,
    authLoading,
    signInModalOpen, 
    openSignInModal, 
    closeSignInModal, 
    roleModalOpen,
    closeRoleModal,
    intendedRoute,
    roleConfig 
  } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);

  const initialNav = useMemo(() => parseHash(), []);
  const [tab, setTabState] = useState(initialNav.tab);
  const [selectedAssetId, setSelectedAssetId] = useState(initialNav.assetId);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

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

  // Sync tab changes with URL hash and check authorization
  const setTab = (nextTab, assetId) => {
    if (!VALID_TABS.includes(nextTab)) return;
    
    // Unauthenticated guard: opening any non-home tab prompts sign-in
    if (nextTab !== 'home' && !isAuthenticated) {
      openSignInModal(nextTab);
      return;
    }

    // Feature-only guard: user without valid facility assignment can only access #platform or #home
    if (isAuthenticated && !hasFacilityAccess && nextTab !== 'platform' && nextTab !== 'home') {
      nextTab = 'platform';
    }

    const prevTab = tab;
    setTabState(nextTab);
    const targetAsset = assetId || selectedAssetId || 'ahu-03';
    if (assetId) {
      setSelectedAssetId(assetId);
    }

    if (typeof window !== 'undefined') {
      let newHash = `#${nextTab}`;
      if (nextTab === 'asset') {
        newHash = `#asset/${targetAsset}`;
      } else if (nextTab === 'calendar' || nextTab === 'maintenance-calendar') {
        newHash = '#maintenance-calendar';
      } else if (nextTab === 'audit' || nextTab === 'compliance') {
        newHash = '#audit';
      } else if (nextTab === 'alerts' || nextTab === 'analysis') {
        newHash = '#alerts';
      } else if (nextTab === 'home') {
        newHash = '#home';
      }

      if (window.location.hash !== newHash) {
        if (prevTab === 'home' && nextTab !== 'home') {
          window.history.pushState({ tab: nextTab, from: 'home', initialized: true }, '', newHash);
        } else if (nextTab === 'home') {
          if (window.history.state?.from === 'home' && window.history.length > 1) {
            window.history.back();
          } else {
            window.history.pushState({ tab: 'home', initialized: true }, '', '#home');
          }
        } else {
          window.history.replaceState({ tab: nextTab, from: 'home', initialized: true }, '', newHash);
        }
      }
    }
  };

  // Enforce access control on tab state whenever authentication changes
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      if (tab !== 'home') {
        openSignInModal(tab);
      }
    } else if (!hasFacilityAccess) {
      // feature_user or facility role missing facility_id -> lock to #platform
      if (tab !== 'platform') {
        setTabState('platform');
        if (typeof window !== 'undefined' && window.location.hash !== '#platform') {
          window.location.hash = '#platform';
        }
      }
    } else if (hasFacilityAccess) {
      // Approved facility role: if currently on #platform and had intended route or came from login
      if (tab === 'home' && intendedRoute && intendedRoute !== 'home') {
        setTab(intendedRoute);
      }
    }
  }, [isAuthenticated, hasFacilityAccess, authLoading]);

  // Listen to browser Back / Forward buttons & history navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentParsed = parseHash();
      if (currentParsed.tab !== 'home' && !window.history.state?.initialized) {
        window.history.replaceState({ tab: 'home', initialized: true }, '', '#home');
        window.history.pushState(
          { tab: currentParsed.tab, assetId: currentParsed.assetId, from: 'home', initialized: true },
          '',
          window.location.hash
        );
      } else if (!window.history.state?.initialized) {
        window.history.replaceState({ tab: 'home', initialized: true }, '', window.location.hash || '#home');
      }

      if (currentParsed.scrollTo) {
        setTimeout(() => {
          const el = document.getElementById(currentParsed.scrollTo);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }

    const onHistoryNavigation = () => {
      const parsed = parseHash();
      
      // Authorization-aware history handling
      if (!isAuthenticated && parsed.tab !== 'home') {
        openSignInModal(parsed.tab);
        setTabState('home');
        return;
      }

      if (isAuthenticated && !hasFacilityAccess && parsed.tab !== 'platform' && parsed.tab !== 'home') {
        setTabState('platform');
        if (typeof window !== 'undefined') window.location.hash = '#platform';
        return;
      }

      setTabState(parsed.tab);
      if (parsed.assetId) {
        setSelectedAssetId(parsed.assetId);
      }
      if (parsed.scrollTo) {
        setTimeout(() => {
          const el = document.getElementById(parsed.scrollTo);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    };

    window.addEventListener('popstate', onHistoryNavigation);
    window.addEventListener('hashchange', onHistoryNavigation);
    return () => {
      window.removeEventListener('popstate', onHistoryNavigation);
      window.removeEventListener('hashchange', onHistoryNavigation);
    };
  }, [isAuthenticated, hasFacilityAccess, openSignInModal]);

  // Loading state: prevent flashing protected content before session resolution
  if (authLoading) {
    return (
      <div className={`min-h-screen bg-[#FAF8F4] dark:bg-[#0F151C] flex flex-col items-center justify-center p-4 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#2C6E9B] text-white flex items-center justify-center font-bold shadow-lg animate-pulse">
            <Shield size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              AEGIS Security Gateway
            </h2>
            <p className="font-mono text-[11px] text-[#8A8175]">
              Verifying authentication & resolving database-assigned facility role...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Path 1: Signed-out user
  if (!isAuthenticated) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <HomePage
          onNavigate={(targetTab) => {
            openSignInModal(targetTab || 'console');
          }}
          liveValues={{ vib: '2.34', cur: '14.2', temp: '54.2', acoustic: '1.8' }}
          isLive={false}
          feedMode="fault"
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onOpenQrTags={() => openSignInModal('console')}
          onOpenCalendar={() => openSignInModal('calendar')}
        />
        <GoogleSignInModal
          open={signInModalOpen || tab !== 'home'}
          onClose={() => {
            closeSignInModal();
            if (tab !== 'home') {
              setTabState('home');
              if (typeof window !== 'undefined') window.location.hash = '#home';
            }
          }}
        />
        {toast && (
          <div className="fixed bottom-4 right-4 z-[130] bg-[#FFFFFF] border border-[#D2C9BA] text-[#1F2933] px-3 py-2.5 rounded-lg shadow-xl flex items-center gap-2 font-mono text-[11px] animate-in slide-in-from-bottom-2 max-w-[360px]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse shrink-0" />
            <span className="leading-relaxed">{toast}</span>
          </div>
        )}
      </div>
    );
  }

  // Render Path 2: Authenticated without approved facility access (feature_user or missing facility_id)
  if (!hasFacilityAccess) {
    return (
      <>
        <FeatureOnlyPage
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
        <RoleAssignmentModal
          open={roleModalOpen}
          onClose={closeRoleModal}
        />
      </>
    );
  }

  // Render Path 3: Authenticated with approved facility access (technician, manager, auditor + facility_id)
  return (
    <>
      <OperationalCockpit
        tab={tab}
        setTab={setTab}
        selectedAssetId={selectedAssetId}
        setSelectedAssetId={setSelectedAssetId}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        showToast={showToast}
        toast={toast}
      />
      <RoleAssignmentModal
        open={roleModalOpen}
        onClose={closeRoleModal}
      />
    </>
  );
}

/**
 * Isolated operational cockpit component.
 * Mounts and streams live telemetry ONLY when the user has an approved facility role and valid facility_id.
 */
function OperationalCockpit({
  tab,
  setTab,
  selectedAssetId,
  setSelectedAssetId,
  darkMode,
  toggleTheme,
  showToast,
  toast
}) {
  const { roleConfig } = useAuth();
  const [range, setRange] = useState('24H');
  const [feedMode, setFeedMode] = useState('fault');
  const [activeSubsystem, setActiveSubsystem] = useState(null);
  const [workOrders, setWorkOrders] = useState(getInitialWorkOrders);
  const [acknowledged, setAcknowledged] = useState(getInitialAcknowledged);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFieldSheet, setShowFieldSheet] = useState(false);
  const [telemetryFilter, setTelemetryFilter] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [railExpanded, setRailExpanded] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playDispatchChime();
  };

  const { params, setParams, save: saveParams, saving } = useFacilityParams();

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

  // Live telemetry feed: only active in OperationalCockpit for authorized facility users
  const { 
    values: liveValues, 
    isLive, 
    lastSeen, 
    backendStatus, 
    backendAnomalies, 
    recordCount 
  } = useLiveFeed(feedMode);

  const effectiveFeedMode = isLive && backendStatus
    ? (backendStatus === 'Alert' || backendStatus === 'Warning' ? 'fault' : 'normal')
    : feedMode;

  const overviewRef = useRef(null);
  const telemetryRef = useRef(null);
  const rootCauseRef = useRef(null);
  const actionRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSelectAsset = (assetId) => {
    setSelectedAssetId(assetId);
    if (tab === 'asset' && typeof window !== 'undefined') {
      const newHash = `#asset/${assetId}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState({ tab: 'asset', assetId, from: 'home', initialized: true }, '', newHash);
      }
    }
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
      work_orders: workOrders
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
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast(`✓ Exported ${type.toUpperCase()} • Shift telemetry`);
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
        [timestamp, 'HVAC Air Handlers', 'AHU-03', 'Acoustic HF Emission', `+${liveValues.acoustic}`, 'dB', '0.0 dB', isFault ? 'ATTENTION' : 'NOMINAL', '88%', '-']
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
      setTimeout(() => URL.revokeObjectURL(url), 2000);
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

  // If user is on #home within authorized session
  if (tab === 'home') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <HomePage
          onNavigate={(targetTab, assetId) => setTab(targetTab || 'console', assetId)}
          liveValues={liveValues}
          isLive={isLive}
          feedMode={effectiveFeedMode}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onOpenQrTags={() => setShowQrModal(true)}
          onOpenCalendar={() => setTab('calendar')}
        />
        {toast && (
          <div className="fixed bottom-4 right-4 z-[130] bg-[#FFFFFF] border border-[#D2C9BA] text-[#1F2933] px-3 py-2.5 rounded-lg shadow-xl flex items-center gap-2 font-mono text-[11px] animate-in slide-in-from-bottom-2 max-w-[360px]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse shrink-0" />
            <span className="leading-relaxed">{toast}</span>
          </div>
        )}
      </div>
    );
  }

  const unacknowledgedCount = effectiveFeedMode === 'fault' ? Math.max(0, 2 - acknowledged.size) : 0;

  return (
    <div className={`flex min-h-screen bg-[#F1EDE6] dark:bg-[#0F151C] text-[#2A3138] selection:bg-[#2C6E9B]/30 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      {/* Redesigned Sidebar Navigation with integrated utilities */}
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
        assetCode={selectedAssetId ? selectedAssetId.toUpperCase() : 'AHU-03'}
        unacknowledgedAlertsCount={unacknowledgedCount}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        soundOn={soundOn}
        toggleSound={handleToggleSound}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader
          onToggleNavigation={() => {
            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
              setRailExpanded(v => !v);
            } else {
              setMobileDrawerOpen(v => !v);
            }
          }}
          isLive={isLive}
          lastSeen={lastSeen}
          feedMode={effectiveFeedMode}
          vibration={liveValues.vib}
          setFeedMode={setFeedMode}
        />

        {/* Page Content Surface */}
        <main className="flex-1 min-w-0 max-w-[1600px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-5">
          <ErrorBoundary onReset={() => setTab('overview')}>
            <RoleContextBanner setTab={setTab} />

          {/* 1. Overview Destination */}
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

          {/* 2. Live Console Destination */}
          {tab === 'console' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="self-start px-3 py-1 bg-[#2C6E9B]/10 border border-[#2C6E9B]/30 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2C6E9B] animate-pulse" />
                  <span className="font-display text-[12px] font-semibold text-[#2C6E9B]">Facility status</span>
                </div>
                <div className="hidden sm:block h-px flex-1 bg-[#E6E0D6] dark:bg-[#2C3847]" />
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
                  <span className="font-mono text-[10px] text-[#8A8175]">Showing {range} · {feedMode === 'fault' ? 'Fault example' : 'Normal operation'} · Updates every 1.8s</span>
                  <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md">
                    {['all', 'critical', 'nominal'].map(f => (
                      <button key={f} onClick={() => setTelemetryFilter(f)} className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase ${telemetryFilter === f ? 'bg-[#E6E0D6] dark:bg-[#2C3847] text-[#1F2933] dark:text-[#FAF8F4]' : 'text-[#A99F90]'}`}>{f}</button>
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
                    <WorkOrderHistory 
                      workOrders={workOrders} 
                      onExport={handleExport} 
                      onClear={handleClearWorkOrders} 
                      onOpenCalendar={() => setTab('calendar')} 
                    />
                  </div>
                </div>
              </div>

              {/* Subsystem Detail Drilldown */}
              {activeSubsystem && (
                <section className="space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#8A8175]">
                    <button onClick={() => setActiveSubsystem(null)} className="flex items-center gap-1 hover:text-[#1F2933] transition-colors"><ArrowLeft size={12} /> Return to Facility Console</button>
                    <ChevronRight size={12} />
                    <span>Console</span>
                    <ChevronRight size={12} />
                    <span>Equipment</span>
                    <ChevronRight size={12} />
                    <span className="text-[#1F2933] dark:text-[#FAF8F4]">{activeSubsystem.toUpperCase()} Detailed Analysis</span>
                    {activeSubsystem === 'mechanical' || activeSubsystem === 'hvac' ? <Badge variant="critical">AHU-03 Focus • Live {liveValues.vib}mm/s</Badge> : null}
                  </div>

                  <div className="grid lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Live Sensor Tiles • {activeSubsystem.toUpperCase()} • AHU-03 Primary Supply Fan</CardTitle>
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
                          <div className={`bg-[#F1EDE6] dark:bg-[#141B22] border rounded-lg p-3 transition-all ${parseFloat(liveValues.vib) > 4 ? 'border-[#C05043]/50 bg-[#C05043]/5' : 'border-[#E6E0D6] dark:border-[#2C3847]'}`}>
                            <div className="flex items-center gap-1.5 mb-1"><Waves size={12} className={parseFloat(liveValues.vib) > 4 ? 'text-[#C05043]' : 'text-[#6E6558]'} /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Vibration Velocity</span></div>
                            <div className={`font-mono text-[18px] font-bold ${parseFloat(liveValues.vib) > 4 ? 'text-[#C05043]' : 'text-[#1F2933] dark:text-[#FAF8F4]'}`}>{detailData.vibration}</div>
                            <div className="font-mono text-[10px] text-[#8A8175]">Threshold: {detailData.thresholdVib} • <span className={parseFloat(liveValues.vib) > 4 ? 'text-[#C05043]' : 'text-[#2E7D5B]'}>{parseFloat(liveValues.vib) > 4 ? `+${Math.round((liveValues.vib/2.5-1)*100)}% over` : 'Nominal'}</span></div>
                            <div className="mt-2 h-1 bg-[#E6E0D6] dark:bg-[#2C3847] rounded-full overflow-hidden"><div className="h-full bg-[#C05043] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.vib/8)*100)}%` }} /></div>
                          </div>
                          <div className={`bg-[#F1EDE6] dark:bg-[#141B22] border rounded-lg p-3 transition-all ${liveValues.cur > 16 ? 'border-[#B07B1C]/50 bg-[#B07B1C]/5' : 'border-[#E6E0D6] dark:border-[#2C3847]'}`}>
                            <div className="flex items-center gap-1.5 mb-1"><Zap size={12} className={liveValues.cur > 16 ? 'text-[#B07B1C]' : 'text-[#6E6558]'} /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Drive Current</span></div>
                            <div className={`font-mono text-[18px] font-bold ${liveValues.cur > 16 ? 'text-[#B07B1C]' : 'text-[#1F2933] dark:text-[#FAF8F4]'}`}>{detailData.current}</div>
                            <div className="font-mono text-[10px] text-[#8A8175]">Nominal: {detailData.nominalCurrent} • <span className={liveValues.cur > 16 ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}>{liveValues.cur > 16 ? `+${Math.round((liveValues.cur/14.2-1)*100)}% surge` : 'Nominal'}</span></div>
                            <div className="mt-2 h-1 bg-[#E6E0D6] dark:bg-[#2C3847] rounded-full overflow-hidden"><div className="h-full bg-[#B07B1C] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.cur/20)*100)}%` }} /></div>
                          </div>
                          <div className={`bg-[#F1EDE6] dark:bg-[#141B22] border rounded-lg p-3 transition-all ${liveValues.temp > 65 ? 'border-[#C05043]/30 bg-[#C05043]/5' : 'border-[#E6E0D6] dark:border-[#2C3847]'}`}>
                            <div className="flex items-center gap-1.5 mb-1"><Thermometer size={12} className={liveValues.temp > 65 ? 'text-[#C05043]' : 'text-[#6E6558]'} /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Bearing Temp</span></div>
                            <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">{detailData.temp}</div>
                            <div className="font-mono text-[10px] text-[#8A8175]">Nominal: {detailData.nominalTemp} • <span className={liveValues.temp > 65 ? 'text-[#C05043]' : 'text-[#2E7D5B]'}>{liveValues.temp > 65 ? 'Overheat' : 'Nominal'}</span></div>
                            <div className="mt-2 h-1 bg-[#E6E0D6] dark:bg-[#2C3847] rounded-full overflow-hidden"><div className="h-full bg-[#C05043] transition-all duration-700" style={{ width: `${Math.min(100, (liveValues.temp/90)*100)}%` }} /></div>
                          </div>
                          <div className="bg-[#F1EDE6] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1"><Volume2 size={12} className="text-[#6E6558]" /><span className="font-mono text-[9px] uppercase text-[#8A8175]">Acoustic HF Noise</span></div>
                            <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">{detailData.acoustic}</div>
                            <div className="font-mono text-[10px] text-[#8A8175]">Baseline 0 dB • Spectral peak 3.2kHz</div>
                            <div className="mt-2 h-1 bg-[#E6E0D6] dark:bg-[#2C3847] rounded-full overflow-hidden"><div className="h-full bg-[#2C6E9B] transition-all duration-700" style={{ width: `${feedMode === 'fault' ? 80 : 20}%` }} /></div>
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
                          <div className="bg-[#F1EDE6] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded p-2.5">
                            <div className="text-[#8A8175] text-[10px] uppercase mb-1">Observed Pattern • Live</div>
                            <div className="text-[#2A3138] dark:text-[#FAF8F4] leading-relaxed">Vibration ↑ ({liveValues.vib} mm/s) + Current Draw ↑ ({liveValues.cur}A) + Delta-T ↓ (3.1°C) → <span className="text-[#C05043] font-bold">Mechanical Drag & Bearing Wear</span></div>
                          </div>
                          <div className="bg-[#F1EDE6] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded p-2.5">
                            <div className="text-[#8A8175] text-[10px] uppercase mb-1">Explainability • Transparent</div>
                            <div className="text-[#6E6558] dark:text-[#A0988A]">Model: Multivariate Isolation Forest + FFT • Spectral defect at 3.2x RPM (outer race) • Confidence 91% • RUL 168h ±24h • No black box • Seasonal ARIMA baseline 8–10 kWh</div>
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
                        <div className="mt-2 space-y-2 font-mono text-[10px] text-[#6E6558] dark:text-[#A0988A]">
                          <div className="flex justify-between"><span>Location</span><span className="text-[#1F2933] dark:text-[#FAF8F4]">East Wing • Roof Level 3</span></div>
                          <div className="flex justify-between"><span>Model</span><span className="text-[#1F2933] dark:text-[#FAF8F4]">Trane M-Series • 2018</span></div>
                          <div className="flex justify-between"><span>Last PM</span><span className="text-[#1F2933] dark:text-[#FAF8F4]">2026-08-14 • 29 days ago</span></div>
                          <div className="flex justify-between"><span>Motor</span><span className="text-[#1F2933] dark:text-[#FAF8F4]">15 kW • 3-Phase • 1750 RPM</span></div>
                          <div className="flex justify-between"><span>Bearing</span><span className="text-[#1F2933] dark:text-[#FAF8F4]">6205-2RS • SKF • 2x • Stock: 4</span></div>
                          <div className="flex justify-between"><span>MQTT Topic</span><span className="text-[#2C6E9B] dark:text-[#58A6FF]">facility/unit01/ahu03/telemetry</span></div>
                          <div className="flex justify-between"><span>Sampling</span><span className="text-[#1F2933] dark:text-[#FAF8F4]">{range} @ {range === '1H' ? '1m' : range === '24H' ? '15m' : '1h'}</span></div>
                        </div>
                      </Card>
                      <MaintenanceChecklist onExport={handleExport} onPrintFieldSheet={() => setShowFieldSheet(true)} />
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* 3. Alerts & Triage Dedicated View */}
          {(tab === 'alerts' || tab === 'analysis') && (
            <AlertsTriageView
              feedMode={effectiveFeedMode}
              liveValues={liveValues}
              range={range}
              setRange={setRange}
              workOrders={workOrders}
              acknowledged={acknowledged}
              onAcknowledge={handleAcknowledge}
              onCreateWorkOrder={handleCreateWorkOrder}
              onViewTelemetry={handleViewTelemetry}
              onPrintFieldSheet={() => setShowFieldSheet(true)}
              onExport={handleExport}
              onSelectAsset={handleSelectAsset}
            />
          )}

          {/* 4. Asset Passport Dedicated View */}
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
              onOpenCalendar={() => setTab('calendar')}
              showToast={showToast}
            />
          )}

          {/* 5. Maintenance Calendar Dedicated Full Page */}
          {(tab === 'calendar' || tab === 'maintenance-calendar') && (
            <MaintenanceCalendarPage
              feedMode={effectiveFeedMode}
              onSelectAsset={handleSelectAsset}
              onPrintFieldSheet={() => setShowFieldSheet(true)}
              showToast={showToast}
              canManageSchedules={roleConfig?.canManageSchedules ?? true}
            />
          )}

          {/* 6. Reliability Audit Dedicated View */}
          {(tab === 'audit' || tab === 'compliance') && (
            <ReliabilityAuditView
              liveValues={liveValues}
              feedMode={effectiveFeedMode}
              onExport={handleExport}
              onSelectAsset={handleSelectAsset}
            />
          )}

          {/* 7. Physics Simulator View */}
          {tab === 'simulator' && (
            <section className="space-y-4 pb-10">
              <SectionLabel k="07" title='Interactive Scenario Simulator: "Normal Run" vs. "Mechanical Degradation"' id="simulator" />
              <PredictiveSimulator params={params} liveValues={liveValues} isLive={isLive} />
            </section>
          )}
          </ErrorBoundary>
        </main>
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

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-[#FAF8F4] px-3 py-2.5 rounded-lg shadow-xl flex items-center gap-2 font-mono text-[11px] animate-in slide-in-from-bottom-2 max-w-[360px]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse shrink-0" />
          <span className="leading-relaxed">{toast}</span>
        </div>
      )}

      {/* Settings Panel */}
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

