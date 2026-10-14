import React from 'react';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { UserRoleDropdown } from './UserRoleDropdown';

/**
 * Compact, responsive top application bar for AEGIS.
 * - Shield-based navigation toggle (replaces hamburger menu)
 * - Brand identity & facility location
 * - Real-time SCADA / simulation status & health condition pill
 * - Scenario switcher (Normal baseline vs Fault anomaly)
 * - User role dropdown
 * 
 * Usability enhancements:
 * - General live clock removed entirely to prevent header collision at high zoom levels
 * - Mute, Theme, and Settings controls moved into the Sidebar to prevent header crowding
 */
export const TopHeader = React.memo(({
  onToggleNavigation,
  isLive,
  feedMode,
  vibration,
  lastSeen,
  setFeedMode
}) => {
  const isFault = feedMode === 'fault';
  const vibNum = parseFloat(vibration) || (isFault ? 6.8 : 2.1);

  // Compute freshness indicator string
  const getFreshness = () => {
    if (isLive && lastSeen) {
      const diffSec = Math.max(0, Math.round((Date.now() - new Date(lastSeen).getTime()) / 1000));
      if (diffSec < 5) return 'just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      return `${Math.round(diffSec / 60)}m ago`;
    }
    return '1.8s cycle';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] dark:bg-[#141B22] border-b border-[#D2C9BA] dark:border-[#2C3847] shadow-xs select-none">
      <div className="h-14 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Shield Navigation Toggle + AEGIS Brand + Facility Context */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* AEGIS Shield Navigation Toggle Button (Accessible, high contrast, replaces hamburger) */}
          <button
            type="button"
            onClick={onToggleNavigation}
            title="Toggle navigation"
            aria-label="Toggle navigation"
            className="flex w-9 h-9 items-center justify-center rounded-lg border border-[#2C6E9B]/40 bg-[#2C6E9B]/10 hover:bg-[#2C6E9B] text-[#2C6E9B] hover:text-white dark:bg-[#2C6E9B]/20 dark:text-[#58A6FF] dark:hover:bg-[#2C6E9B] dark:hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2C6E9B] transition-all cursor-pointer shadow-xs"
          >
            <Shield size={18} className="transition-transform group-hover:scale-105" />
          </button>

          {/* AEGIS Brand Identity */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-[15px] sm:text-[16px] font-bold tracking-tight text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                AEGIS
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#2C6E9B]/10 text-[#2C6E9B] dark:text-[#58A6FF] font-bold uppercase border border-[#2C6E9B]/20">
                Intel
              </span>
            </div>
          </div>

          {/* Facility Location Tag */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-[#E6E0D6] dark:border-[#2C3847] text-[11px] font-mono text-[#554D42] dark:text-[#C5BCAD] shrink-0">
            <MapPin size={12} className="text-[#8A8175] shrink-0" />
            <span className="font-semibold hidden lg:inline">Central Campus</span>
            <span className="px-1.5 py-0.2 rounded bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] text-[#6E6558] dark:text-[#A0988A] text-[10px]">
              Unit 01
            </span>
          </div>
        </div>

        {/* Center: Live / Simulated Telemetry Freshness & Operational Health Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          {/* Data Source Status & Freshness */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] text-[11px] font-mono shrink-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              isLive 
                ? 'bg-[#2E7D5B] animate-pulse' 
                : 'bg-[#B07B1C]'
            }`} />
            <span className="text-[#554D42] dark:text-[#C5BCAD] font-medium hidden sm:inline">
              {isLive ? 'Live' : 'Simulated'}
            </span>
            <span className="text-[#8A8175] hidden sm:inline">•</span>
            <span className="text-[#8A8175] text-[10px]">{getFreshness()}</span>
          </div>

          {/* Condition Health Indicator Pill */}
          <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border font-mono text-[10px] sm:text-[11px] font-semibold transition-colors shrink-0 ${
            isFault
              ? 'bg-[#C05043]/10 border-[#C05043]/30 text-[#C05043]'
              : 'bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B]'
          }`}>
            {isFault ? <AlertTriangle size={13} className="shrink-0" /> : <CheckCircle2 size={13} className="shrink-0" />}
            <span>{isFault ? 'Health 74%' : 'Health 91%'}</span>
            <span className="text-[#8A8175] hidden sm:inline">•</span>
            <span className="font-bold hidden sm:inline">{vibNum.toFixed(1)} mm/s</span>
          </div>

          {/* Interactive Simulation Scenario Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md font-mono text-[10px] shrink-0">
            <span className="px-1 text-[#8A8175] text-[9px] uppercase font-bold hidden xl:inline">Scenario:</span>
            <button
              type="button"
              onClick={() => setFeedMode('normal')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                !isFault 
                  ? 'bg-[#2E7D5B] text-white font-bold shadow-xs' 
                  : 'text-[#6E6558] dark:text-[#A0988A] hover:text-[#1F2933]'
              }`}
              title="Switch to Normal Operating Baseline"
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setFeedMode('fault')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                isFault 
                  ? 'bg-[#C05043] text-white font-bold shadow-xs' 
                  : 'text-[#6E6558] dark:text-[#A0988A] hover:text-[#1F2933]'
              }`}
              title="Simulate Mechanical Bearing Fault (AHU-03)"
            >
              Fault
            </button>
          </div>
        </div>

        {/* Right: Account & Role Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <UserRoleDropdown />
        </div>
      </div>
    </header>
  );
});
