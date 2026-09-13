import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertTriangle, Wrench, ClipboardList, Eye, FileText, Check } from 'lucide-react';

export const TriageQueue = ({ onCreateWorkOrder, onViewTelemetry, acknowledged, onAcknowledge, workOrders }) => {
  return (
    <div className="space-y-3">
      {/* Urgent */}
      <Card className="border-[#EF4444]/30 bg-[#121721] relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF4444]" />
        <div className="pl-2">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="critical">Urgent Triage • Red</Badge>
              <span className="font-mono text-[11px] text-slate-400">Asset: <span className="text-white font-semibold">AHU-03 Primary Supply Fan (East Wing)</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-500">CONF 91% • Bearing Degradation</span>
              <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">Observed Pattern</div>
                <div className="font-mono text-[12px] text-slate-200 leading-relaxed">Elevated rotational vibration (6.8 mm/s) + 24% current surge + reduced delta-T. <span className="text-[#F59E0B]">Outer race defect frequency detected at 3.2x RPM.</span></div>
              </div>
              <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-[#EF4444]" />
                  <span className="font-mono text-[11px] font-semibold text-white uppercase">Explainable Diagnosis</span>
                  <Badge variant="critical">91% Confidence: Mechanical Bearing Degradation (Outer Race)</Badge>
                </div>
                <div className="font-mono text-[10px] text-slate-400 leading-relaxed">
                  Correlation chain: <span className="text-slate-200">Vibration ↑ 223%</span> + <span className="text-slate-200">Current Draw ↑ 24%</span> + <span className="text-slate-200">Delta-T ↓ 3.1°C</span> → Mechanical Drag & Bearing Wear. Model: Multivariate Isolation Forest + Spectral Analysis.
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#1E2638] rounded text-slate-400">RUL: ~168 hrs</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#EF4444]/10 rounded text-[#EF4444] border border-[#EF4444]/20">Action Window: 7 Days</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Prescriptive Action Plan</div>
                <ol className="space-y-1 font-mono text-[11px] text-slate-300 list-decimal list-inside">
                  <li>Lubricate bearing housing and inspect grease condition (NLGI #2, check for metal particulate).</li>
                  <li>Check pulley alignment and belt tension • Tools: straight edge, tension gauge.</li>
                  <li>Verify phase current under manual bypass • Expected: 14.2A ±0.5A.</li>
                </ol>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-[#0B0E14] rounded-lg border border-[#1E2638] p-3">
                <div className="font-mono text-[10px] text-slate-500 uppercase mb-2">Field Kit</div>
                <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
                  <div className="flex justify-between"><span>• Bearing 6205-2RS</span><span className="text-slate-600">Stock: 4</span></div>
                  <div className="flex justify-between"><span>• Grease Gun + NLGI2</span><span className="text-[#10B981]">OK</span></div>
                  <div className="flex justify-between"><span>• Vibration Meter</span><span className="text-[#10B981]">OK</span></div>
                  <div className="flex justify-between"><span>• Clamp Meter Fluke 376</span><span className="text-[#10B981]">OK</span></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="critical" onClick={() => onCreateWorkOrder('AHU-03', '8821')} className="col-span-2">
                  <Wrench size={12} className="mr-1.5" /> Create Work Order #8821
                </Button>
                <Button variant="secondary" onClick={onViewTelemetry}>
                  <Eye size={12} className="mr-1" /> View Trend Telemetry
                </Button>
                <Button variant="secondary" onClick={() => onAcknowledge('ahu03')}>
                  {acknowledged.has('ahu03') ? <><Check size={12} className="mr-1" /> Acked</> : 'Acknowledge'}
                </Button>
                <Button variant="ghost" className="col-span-2 border border-dashed border-[#26324D]">
                  <FileText size={12} className="mr-1" /> Print Field Sheet (PDF)
                </Button>
              </div>
              {workOrders.find(w=>w.asset==='AHU-03') && (
                <div className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded p-2">
                  ✓ Work Order #8821 dispatched to shift lead • ETA: Today 14:30
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Advisory */}
      <Card className="border-[#F59E0B]/20">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="attention">Advisory • Amber</Badge>
            <span className="font-mono text-[11px] text-slate-300">Chilled Water Secondary Pump #2</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">84% prob • Strainer clogging</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="font-mono text-[11px] text-slate-400">Observed Pattern: Flow rate dropping below pump curve expectations (4.1 L/s vs 5.8 L/s nominal). Suction pressure stable, discharge pressure +0.3 bar deviation.</div>
            <div className="mt-2 font-mono text-[10px] text-slate-500">Diagnosis: Strainer basket partial clogging (84% probability). Action Window: Inspect during scheduled bi-weekly rounds • Tools: isolation valves, drain pan.</div>
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button variant="secondary" size="xs" onClick={() => onCreateWorkOrder('CW-Pump-02', '8822')}><ClipboardList size={10} className="mr-1" /> Work Order #8822</Button>
            <Button variant="ghost" size="xs" onClick={() => onAcknowledge('cwp2')}>{acknowledged.has('cwp2') ? 'Acked' : 'Acknowledge'}</Button>
          </div>
        </div>
      </Card>

      {/* Optimization */}
      <Card className="border-[#0EA5E9]/20">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="info">Optimization • Blue</Badge>
            <span className="font-mono text-[11px] text-slate-300">VAV Box Zone 4B</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Actuator hunting • Calibration drift</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="font-mono text-[11px] text-slate-400">Observed Pattern: Actuator hunting between 20% and 80% open every 4 minutes. Supply temp oscillating ±1.2°C, energy waste est. 2.1 kWh/day.</div>
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button variant="secondary" size="xs"><Wrench size={10} className="mr-1" /> Calibrate</Button>
            <Button variant="ghost" size="xs">Dismiss</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
