import React from 'react';
import { 
  Shield, 
  Radio, 
  Gauge, 
  Settings, 
  LayoutDashboard, 
  ChartNoAxesCombined, 
  Cable, 
  Menu 
} from 'lucide-react';

export const TABS = [
  { 
    id: 'overview', 
    label: 'Overview', 
    shortLabel: 'Overview', 
    subtitle: 'Command Center',
    tooltipTitle: 'Facility Overview',
    tooltipDesc: 'Overall health score, problem spotlight & system status',
    icon: LayoutDashboard 
  },
  { 
    id: 'console', 
    label: 'Live Console', 
    shortLabel: 'Console', 
    subtitle: 'Telemetry & Equipment',
    tooltipTitle: 'Live Operations Console',
    tooltipDesc: 'Real-time telemetry streams, equipment grid & sensor tiles',
    icon: Radio,
    alertOnFault: true
  },
  { 
    id: 'analysis', 
    label: 'Analysis & Action', 
    shortLabel: 'Analysis', 
    subtitle: 'Root Cause & Triage',
    tooltipTitle: 'Analysis & Triage Queue',
    tooltipDesc: 'Vibration spectrum, failure forecasting & work orders',
    icon: ChartNoAxesCombined,
    alertOnFault: true
  },
  { 
    id: 'simulator', 
    label: 'Scenario Simulator', 
    shortLabel: 'Simulator', 
    subtitle: 'Physics Wear Engine',
    tooltipTitle: 'Predictive Simulator',
    tooltipDesc: 'Run what-if wear scenarios and verify early warning limits',
    icon: Gauge 
  },
  { 
    id: 'platform', 
    label: 'Platform & Hardware', 
    shortLabel: 'Platform', 
    subtitle: 'ESP32 & Schematics',
    tooltipTitle: 'Hardware & Architecture',
    tooltipDesc: 'Democratized sensor specs, gateway pinouts & open docs',
    icon: Cable 
  },
];

export const TabBar = React.memo(({ tab, setTab, onSettings }) => (
  <div className="flex xl:hidden overflow-x-auto items-center bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] justify-between">
    <div className="flex items-center overflow-x-auto">
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`whitespace-nowrap font-display text-[10px] font-bold uppercase px-3.5 py-2.5 border-b-2 transition-colors ${tab === t.id ? 'border-[#2C6E9B] text-[#2C6E9B] bg-[#2C6E9B]/5' : 'border-transparent text-[#6E6558] dark:text-[#C5BCAD] hover:bg-[#F1EDE6] dark:hover:bg-[#141B22] hover:text-[#1F2933]'}`}
        >
          {t.shortLabel}
        </button>
      ))}
    </div>
    {onSettings && (
      <button
        type="button"
        onClick={onSettings}
        title="Facility Settings & Sensor Calibration"
        aria-label="Settings"
        className="group shrink-0 flex items-center gap-1 font-display text-[10px] font-bold uppercase px-3 py-2 text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#2C6E9B] transition-colors border-l border-[#E6E0D6] dark:border-[#2C3847]"
      >
        <Settings size={13} className="transition-transform duration-500 ease-out group-hover:rotate-90 text-[#2C6E9B]" />
        <span>Settings</span>
      </button>
    )}
  </div>
));

export const SideRail = React.memo(({ 
  tab, 
  setTab, 
  onSettings, 
  settingsOpen, 
  isLive, 
  feedMode,
  collapsed, 
  onToggleCollapse, 
  expanded,
  onToggleExpand
}) => {
  const isFault = feedMode === 'fault';
  const widthClass = collapsed ? 'w-0' : (expanded ? 'w-[230px]' : 'w-[76px]');

  return (
    <div className={`hidden xl:block transition-[width] duration-300 ${widthClass}`}>
      <aside className={`hidden xl:flex fixed inset-y-0 left-0 z-[60] flex-col bg-[#FFFFFF] dark:bg-[#141B22] border-r-2 border-[#1F2933] dark:border-[#2C3847] transition-[width,transform] duration-300 ${
        collapsed ? '-translate-x-full w-[76px]' : `translate-x-0 ${expanded ? 'w-[230px]' : 'w-[76px]'}`
      }`}>
        
        {/* Top Header Section */}
        <div className={`h-[76px] w-full border-b-2 border-[#1F2933] dark:border-[#2C3847] flex items-center ${
          expanded ? 'justify-between px-4' : 'justify-center'
        }`}>
          {expanded ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] flex items-center justify-center shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C]">
                  <Shield size={16} className="text-[#FFFFFF]" />
                </div>
                <div>
                  <div className="font-display text-[15px] font-bold leading-none uppercase text-[#1F2933] dark:text-[#FAF8F4] tracking-wider">
                    AEGIS
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#8A8175] mt-0.5">
                    Console
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleExpand}
                title="Collapse to compact icon rail"
                aria-label="Collapse to compact icon rail"
                className="w-8 h-8 rounded border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#1A222B] text-[#6E6558] dark:text-[#FAF8F4] hover:text-[#2C6E9B] hover:border-[#2C6E9B] flex items-center justify-center transition-colors"
              >
                <Menu size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onToggleExpand}
              title="Expand navigation sidebar"
              aria-label="Expand navigation sidebar"
              className="w-10 h-10 rounded-lg bg-[#2C6E9B] flex items-center justify-center text-white shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:opacity-90 transition-opacity"
            >
              <Shield size={20} className="text-[#FFFFFF]" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 flex flex-col gap-2 items-center px-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            const hasAlert = item.alertOnFault && isFault;

            if (expanded) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-[#2C6E9B] border-[#1F2933] text-[#FFFFFF] shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C]'
                      : 'bg-[#FAF8F4] dark:bg-[#1A222B] border-[#E6E0D6] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B] hover:text-[#1F2933] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#E6E0D6] dark:bg-[#141B22] text-[#2C6E9B]'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 truncate">
                      <div className={`font-display text-[12px] font-bold uppercase tracking-wider leading-tight truncate ${
                        isActive ? 'text-[#FFFFFF]' : 'text-[#1F2933] dark:text-[#FAF8F4]'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`font-mono text-[9px] truncate mt-0.5 ${
                        isActive ? 'text-[#FFFFFF]/80' : 'text-[#8A8175]'
                      }`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {hasAlert && (
                    <span className="shrink-0 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-[#C05043] text-white animate-pulse">
                      Alert
                    </span>
                  )}
                </button>
              );
            }

            return (
              <div key={item.id} className="relative group flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative w-12 h-12 flex items-center justify-center border transition-all ${
                    isActive 
                      ? 'bg-[#2C6E9B] border-[#1F2933] text-[#FFFFFF] shadow-[3px_3px_0_#D2C9BA] dark:shadow-[3px_3px_0_#0F151C]' 
                      : 'bg-[#FAF8F4] dark:bg-[#1A222B] border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] dark:text-[#C5BCAD] hover:border-[#2C6E9B] hover:text-[#2C6E9B]'
                  }`}
                >
                  <Icon size={18} />
                  {isActive && <span className="absolute -left-[15px] h-6 w-1 bg-[#2C6E9B]" />}
                  
                  {hasAlert && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#C05043] ring-2 ring-white dark:ring-[#141B22] animate-pulse" />
                  )}
                </button>

                <div className="absolute left-[64px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-[100] pointer-events-none">
                  <div className="bg-[#1F2933] dark:bg-[#0F151C] text-white border-2 border-[#1F2933] dark:border-[#2C3847] shadow-[3px_3px_0_rgba(0,0,0,0.3)] rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-wider text-white">
                      <span>{item.tooltipTitle}</span>
                      {hasAlert && (
                        <span className="px-1.5 py-0.2 rounded bg-[#C05043] text-[8px] font-mono">
                          Attention Needed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Action Section: Settings & Controls */}
        <div className={`mt-auto mb-5 ${expanded ? 'px-3 w-full' : 'relative group'}`}>
          {expanded ? (
            <button
              type="button"
              onClick={onSettings}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                settingsOpen
                  ? 'bg-[#2C6E9B] border-[#1F2933] text-white shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C]'
                  : 'bg-[#FAF8F4] dark:bg-[#1A222B] border-[#E6E0D6] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Settings size={18} className="transition-transform duration-500 ease-out group-hover:rotate-90 shrink-0 text-[#2C6E9B]" />
                <div className="min-w-0">
                  <div className="font-display text-[11px] font-bold uppercase tracking-wider text-[#1F2933] dark:text-[#FAF8F4]">
                    Facility Settings
                  </div>
                  <div className="font-mono text-[9px] text-[#8A8175] truncate">
                    Thresholds & Node Tare
                  </div>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} />
            </button>
          ) : (
            <>
              <button 
                type="button" 
                onClick={onSettings} 
                title="Facility Settings & Sensor Calibration" 
                aria-label="Facility Settings & Sensor Calibration"
                aria-expanded={settingsOpen}
                className={`relative w-12 h-12 flex items-center justify-center border-2 transition-all ${
                  settingsOpen
                    ? 'bg-[#2C6E9B] border-[#1F2933] dark:border-[#2C3847] text-[#FFFFFF] shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C]'
                    : 'border-[#1F2933] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:border-[#2C6E9B] hover:text-[#2C6E9B] active:translate-x-[1px] active:translate-y-[1px]'
                }`}
              >
                <Settings size={20} className="transition-transform duration-500 ease-out group-hover:rotate-90" />
                <span 
                  className={`absolute top-1 right-1 w-2 h-2 rounded-full border border-white dark:border-gray-900 ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} 
                  title={isLive ? 'ESP32 Hardware Connected' : 'Demonstration Mode'} 
                />
              </button>

              <div className="absolute left-[64px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-[100] pointer-events-none">
                <div className="bg-[#1F2933] text-white text-[11px] font-mono px-2.5 py-1 rounded shadow-lg whitespace-nowrap border border-[#3E4650]">
                  Facility Settings & Calibration
                </div>
              </div>
            </>
          )}
        </div>

      </aside>
    </div>
  );
});
