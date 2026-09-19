import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ASSET_REGISTRY } from './AssetQrModal';

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
  showToast
}) => {
  const currentAsset = ASSET_REGISTRY[assetId] || ASSET_REGISTRY['ahu-03'];
  const isAhu = currentAsset.id === 'ahu-03';
  const isFault = feedMode === 'fault' && isAhu;

  const [fieldTasks, setFieldTasks] = useState([
    { id: 1, text: 'Lockout/Tagout applied at electrical disconnect (SOP-EL-03)', done: true },
    { id: 2, text: 'Bearing housing visual check • Inspect grease for metallic glitter', done: true },
    { id: 3, text: 'Lubrication • Inject 2 pumps NLGI #2 synthetic grease', done: false },
    { id: 4, text: 'Pulley alignment (straight-edge <0.5mm) & belt tension (45–55 Hz)', done: false },
    { id: 5, text: 'Phase current under manual bypass (14.2A ±0.5A, imbalance <2%)', done: false },
    { id: 6, text: 'Post-repair spin test • 10min validation (target vibration <2.5 mm/s)', done: false }
  ]);

  const [serviceLogged, setServiceLogged] = useState(false);

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
          </div>
        </div>
      </div>

      {/* 4. Live Sensor Vitals (Instant Field Diagnostic Readout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Vibration */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          isFault 
            ? 'bg-[#C05043]/5 border-[#C05043]' 
            : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847]'
        }`}>
          <div className="flex items-center justify-between text-[#8A8175] mb-1">
            <span className="font-mono text-[10px] uppercase font-bold">Vibration Velocity</span>
            <Activity size={14} className={isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'} />
          </div>
          <div className={`font-mono text-[22px] font-bold ${isFault ? 'text-[#C05043]' : 'text-[#1F2933] dark:text-[#FAF8F4]'}`}>
            {isFault ? `${liveValues?.vib ?? 6.8} mm/s` : `${liveValues?.vib ?? 2.1} mm/s`}
          </div>
          <div className="font-mono text-[10px] text-[#8A8175] mt-1">
            ISO Limit: 2.5 mm/s • <span className={isFault ? 'text-[#C05043] font-bold' : 'text-[#2E7D5B]'}>{isFault ? '+172% Over' : 'Nominal'}</span>
          </div>
        </div>

        {/* Current */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          isFault 
            ? 'bg-[#B07B1C]/5 border-[#B07B1C]' 
            : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847]'
        }`}>
          <div className="flex items-center justify-between text-[#8A8175] mb-1">
            <span className="font-mono text-[10px] uppercase font-bold">Motor Phase Draw</span>
            <Zap size={14} className={isFault ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'} />
          </div>
          <div className={`font-mono text-[22px] font-bold ${isFault ? 'text-[#B07B1C]' : 'text-[#1F2933] dark:text-[#FAF8F4]'}`}>
            {isFault ? `${liveValues?.cur ?? 17.6} A` : `${liveValues?.cur ?? 14.2} A`}
          </div>
          <div className="font-mono text-[10px] text-[#8A8175] mt-1">
            Nominal: 14.2 A • <span className={isFault ? 'text-[#B07B1C] font-bold' : 'text-[#2E7D5B]'}>{isFault ? '+24% Surge' : 'Balanced'}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          isFault 
            ? 'bg-[#C05043]/5 border-[#C05043]' 
            : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847]'
        }`}>
          <div className="flex items-center justify-between text-[#8A8175] mb-1">
            <span className="font-mono text-[10px] uppercase font-bold">Bearing Outer Ring</span>
            <Thermometer size={14} className={isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'} />
          </div>
          <div className={`font-mono text-[22px] font-bold ${isFault ? 'text-[#C05043]' : 'text-[#1F2933] dark:text-[#FAF8F4]'}`}>
            {isFault ? `${liveValues?.temp ?? 71.8}°C` : `${liveValues?.temp ?? 52.0}°C`}
          </div>
          <div className="font-mono text-[10px] text-[#8A8175] mt-1">
            Critical Threshold: 65.0°C • <span className={isFault ? 'text-[#C05043] font-bold' : 'text-[#2E7D5B]'}>{isFault ? 'Overheating' : 'Cold Baseline'}</span>
          </div>
        </div>

        {/* Acoustic Noise */}
        <div className="p-4 rounded-xl border-2 border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#1A222B]">
          <div className="flex items-center justify-between text-[#8A8175] mb-1">
            <span className="font-mono text-[10px] uppercase font-bold">Acoustic HF Noise</span>
            <Volume2 size={14} className="text-[#2C6E9B]" />
          </div>
          <div className="font-mono text-[22px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
            {isFault ? `+${liveValues?.acoustic ?? 14} dB` : `+${liveValues?.acoustic ?? 0} dB`}
          </div>
          <div className="font-mono text-[10px] text-[#8A8175] mt-1">
            Spectral Peak: {isFault ? '3.2 kHz Harmonic' : 'Smooth Baseline'}
          </div>
        </div>
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
                    Checklist executed via QR scan. Bearing lubricated, alignment confirmed. Target vibration normalized.
                  </div>
                </div>
              )}

              <div className="p-2.5 rounded bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div className="flex justify-between items-center font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  <span>2026-08-14 • Scheduled PM</span>
                  <span className="text-[#8A8175]">M. Singh</span>
                </div>
                <div className="text-[#6E6558] dark:text-[#A0988A] mt-0.5">
                  Quarterly belt tensioning & filter media replacement. Vibration was nominal (2.1 mm/s).
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div className="flex justify-between items-center font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  <span>2026-05-10 • Bearing Replacement</span>
                  <span className="text-[#8A8175]">J. Rivera</span>
                </div>
                <div className="text-[#6E6558] dark:text-[#A0988A] mt-0.5">
                  Installed new SKF 6205-2RS bearings on drive and non-drive ends. Balanced rotor.
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
};
