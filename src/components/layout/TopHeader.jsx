import React from 'react';
import { 
  Shield, 
  Activity, 
  MapPin, 
  Clock, 
  Search, 
  FileJson, 
  FileSpreadsheet, 
  Settings, 
  Menu, 
  Sun, 
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { isSoundEnabled, setSoundEnabled, playDispatchChime } from '../../lib/sound';

export const TopHeader = React.memo(({
  railCollapsed,
  setRailCollapsed,
  isLive,
  feedMode,
  vibration,
  darkMode,
  toggleTheme,
  clock,
  searchQuery,
  setSearchQuery,
  range,
  setRange,
  setFeedMode,
  handleExport,
  setSettingsOpen
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playDispatchChime();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-[#FFFFFF] dark:bg-[#141B22] border-b-2 border-[#1F2933] dark:border-[#2C3847] shadow-[0_2px_0_rgba(31,41,51,0.06)]">
      {/* 1. Top Integrity Bar */}
      <div className="min-h-[48px] px-3 lg:px-5 flex items-center justify-between gap-3 border-b border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#1A222B]">
        <div className="flex items-center gap-3">
          {/* 3-line hamburger menu icon to expand sidebar when collapsed */}
          {railCollapsed && (
            <button
              type="button"
              onClick={() => setRailCollapsed(false)}
              title="Open navigation sidebar"
              aria-label="Open navigation sidebar"
              className="hidden xl:flex w-8 h-8 items-center justify-center rounded border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:bg-[#2C6E9B] hover:text-[#FFFFFF] hover:border-[#1F2933] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Menu size={16} />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2C6E9B] flex items-center justify-center shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C]">
              <Shield size={15} className="text-[#FFFFFF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[20px] sm:text-[24px] leading-none font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase tracking-wide">
                AEGIS
              </span>
              <span className="hidden sm:inline font-mono text-[10px] text-[#6E6558] dark:text-[#A99F90] tracking-wider uppercase pl-2 border-l border-[#D2C9BA] dark:border-[#2C3847]">
                Telemetry & Predictive Maintenance
              </span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-[#E6E0D6] dark:border-[#2C3847]">
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} />
            <span className="font-mono text-[10px] tracking-wide text-[#6E6558] dark:text-[#A99F90]">
              {isLive ? 'ESP32 Hardware Stream: Connected' : 'Demonstration Mode (Simulated Physics)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Facility Health Pill in Header */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold ${
            feedMode === 'fault'
              ? 'bg-[#C05043]/10 dark:bg-[#C05043]/20 border-[#C05043]/40 text-[#C05043]'
              : 'bg-[#2E7D5B]/10 dark:bg-[#2E7D5B]/20 border-[#2E7D5B]/40 text-[#2E7D5B]'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${feedMode === 'fault' ? 'bg-[#C05043] animate-pulse' : 'bg-[#2E7D5B]'}`} />
            <span>{feedMode === 'fault' ? '74% Health • AHU-03 Advisory' : '91% Health • Nominal'}</span>
          </div>

          {/* Live Vibration reading */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6E0D6] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847]">
            <Activity size={12} className="text-[#2C6E9B]" />
            <span className="font-mono text-[9px] text-[#6E6558] dark:text-[#A99F90]">Vibration {vibration} mm/s</span>
          </div>

          {/* Dark Mode Theme Toggle with Sun / Moon symbol */}
          <button
            type="button"
            onClick={toggleTheme}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:border-[#2C6E9B] hover:text-[#2C6E9B] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            {darkMode ? (
              <Sun size={15} className="text-[#E0A83B]" />
            ) : (
              <Moon size={15} className="text-[#2C6E9B]" />
            )}
          </button>

          {/* SCADA Sound Chime Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundOn ? 'SCADA Sound Alarm: ENABLED (Click to mute)' : 'SCADA Sound Alarm: MUTED (Click to enable chime)'}
            aria-label={soundOn ? 'Mute SCADA sound' : 'Enable SCADA sound'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all ${
              soundOn 
                ? 'border-[#2C6E9B] bg-[#2C6E9B]/15 text-[#2C6E9B] shadow-[2px_2px_0_#2C6E9B]' 
                : 'border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#8A8175] dark:text-[#A99F90] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:text-[#1F2933]'
            }`}
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* 2. Global Control Bar */}
      <div className="min-h-[58px] px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#141B22]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#8A8175]" />
            <div>
              <div className="text-[9px] font-bold uppercase text-[#8A8175]">Facility</div>
              <span className="font-display text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Central Campus / Facility Unit 01</span>
            </div>
            <Badge variant="neutral">UNIT-01</Badge>
          </div>
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E6E0D6] dark:border-[#2C3847]">
            <Clock size={12} className="text-[#8A8175]" />
            <span className="font-mono text-[10px] text-[#6E6558] dark:text-[#A99F90]">Active shift · J. Rivera · 06:00–14:00 · {clock}</span>
          </div>
        </div>

        <div className="w-full lg:w-auto flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <div className="relative hidden md:flex items-center">
            <Search size={12} className="absolute left-2 text-[#A99F90]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter subsystems..."
              className="pl-7 pr-2 py-1 w-[160px] bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md font-mono text-[10px] text-[#1F2933] dark:text-white placeholder:text-[#A99F90] focus:outline-none focus:border-[#D2C9BA]"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            {['1H', '24H', '7D'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-md transition-all ${range === r ? 'bg-[#E6E0D6] dark:bg-[#2C3847] text-[#1F2933] dark:text-white border border-[#D2C9BA] dark:border-[#3E4D61]' : 'text-[#8A8175] hover:text-[#3E4650] dark:hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
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
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Facility Settings & Sensor Calibration"
              className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-[#2C6E9B] text-white font-mono text-[10px] font-bold uppercase rounded border border-[#1F2933] dark:border-[#2C3847] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:bg-[#255C83] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Settings size={12} className="transition-transform duration-500 ease-out group-hover:rotate-90" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
