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
  VolumeX,
  Download,
  ChevronDown
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { isSoundEnabled, setSoundEnabled, playDispatchChime } from '../../lib/sound';
import { Printer } from 'lucide-react';

const ExportDropdown = ({ onExport, onPrintFieldSheet }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div className="relative inline-flex items-center rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#1A222B] shadow-sm" ref={ref}>
      {/* 1-Click Primary Export */}
      <button
        type="button"
        onClick={() => {
          onExport('csv');
          setOpen(false);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[10px] font-semibold hover:bg-[#E6E0D6] dark:hover:bg-[#2C3847] transition-all rounded-l"
        title="1-Click Export CSV Telemetry"
      >
        <Download size={12} className="text-[#2C6E9B]" />
        <span>Export</span>
      </button>

      {/* Menu Chevron Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        aria-label="More export options"
        className="px-1.5 py-1.5 border-l border-[#D2C9BA] dark:border-[#2C3847] text-[#8A8175] hover:text-[#1F2933] dark:hover:text-white hover:bg-[#E6E0D6] dark:hover:bg-[#2C3847] transition-all rounded-r"
      >
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180 text-[#2C6E9B]' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#FFFFFF] dark:bg-[#141B22] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-lg shadow-2xl py-1.5 z-50 font-mono text-[10px] animate-in fade-in slide-in-from-top-1">
          <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[#8A8175] font-bold border-b border-[#E6E0D6] dark:border-[#2C3847] mb-1">
            Export Shift Telemetry
          </div>
          <button
            type="button"
            onClick={() => { onExport('csv'); setOpen(false); }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#F1EDE6] dark:hover:bg-[#2C3847] flex items-center gap-2 text-[#1F2933] dark:text-[#FAF8F4] transition-colors"
          >
            <FileSpreadsheet size={13} className="text-[#2E7D5B] shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">Export CSV</span>
              <span className="text-[9px] text-[#8A8175]">Spreadsheet & machine logs</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => { onExport('json'); setOpen(false); }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#F1EDE6] dark:hover:bg-[#2C3847] flex items-center gap-2 text-[#1F2933] dark:text-[#FAF8F4] transition-colors"
          >
            <FileJson size={13} className="text-[#2C6E9B] shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">Export JSON</span>
              <span className="text-[9px] text-[#8A8175]">Full sensor snapshot payload</span>
            </div>
          </button>
          {onPrintFieldSheet && (
            <button
              type="button"
              onClick={() => { onPrintFieldSheet(); setOpen(false); }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#F1EDE6] dark:hover:bg-[#2C3847] flex items-center gap-2 text-[#1F2933] dark:text-[#FAF8F4] border-t border-[#E6E0D6] dark:border-[#2C3847] mt-1 pt-1.5 transition-colors"
            >
              <Printer size={13} className="text-[#B07B1C] shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold">Print Field Sheet</span>
                <span className="text-[9px] text-[#8A8175]">Physical work order PDF</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

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
  setSettingsOpen,
  onPrintFieldSheet
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
          {/* Consolidated Live Health & Telemetry Pill */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[10px] font-bold transition-colors ${
            feedMode === 'fault'
              ? 'bg-[#C05043]/10 dark:bg-[#C05043]/20 border-[#C05043]/40 text-[#C05043]'
              : 'bg-[#2E7D5B]/10 dark:bg-[#2E7D5B]/20 border-[#2E7D5B]/40 text-[#2E7D5B]'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${feedMode === 'fault' ? 'bg-[#C05043] animate-pulse' : 'bg-[#2E7D5B]'}`} />
            <span>{feedMode === 'fault' ? '74% Health • AHU-03 Advisory' : '91% Health • Nominal'}</span>
            <span className="text-[#8A8175] dark:text-[#A99F90]">•</span>
            <span className="text-[#2C6E9B] font-semibold">{vibration} mm/s</span>
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
      <div className="min-h-[52px] px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#141B22]">
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

        <div className="w-full lg:w-auto flex items-center gap-2 overflow-visible flex-wrap sm:flex-nowrap pb-1 lg:pb-0">
          {/* Time Range Selector */}
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

          {/* Compact Demo Simulator Switch */}
          <div className="flex items-center gap-1 p-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <span className="font-mono text-[9px] uppercase px-1.5 text-[#8A8175] font-semibold">Demo:</span>
            <button 
              onClick={() => setFeedMode('normal')} 
              className={`font-mono text-[10px] px-2 py-0.5 rounded transition-all ${feedMode === 'normal' ? 'bg-[#2E7D5B] text-white font-bold' : 'text-[#8A8175] hover:text-[#3E4650] dark:hover:text-white'}`}
            >
              Normal
            </button>
            <button 
              onClick={() => setFeedMode('fault')} 
              className={`font-mono text-[10px] px-2 py-0.5 rounded transition-all ${feedMode === 'fault' ? 'bg-[#C05043] text-white font-bold' : 'text-[#8A8175] hover:text-[#3E4650] dark:hover:text-white'}`}
            >
              Fault
            </button>
          </div>

          {/* Unified Export Menu & Settings */}
          <ExportDropdown onExport={handleExport} onPrintFieldSheet={onPrintFieldSheet} />

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
  );
});
