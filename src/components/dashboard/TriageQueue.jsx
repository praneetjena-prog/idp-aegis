import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertTriangle, Wrench, Eye, Check, Printer, Clock, ArrowRight } from 'lucide-react';

export const TriageQueue = ({ 
  onCreateWorkOrder, 
  onViewTelemetry, 
  acknowledged, 
  onAcknowledge, 
  workOrders,
  onOpenFieldSheet 
}) => {
  const isAhuDispatched = workOrders.some(w => w.asset === 'AHU-03' || w.id === '8821');
  const isPumpDispatched = workOrders.some(w => w.asset === 'CW-Pump-02' || w.id === '8822');

  return (
    <div className="space-y-3">
      {/* 1. Critical Priority Ticket */}
      <Card className="border-l-4 border-l-[#C05043] border-[#E6E0D6] bg-[#FFFFFF] shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#E6E0D6]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#C05043] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              Critical Alert • WO-8821
            </span>
            <h3 className="font-display text-[14px] font-bold text-[#1F2933]">
              AHU-03 Primary Supply Fan (East Wing, Roof Level 3)
            </h3>
            <span className="font-mono text-[10px] text-[#8A8175]">
              Fault: <strong className="text-[#C05043]">Bearing Outer Race Wear (91% Conf)</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-[#C05043] font-bold">
              <Clock size={12} /> Action Window: 7 Days (RUL ~168h)
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 pt-3 items-center">
          {/* Key Telemetry Chips */}
          <div className="lg:col-span-4 flex flex-wrap gap-2">
            <div className="px-2.5 py-1.5 rounded bg-[#C05043]/10 border border-[#C05043]/20 font-mono text-[10px]">
              <span className="text-[#8A8175] block text-[9px]">VIBRATION</span>
              <strong className="text-[#C05043] text-[12px]">6.8 mm/s</strong> (+172%)
            </div>
            <div className="px-2.5 py-1.5 rounded bg-[#B07B1C]/10 border border-[#B07B1C]/20 font-mono text-[10px]">
              <span className="text-[#8A8175] block text-[9px]">DRIVE AMPS</span>
              <strong className="text-[#B07B1C] text-[12px]">17.6 A</strong> (+24%)
            </div>
            <div className="px-2.5 py-1.5 rounded bg-[#2C6E9B]/10 border border-[#2C6E9B]/20 font-mono text-[10px]">
              <span className="text-[#8A8175] block text-[9px]">BEARING TEMP</span>
              <strong className="text-[#2C6E9B] text-[12px]">71.8°C</strong> (+38%)
            </div>
          </div>

          {/* Action Directive */}
          <div className="lg:col-span-5 font-mono text-[11px] text-[#554D42] leading-relaxed">
            <div><strong className="text-[#1F2933]">Direct Service Task:</strong> Relubricate bearing housing with NLGI #2 grease, verify belt tension (45–55 Hz) & check motor amp balance under manual bypass.</div>
            <div className="text-[10px] text-[#8A8175] mt-1">Required: SKF 6205-2RS bearing • Grease gun • Clamp meter • Fluke 376</div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-3 flex flex-wrap gap-2 justify-start lg:justify-end">
            <Button 
              variant={isAhuDispatched ? "secondary" : "critical"} 
              size="xs" 
              onClick={() => onCreateWorkOrder('AHU-03', '8821')}
              disabled={isAhuDispatched}
            >
              <Wrench size={11} className="mr-1" />
              {isAhuDispatched ? 'WO #8821 Active' : 'Dispatch WO'}
            </Button>
            <Button 
              variant="secondary" 
              size="xs" 
              onClick={() => onAcknowledge('ahu03')}
            >
              {acknowledged.has('ahu03') ? <><Check size={11} className="mr-1 text-[#2E7D5B]" /> Acked</> : 'Acknowledge'}
            </Button>
            <Button 
              variant="ghost" 
              size="xs" 
              onClick={onViewTelemetry}
            >
              <Eye size={11} className="mr-1" /> Spectrum
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Advisory Priority Ticket */}
      <Card className="border-l-4 border-l-[#B07B1C] border-[#E6E0D6] bg-[#FFFFFF] shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#E6E0D6]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#B07B1C] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              Advisory Alert • WO-8822
            </span>
            <h3 className="font-display text-[14px] font-bold text-[#1F2933]">
              Chilled Water Secondary Pump #2 (Basement Plant Room)
            </h3>
            <span className="font-mono text-[10px] text-[#8A8175]">
              Fault: <strong className="text-[#B07B1C]">Strainer Basket Restriction (84% Prob)</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-[#B07B1C] font-semibold">
              Action Window: Bi-Weekly PM Window
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 pt-3 items-center">
          <div className="lg:col-span-4 flex flex-wrap gap-2">
            <div className="px-2.5 py-1.5 rounded bg-[#B07B1C]/10 border border-[#B07B1C]/20 font-mono text-[10px]">
              <span className="text-[#8A8175] block text-[9px]">FLOW RATE</span>
              <strong className="text-[#B07B1C] text-[12px]">4.1 L/s</strong> (Nom 5.8 L/s)
            </div>
            <div className="px-2.5 py-1.5 rounded bg-[#FAF8F4] border border-[#E6E0D6] font-mono text-[10px]">
              <span className="text-[#8A8175] block text-[9px]">PRESSURE DROP</span>
              <strong className="text-[#1F2933] text-[12px]">+0.3 bar</strong> (Across basket)
            </div>
          </div>

          <div className="lg:col-span-5 font-mono text-[11px] text-[#554D42] leading-relaxed">
            <div><strong className="text-[#1F2933]">Direct Service Task:</strong> Isolate pump suction/discharge valves, drain strainer housing, clear debris from mesh basket, inspect O-ring seal.</div>
          </div>

          <div className="lg:col-span-3 flex flex-wrap gap-2 justify-start lg:justify-end">
            <Button 
              variant={isPumpDispatched ? "secondary" : "primary"} 
              size="xs" 
              onClick={() => onCreateWorkOrder('CW-Pump-02', '8822')}
              disabled={isPumpDispatched}
            >
              <Wrench size={11} className="mr-1" />
              {isPumpDispatched ? 'WO #8822 Active' : 'Dispatch WO'}
            </Button>
            <Button 
              variant="secondary" 
              size="xs" 
              onClick={() => onAcknowledge('cwp2')}
            >
              {acknowledged.has('cwp2') ? <><Check size={11} className="mr-1 text-[#2E7D5B]" /> Acked</> : 'Acknowledge'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Energy Optimization Notice */}
      <Card className="border-l-4 border-l-[#2C6E9B] border-[#E6E0D6] bg-[#FFFFFF] shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#2C6E9B] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              Optimization
            </span>
            <h3 className="font-display text-[14px] font-bold text-[#1F2933]">
              VAV Box Zone 4B (2nd Floor North)
            </h3>
            <span className="font-mono text-[10px] text-[#6E6558]">
              Actuator hunting (20%–80% cycling every 4 min) • Estimated energy loss: ~2.1 kWh/day
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="xs">Auto-Calibrate Actuator</Button>
            <Button variant="ghost" size="xs">Dismiss</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
