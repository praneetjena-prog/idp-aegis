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
  Calendar as CalendarIcon
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
          label: 'Hydraulic Flow Rate',
          icon: Activity,
          value: isFault ? '4.1 L/s' : '5.8 L/s',
          isWarning: isFault,
          sub: isFault ? 'Advisory: Strainer Inspection' : 'Nominal: 5.8 L/s Design'
        },
        {
          label: 'Discharge Head',
          icon: Zap,
          value: isFault ? '4.5 bar' : '4.2 bar',
          isWarning: isFault,
          sub: isFault ? '+0.3 bar Head Loss' : 'Balanced Pressure'
        },
        {
          label: 'Pump Motor Current',
          icon: Zap,
          value: isFault ? '16.8 A' : '14.1 A',
          isWarning: isFault,
          sub: 'Rated: 15.0 A FLC'
        },
        {
          label: 'Seal Chamber Temp',
          icon: Thermometer,
          value: isFault ? '58.2°C' : '48.0°C',
          isWarning: false,
          sub: 'Threshold: 75.0°C'
        }
      ];
    case 'elec-01':
      return [
        {
          label: '3-Phase Current Balance',
          icon: Activity,
          value: '94.1%',
          isWarning: false,
          sub: 'Threshold: >92.0% Nominal'
        },
        {
          label: 'Main Feeder Load',
          icon: Zap,
          value: '1,280 A',
          isWarning: false,
          sub: 'Bus Rating: 2,000 A'
        },
        {
          label: 'L1/L2/L3 Busbar Temp',
          icon: Thermometer,
          value: '42.5°C',
          isWarning: false,
          sub: 'IR Delta: <2.8°C (Optimal)'
        },
        {
          label: 'Power Factor (PF)',
          icon: Volume2,
          value: '0.96 pf',
          isWarning: false,
          sub: 'Grid Compliance >0.95'
        }
      ];
    case 'chiller-01':
      return [
        {
          label: 'Cooling Plant Load',
          icon: Activity,
          value: '385 Tons',
          isWarning: false,
          sub: 'Capacity: 450 Tons'
        },
        {
          label: 'Evaporator Approach',
          icon: Thermometer,
          value: '1.1°C',
          isWarning: false,
          sub: 'Threshold: <1.5°C'
        },
        {
          label: 'Compressor Draw',
          icon: Zap,
          value: '72.0 A',
          isWarning: false,
          sub: '4160V Medium Voltage'
        },
        {
          label: 'Refrigerant Pressure',
          icon: Volume2,
          value: '3.2 bar',
          isWarning: false,
          sub: 'R-134a Suction Normal'
        }
      ];
    case 'vav-4b':
      return [
        {
          label: 'Damper Modulation',
          icon: Activity,
          value: isFault ? '20–80%' : '55%',
          isWarning: isFault,
          sub: isFault ? 'Hunting Drift Detected' : 'Modulation Stable'
        },
        {
          label: 'Plenum Airflow',
          icon: Zap,
          value: isFault ? '380 CFM' : '450 CFM',
          isWarning: isFault,
          sub: 'Set: 450 CFM @ 21.5°C'
        },
        {
          label: 'Discharge Air Temp',
          icon: Thermometer,
          value: '21.4°C',
          isWarning: false,
          sub: 'Room Setpoint: 22.0°C'
        },
        {
          label: 'Actuator Torque',
          icon: Volume2,
          value: '4.8 Nm',
          isWarning: false,
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
          sub: `ISO Limit: 2.5 mm/s • ${isFault ? '+172% Over' : 'Nominal'}`
        },
        {
          label: 'Motor Phase Draw',
          icon: Zap,
          value: isFault ? `${liveValues?.cur ?? 17.6} A` : `${liveValues?.cur ?? 14.2} A`,
          isWarning: isFault,
          sub: `Nominal: 14.2 A • ${isFault ? '+24% Surge' : 'Balanced'}`
        },
        {
          label: 'Bearing Outer Ring',
          icon: Thermometer,
          value: isFault ? `${liveValues?.temp ?? 71.8}°C` : `${liveValues?.temp ?? 52.0}°C`,
          isWarning: isFault,
          sub: `Critical Threshold: 65.0°C • ${isFault ? 'Overheating' : 'Cold Baseline'}`
        },
        {
          label: 'Acoustic HF Noise',
          icon: Volume2,
          value: isFault ? `+${liveValues?.acoustic ?? 14} dB` : `+${liveValues?.acoustic ?? 0} dB`,
          isWarning: isFault,
          sub: `Spectral Peak: ${isFault ? '3.2 kHz Harmonic' : 'Smooth Baseline'}`
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
  workOrders,
  onCreateWorkOrder,
  onShowQrModal,
  onPrintFieldSheet,
  onOpenCalendar,
  showToast
}) => {
  const currentAsset = ASSET_REGISTRY[assetId] || ASSET_REGISTRY['ahu-03'];
  const isAhu = currentAsset.id === 'ahu-03';
  const isFault = feedMode === 'fault' && isAhu;

  const [fieldTasks, setFieldTasks] = useState(() => {
    const list = ASSET_SOP_TASKS[currentAsset.id] || ASSET_SOP_TASKS['ahu-03'];
    return list.map(t => ({ ...t }));
  });

  const [serviceLogged, setServiceLogged] = useState(false);

  // Sync field tasks whenever the technician switches to a different asset
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
      showToast(`✓ Shift service signed off for ${currentAsset.code} • Logged to Aegis audit history`);
    }
  };

  const completedCount = fieldTasks.filter(t => t.done).length;
  const percentDone = Math.round((completedCount / fieldTasks.length) * 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* 1. Top Navigation & Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-3.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] font-mono text-[11px] font-bold text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] hover:text-[#2C6E9B] transition-all"
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
          <button
            type="button"
            onClick={onShowQrModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#2C6E9B] text-[#2C6E9B] font-mono text-[11px] font-bold rounded shadow-sm hover:bg-[#2C6E9B] hover:text-white transition-all"
            title="View or Print Machine QR Tag"
          >
            <QrCode size={13} />
            <span>Show QR Sticker</span>
          </button>
        </div>
      </div>

      {/* 2. Machine Switcher Bar (Quick Navigation Between Equipment) */}
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
                ? 'bg-[#2C6E9B] border-[#2C6E9B] text-white shadow-sm'
                : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
            }`}
          >
            {a.code} • {a.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* 3. Asset Identity Hero Card */}
      <div className={`border-2 rounded-xl p-5 transition-all bg-white dark:bg-[#1A222B] ${
        isFault 
          ? 'border-[#C05043] shadow-[3px_3px_0_#C05043]'
          : 'border-[#1F2933] dark:border-[#2C3847] shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            {/* Health Score Badge */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center shrink-0 shadow-inner ${
              isFault ? 'bg-[#C05043]/10 border-[#C05043]' : 'bg-[#2E7D5B]/10 border-[#2E7D5B]'
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

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#1F2933] text-white font-mono text-[11px] font-bold">
                  {currentAsset.code}
                </span>
                <Badge variant={isFault ? 'critical' : currentAsset.statusVariant}>
                  {isFault ? 'Critical • 7 Day Action Window' : currentAsset.status}
                </Badge>
                <span className="font-mono text-[11px] text-[#8A8175]">
                  {currentAsset.subsystem}
                </span>
              </div>

              <h1 className="font-display text-[20px] sm:text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                {currentAsset.name}
              </h1>

              <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#6E6558] dark:text-[#A0988A]">
                <span><strong>Location:</strong> {currentAsset.location}</span>
                <span>•</span>
                <span><strong>Serial:</strong> {currentAsset.serial}</span>
                <span>•</span>
                <span><strong>Last PM:</strong> {currentAsset.lastPm}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onShowQrModal}
              className="flex items-center gap-1.5"
            >
              <QrCode size={13} />
              <span>Print Asset Tag</span>
            </Button>
            {onPrintFieldSheet && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onPrintFieldSheet}
                className="flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Field Sheet (PDF)</span>
              </Button>
            )}
            {onOpenCalendar && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onOpenCalendar}
                className="flex items-center gap-1.5 border-[#2C6E9B] text-[#2C6E9B] hover:bg-[#2C6E9B] hover:text-white"
                title="View equipment maintenance window on calendar"
              >
                <CalendarIcon size={13} />
                <span>PM Calendar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Sensor Vitals (Instant Field Diagnostic Readout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {getAssetVitals(currentAsset.id, liveValues, feedMode).map((v, idx) => {
          const Icon = v.icon;
          return (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border-2 transition-all ${
                v.isWarning 
                  ? 'bg-[#C05043]/5 border-[#C05043]' 
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
              <div className="font-mono text-[10px] text-[#8A8175] mt-1">
                {v.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Active Work Orders & Mobile Field Checklist */}
      <div className="grid lg:grid-cols-12 gap-5">
        
        {/* Left Column: Interactive Field Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-2 border-[#1F2933] dark:border-[#2C3847]">
            <CardHeader>
              <div>
                <CardTitle>On-Site Technician Inspection Checklist</CardTitle>
                <p className="text-[11px] text-[#8A8175] mt-0.5">
                  Tap tasks on your phone as you complete them at the physical asset
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
                Technician: J. Rivera • Active Shift
              </span>
              <Button
                variant={serviceLogged ? 'secondary' : 'teal'}
                size="sm"
                onClick={handleSignOff}
                disabled={serviceLogged}
                className="w-full sm:w-auto"
              >
                <CheckCircle2 size={13} className="mr-1.5" />
                <span>{serviceLogged ? '✓ Service Signed Off & Audited' : 'Sign Off & Log Inspection'}</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Physical Specs, Field Kit, & Maintenance History */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Machine Bill of Materials / Field Kit */}
          <Card>
            <CardHeader>
              <CardTitle>Required Field Kit & Spare Parts</CardTitle>
              <Badge variant="neutral">Open Stock</Badge>
            </CardHeader>
            <div className="space-y-2 font-mono text-[11px] mt-2">
              <div className="p-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">Bearing: {currentAsset.bearing}</div>
                  <div className="text-[10px] text-[#8A8175]">Deep groove ball bearing</div>
                </div>
                <Badge variant="nominal">In Stock: 4</Badge>
              </div>

              <div className="p-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">Grease: {currentAsset.grease}</div>
                  <div className="text-[10px] text-[#8A8175]">Purge & 2 pumps per port</div>
                </div>
                <Badge variant="nominal">In Stock: 12</Badge>
              </div>

              <div className="p-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">Belt: {currentAsset.belt}</div>
                  <div className="text-[10px] text-[#8A8175]">Acoustic frequency tensioning</div>
                </div>
                <Badge variant="nominal">In Stock: 6</Badge>
              </div>
            </div>
          </Card>

          {/* Maintenance Audit History Log */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Service History</CardTitle>
              <span className="font-mono text-[10px] text-[#8A8175]">Chronological</span>
            </CardHeader>
            <div className="space-y-2.5 font-mono text-[10px] mt-2">
              {serviceLogged && (
                <div className="p-2.5 rounded bg-[#2E7D5B]/10 border border-[#2E7D5B]/30 animate-in fade-in">
                  <div className="flex justify-between items-center text-[#2E7D5B] font-bold">
                    <span>Just Now • Preventive Service</span>
                    <span>J. Rivera</span>
                  </div>
                  <div className="text-[#3E4650] dark:text-[#C5BCAD] mt-1">
                    Checklist completed via QR passport for {currentAsset.code}. Field inspection tasks logged to Aegis audit ledger.
                  </div>
                </div>
              )}

              {(ASSET_HISTORIES[currentAsset.id] || ASSET_HISTORIES['ahu-03']).map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
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
