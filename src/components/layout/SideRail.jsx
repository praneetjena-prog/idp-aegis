import React, { useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Gauge, 
  Settings, 
  LayoutDashboard, 
  AlertTriangle, 
  QrCode,
  CalendarDays,
  Microscope,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

/**
 * Standardized AEGIS Information Architecture:
 * - MONITOR: Overview, Live Console, Alerts & Triage
 * - ASSETS & MAINTENANCE: Asset Passports, Maintenance Calendar
 * - RELIABILITY & INTELLIGENCE: Reliability Audit, Physics Simulator
 * - ADMINISTRATION: Facility Settings
 */
export const NAV_GROUPS = [
  {
    title: 'Monitor',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        subtitle: 'Facility Summary',
        icon: LayoutDashboard,
        route: 'overview'
      },
      {
        id: 'console',
        label: 'Live Console',
        subtitle: 'Telemetry & SCADA',
        icon: Radio,
        route: 'console'
      },
      {
        id: 'alerts',
        label: 'Alerts & Triage',
        subtitle: 'Active Fault Queue',
        icon: AlertTriangle,
        route: 'alerts',
        hasBadge: true
      }
    ]
  },
  {
    title: 'Assets & Maintenance',
    items: [
      {
        id: 'asset',
        label: 'Asset Passports',
        subtitle: 'Digital Twins & SOPs',
        icon: QrCode,
        route: 'asset'
      },
      {
        id: 'calendar',
        label: 'Maintenance Calendar',
        subtitle: 'PM Schedule & Sync',
        icon: CalendarDays,
        route: 'calendar'
      }
    ]
  },
  {
    title: 'Reliability & Intelligence',
    items: [
      {
        id: 'audit',
        label: 'Reliability Audit',
        subtitle: 'ISO 10816 Class II',
        icon: Microscope,
        route: 'audit'
      },
      {
        id: 'simulator',
        label: 'Physics Simulator',
        subtitle: 'Degradation Sandbox',
        icon: Gauge,
        route: 'simulator'
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        id: 'settings',
        label: 'Facility Settings',
        subtitle: 'Limits & Calibration',
        icon: Settings,
        isAction: true,
        actionType: 'settings'
      }
    ]
  }
];

export const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'console', label: 'Live Console', icon: Radio },
  { id: 'alerts', label: 'Alerts & Triage', icon: AlertTriangle },
  { id: 'asset', label: 'Asset Passport', icon: QrCode },
  { id: 'calendar', label: 'Maintenance Calendar', icon: CalendarDays },
  { id: 'audit', label: 'Reliability Audit', icon: Microscope },
  { id: 'simulator', label: 'Simulator', icon: Gauge }
];

export const SideRail = React.memo(({ 
  tab, 
  setTab, 
  onSettings, 
  settingsOpen, 
  isLive, 
  feedMode,
  collapsed = false, 
  onToggleCollapse, 
  expanded = true,
  onToggleExpand,
  assetCode,
  unacknowledgedAlertsCount = 0,
  mobileOpen = false,
  onCloseMobile,
  darkMode = false,
  toggleTheme,
  soundOn = true,
  toggleSound
}) => {
  const isFault = feedMode === 'fault';
  const widthClass = collapsed ? 'w-0' : (expanded ? 'w-[240px]' : 'w-[68px]');

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const handleNavClick = (item) => {
    if (item.isAction && item.actionType === 'settings') {
      if (onSettings) onSettings();
      if (mobileOpen && onCloseMobile) onCloseMobile();
      return;
    }

    if (item.route) {
      setTab(item.route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    }
  };

  const isItemActive = (item) => {
    if (item.id === 'settings') return Boolean(settingsOpen);
    if (item.route === 'overview' && tab === 'overview') return true;
    if (item.route === 'console' && tab === 'console') return true;
    if (item.route === 'alerts' && (tab === 'alerts' || tab === 'analysis')) return true;
    if (item.route === 'asset' && tab === 'asset') return true;
    if (item.route === 'calendar' && (tab === 'calendar' || tab === 'maintenance-calendar')) return true;
    if (item.route === 'audit' && (tab === 'audit' || tab === 'compliance')) return true;
    if (item.route === 'simulator' && tab === 'simulator') return true;
    return false;
  };

  // Compute alert badge count strictly from real application state
  const alertBadgeCount = isFault && unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : 0;

  const renderNavContent = (isDrawer = false) => {
    const isExpandedState = isDrawer || expanded;

    return (
      <div className="flex flex-col h-full bg-[#FAF8F4] dark:bg-[#141B22] border-r border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-[#FAF8F4] select-none">
        {/* Brand Header */}
        <div className={`h-14 border-b border-[#D2C9BA] dark:border-[#2C3847] flex items-center px-3.5 shrink-0 ${
          isExpandedState ? 'justify-between' : 'justify-center'
        }`}>
          {isExpandedState ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Shield size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4] tracking-tight leading-none">
                    AEGIS
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] mt-1 font-semibold truncate">
                    Facility Intel
                  </div>
                </div>
              </div>

              {isDrawer ? (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  title="Close navigation"
                  aria-label="Close navigation"
                  className="w-7 h-7 rounded-md border border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#1A222B] text-[#8A8175] hover:text-[#1F2933] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  title="Collapse sidebar to icon rail"
                  aria-label="Collapse sidebar to icon rail"
                  className="w-7 h-7 rounded-md border border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#1A222B] text-[#8A8175] hover:text-[#1F2933] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onToggleExpand}
              title="Expand sidebar navigation"
              aria-label="Expand sidebar navigation"
              className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center shadow-xs hover:bg-[#255C83] transition-colors cursor-pointer"
            >
              <Shield size={16} />
            </button>
          )}
        </div>

        {/* Navigation Categories Container */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3 font-sans" aria-label="Facility Navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-0.5">
              {isExpandedState && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#8A8175] dark:text-[#A0988A]">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const showBadge = item.hasBadge && alertBadgeCount > 0;

                if (isExpandedState) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item)}
                      title={`${item.label} — ${item.subtitle}`}
                      aria-label={item.label}
                      className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2C6E9B] ${
                        isActive
                          ? 'bg-[#2C6E9B] text-white font-semibold shadow-xs'
                          : 'text-[#4A4237] dark:text-[#C5BCAD] hover:bg-[#EAE4D9] dark:hover:bg-[#1E2733] hover:text-[#1F2933] dark:hover:text-[#FAF8F4]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon 
                          size={16} 
                          className={`shrink-0 ${
                            isActive 
                              ? 'text-white' 
                              : item.id === 'alerts' && isFault && alertBadgeCount > 0
                              ? 'text-[#C05043]'
                              : 'text-[#6E6558] dark:text-[#9CA3AF] group-hover:text-[#2C6E9B]'
                          }`} 
                        />
                        <div className="min-w-0 truncate">
                          <div className="text-[12px] font-medium leading-tight truncate">
                            {item.label}
                          </div>
                          <div className={`text-[9px] font-mono truncate mt-0.5 ${
                            isActive ? 'text-white/80' : 'text-[#8A8175] dark:text-[#8A8175]'
                          }`}>
                            {item.id === 'asset' && assetCode ? `Active: ${assetCode}` : item.subtitle}
                          </div>
                        </div>
                      </div>

                      {showBadge && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold shrink-0 ${
                          isActive 
                            ? 'bg-white text-[#C05043]' 
                            : 'bg-[#C05043] text-white'
                        }`}>
                          {alertBadgeCount}
                        </span>
                      )}
                    </button>
                  );
                }

                // Collapsed Icon-Rail Button
                return (
                  <div key={item.id} className="relative flex justify-center py-0.5">
                    <button
                      type="button"
                      onClick={() => handleNavClick(item)}
                      title={`${item.label} — ${item.subtitle}`}
                      aria-label={`${item.label} — ${item.subtitle}`}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2C6E9B] ${
                        isActive
                          ? 'bg-[#2C6E9B] text-white shadow-xs'
                          : 'text-[#6E6558] dark:text-[#C5BCAD] hover:bg-[#EAE4D9] dark:hover:bg-[#1E2733] hover:text-[#1F2933]'
                      }`}
                    >
                      <Icon size={18} />
                      {showBadge && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C05043] ring-2 ring-white dark:ring-[#141B22]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Unified Sidebar Footer: Utilities (Sound, Theme, Facility Context) */}
        <div className={`p-2.5 border-t border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] shrink-0 ${
          isExpandedState ? 'space-y-2' : 'flex flex-col items-center gap-1.5'
        }`}>
          {isExpandedState ? (
            <>
              {/* Utility Icons Strip: Mute + Theme (moved from top bar to sidebar to prevent header collision) */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={toggleSound}
                  title={soundOn ? 'Audible Alarms: ENABLED (Click to mute)' : 'Audible Alarms: MUTED (Click to unmute)'}
                  aria-label={soundOn ? 'Mute audible alarms' : 'Enable audible alarms'}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    soundOn 
                      ? 'border-[#2C6E9B] bg-[#2C6E9B]/10 text-[#2C6E9B] font-semibold' 
                      : 'border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#1A222B] text-[#8A8175] hover:text-[#1F2933]'
                  }`}
                >
                  {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  <span>{soundOn ? 'Audio On' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="px-2 py-1.5 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#1A222B] text-[11px] font-mono text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B] hover:text-[#2C6E9B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {darkMode ? (
                    <>
                      <Sun size={13} className="text-[#E0A83B]" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={13} className="text-[#2C6E9B]" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Facility Identifier Tag */}
              <div className="px-2 py-1.5 rounded-md bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] text-[10px] font-mono text-[#8A8175] flex items-center justify-between">
                <span>Facility</span>
                <span className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">UNIT-01</span>
              </div>
            </>
          ) : (
            <>
              {/* Collapsed Utility Buttons */}
              <button
                type="button"
                onClick={toggleSound}
                title={soundOn ? 'Audio Alarms: Enabled (Click to mute)' : 'Audio Alarms: Muted (Click to unmute)'}
                aria-label={soundOn ? 'Mute audio alarms' : 'Enable audio alarms'}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                  soundOn
                    ? 'border-[#2C6E9B] bg-[#2C6E9B]/10 text-[#2C6E9B]'
                    : 'border-[#D2C9BA] dark:border-[#2C3847] text-[#8A8175] hover:text-[#1F2933]'
                }`}
              >
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#1A222B] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B] hover:text-[#2C6E9B] transition-colors cursor-pointer"
              >
                {darkMode ? <Sun size={16} className="text-[#E0A83B]" /> : <Moon size={16} className="text-[#2C6E9B]" />}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop & Laptop Sidebar: Active on medium, large, and high-zoom desktop screens (md: 768px+) */}
      <aside 
        className={`hidden md:flex flex-col shrink-0 transition-[width] duration-200 z-30 sticky top-0 h-screen ${widthClass}`}
        aria-label="Desktop Navigation"
      >
        {renderNavContent(false)}
      </aside>

      {/* 2. Mobile Responsive Navigation Drawer: Active only on genuinely narrow handheld screens (< 768px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Slide-out Surface */}
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
});
