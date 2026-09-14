import React from 'react';
import { 
  Shield, 
  Activity, 
  Radio, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Wrench, 
  FileSpreadsheet, 
  Sliders, 
  HelpCircle,
  TrendingUp,
  Droplets,
  Zap,
  Gauge,
  Thermometer,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const FacilityOverview = ({ 
  feedMode, 
  liveValues, 
  isLive, 
  setTab, 
  onCreateWorkOrder, 
  workOrders,
  onExport 
}) => {
  const isFault = feedMode === 'fault';
  const healthScore = isFault ? 74 : 91;
  const isDispatched = workOrders.some(w => w.id === '8821');

  return (
    <div className="space-y-6">
      {/* 1. Facility Status & Overall Health Hero */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] p-5 sm:p-6 shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Animated Health Gauge Badge */}
            <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#FAF8F4] dark:bg-[#141B22] border-2 border-[#1F2933] rounded-xl shadow-[2px_2px_0_#1F2933]">
              <div className="text-center">
                <div className={`font-mono text-[20px] sm:text-[24px] font-bold leading-none ${isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
                  {healthScore}%
                </div>
                <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-[#8A8175] mt-1 font-semibold">
                  Health
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[22px] sm:text-[28px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase leading-tight">
                  Facility Overview
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border border-[#D2C9BA] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]">
                  Central Campus • Unit 01
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                  isFault 
                    ? 'bg-[#C05043]/10 border-[#C05043]/30 text-[#C05043]' 
                    : 'bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B]'
                }`}>
                  {isFault ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                  {isFault ? 'Attention Needed' : 'All Systems Nominal'}
                </span>
              </div>

              <p className="font-sans text-[13px] sm:text-[14px] text-[#554D42] dark:text-[#C5BCAD] max-w-[760px] leading-relaxed">
                {isFault 
                  ? '37 of 38 monitored units are running normally. One machine (Air Handler AHU-03) is showing early mechanical wear and should be inspected during this shift.'
                  : 'All 38 machines are running smooth, cool, and balanced. Sensors report no abnormal vibration or temperature surges.'}
              </p>

              {/* Data Stream Mode indicator */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#8A8175]">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} />
                  {isLive ? 'Live Hardware (ESP32 Stream Active)' : 'Demonstration Mode (Realistic Physics Engine)'}
                </span>
                <span>•</span>
                <span>Auto-refresh every 1.8 seconds</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 shrink-0">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setTab('console')}
              className="w-full justify-between"
            >
              <span>Inspect Live Console</span>
              <ArrowRight size={14} className="ml-2" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setTab('simulator')}
              className="w-full justify-between"
            >
              <span>Test Simulator</span>
              <Gauge size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Plain-English Problem Spotlight (Only when fault detected or highlighted) */}
      <div className={`border-2 rounded-xl p-5 transition-all ${
        isFault 
          ? 'bg-[#FAF8F4] dark:bg-[#18202A] border-[#C05043] shadow-[3px_3px_0_#C05043]'
          : 'bg-[#FAF8F4] dark:bg-[#18202A] border-[#2E7D5B] shadow-[3px_3px_0_#2E7D5B]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E0D6] dark:border-[#2C3847] pb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isFault ? 'bg-[#C05043] text-white' : 'bg-[#2E7D5B] text-white'
            }`}>
              {isFault ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">
                {isFault ? 'Technician Priority Notice' : 'Current Equipment Status'}
              </div>
              <h2 className="font-display text-[16px] sm:text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                {isFault 
                  ? 'Machine Alert: Air Handling Unit 03 (AHU-03) — Fan Motor Rumble' 
                  : 'All Critical Rotating Equipment Running Within Safe Tolerances'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isFault ? 'critical' : 'success'}>
              {isFault ? 'Urgency: Moderate (7 Days Remaining)' : 'Zero Active Faults'}
            </Badge>
          </div>
        </div>

        {isFault ? (
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-[13px]">
            <div className="bg-[#FFFFFF] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-lg">
              <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175] flex items-center gap-1 mb-1">
                <HelpCircle size={12} className="text-[#2C6E9B]" /> What is happening?
              </div>
              <p className="text-[#3E4650] dark:text-[#C5BCAD] leading-relaxed">
                The supply fan motor is vibrating at <strong className="text-[#C05043]">{liveValues?.vib ?? 6.8} mm/s</strong> (safe limit is 2.5 mm/s) and running at <strong className="text-[#C05043]">{liveValues?.temp ?? 71.8}°C</strong>. 
                The bearing balls are beginning to show micro-wear on the outer ring.
              </p>
            </div>

            <div className="bg-[#FFFFFF] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-lg">
              <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175] flex items-center gap-1 mb-1">
                <Clock size={12} className="text-[#2C6E9B]" /> When will it break?
              </div>
              <p className="text-[#3E4650] dark:text-[#C5BCAD] leading-relaxed">
                Estimated Remaining Life: <strong className="text-[#1F2933] dark:text-[#FAF8F4]">~168 Hours (7 Days)</strong>.
                There is <strong>no immediate emergency shutdown</strong> needed today. You have ample time to service it before it stops the ventilation.
              </p>
            </div>

            <div className="bg-[#FFFFFF] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] p-3.5 rounded-lg flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175] flex items-center gap-1 mb-1">
                  <Wrench size={12} className="text-[#2C6E9B]" /> What should I do?
                </div>
                <p className="text-[#3E4650] dark:text-[#C5BCAD] leading-relaxed">
                  1. Check lubrication grease (NLGI #2).<br />
                  2. Check belt tension and pulley alignment.
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E6E0D6] dark:border-[#2C3847]">
                <Button 
                  variant={isDispatched ? 'secondary' : 'primary'} 
                  size="xs" 
                  onClick={() => onCreateWorkOrder('AHU-03', '8821')}
                  disabled={isDispatched}
                  className="w-full"
                >
                  {isDispatched ? '✓ Work Order #8821 Dispatched' : '+ Create Work Order & Notify Lead'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-[#FFFFFF] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <p className="text-[#3E4650] dark:text-[#C5BCAD] leading-relaxed">
              Motors, chilled water pumps, and air handlers are operating with smooth harmonics. Vibration is low ({liveValues?.vib ?? 2.1} mm/s) and motor temperatures are within cold baseline tolerances ({liveValues?.temp ?? 52}°C). Routine filter and lubrication checks are on schedule.
            </p>
          </div>
        )}
      </div>

      {/* 3. The 4 Key Numbers — Simplified for Everyone */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Monitored Machines</span>
            <Cpu size={16} className="text-[#2C6E9B]" />
          </div>
          <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
            38 <span className="text-[13px] font-normal text-[#8A8175]">Units</span>
          </div>
          <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
            Air handling units, water pumps, cooling towers, and switchboards.
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Sensors Online</span>
            <Radio size={16} className="text-[#2C6E9B]" />
          </div>
          <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
            1,428 <span className="text-[13px] font-normal text-[#8A8175]">Points</span>
          </div>
          <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
            Actively measuring vibration, surface heat, current draw, and noise.
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Facility Uptime</span>
            <Activity size={16} className="text-[#2E7D5B]" />
          </div>
          <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
            99.8%
          </div>
          <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
            Unscheduled downtime prevented through proactive early alerts.
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Early Warning Window</span>
            <Clock size={16} className="text-[#2C6E9B]" />
          </div>
          <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
            7–14 <span className="text-[13px] font-normal text-[#8A8175]">Days</span>
          </div>
          <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
            Average lead time given to technicians before a motor stops running.
          </p>
        </Card>
      </div>

      {/* 4. Subsystems at a Glance — Plain Language Status */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#E6E0D6] dark:border-[#2C3847] pb-3">
          <div>
            <CardTitle>Building Subsystems Status</CardTitle>
            <p className="text-[11px] text-[#8A8175] mt-0.5">
              Current operational health across the 5 primary campus utility loops.
            </p>
          </div>
          <button 
            onClick={() => setTab('console')} 
            className="text-[11px] font-mono font-bold text-[#2C6E9B] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            Open detailed telemetry <ChevronRight size={13} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { 
              name: 'HVAC Air Handlers', 
              score: isFault ? 79 : 92, 
              status: isFault ? 'Warning' : 'Good',
              note: isFault ? 'AHU-03 fan vibration' : 'Normal airflow',
              color: isFault ? 'text-[#B07B1C]' : 'text-[#2E7D5B]',
              barColor: isFault ? 'bg-[#B07B1C]' : 'bg-[#2E7D5B]'
            },
            { 
              name: 'Mechanical Pumps', 
              score: isFault ? 61 : 88, 
              status: isFault ? 'Action Required' : 'Good',
              note: isFault ? 'CW-Pump-02 strainer' : 'Pressures steady',
              color: isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]',
              barColor: isFault ? 'bg-[#C05043]' : 'bg-[#2E7D5B]'
            },
            { 
              name: 'Electrical Panels', 
              score: isFault ? 84 : 95, 
              status: 'Balanced',
              note: '94.1% Phase balance',
              color: 'text-[#2E7D5B]',
              barColor: 'bg-[#2E7D5B]'
            },
            { 
              name: 'Chilled Water Loops', 
              score: 95, 
              status: 'Nominal',
              note: '4.2 bar constant',
              color: 'text-[#2E7D5B]',
              barColor: 'bg-[#2E7D5B]'
            },
            { 
              name: 'Energy Efficiency', 
              score: 88, 
              status: 'Optimal',
              note: '0.96 Power Factor',
              color: 'text-[#2E7D5B]',
              barColor: 'bg-[#2E7D5B]'
            },
          ].map((sys, idx) => (
            <div key={idx} className="bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] p-3 rounded-lg flex flex-col justify-between">
              <div>
                <div className="font-display text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4] truncate">
                  {sys.name}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className={`font-mono text-[18px] font-bold ${sys.color}`}>{sys.score}%</span>
                  <span className={`text-[10px] font-mono uppercase font-bold ${sys.color}`}>{sys.status}</span>
                </div>
                <div className="w-full h-1.5 bg-[#E6E0D6] dark:bg-[#2C3847] rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${sys.barColor}`} style={{ width: `${sys.score}%` }} />
                </div>
              </div>
              <div className="font-mono text-[10px] text-[#8A8175] mt-3 pt-2 border-t border-[#E6E0D6] dark:border-[#2C3847] truncate">
                {sys.note}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. How Aegis Works — Technician Learning Guide */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-5 rounded-xl">
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">Technician 101</span>
          <h3 className="font-display text-[16px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
            How Aegis Predictive Monitoring Works
          </h3>
          <p className="text-[12px] text-[#6E6558] dark:text-[#A0988A] mt-0.5">
            A simple 3-step guide for apprentices and facility maintenance staff.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <div className="w-7 h-7 rounded-md bg-[#2C6E9B]/10 text-[#2C6E9B] flex items-center justify-center font-mono text-[12px] font-bold mb-2">
              01
            </div>
            <h4 className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Sensors Listen 24/7</h4>
            <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-relaxed">
              Inexpensive sensor nodes measure mechanical vibration (mm/s), motor temperature (°C), and electrical current (Amps) every second.
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <div className="w-7 h-7 rounded-md bg-[#2F8A7E]/10 text-[#2F8A7E] flex items-center justify-center font-mono text-[12px] font-bold mb-2">
              02
            </div>
            <h4 className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Detects Tiny Drifts</h4>
            <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-relaxed">
              When grease dries up or a belt loosens, vibration rises before anyone can hear or smell it. Aegis catches this drift days before failure.
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
            <div className="w-7 h-7 rounded-md bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center font-mono text-[12px] font-bold mb-2">
              03
            </div>
            <h4 className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Step-by-Step Fix</h4>
            <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-relaxed">
              Instead of guessing or replacing entire machines, you get a clear checklist: what grease to pump, what bolts to tighten, and what to log.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Quick Operator Shortcuts */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <button
          type="button"
          onClick={() => setTab('console')}
          className="text-left p-3.5 bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg hover:border-[#2C6E9B] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-[#2C6E9B] mb-2">
            <Activity size={18} />
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Live Sensor Console</div>
          <p className="text-[11px] text-[#8A8175] mt-1">Check real-time vibration, amp, and thermal curves.</p>
        </button>

        <button
          type="button"
          onClick={() => setTab('analysis')}
          className="text-left p-3.5 bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg hover:border-[#2C6E9B] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-[#2C6E9B] mb-2">
            <Sliders size={18} />
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Analysis & Triage</div>
          <p className="text-[11px] text-[#8A8175] mt-1">Review probable failure causes and dispatch orders.</p>
        </button>

        <button
          type="button"
          onClick={() => setTab('simulator')}
          className="text-left p-3.5 bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg hover:border-[#2C6E9B] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-[#2C6E9B] mb-2">
            <Gauge size={18} />
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Scenario Simulator</div>
          <p className="text-[11px] text-[#8A8175] mt-1">Simulate heat spikes, high load, and bearing wear.</p>
        </button>

        <button
          type="button"
          onClick={() => onExport('csv')}
          className="text-left p-3.5 bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg hover:border-[#2C6E9B] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-[#2C6E9B] mb-2">
            <FileSpreadsheet size={18} />
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Export Shift Report</div>
          <p className="text-[11px] text-[#8A8175] mt-1">Download CSV of all machine readings for shift handover.</p>
        </button>
      </div>
    </div>
  );
};
