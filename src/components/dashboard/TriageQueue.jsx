import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertTriangle, Wrench, ClipboardList, Eye, FileText, Check } from 'lucide-react';

export const TriageQueue = ({ onCreateWorkOrder, onViewTelemetry, acknowledged, onAcknowledge, workOrders, onPrintFieldSheet }) => {
  return (
    <div className="space-y-3">
      {/* Urgent */}
      <Card className="border-[#C05043]/30 bg-[#FFFFFF] relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C05043]" />
        <div className="pl-2">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="critical">Urgent Triage • Red</Badge>
              <span className="font-mono text-[11px] text-[#6E6558]">Asset: <span className="text-[#1F2933] font-semibold">AHU-03 Primary Supply Fan (East Wing)</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[#8A8175]">CONF 91% • Bearing Degradation</span>
              <div className="w-2 h-2 rounded-full bg-[#C05043] animate-pulse" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <div className="font-mono text-[10px] text-[#8A8175] uppercase tracking-wider mb-1">Observed Pattern</div>
                <div className="font-mono text-[12px] text-[#2A3138] leading-relaxed">Elevated rotational vibration (6.8 mm/s) + 24% current surge + reduced delta-T. <span className="text-[#B07B1C]">Outer race defect frequency detected at 3.2x RPM.</span></div>
              </div>
              <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-[#C05043]" />
                  <span className="font-mono text-[11px] font-semibold text-[#1F2933] uppercase">Explainable Diagnosis</span>
                  <Badge variant="critical">91% Confidence: Mechanical Bearing Degradation (Outer Race)</Badge>
                </div>
                <div className="font-mono text-[10px] text-[#6E6558] leading-relaxed">
                  Correlation chain: <span className="text-[#2A3138]">Vibration ↑ 223%</span> + <span className="text-[#2A3138]">Current Draw ↑ 24%</span> + <span className="text-[#2A3138]">Delta-T ↓ 3.1°C</span> → Mechanical Drag & Bearing Wear. Model: Multivariate Isolation Forest + Spectral Analysis.
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#E6E0D6] rounded text-[#6E6558]">RUL: ~168 hrs</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#C05043]/10 rounded text-[#C05043] border border-[#C05043]/20">Action Window: 7 Days</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-[#8A8175] uppercase tracking-wider mb-1.5">Prescriptive Action Plan</div>
                <ol className="space-y-1 font-mono text-[11px] text-[#3E4650] list-decimal list-inside">
                  <li><span className="font-semibold text-[#1F2933]">Lockout/Tagout</span>: Isolate AHU-03 at disconnect • Verify zero energy (SOP-EL-03).</li>
                  <li><span className="font-semibold text-[#1F2933]">Lubricate & Inspect</span>: Bearing housing grease condition • Check particulate (NLGI #2, 2 pumps).</li>
                  <li><span className="font-semibold text-[#1F2933]">Mechanical Check</span>: Pulley alignment (straight edge &lt;0.5mm) & belt tension (45–55 Hz).</li>
                  <li><span className="font-semibold text-[#1F2933]">Electrical Verification</span>: Phase current under manual bypass (14.2A ±0.5A, imbalance &lt;2%).</li>
                  <li><span className="font-semibold text-[#1F2933]">Post-Repair Validation</span>: Run 10min, target &lt;2.5 mm/s, log to Aegis & close WO.</li>
                </ol>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-[#F1EDE6] rounded-lg border border-[#E6E0D6] p-3">
                <div className="font-mono text-[10px] text-[#8A8175] uppercase mb-2">Field Kit & Inventory</div>
                <div className="space-y-1.5 font-mono text-[10px] text-[#6E6558]">
                  <div className="flex justify-between"><span>• Bearing 6205-2RS (x2)</span><span className="text-[#1F2933] font-bold">Stock: 4 ($12/ea)</span></div>
                  <div className="flex justify-between"><span>• Grease Gun + NLGI #2</span><span className="text-[#2E7D5B] font-bold">Stock: 12 ($5)</span></div>
                  <div className="flex justify-between"><span>• Belt B-62</span><span className="text-[#1F2933] font-bold">Stock: 6 ($18)</span></div>
                  <div className="flex justify-between"><span>• Vibration & Clamp Meters</span><span className="text-[#2E7D5B] font-bold">Calibrated OK</span></div>
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
                <Button variant="teal" size="sm" onClick={onPrintFieldSheet} className="col-span-2">
                  <FileText size={12} className="mr-1.5" /> Print Field Sheet (PDF) • Checklist
                </Button>
              </div>
              {workOrders.find(w=>w.asset==='AHU-03') && (
                <div className="font-mono text-[10px] text-[#2E7D5B] bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 rounded p-2">
                  ✓ Work Order #8821 dispatched to shift lead • ETA: Today 14:30
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Advisory */}
      <Card className="border-[#B07B1C]/20">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="attention">Advisory • Amber</Badge>
            <span className="font-mono text-[11px] text-[#3E4650]">Chilled Water Secondary Pump #2</span>
          </div>
          <span className="font-mono text-[10px] text-[#8A8175]">84% prob • Strainer clogging</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="font-mono text-[11px] text-[#6E6558]">Observed Pattern: Flow rate dropping below pump curve expectations (4.1 L/s vs 5.8 L/s nominal). Suction pressure stable, discharge pressure +0.3 bar deviation.</div>
            <div className="mt-2 font-mono text-[10px] text-[#8A8175]">Diagnosis: Strainer basket partial clogging (84% probability). Action Window: Inspect during scheduled bi-weekly rounds • Tools: isolation valves, drain pan.</div>
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button variant="secondary" size="xs" onClick={() => onCreateWorkOrder('CW-Pump-02', '8822')}><ClipboardList size={10} className="mr-1" /> Work Order #8822</Button>
            <Button variant="ghost" size="xs" onClick={() => onAcknowledge('cwp2')}>{acknowledged.has('cwp2') ? 'Acked' : 'Acknowledge'}</Button>
          </div>
        </div>
      </Card>

      {/* Optimization */}
      <Card className="border-[#2C6E9B]/20">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="info">Optimization • Blue</Badge>
            <span className="font-mono text-[11px] text-[#3E4650]">VAV Box Zone 4B</span>
          </div>
          <span className="font-mono text-[10px] text-[#8A8175]">Actuator hunting • Calibration drift</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="font-mono text-[11px] text-[#6E6558]">Observed Pattern: Actuator hunting between 20% and 80% open every 4 minutes. Supply temp oscillating ±1.2°C, energy waste est. 2.1 kWh/day.</div>
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
