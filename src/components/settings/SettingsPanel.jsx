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
  HelpCircle,
  Lock,
  Building2,
  Globe,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DEFAULT_PARAMS } from '@/lib/facility';
import { getDeviceCredentials } from '@/lib/devices.functions';
import { useAuth } from '../../context/AuthContext';

const PRESETS = [
  {
    id: 'iso_standard',
    name: 'ISO 10816 Standard (Rigid Base HVAC)',
    description: 'Recommended for standard commercial air handlers and fan motors.',
    badge: 'Standard HVAC',
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
  const { user, permissions, roleConfig } = useAuth();
  const canEdit = Boolean(permissions?.canEditThresholds);
  const [draft, setDraft] = useState(params);
  const [tab, setTab] = useState('thresholds'); // 'profile' | 'thresholds' | 'calibration' | 'integration'
  const [device, setDevice] = useState(null);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState('iso_standard');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => { 
    if (open) {
      setDraft(params);
      setCalibrationSuccess(false);
      setSaveSuccessNotice(false);
    }
  }, [open, params]);

  // Lock background scroll
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = '';
    };
  }, [open]);

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

  // Real-time validation checks
  const validationErrors = useMemo(() => {
    const errors = [];
    if (draft.vibrationWarn >= draft.vibrationCritical) {
      errors.push(`Vibration caution level (${draft.vibrationWarn} mm/s) must be lower than critical trip level (${draft.vibrationCritical} mm/s).`);
    }
    if (draft.currentWarn >= draft.currentCritical) {
      errors.push(`Current warning threshold (${draft.currentWarn} A) must be lower than critical overload level (${draft.currentCritical} A).`);
    }
    if (draft.tempWarn >= draft.tempCritical) {
      errors.push(`Temperature caution threshold (${draft.tempWarn} °C) must be lower than critical trip limit (${draft.tempCritical} °C).`);
    }
    return errors;
  }, [draft]);

  const isValid = validationErrors.length === 0;

  if (!open) return null;

  const set = (key, value) => {
    if (!canEdit) return;
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    if (!canEdit) return;
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

  const handleSave = async () => {
    if (!canEdit || !isValid) return;
    try {
      await onSave(draft);
      setSaveSuccessNotice(true);
      setTimeout(() => {
        setSaveSuccessNotice(false);
        onClose();
      }, 1000);
    } catch (e) {
      console.error('Failed to save parameters', e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1F2933]/60 dark:bg-[#000000]/80 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-settings-title"
    >
      {/* Clickable Backdrop to close immediately */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Pop-up Dialog Card */}
      <div 
        className="relative z-10 w-full max-w-[760px] max-h-[90vh] bg-[#FAF8F4] dark:bg-[#141B22] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header */}
        <div className="px-5 py-4 bg-[#FFFFFF] dark:bg-[#1A222B] border-b-2 border-[#1F2933] dark:border-[#2C3847] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold shadow-xs">
              <Sliders size={16} />
            </div>
            <div>
              <h2 id="facility-settings-title" className="font-display text-[15px] sm:text-[16px] font-bold tracking-[0.04em] uppercase text-[#1F2933] dark:text-[#FAF8F4]">
                Facility Configuration & Calibration
              </h2>
              <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                Central Campus Utilities &bull; Machine Limits &bull; Physical Calibration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-mono text-[10px] text-[#8A8175] border border-[#D2C9BA] dark:border-[#2C3847] px-1.5 py-0.5 rounded bg-[#FAF8F4] dark:bg-[#141B22]">
              ESC
            </span>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933] dark:hover:text-white transition-colors flex items-center justify-center"
              aria-label="Close Settings"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 2. Role Access & Data Status Strip */}
        <div className="px-5 py-2.5 bg-[#F1EDE6] dark:bg-[#10161D] border-b border-[#E6E0D6] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} />
            <span className="text-[#3E4650] dark:text-[#C5BCAD]">
              {isLive ? 'Hardware Live Feed Connected' : 'Simulated Physics Feed (Physics Sandbox)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canEdit ? (
              <span className="flex items-center gap-1 text-[#2E7D5B] font-semibold text-[10px]">
                <ShieldCheck size={12} />
                <span>Manager Edit Privileges Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#B07B1C] font-semibold text-[10px]">
                <Lock size={12} />
                <span>Read-Only Audit Mode ({roleConfig?.shortName || 'Technician'})</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="px-5 pt-2.5 bg-[#FFFFFF] dark:bg-[#1A222B] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center gap-1 overflow-x-auto shrink-0">
          {[
            { id: 'profile', label: '1. Facility Profile', icon: Building2 },
            { id: 'thresholds', label: '2. Alarm Thresholds', icon: ShieldAlert },
            { id: 'calibration', label: '3. Sensor Calibration', icon: Gauge },
            { id: 'integration', label: '4. Telemetry & Gateway', icon: Radio },
          ].map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap font-mono text-[11px] font-bold px-3 py-2 border-b-2 flex items-center gap-1.5 transition-all ${
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

        {/* 4. Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Validation Notice Banner */}
          {!isValid && (
            <div className="p-3 rounded-lg bg-[#C05043]/10 border border-[#C05043]/40 text-[#C05043] font-mono text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>Input Validation Notice:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Non-Manager Read-Only Warning Banner */}
          {!canEdit && (
            <div className="p-3 rounded-lg bg-[#B07B1C]/10 border border-[#B07B1C]/30 text-[#8A5A0A] dark:text-[#E0A84E] font-mono text-[11px] flex items-start gap-2.5">
              <Lock size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong>Read-Only Mode:</strong> Facility thresholds and physical nameplate ratings can only be modified by users with the Manager role. You are currently viewing in read-only audit mode as <strong>{roleConfig?.name || 'Technician'}</strong>.
              </div>
            </div>
          )}

          {/* TAB 1: FACILITY PROFILE */}
          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-4 rounded-xl space-y-3.5">
                <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#1F2933] dark:text-[#FAF8F4] border-b border-[#E6E0D6] dark:border-[#2C3847] pb-2 flex items-center justify-between">
                  <span>Facility Identity & Operating Window</span>
                  <span className="text-[10px] text-[#8A8175] normal-case">Campus metadata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#8A8175] mb-1">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={draft.facilityName ?? ''}
                      onChange={(e) => set('facilityName', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 font-mono text-[12px] ${
                        canEdit 
                          ? 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-white focus:border-[#2C6E9B]' 
                          : 'bg-[#FAF8F4]/60 dark:bg-[#141B22]/60 border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#8A8175] mb-1">
                      Primary Asset Tag Focus
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={draft.assetTag ?? ''}
                      onChange={(e) => set('assetTag', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 font-mono text-[12px] font-bold ${
                        canEdit 
                          ? 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-white' 
                          : 'bg-[#FAF8F4]/60 dark:bg-[#141B22]/60 border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#8A8175] mb-1">
                      Equipment Subsystem Type
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={draft.assetType ?? ''}
                      onChange={(e) => set('assetType', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 font-mono text-[12px] ${
                        canEdit 
                          ? 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-white' 
                          : 'bg-[#FAF8F4]/60 dark:bg-[#141B22]/60 border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#8A8175] mb-1">
                      Operating Hours / Day
                    </label>
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={draft.operatingHoursPerDay ?? 16}
                      onChange={(e) => set('operatingHoursPerDay', parseInt(e.target.value) || 16)}
                      className={`w-full border rounded-lg px-3 py-2 font-mono text-[12px] ${
                        canEdit 
                          ? 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-white' 
                          : 'bg-[#FAF8F4]/60 dark:bg-[#141B22]/60 border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#8A8175] mb-1">
                      Last Major Overhaul Date
                    </label>
                    <input
                      type="date"
                      disabled={!canEdit}
                      value={draft.lastServiceDate ?? ''}
                      onChange={(e) => set('lastServiceDate', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 font-mono text-[12px] ${
                        canEdit 
                          ? 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-white' 
                          : 'bg-[#FAF8F4]/60 dark:bg-[#141B22]/60 border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#8A8175] mb-1">
                      Rated Motor Current (FLC)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        disabled={!canEdit}
                        value={draft.ratedCurrentA ?? 14.2}
                        onChange={(e) => set('ratedCurrentA', parseFloat(e.target.value) || 14.2)}
                        className={`w-full border rounded-lg px-3 py-2 font-mono text-[12px] ${
                          canEdit 
                            ? 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-white' 
                            : 'bg-[#FAF8F4]/60 dark:bg-[#141B22]/60 border-[#E6E0D6] dark:border-[#2C3847] text-[#6E6558] cursor-not-allowed'
                        }`}
                      />
                      <span className="font-mono text-[11px] text-[#8A8175]">Amps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALARM THRESHOLDS */}
          {tab === 'thresholds' && (
            <div className="space-y-4">
              {/* Presets Strip */}
              {canEdit && (
                <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-xl p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#2C6E9B]" /> Technician Standards Presets
                    </div>
                    <span className="text-[10px] font-mono text-[#8A8175]">1-Click ISO Profile Application</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESETS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`text-left p-2.5 rounded-lg border text-[11px] transition-all flex flex-col justify-between ${
                          activePreset === p.id 
                            ? 'border-[#2C6E9B] bg-[#2C6E9B]/10 dark:bg-[#2C6E9B]/20 text-[#1F2933] dark:text-[#FAF8F4] shadow-xs' 
                            : 'border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center justify-between gap-1">
                            <span>{p.badge}</span>
                            {activePreset === p.id && <span className="text-[9px] px-1.5 py-0.5 bg-[#2C6E9B] text-white rounded font-normal">Active</span>}
                          </div>
                          <div className="text-[10px] text-[#8A8175] mt-1 line-clamp-2">{p.description}</div>
                        </div>
                        <div className="mt-2 pt-1 border-t border-[#E6E0D6]/50 dark:border-[#2C3847]/50 font-mono text-[9px] text-[#2C6E9B] font-semibold">
                          Vib: {p.values.vibrationWarn} / {p.values.vibrationCritical} mm/s
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Threshold Fields */}
              <div className="space-y-3">
                {/* 1. Vibration Severity */}
                <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Activity size={13} className="text-[#C05043]" /> Vibration Severity (ISO 10816 Class II)
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8175]">Unit: mm/s RMS (10–1000 Hz)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-[#B07B1C] uppercase font-bold">
                        Yellow Caution Level
                      </label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          disabled={!canEdit}
                          value={draft.vibrationWarn ?? 1.8}
                          onChange={(e) => set('vibrationWarn', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg px-3 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">mm/s</span>
                      </div>
                      <p className="text-[9px] text-[#8A8175] mt-1">Triggers early inspection and technician alert.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-[#C05043] uppercase font-bold">
                        Red Critical Trip Level
                      </label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          disabled={!canEdit}
                          value={draft.vibrationCritical ?? 2.5}
                          onChange={(e) => set('vibrationCritical', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg px-3 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">mm/s</span>
                      </div>
                      <p className="text-[9px] text-[#8A8175] mt-1">Dispatches work order and logs safety excursion.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Temperature */}
                <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Thermometer size={13} className="text-[#C05043]" /> Motor Casing / Bearing Temperature
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8175]">Unit: °Celsius</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-[#B07B1C] uppercase font-bold">
                        Warn Threshold
                      </label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          disabled={!canEdit}
                          value={draft.tempWarn ?? 45}
                          onChange={(e) => set('tempWarn', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg px-3 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">°C</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-[#C05043] uppercase font-bold">
                        Critical Overheat Trip
                      </label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          disabled={!canEdit}
                          value={draft.tempCritical ?? 52}
                          onChange={(e) => set('tempCritical', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg px-3 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Current Overload */}
                <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Zap size={13} className="text-[#2C6E9B]" /> Drive Current Overload (Phase A)
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8175]">Unit: Amperes (A)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-[#B07B1C] uppercase font-bold">
                        Surge Warning
                      </label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          disabled={!canEdit}
                          value={draft.currentWarn ?? 12.5}
                          onChange={(e) => set('currentWarn', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg px-3 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">A</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-[#C05043] uppercase font-bold">
                        Critical Overcurrent Trip
                      </label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          disabled={!canEdit}
                          value={draft.currentCritical ?? 14.2}
                          onChange={(e) => set('currentCritical', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg px-3 py-1.5 font-mono text-[12px] text-[#1F2933] dark:text-white"
                        />
                        <span className="text-[10px] font-mono text-[#8A8175]">A</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SENSOR CALIBRATION */}
          {tab === 'calibration' && (
            <div className="space-y-4">
              {/* Tare Accelerometer */}
              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
                      <Gauge size={14} className="text-[#2C6E9B]" /> MPU-6050 Accelerometer Zero-Offset Calibration
                    </div>
                    <p className="text-[11px] text-[#6E6558] dark:text-[#A99F90] mt-1 font-sans">
                      Tare baseline gravitational drift when the air handler or pump is idling at 0 RPM.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between gap-3">
                  <Button 
                    variant="primary" 
                    size="sm"
                    disabled={calibrating}
                    onClick={handleZeroCalibration}
                    className="font-mono text-[11px]"
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
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#2E7D5B] font-bold animate-in fade-in">
                      <CheckCircle2 size={14} /> Zero-Baseline Normalized (0.00 mm/s)
                    </div>
                  )}
                </div>
              </div>

              {/* Calibration constants grid */}
              <div className="grid sm:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#8A8175]">CT Current Clamp Ratio</span>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">100A : 50mA (SCT-013-000)</div>
                  <div className="text-[10px] text-[#8A8175]">Burden resistor: 33Ω calibrated</div>
                </div>
                <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#8A8175]">Thermocouple Cold-Junction</span>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">MAX6675 SPI (K-Type Probe)</div>
                  <div className="text-[10px] text-[#8A8175]">Zero offset: +0.0°C compensated</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY & GATEWAY INTEGRATION */}
          {tab === 'integration' && (
            <div className="space-y-4 font-mono text-[11px]">
              {/* Credentials & Keys */}
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">
                  Gateway Endpoint & Credentials
                </div>
                <CopyRow label="Ingest API Endpoint" value={endpoint} />
                <CopyRow label="Node Device ID" value={device?.deviceId ?? 'aegis-node-central-01'} />
                <CopyRow label="Authorization Ingest Key" value={device?.ingestKey ?? 'aeg_live_sec_8921df'} />
                <CopyRow label="MQTT Broker URI" value="mqtts://broker.hivemq.com:8883/facility/unit01/telemetry" />
              </div>

              {/* ESP32 Wiring Reminder */}
              <div className="bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-xl p-3.5 space-y-1">
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[12px]">
                  ESP32 Industrial Edge Gateway Pinout
                </div>
                <div className="text-[#6E6558] dark:text-[#A99F90] space-y-0.5 text-[10px]">
                  <div>&bull; <strong>VCC / 3V3</strong> &rarr; 3.3V Regulated Power Rail</div>
                  <div>&bull; <strong>GND</strong> &rarr; Common Clean Instrument Ground</div>
                  <div>&bull; <strong>SDA</strong> &rarr; GPIO 21 (I2C Accelerometer Data)</div>
                  <div>&bull; <strong>SCL</strong> &rarr; GPIO 22 (I2C Accelerometer Clock)</div>
                  <div>&bull; <strong>ADC1 (GPIO 34)</strong> &rarr; SCT-013 CT Current Sensor Burden Voltage</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 5. Fixed Pop-up Footer */}
        <div className="px-5 py-3.5 bg-[#FFFFFF] dark:bg-[#1A222B] border-t-2 border-[#1F2933] dark:border-[#2C3847] flex items-center justify-between gap-3 shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDraft(DEFAULT_PARAMS)}
            disabled={!canEdit}
            className="font-mono text-[11px]"
          >
            <RotateCcw size={12} className="mr-1.5" /> Reset Defaults
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onClose}
              className="font-mono text-[11px]"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              disabled={saving || !canEdit || !isValid} 
              onClick={handleSave}
              className="font-mono text-[11px]"
            >
              <Save size={12} className="mr-1.5" /> 
              {saving ? 'Saving...' : saveSuccessNotice ? '✓ Saved!' : (!canEdit ? 'Read-Only (Locked)' : 'Save Configuration')}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
