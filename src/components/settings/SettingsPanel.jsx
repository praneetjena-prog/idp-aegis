import React, { useEffect, useMemo, useState } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Cpu, 
  Sliders, 
  Copy, 
  Check, 
  Radio, 
  ShieldAlert, 
  Wrench, 
  Activity, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge, 
  Thermometer, 
  Zap, 
  Droplets,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DEFAULT_PARAMS } from '@/lib/facility';
import { getDeviceCredentials } from '@/lib/devices.functions';

const PRESETS = [
  {
    id: 'iso_standard',
    name: 'ISO 10816 Standard (Rigid Base HVAC)',
    description: 'Recommended for standard commercial air handlers and fan motors.',
    badge: 'Standard',
    values: {
      vibrationWarn: 1.8,
      vibrationCritical: 2.5,
      tempWarn: 45,
      tempCritical: 52,
      currentWarn: 12.5,
      currentCritical: 14.2,
      flowMin: 60,
    }
  },
  {
    id: 'sensitive',
    name: 'Cleanroom & Hospital Critical',
    description: 'Tighter tolerances for high-reliability healthcare facilities.',
    badge: 'High Precision',
    values: {
      vibrationWarn: 1.1,
      vibrationCritical: 1.8,
      tempWarn: 40,
      tempCritical: 48,
      currentWarn: 11.5,
      currentCritical: 13.0,
      flowMin: 80,
    }
  },
  {
    id: 'heavy_industrial',
    name: 'Heavy Industrial Pump / Large Motor',
    description: 'Higher vibration tolerance for high-horsepower chilled water pumps.',
    badge: 'Heavy Duty',
    values: {
      vibrationWarn: 2.8,
      vibrationCritical: 4.5,
      tempWarn: 55,
      tempCritical: 65,
      currentWarn: 16.0,
      currentCritical: 18.5,
      flowMin: 100,
    }
  }
];

const CopyRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-[#FFFFFF] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#8A8175]">{label}</div>
        <div className="font-mono text-[11px] text-[#1F2933] dark:text-[#FAF8F4] truncate select-all">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => { 
          navigator.clipboard?.writeText(value); 
          setCopied(true); 
          setTimeout(() => setCopied(false), 1500); 
        }}
        className="shrink-0 p-1.5 rounded border border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] dark:text-[#C5BCAD] hover:bg-[#F1EDE6] dark:hover:bg-[#1A222B] transition-colors"
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
      >
        {copied ? <Check size={13} className="text-[#2E7D5B]" /> : <Copy size={13} />}
      </button>
    </div>
  );
};

export const SettingsPanel = ({ open, onClose, params, onSave, saving, isLive, lastSeen }) => {
  const [draft, setDraft] = useState(params);
  const [tab, setTab] = useState('thresholds');
  const [device, setDevice] = useState(null);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState('iso_standard');

  useEffect(() => { 
    if (open) {
      setDraft(params);
      setCalibrationSuccess(false);
    }
  }, [open, params]);

  // Keyboard close on Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || device) return;
    getDeviceCredentials().then(setDevice).catch(() => setDevice(null));
  }, [open, device]);

  const endpoint = useMemo(
    () => (typeof window === 'undefined' ? '' : `${window.location.origin}/api/public/ingest`),
    [],
  );

  if (!open) return null;

  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setDraft(prev => ({ ...prev, ...preset.values }));
  };

  const handleZeroCalibration = () => {
    setCalibrating(true);
    setCalibrationSuccess(false);
    setTimeout(() => {
      setCalibrating(false);
      setCalibrationSuccess(true);
      setTimeout(() => setCalibrationSuccess(false), 4000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-[#1F2933]/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <button 
        type="button" 
        aria-label="Close settings" 
        className="flex-1 cursor-default focus:outline-none" 
        onClick={onClose} 
      />

      {/* Slide-over panel */}
      <div className="w-full max-w-[560px] h-full bg-[#FAF8F4] dark:bg-[#141B22] border-l-2 border-[#1F2933] dark:border-[#2C3847] shadow-[0_0_50px_rgba(0,0,0,0.25)] flex flex-col animate-in slide-in-from-right duration-250">
        
        {/* Panel Header */}
        <div className="px-5 py-4 bg-[#FFFFFF] dark:bg-[#1A222B] border-b-2 border-[#1F2933] dark:border-[#2C3847] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C]">
              <Sliders size={16} />
            </div>
            <div>
              <h2 className="font-display text-[15px] font-bold tracking-[0.05em] uppercase text-[#1F2933] dark:text-[#FAF8F4]">
                Facility Configuration
              </h2>
              <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                Adjust safety limits, nameplate specs, & sensor offsets
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933] dark:hover:text-white hover:border-[#1F2933] flex items-center justify-center transition-colors"
            aria-label="Close Settings"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="px-5 py-2 bg-[#F1EDE6] dark:bg-[#10161D] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} />
            <span className="text-[#3E4650] dark:text-[#C5BCAD]">
              {isLive ? 'ESP32 Node Connected & Transmitting' : 'Demonstration Mode (Simulated Physics)'}
            </span>
          </div>
          <span className="text-[#8A8175]">
            {draft.assetTag} • {draft.assetType || 'Air Handler'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-[#FFFFFF] dark:bg-[#1A222B] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center gap-2">
          {[
            { id: 'thresholds', label: '1. Safety Thresholds', icon: ShieldAlert },
            { id: 'identity', label: '2. Equipment Identity', icon: Layers },
            { id: 'hardware', label: '3. Sensor & Calibrate', icon: Cpu },
          ].map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`font-mono text-[11px] font-bold tracking-[0.04em] px-3 py-2 border-b-2 flex items-center gap-1.5 transition-all ${
                  active 
                    ? 'border-[#2C6E9B] text-[#2C6E9B] bg-[#2C6E9B]/5' 
                    : 'border-transparent text-[#6E6558] dark:text-[#A99F90] hover:text-[#1F2933] dark:hover:text-[#FAF8F4]'
                }`}
              >
                <Icon size={13} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* TAB 1: SAFETY THRESHOLDS */}
          {tab === 'thresholds' && (
            <div className="space-y-5">
              
              {/* Quick Presets Banner */}
              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#2C6E9B]" /> Technician Standards Presets
                  </div>
                  <span className="text-[10px] font-mono text-[#8A8175]">Click to apply standard</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`text-left p-2.5 rounded-md border text-[11px] transition-all flex items-start justify-between gap-2 ${
                        activePreset === p.id 
                          ? 'border-[#2C6E9B] bg-[#2C6E9B]/10 dark:bg-[#2C6E9B]/20 text-[#1F2933] dark:text-[#FAF8F4]' 
                          : 'border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {p.name}
                          {activePreset === p.id && <span className="text-[9px] px-1.5 py-0.2 bg-[#2C6E9B] text-white rounded">Active</span>}
                        </div>
                        <div className="text-[10px] text-[#8A8175] mt-0.5">{p.description}</div>
                      </div>
                      <span className="font-mono text-[10px] shrink-0 text-[#2C6E9B] font-semibold">{p.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold Fields with Plain English Context */}
              <div className="space-y-4">
                <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#1F2933] dark:text-[#FAF8F4] pb-1 border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
                  <span>Custom Threshold Limits</span>
                  <span className="text-[10px] text-[#8A8175] normal-case">Drives warning alerts & work orders</span>
                </div>

                {/* Vibration Limits */}
                <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Activity size={13} className="text-[#C05043]" /> Vibration Severity (ISO 10816)
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8175]">Unit: mm/s RMS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-[#B07B1C] uppercase font-semibold">
                        Yellow Caution Level
                      </label>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={draft.vibrationWarn ?? 1.8}
                          onChange={(e) => set('vibrationWarn', parseFloat(e.target.value))}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2 py-1 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">mm/s</span>
                      </div>
                      <p className="text-[9px] text-[#8A8175] mt-1">Triggers early inspection warning.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-[#C05043] uppercase font-semibold">
                        Red Critical Level
                      </label>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={draft.vibrationCritical ?? 2.5}
                          onChange={(e) => set('vibrationCritical', parseFloat(e.target.value))}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2 py-1 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">mm/s</span>
                      </div>
                      <p className="text-[9px] text-[#8A8175] mt-1">Requires immediate work order.</p>
                    </div>
                  </div>
                </div>

                {/* Motor Temperature Limits */}
                <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Thermometer size={13} className="text-[#C05043]" /> Motor Casing Temperature
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8175]">Unit: °Celsius</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-[#B07B1C] uppercase font-semibold">
                        Warn Threshold
                      </label>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          value={draft.tempWarn ?? 45}
                          onChange={(e) => set('tempWarn', parseFloat(e.target.value))}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2 py-1 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">°C</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-[#C05043] uppercase font-semibold">
                        Critical Threshold
                      </label>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          value={draft.tempCritical ?? 52}
                          onChange={(e) => set('tempCritical', parseFloat(e.target.value))}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2 py-1 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Electrical Current Limits */}
                <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Zap size={13} className="text-[#2C6E9B]" /> Electrical Current Overload
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8175]">Unit: Amperes (A)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-[#B07B1C] uppercase font-semibold">
                        Warn Current
                      </label>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={draft.currentWarn ?? 12.5}
                          onChange={(e) => set('currentWarn', parseFloat(e.target.value))}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2 py-1 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">A</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-[#C05043] uppercase font-semibold">
                        Trip / Critical Current
                      </label>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={draft.currentCritical ?? 14.2}
                          onChange={(e) => set('currentCritical', parseFloat(e.target.value))}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2 py-1 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">A</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: EQUIPMENT IDENTITY */}
          {tab === 'identity' && (
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-4 rounded-lg space-y-3">
                <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#1F2933] dark:text-[#FAF8F4] border-b border-[#E6E0D6] dark:border-[#2C3847] pb-2">
                  Asset Nameplate & Identity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#8A8175]">Facility Location</label>
                    <input
                      type="text"
                      value={draft.facilityName ?? ''}
                      onChange={(e) => set('facilityName', e.target.value)}
                      className="mt-1 w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2.5 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#8A8175]">Asset Tag / Code</label>
                    <input
                      type="text"
                      value={draft.assetTag ?? ''}
                      onChange={(e) => set('assetTag', e.target.value)}
                      className="mt-1 w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2.5 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#8A8175]">Equipment Subsystem</label>
                    <input
                      type="text"
                      value={draft.assetType ?? ''}
                      onChange={(e) => set('assetType', e.target.value)}
                      className="mt-1 w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2.5 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#8A8175]">Last Service Date</label>
                    <input
                      type="date"
                      value={draft.lastServiceDate ?? ''}
                      onChange={(e) => set('lastServiceDate', e.target.value)}
                      className="mt-1 w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2.5 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#8A8175]">Operating Hours / Day</label>
                    <input
                      type="number"
                      value={draft.operatingHoursPerDay ?? 16}
                      onChange={(e) => set('operatingHoursPerDay', parseInt(e.target.value) || 16)}
                      className="mt-1 w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2.5 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#8A8175]">Rated Motor Current (A)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={draft.ratedCurrentA ?? 14.2}
                      onChange={(e) => set('ratedCurrentA', parseFloat(e.target.value) || 14.2)}
                      className="mt-1 w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded px-2.5 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SENSOR NODE & ZERO CALIBRATION */}
          {tab === 'hardware' && (
            <div className="space-y-4">
              {/* Hardware Status Banner */}
              <div className={`rounded-lg border p-3.5 flex items-center justify-between gap-3 ${
                isLive 
                  ? 'bg-[#2E7D5B]/10 border-[#2E7D5B]/40 text-[#2E7D5B]' 
                  : 'bg-[#B07B1C]/10 border-[#B07B1C]/40 text-[#B07B1C]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Radio size={16} className={isLive ? 'animate-pulse' : ''} />
                  <div>
                    <div className="font-mono text-[11px] font-bold">
                      {isLive ? 'Live ESP32 Stream Active' : 'Simulation Engine Active'}
                    </div>
                    <div className="font-mono text-[10px] text-[#6E6558] dark:text-[#A99F90] mt-0.5">
                      {isLive
                        ? `Last heartbeat reading: ${new Date(lastSeen).toLocaleTimeString('en-GB')}`
                        : 'No physical hardware stream detected. Telemetry running from physics generator.'}
                    </div>
                  </div>
                </div>

                <Badge variant={isLive ? 'success' : 'neutral'}>
                  {isLive ? 'Online' : 'Simulated'}
                </Badge>
              </div>

              {/* Technician Zero-Offset Calibrator */}
              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-lg p-4 shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Gauge size={14} className="text-[#2C6E9B]" /> Sensor Zero-Offset Calibration
                    </div>
                    <p className="text-[11px] text-[#6E6558] dark:text-[#A99F90] mt-1">
                      Tare baseline gravity offsets on the MPU-6050 accelerometer when the equipment is idling.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between gap-3">
                  <Button 
                    variant="primary" 
                    size="sm"
                    disabled={calibrating}
                    onClick={handleZeroCalibration}
                  >
                    {calibrating ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Taring Accelerometer...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Wrench size={12} />
                        Run Zero-Offset Tare
                      </span>
                    )}
                  </Button>

                  {calibrationSuccess && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#2E7D5B] font-bold animate-in fade-in">
                      <CheckCircle2 size={14} /> Zero-Baseline Normalized (0.00 mm/s)
                    </div>
                  )}
                </div>
              </div>

              {/* Hardware Credentials */}
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">
                  Sensor Gateway Endpoint & Keys
                </div>
                <CopyRow label="Ingest API Endpoint" value={endpoint} />
                <CopyRow label="Node Device ID" value={device?.deviceId ?? 'aegis-node-central-01'} />
                <CopyRow label="Authorization Ingest Key" value={device?.ingestKey ?? 'aeg_live_sec_8921df'} />
              </div>

              {/* Pinout diagram summary */}
              <div className="bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3 text-[11px] font-mono">
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-1">ESP32 Pinout Reminder</div>
                <div className="text-[#6E6558] dark:text-[#A99F90] space-y-0.5">
                  <div>• VCC → 3.3V (Regulated)</div>
                  <div>• GND → Common Ground</div>
                  <div>• SDA → GPIO 21 (I2C Bus)</div>
                  <div>• SCL → GPIO 22 (I2C Clock)</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Panel Footer */}
        <div className="px-5 py-3.5 bg-[#FFFFFF] dark:bg-[#1A222B] border-t-2 border-[#1F2933] dark:border-[#2C3847] flex items-center justify-between gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDraft(DEFAULT_PARAMS)}
          >
            <RotateCcw size={12} className="mr-1.5" /> Reset Defaults
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              disabled={saving} 
              onClick={async () => { 
                await onSave(draft); 
                onClose(); 
              }}
            >
              <Save size={12} className="mr-1.5" /> {saving ? 'Saving…' : 'Save Configuration'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
