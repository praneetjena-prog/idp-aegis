import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Wrench, 
  HelpCircle,
  Gauge,
  Radio,
  CalendarDays,
  Shield,
  Layers,
  Zap,
  Droplets,
  Cog,
  BarChart3,
  QrCode,
  Info
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const FacilityOverview = ({ 
  feedMode, 
  liveValues, 
  isLive, 
  setTab, 
  onCreateWorkOrder, 
  workOrders = [],
  onExport 
}) => {
  const isFault = feedMode === 'fault';
  const healthScore = isFault ? 74 : 91;
  const isDispatched = workOrders.some(w => w.id === '8821');

  const subsystems = [
    { id: 'hvac', name: 'HVAC Air Handlers', icon: Activity, health: isFault ? 79 : 92, status: isFault ? 'Advisory' : 'Nominal', metric: '242 kW Load', target: 'ahu-03' },
    { id: 'electrical', name: 'Electrical Infrastructure', icon: Zap, health: isFault ? 74 : 95, status: isFault ? 'Advisory' : 'Nominal', metric: '94.1% Balanced', target: 'elec-01' },
    { id: 'water', name: 'Hydraulic & Water Loops', icon: Droplets, health: 95, status: 'Nominal', metric: '4.2 bar Loop', target: 'cw-pump-02' },
    { id: 'mechanical', name: 'Mechanical Rotating Plant', icon: Cog, health: isFault ? 61 : 88, status: isFault ? 'Action Required' : 'Nominal', metric: isFault ? 'AHU-03 Drag' : 'All Smooth', target: 'ahu-03' },
    { id: 'energy', name: 'Facility Energy Optimization', icon: BarChart3, health: 88, status: 'Nominal', metric: '0.96 Power Factor', target: 'vav-4b' }
  ];

  const recentEvents = [
    {
      time: '12m ago',
      title: isFault ? 'AHU-03 Vibration Elevated' : 'Routine Baseline Scan Complete',
      desc: isFault ? 'Velocity reached 6.8 mm/s RMS (ISO 10816 Zone C)' : 'All 38 assets logged nominal vibration harmonics',
      type: isFault ? 'alert' : 'info'
    },
    {
      time: '2h ago',
      title: 'Shift 1 Handoff Logged',
      desc: 'Technician J. Rivera confirmed zero active LOTO isolations',
      type: 'info'
    },
    {
      time: 'Yesterday',
      title: 'WO #8820 Seal Replacement',
      desc: 'CW-P01 pump face seal overhaul logged by A. Kumar',
      type: 'success'
    }
  ];

  const upcomingMaintenance = [
    { date: 'Oct 16', asset: 'AHU-03', task: 'Supply Fan Bearing Overhaul', tech: 'J. Rivera', type: 'predictive' },
    { date: 'Oct 18', asset: 'CW-Pump-02', task: 'Duplex Strainer Cleanout', tech: 'A. Kumar', type: 'routine' },
    { date: 'Oct 24', asset: 'SW-Panel-01', task: 'Quarterly Thermal IR Scan', tech: 'M. Singh', type: 'routine' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Facility Status & Overall Health Hero */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-5 sm:p-6 rounded-xl shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            {/* Health Score Pill */}
            <div className="relative shrink-0 flex items-center justify-center w-20 h-20 bg-[#FAF8F4] dark:bg-[#141B22] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl shadow-xs">
              <div className="text-center">
                <div className={`font-mono text-[24px] sm:text-[26px] font-bold leading-none ${isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
                  {healthScore}%
                </div>
                <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-[#8A8175] mt-1 font-semibold">
                  Health
                </div>
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[20px] sm:text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase leading-tight">
                  Central Campus Overview
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]">
                  Unit 01
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border border-[#2E7D5B]/30 bg-[#2E7D5B]/10 text-[#2E7D5B]">
                  <Activity size={12} /> 99.8% 30-Day Uptime
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                  isFault 
                    ? 'bg-[#C05043]/10 border-[#C05043]/30 text-[#C05043]' 
                    : 'bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B]'
                }`}>
                  {isFault ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                  {isFault ? '1 Asset Needs Attention' : 'All 38 Units Nominal'}
                </span>
              </div>

              <p className="font-sans text-[13px] sm:text-[14px] text-[#554D42] dark:text-[#C5BCAD] max-w-[800px] leading-relaxed">
                {isFault 
                  ? '37 of 38 monitored rotating equipment units are running within normal parameters. Supply fan motor AHU-03 indicates bearing outer-race wear and should be inspected during this shift.'
                  : 'All 38 monitored machines across campus are operating smoothly. Vibration, motor currents, and bearing temperatures are balanced within nominal ISO 10816 Class II baselines.'}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#8A8175]">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} />
                  {isLive ? 'Live Hardware Stream (ESP32 Gateway)' : 'Calibrated Physics Simulation Mode'}
                </span>
                <span>•</span>
                <span>Telemetry freshness: &lt; 2s cycle</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setTab('console')}
              className="justify-between"
            >
              <span>Open Live Console</span>
              <ArrowRight size={14} className="ml-2" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setTab('asset', 'ahu-03')}
              className="justify-between"
            >
              <span>AHU-03 Passport</span>
              <QrCode size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Priority Attention Spotlight (AHU-03) */}
      <div className={`border rounded-xl p-5 transition-colors ${
        isFault 
          ? 'bg-[#FFFFFF] dark:bg-[#1A222B] border-[#C05043]/40 shadow-xs'
          : 'bg-[#FFFFFF] dark:bg-[#1A222B] border-[#2E7D5B]/40 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E0D6] dark:border-[#2C3847] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isFault ? 'bg-[#C05043]/15 text-[#C05043]' : 'bg-[#2E7D5B]/15 text-[#2E7D5B]'
            }`}>
              {isFault ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">
                {isFault ? 'Primary Shift Priority Notice' : 'Current Equipment Health Status'}
              </div>
              <h2 className="font-display text-[16px] sm:text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                {isFault 
                  ? 'Machine Alert: Air Handling Unit 03 (AHU-03) — Supply Fan Bearing Drag' 
                  : 'All Rotating Equipment Operating Within Normal ISO Limits'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isFault ? 'critical' : 'nominal'}>
              {isFault ? 'Urgency: Moderate (7-Day Action Window)' : 'Zero Faults Logged'}
            </Badge>
          </div>
        </div>

        {isFault ? (
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-[13px]">
            {/* Question 1: What is happening? */}
            <div className="bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] p-4 rounded-lg">
              <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175] flex items-center gap-1.5 mb-2">
                <HelpCircle size={13} className="text-[#2C6E9B]" />
                <span>1. What is happening?</span>
              </div>
              <p className="text-[#3E4650] dark:text-[#C5BCAD] leading-relaxed text-[12px]">
                The supply fan motor is vibrating at <strong className="text-[#C05043] font-mono">{liveValues?.vib ?? 6.8} mm/s</strong> (ISO 10816 Class II safe limit is 2.5 mm/s) and drawing <strong className="text-[#C05043] font-mono">{liveValues?.cur ?? 17.6} A</strong> (+24% over nominal). The bearing balls show early spalling on the outer ring race.
              </p>
            </div>

            {/* Question 2: When will it break? */}
            <div className="bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] p-4 rounded-lg">
              <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175] flex items-center gap-1.5 mb-2">
                <Clock size={13} className="text-[#2C6E9B]" />
                <span>2. When will it break?</span>
              </div>
              <p className="text-[#3E4650] dark:text-[#C5BCAD] leading-relaxed text-[12px]">
                Estimated Remaining Useful Life: <strong className="text-[#1F2933] dark:text-[#FAF8F4] font-mono">~168 Hours (7 Days)</strong>.
                There is <strong>no immediate emergency trip</strong> today. Ample lead time exists to service the unit during scheduled off-peak hours before thermal degradation.
              </p>
            </div>

            {/* Question 3: What should I do next? */}
            <div className="bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] p-4 rounded-lg flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175] flex items-center gap-1.5 mb-2">
                  <Wrench size={13} className="text-[#2C6E9B]" />
                  <span>3. What should I do next?</span>
                </div>
                <p className="text-[#3E4650] dark:text-[#C5BCAD] leading-relaxed text-[12px]">
                  1. Apply LOTO electrical disconnect (SOP-EL-03).<br />
                  2. Inject 2 pumps NLGI #2 synthetic grease.<br />
                  3. Verify belt tension (45–55 Hz) & pulley alignment.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] flex gap-2">
                <Button 
                  variant={isDispatched ? 'secondary' : 'primary'} 
                  size="xs" 
                  onClick={() => onCreateWorkOrder('AHU-03', '8821')}
                  disabled={isDispatched}
                  className="flex-1"
                >
                  {isDispatched ? '✓ Work Order #8821 Dispatched' : '+ Create Work Order #8821'}
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setTab('asset', 'ahu-03')}
                  title="Open AHU-03 Passport"
                >
                  <QrCode size={12} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg text-[13px] text-[#554D42] dark:text-[#C5BCAD]">
            All motors, pumps, and fans are running smoothly. Spectral vibration harmonic peaks are below 1.5 mm/s RMS, phase currents are balanced at &lt; 2% delta, and bearing temperatures are nominal at {liveValues?.temp ?? 52}°C.
          </div>
        )}
      </div>

      {/* 3. Subsystem Condition Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
              Campus Subsystem Health
            </h3>
            <span className="font-mono text-[10px] text-[#8A8175]">5 Subsystems Monitored</span>
          </div>
          <button 
            type="button" 
            onClick={() => setTab('console')} 
            className="text-[11px] font-mono text-[#2C6E9B] hover:underline flex items-center gap-1"
          >
            <span>View Detailed SCADA Grid</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {subsystems.map(sys => {
            const Icon = sys.icon;
            const isWarning = sys.status !== 'Nominal';
            return (
              <div 
                key={sys.id}
                onClick={() => setTab('asset', sys.target)}
                className={`p-3.5 rounded-xl border bg-white dark:bg-[#1A222B] transition-all hover:border-[#2C6E9B] cursor-pointer ${
                  isWarning 
                    ? 'border-[#C05043]/30 dark:border-[#C05043]/40' 
                    : 'border-[#D2C9BA] dark:border-[#2C3847]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isWarning ? 'bg-[#C05043]/10 text-[#C05043]' : 'bg-[#2C6E9B]/10 text-[#2C6E9B]'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <Badge variant={isWarning ? 'critical' : 'nominal'}>
                    {sys.status}
                  </Badge>
                </div>
                <div className="font-display text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4] truncate">
                  {sys.name}
                </div>
                <div className="mt-2 flex items-baseline justify-between font-mono">
                  <span className={`text-[18px] font-bold ${
                    sys.health < 70 ? 'text-[#C05043]' : sys.health < 85 ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'
                  }`}>
                    {sys.health}%
                  </span>
                  <span className="text-[10px] text-[#8A8175] truncate max-w-[80px]">
                    {sys.metric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Operational Context: Recent Events & Upcoming PM Tasks */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent Operational Events */}
        <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6E0D6] dark:border-[#2C3847] pb-2.5">
            <h3 className="font-display text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
              Recent Significant Changes
            </h3>
            <span className="font-mono text-[10px] text-[#8A8175]">Audit Trail</span>
          </div>

          <div className="space-y-2.5">
            {recentEvents.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] text-[12px]">
                <div className="font-mono text-[10px] text-[#8A8175] shrink-0 pt-0.5">
                  {evt.time}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#1F2933] dark:text-[#FAF8F4] leading-tight">
                    {evt.title}
                  </div>
                  <div className="text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-0.5">
                    {evt.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Maintenance Tasks */}
        <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6E0D6] dark:border-[#2C3847] pb-2.5">
            <h3 className="font-display text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
              Upcoming Maintenance Agenda
            </h3>
            <span className="font-mono text-[10px] text-[#8A8175]">Next 14 Days</span>
          </div>

          <div className="space-y-2.5">
            {upcomingMaintenance.map((pm, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] text-[12px] gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-[#2C6E9B]/10 text-[#2C6E9B] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                    {pm.date.split(' ')[1]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#1F2933] dark:text-[#FAF8F4] truncate">
                      {pm.asset} — {pm.task}
                    </div>
                    <div className="text-[10px] font-mono text-[#8A8175]">
                      Assigned: {pm.tech} • {pm.type === 'predictive' ? 'Predictive Slot' : 'Routine PM'}
                    </div>
                  </div>
                </div>
                <Badge variant={pm.type === 'predictive' ? 'critical' : 'neutral'}>
                  {pm.date}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Metric Transparency & Discoverability Note */}
      <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg flex items-center justify-between text-[11px] font-mono text-[#8A8175]">
        <div className="flex items-center gap-2">
          <Info size={13} className="text-[#2C6E9B]" />
          <span>Facility Health is calculated from multi-sensor weighted scores across 5 campus subsystems (updated every 1.8s).</span>
        </div>
        <span>Data Standard: ISO 10816-3</span>
      </div>
    </div>
  );
};
