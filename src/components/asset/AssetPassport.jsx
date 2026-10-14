import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  QrCode, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Zap, 
  Thermometer, 
  Volume2, 
  CheckSquare, 
  Square, 
  Layers, 
  FileText, 
  Shield, 
  Radio, 
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Tag,
  MapPin,
  FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ASSET_REGISTRY } from './AssetQrModal';

export const ASSET_SOP_TASKS = {
  'ahu-03': [
    { id: 1, text: 'Lockout/Tagout applied at electrical disconnect (SOP-EL-03)', done: true },
    { id: 2, text: 'Bearing housing visual check • Inspect grease for metallic glitter', done: true },
    { id: 3, text: 'Lubrication • Inject 2 pumps NLGI #2 synthetic grease', done: false },
    { id: 4, text: 'Pulley alignment (straight-edge <0.5mm) & belt tension (45–55 Hz)', done: false },
    { id: 5, text: 'Phase current under manual bypass (14.2A ±0.5A, imbalance <2%)', done: false },
    { id: 6, text: 'Post-repair spin test • 10min validation (target vibration <2.5 mm/s)', done: false }
  ],
  'cw-pump-02': [
    { id: 1, text: 'Isolate suction & discharge valves • Tag hydraulic circuit (SOP-HY-02)', done: true },
    { id: 2, text: 'Differential pressure audit • Inspect duplex strainer basket for debris', done: true },
    { id: 3, text: 'Mechanical seal inspection • Check flush line & verify zero drip rate', done: false },
    { id: 4, text: 'Flexible shaft coupling check • Measure radial & angular misalignment', done: false },
    { id: 5, text: 'Grease motor bearings • Apply 1.5 pumps Polyurea #2 grease', done: false },
    { id: 6, text: 'Dynamic prime & cavitation check • Acoustic listening wand verification', done: false }
  ],
  'elec-01': [
    { id: 1, text: 'Establish Arc-Flash safety perimeter (NFPA 70E Category 2 PPE)', done: true },
    { id: 2, text: 'Thermal IR imaging scan • Check L1/L2/L3 busbars & breaker lugs (<10°C delta)', done: true },
    { id: 3, text: 'Torque verification on main 2000A incoming feeder lug connections', done: false },
    { id: 4, text: 'Neutral-to-ground stray voltage check (verify <1.5 VAC under load)', done: false },
    { id: 5, text: 'Phase current balance validation (target >92% balance across phases)', done: false },
    { id: 6, text: 'Clean enclosure dust filters & verify panel ventilation exhaust fans', done: false }
  ],
  'chiller-01': [
    { id: 1, text: 'Review compressor run log • Verify refrigerant R-134a charge pressure', done: true },
    { id: 2, text: 'Evaporator & condenser approach temperature delta audit (<1.5°C)', done: true },
    { id: 3, text: 'Oil sump inspection • Verify level sight glass & sample acid test kit', done: false },
    { id: 4, text: 'VFD cooling fan filter change & inspect 4160V power electronics heat sinks', done: false },
    { id: 5, text: 'Purge unit diagnostic cycle & leak test on hermetic seals', done: false },
    { id: 6, text: 'Verify chiller water flow proving switches & freeze protection interlocks', done: false }
  ],
  'vav-4b': [
    { id: 1, text: 'Inspect Belimo 24VAC damper actuator mechanical linkage & U-bolt clamp', done: true },
    { id: 2, text: 'Calibrate full actuator stroke • 0° (fully closed) to 90° (fully open)', done: true },
    { id: 3, text: 'Zero-point calibration on differential pressure pitot tube sensor', done: false },
    { id: 4, text: 'Reheat hydronic 2-way valve stroke & temperature differential check', done: false },
    { id: 5, text: 'Room thermostat setpoint step-response test (verify hunting stops in 120s)', done: false },
    { id: 6, text: 'Verify BACnet MS/TP bus communication & telemetry signal strength', done: false }
  ]
};

export const ASSET_HISTORIES = {
  'ahu-03': [
    { date: '2026-08-14', type: 'Scheduled PM', tech: 'M. Singh', desc: 'Quarterly belt tensioning & filter media replacement. Vibration was nominal (2.1 mm/s).' },
    { date: '2026-05-10', type: 'Bearing Replacement', tech: 'J. Rivera', desc: 'Installed new SKF 6205-2RS bearings on drive and non-drive ends. Balanced rotor.' }
  ],
  'cw-pump-02': [
    { date: '2026-08-28', type: 'Impeller & Strainer Audit', tech: 'A. Kumar', desc: 'Backflushed duplex strainer basket; flow rate restored to nominal 5.8 L/s.' },
    { date: '2026-04-12', type: 'Mechanical Seal PM', tech: 'J. Rivera', desc: 'Replaced tungsten carbide mechanical face seal. Zero drip rate confirmed.' }
  ],
  'elec-01': [
    { date: '2026-07-10', type: 'Thermal IR Scan & Torquing', tech: 'M. Singh', desc: 'Annual thermographic inspection. All phase lugs torqued to 50 Nm. Delta T <3.2°C.' },
    { date: '2026-01-20', type: 'Breaker Trip Calibration', tech: 'E. Vance', desc: 'Secondary injection test on main 2000A breaker. Trip curve within ANSI tolerances.' }
  ],
  'chiller-01': [
    { date: '2026-09-01', type: 'Refrigerant & Oil Analysis', tech: 'J. Rivera', desc: 'Spectrometric oil analysis showed 0 ppm copper/iron wear. R-134a charge optimal.' },
    { date: '2026-03-15', type: 'Condenser Tube Brushing', tech: 'A. Kumar', desc: 'Cleaned 480 condenser copper tubes. Approach temp improved to 0.8°C.' }
  ],
  'vav-4b': [
    { date: '2026-06-15', type: 'Actuator Re-zeroing', tech: 'M. Singh', desc: 'Re-calibrated feedback potentiometer. Damper hunt cycle dampened.' },
    { date: '2025-11-04', type: 'Plenum Filter Replacement', tech: 'A. Kumar', desc: 'Replaced MERV 13 ceiling plenum air filter and cleaned pitot sensor tube.' }
  ]
};

function getAssetVitals(assetId, liveValues, feedMode) {
  const isFault = feedMode === 'fault';
  switch (assetId) {
    case 'cw-pump-02':
      return [
        {
          label: 'Hydraulic Flow',
          icon: Activity,
          value: isFault ? '4.1 L/s' : '5.8 L/s',
          isWarning: isFault,
          limit: 'Min: 5.0 L/s',
          sub: isFault ? 'Advisory: Strainer Basket Clean' : 'Optimal Operating Point'
        },
        {
          label: 'Discharge Head',
          icon: Zap,
          value: isFault ? '4.5 bar' : '4.2 bar',
          isWarning: isFault,
          limit: 'Max: 4.8 bar',
          sub: isFault ? '+0.3 bar Head Loss' : 'Balanced Pressure'
        },
        {
          label: 'Motor Current',
          icon: Zap,
          value: isFault ? '16.8 A' : '14.1 A',
          isWarning: isFault,
          limit: 'Rated: 15.0 A',
          sub: isFault ? '+12% Overload Drag' : 'Normal Current Draw'
        },
        {
          label: 'Seal Chamber Temp',
          icon: Thermometer,
          value: isFault ? '58.2°C' : '48.0°C',
          isWarning: false,
          limit: 'Critical: 75.0°C',
          sub: 'Mechanical Face Seal Normal'
        }
      ];
    case 'elec-01':
      return [
        {
          label: 'Phase Balance',
          icon: Activity,
          value: '94.1%',
          isWarning: false,
          limit: 'Min: 92.0%',
          sub: 'Balanced Across 3 Phases'
        },
        {
          label: 'Feeder Load',
          icon: Zap,
          value: '1,280 A',
          isWarning: false,
          limit: 'Bus: 2,000 A',
          sub: '64% Operational Loading'
        },
        {
          label: 'Busbar Temp',
          icon: Thermometer,
          value: '42.5°C',
          isWarning: false,
          limit: 'Max: 65.0°C',
          sub: 'IR Scan Delta <2.8°C'
        },
        {
          label: 'Power Factor',
          icon: Volume2,
          value: '0.96 pf',
          isWarning: false,
          limit: 'Min: 0.95 pf',
          sub: 'Grid Compliance Optimal'
        }
      ];
    case 'chiller-01':
      return [
        {
          label: 'Cooling Tonnage',
          icon: Activity,
          value: '385 Tons',
          isWarning: false,
          limit: 'Capacity: 450 T',
          sub: '85% Compressor Load'
        },
        {
          label: 'Evaporator Approach',
          icon: Thermometer,
          value: '1.1°C',
          isWarning: false,
          limit: 'Max: 1.5°C',
          sub: 'Clean Heat Exchange'
        },
        {
          label: 'Compressor Draw',
          icon: Zap,
          value: '72.0 A',
          isWarning: false,
          limit: '4160V System',
          sub: 'VFD Speed Controlled'
        },
        {
          label: 'Suction Pressure',
          icon: Volume2,
          value: '3.2 bar',
          isWarning: false,
          limit: 'R-134a Safe Band',
          sub: 'Zero Superheat Drift'
        }
      ];
    case 'vav-4b':
      return [
        {
          label: 'Damper Modulation',
          icon: Activity,
          value: isFault ? '20–80%' : '55%',
          isWarning: isFault,
          limit: 'Hunting <5%',
          sub: isFault ? 'Hunting Oscillation Active' : 'Modulation Stable'
        },
        {
          label: 'Airflow Delivery',
          icon: Zap,
          value: isFault ? '380 CFM' : '450 CFM',
          isWarning: isFault,
          limit: 'Set: 450 CFM',
          sub: isFault ? '-70 CFM Under-delivery' : 'Design Airflow Reached'
        },
        {
          label: 'Discharge Temp',
          icon: Thermometer,
          value: '21.4°C',
          isWarning: false,
          limit: 'Set: 22.0°C',
          sub: 'Room Comfort Optimal'
        },
        {
          label: 'Actuator Torque',
          icon: Volume2,
          value: '4.8 Nm',
          isWarning: false,
          limit: 'Max: 10 Nm',
          sub: 'Belimo 24VAC Feedback'
        }
      ];
    case 'ahu-03':
    default:
      return [
        {
          label: 'Vibration Velocity',
          icon: Activity,
          value: isFault ? `${liveValues?.vib ?? 6.8} mm/s` : `${liveValues?.vib ?? 2.1} mm/s`,
          isWarning: isFault,
          limit: 'ISO Limit: 2.5 mm/s',
          sub: isFault ? '+172% Over Limit • BPFO Peak' : 'ISO Class II Zone A (<2.8)'
        },
        {
          label: 'Motor Phase Current',
          icon: Zap,
          value: isFault ? `${liveValues?.cur ?? 17.6} A` : `${liveValues?.cur ?? 14.2} A`,
          isWarning: isFault,
          limit: 'Rated: 14.2 A',
          sub: isFault ? '+24% Surge Drag' : 'Balanced Phase Draw'
        },
        {
          label: 'Bearing Outer Ring Temp',
          icon: Thermometer,
          value: isFault ? `${liveValues?.temp ?? 71.8}°C` : `${liveValues?.temp ?? 52.0}°C`,
          isWarning: isFault,
          limit: 'Critical: 65.0°C',
          sub: isFault ? 'Thermal Runaway Risk' : 'Thermal Dissipation Nominal'
        },
        {
          label: 'Acoustic Emission',
          icon: Volume2,
          value: isFault ? `+${liveValues?.acoustic ?? 14} dB` : `+${liveValues?.acoustic ?? 0} dB`,
          isWarning: isFault,
          limit: 'Baseline: 0 dB',
          sub: isFault ? '3.2x RPM Impact Harmonics' : 'Smooth Lubricated Baseline'
        }
      ];
  }
}

export const AssetPassport = ({
  assetId = 'ahu-03',
  onSelectAsset,
  onBack,
  liveValues,
  feedMode,
  isLive,
  workOrders = [],
  onCreateWorkOrder,
  onShowQrModal,
  onPrintFieldSheet,
  onOpenCalendar,
  showToast
}) => {
  const currentAsset = ASSET_REGISTRY[assetId] || ASSET_REGISTRY['ahu-03'];
  const isAhu = currentAsset.id === 'ahu-03';
  const isFault = feedMode === 'fault' && isAhu;

  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [fieldTasks, setFieldTasks] = useState(() => {
    const list = ASSET_SOP_TASKS[currentAsset.id] || ASSET_SOP_TASKS['ahu-03'];
    return list.map(t => ({ ...t }));
  });
  const [serviceLogged, setServiceLogged] = useState(false);

  // Sync field tasks when asset changes
  useEffect(() => {
    const list = ASSET_SOP_TASKS[currentAsset.id] || ASSET_SOP_TASKS['ahu-03'];
    setFieldTasks(list.map(t => ({ ...t })));
    setServiceLogged(false);
  }, [currentAsset.id]);

  const toggleTask = (id) => {
    setFieldTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleSignOff = () => {
    setServiceLogged(true);
    if (showToast) {
      showToast(`✓ Shift service signed off for ${currentAsset.code} • Logged to Aegis audit ledger`);
    }
  };

  const completedCount = fieldTasks.filter(t => t.done).length;
  const percentDone = Math.round((completedCount / fieldTasks.length) * 100);

  // Relevant open work orders for this machine
  const assetWorkOrders = workOrders.filter(w => 
    w.asset?.toLowerCase().includes(currentAsset.code.toLowerCase()) || 
    w.asset?.toLowerCase().includes(currentAsset.id)
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header & Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] hover:text-[#2C6E9B] transition-all"
          >
            <ArrowLeft size={13} />
            <span>Facility Console</span>
          </button>
          <ChevronRight size={13} className="text-[#8A8175]" />
          <span className="font-mono text-[11px] text-[#8A8175]">Asset Passport</span>
          <ChevronRight size={13} className="text-[#8A8175]" />
          <span className="font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
            {currentAsset.code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowQrModal}
            className="flex items-center gap-1.5 font-mono text-[11px] border-[#2C6E9B] text-[#2C6E9B] hover:bg-[#2C6E9B] hover:text-white"
            title="View or Print Machine QR Tag"
          >
            <QrCode size={13} />
            <span>Show QR Sticker</span>
          </Button>
          {onPrintFieldSheet && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onPrintFieldSheet}
              className="flex items-center gap-1.5 font-mono text-[11px]"
            >
              <Printer size={13} />
              <span>Field Sheet</span>
            </Button>
          )}
        </div>
      </div>

      {/* Campus Asset Quick Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] font-bold shrink-0">
          Campus Assets:
        </span>
        {Object.values(ASSET_REGISTRY).map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelectAsset(a.id)}
            className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
              currentAsset.id === a.id
                ? 'bg-[#2C6E9B] border-[#2C6E9B] text-white shadow-xs'
                : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
            }`}
          >
            {a.code} • {a.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* SECTION 1: Identity & Location Hero Card */}
      <div className={`border-2 rounded-xl p-5 bg-white dark:bg-[#1A222B] transition-all shadow-xs ${
        isFault 
          ? 'border-[#C05043]'
          : 'border-[#D2C9BA] dark:border-[#2C3847]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            {/* Health Score Pill */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center shrink-0 ${
              isFault 
                ? 'bg-[#C05043]/10 border-[#C05043]' 
                : 'bg-[#2E7D5B]/10 border-[#2E7D5B]'
            }`}>
              <span className={`font-mono text-[22px] sm:text-[26px] font-bold leading-none ${
                isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'
              }`}>
                {isFault ? '74%' : '92%'}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-wider text-[#8A8175] mt-1 font-semibold">
                Health
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#1F2933] text-white font-mono text-[11px] font-bold">
                  {currentAsset.code}
                </span>
                <Badge variant={isFault ? 'critical' : currentAsset.statusVariant}>
                  {isFault ? 'Action Required • 7-Day Window' : currentAsset.status}
                </Badge>
                <span className="font-mono text-[11px] text-[#8A8175] font-semibold">
                  {currentAsset.subsystem}
                </span>
              </div>

              <h1 className="font-display text-[20px] sm:text-[22px] font-bold text-[#1F2933] dark:text-[#FAF8F4] leading-tight">
                {currentAsset.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#6E6558] dark:text-[#A0988A]">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#2C6E9B]" />
                  <span>{currentAsset.location}</span>
                </span>
                <span>•</span>
                <span>Serial: <strong>{currentAsset.serial}</strong></span>
                <span>•</span>
                <span>Last PM: <strong>{currentAsset.lastPm}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onCreateWorkOrder && isAhu && (
              <Button 
                variant="critical" 
                size="sm" 
                onClick={() => onCreateWorkOrder('AHU-03', '8821')}
                className="font-mono text-[11px]"
              >
                Dispatch WO #8821
              </Button>
            )}
            {onOpenCalendar && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onOpenCalendar}
                className="flex items-center gap-1.5 font-mono text-[11px]"
              >
                <CalendarIcon size={12} />
                <span>Calendar Window</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Operating Status & Live Vitals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#6E6558] dark:text-[#A0988A]">
            Operating Status & Live Vitals
          </span>
          <span className="font-mono text-[9px] text-[#8A8175]">
            Telemetry Stream • Sensor Gateway Active
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {getAssetVitals(currentAsset.id, liveValues, feedMode).map((v, idx) => {
            const Icon = v.icon;
            return (
              <div 
                key={idx} 
                className={`p-3.5 rounded-xl border transition-all ${
                  v.isWarning 
                    ? 'bg-[#C05043]/5 border-[#C05043]/50' 
                    : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847]'
                }`}
              >
                <div className="flex items-center justify-between text-[#8A8175] mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold">{v.label}</span>
                  <Icon size={14} className={v.isWarning ? 'text-[#C05043]' : 'text-[#2E7D5B]'} />
                </div>
                <div className={`font-mono text-[22px] font-bold ${
                  v.isWarning ? 'text-[#C05043]' : 'text-[#1F2933] dark:text-[#FAF8F4]'
                }`}>
                  {v.value}
                </div>
                <div className="font-mono text-[10px] text-[#8A8175] mt-1 flex justify-between">
                  <span>{v.limit}</span>
                  <span className={v.isWarning ? 'text-[#C05043] font-semibold' : 'text-[#2E7D5B]'}>
                    {v.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Specifications & Nameplate (with Progressive Disclosure) */}
      <Card>
        <div className="p-4 flex items-center justify-between border-b border-[#E6E0D6] dark:border-[#2C3847]">
          <div>
            <CardTitle>Specifications & Nameplate Ratings</CardTitle>
            <p className="text-[11px] text-[#8A8175] mt-0.5 font-mono">
              Electrical characteristics, mechanical drive, bearings, and lubrication schedule
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSpecsExpanded(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] transition-colors"
          >
            <span>{specsExpanded ? 'Hide Specifications' : 'Show Full Specifications'}</span>
            {specsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Compact summary always visible */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
          <div className="p-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <span className="text-[9px] uppercase text-[#8A8175] block">Rated Power / Voltage</span>
            <span className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5 block truncate">{currentAsset.voltage}</span>
          </div>
          <div className="p-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <span className="text-[9px] uppercase text-[#8A8175] block">Operating Speed</span>
            <span className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5 block">{currentAsset.rpm}</span>
          </div>
          <div className="p-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <span className="text-[9px] uppercase text-[#8A8175] block">Installed Bearing</span>
            <span className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5 block truncate">{currentAsset.bearing}</span>
          </div>
          <div className="p-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <span className="text-[9px] uppercase text-[#8A8175] block">Approved Grease</span>
            <span className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5 block truncate">{currentAsset.grease}</span>
          </div>
        </div>

        {/* Expanded technical disclosure */}
        {specsExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-[#E6E0D6] dark:border-[#2C3847] grid sm:grid-cols-2 gap-4 font-mono text-[11px] animate-in fade-in">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="text-[#8A8175]">Drive Coupling / Belt:</span>
                <span className="font-semibold text-[#1F2933] dark:text-[#FAF8F4]">{currentAsset.belt}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="text-[#8A8175]">Installation Date:</span>
                <span className="font-semibold text-[#1F2933] dark:text-[#FAF8F4]">2018-04-12</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="text-[#8A8175]">Monitoring Standard:</span>
                <span className="font-semibold text-[#1F2933] dark:text-[#FAF8F4]">ISO 10816-3 Class II</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="text-[#8A8175]">Telemetry Protocol:</span>
                <span className="font-semibold text-[#2C6E9B]">MQTT / JSON (Edge Gateway)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="text-[#8A8175]">Bearing Stock Replacement:</span>
                <span className="font-semibold text-[#2E7D5B]">SKF 6205-2RS (4 in Central Store)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="text-[#8A8175]">Preventative Maintenance Cycle:</span>
                <span className="font-semibold text-[#1F2933] dark:text-[#FAF8F4]">Quarterly (90 Days)</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 4 & 5: Maintenance History, Open Work Orders, & Digital SOP Checklist */}
      <div className="grid lg:grid-cols-12 gap-5">
        
        {/* SECTION 5: Digital SOP Checklist (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-2 border-[#1F2933] dark:border-[#2C3847]">
            <CardHeader>
              <div>
                <CardTitle>Digital SOP Inspection Checklist</CardTitle>
                <p className="text-[11px] text-[#8A8175] mt-0.5">
                  Standard operating procedure for field maintenance & post-repair validation
                </p>
              </div>
              <Badge variant={percentDone === 100 ? 'nominal' : 'neutral'}>
                {completedCount}/{fieldTasks.length} Completed ({percentDone}%)
              </Badge>
            </CardHeader>

            <div className="space-y-2 mt-2">
              {fieldTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTask(t.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                    t.done
                      ? 'bg-[#2E7D5B]/5 border-[#2E7D5B]/30'
                      : 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] hover:border-[#2C6E9B]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {t.done ? (
                      <CheckSquare size={16} className="text-[#2E7D5B]" />
                    ) : (
                      <Square size={16} className="text-[#8A8175]" />
                    )}
                  </div>
                  <span className={`font-mono text-[11px] leading-relaxed ${
                    t.done 
                      ? 'text-[#6E6558] line-through dark:text-[#8A8175]' 
                      : 'text-[#1F2933] dark:text-[#FAF8F4] font-semibold'
                  }`}>
                    {t.text}
                  </span>
                </button>
              ))}
            </div>

            {/* 1-Tap Sign-off Button */}
            <div className="mt-4 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-mono text-[10px] text-[#8A8175]">
                Shift Technician: J. Rivera • Active Shift Lead
              </span>
              <Button
                variant={serviceLogged ? 'secondary' : 'teal'}
                size="sm"
                onClick={handleSignOff}
                disabled={serviceLogged}
                className="w-full sm:w-auto font-mono text-[11px]"
              >
                <CheckCircle2 size={13} className="mr-1.5" />
                <span>{serviceLogged ? '✓ Signed Off & Audited to Log' : 'Sign Off & Log Inspection'}</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* SECTION 4: Maintenance History & Open Work Orders (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Work Orders for this asset */}
          <Card>
            <CardHeader>
              <CardTitle>Active Asset Work Orders</CardTitle>
              <Badge variant={assetWorkOrders.length > 0 ? 'critical' : 'nominal'}>
                {assetWorkOrders.length} Dispatched
              </Badge>
            </CardHeader>
            <div className="space-y-2 font-mono text-[11px]">
              {assetWorkOrders.length > 0 ? (
                assetWorkOrders.map((wo) => (
                  <div 
                    key={wo.id}
                    className="p-3 bg-[#C05043]/10 border border-[#C05043]/30 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-[#C05043]">
                      <span>WO #{wo.id} • {wo.priority?.toUpperCase()}</span>
                      <span className="text-[10px]">{new Date(wo.created).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[11px] text-[#1F2933] dark:text-[#FAF8F4]">
                      {wo.diagnosis}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg text-[#8A8175] text-center">
                  No active work orders dispatched for {currentAsset.code}.
                </div>
              )}
            </div>
          </Card>

          {/* Maintenance Audit History Log */}
          <Card>
            <CardHeader>
              <CardTitle>Chronological Service Log</CardTitle>
              <span className="font-mono text-[10px] text-[#8A8175]">Audit Trail</span>
            </CardHeader>
            <div className="space-y-2.5 font-mono text-[10px]">
              {serviceLogged && (
                <div className="p-2.5 rounded-lg bg-[#2E7D5B]/10 border border-[#2E7D5B]/30 animate-in fade-in">
                  <div className="flex justify-between items-center text-[#2E7D5B] font-bold">
                    <span>Just Now • Shift Sign-off</span>
                    <span>J. Rivera</span>
                  </div>
                  <div className="text-[#3E4650] dark:text-[#C5BCAD] mt-1">
                    Inspection checklist completed for {currentAsset.code}. Logged to permanent facility audit ledger.
                  </div>
                </div>
              )}

              {(ASSET_HISTORIES[currentAsset.id] || ASSET_HISTORIES['ahu-03']).map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                  <div className="flex justify-between items-center font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                    <span>{item.date} • {item.type}</span>
                    <span className="text-[#8A8175]">{item.tech}</span>
                  </div>
                  <div className="text-[#6E6558] dark:text-[#A0988A] mt-0.5">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
};
