import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  AlertTriangle, 
  Wrench, 
  ClipboardList, 
  Eye, 
  FileText, 
  Check, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TriageQueue = ({ 
  onCreateWorkOrder, 
  onViewTelemetry, 
  acknowledged = new Set(), 
  onAcknowledge, 
  workOrders = [], 
  onPrintFieldSheet 
}) => {
  const { user, permissions } = useAuth();
  const role = user?.role || 'manager';
  const isReadOnly = permissions?.isReadOnly;
  const [activeDrawer, setActiveDrawer] = useState(null); // 'sop' | 'parts' | null

  const isDispatched = workOrders?.some(w => w.asset === 'AHU-03' || w.id === '8821');

  const toggleDrawer = (drawer) => {
    setActiveDrawer(prev => prev === drawer ? null : drawer);
  };

  return (
    <div className="space-y-3">
      {/* 1. Urgent Card: AHU-03 */}
      <Card className="border-l-4 border-l-[#C05043] border-[#D2C9BA] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="critical">Urgent Triage</Badge>
            <span className="font-mono text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              AHU-03 Primary Supply Fan
            </span>
            <span className="font-mono text-[11px] text-[#8A8175]">East Wing (Roof Level 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#C05043] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C05043] animate-pulse" />
              91% Confidence • Bearing Degradation
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] text-[#8A8175]">
              Window: 7 Days (RUL ~168h)
            </span>
          </div>
        </div>

        {/* Minimal Spec Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[#E6E0D6] dark:border-[#2C3847] my-3">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">Defect Signature</div>
            <div className="font-mono text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5">Outer Race Spall</div>
            <div className="font-mono text-[10px] text-[#B07B1C]">3.2× RPM Harmonics</div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">Vibration (RMS)</div>
            <div className="font-mono text-[12px] font-bold text-[#C05043] mt-0.5">6.8 mm/s</div>
            <div className="font-mono text-[10px] text-[#C05043]">+172% over limit</div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">Phase Current</div>
            <div className="font-mono text-[12px] font-bold text-[#B07B1C] mt-0.5">17.6 A</div>
            <div className="font-mono text-[10px] text-[#B07B1C]">+24% friction drag</div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">Diagnosis Model</div>
            <div className="font-mono text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5">Isolation Forest + FFT</div>
            <div className="font-mono text-[10px] text-[#2E7D5B]">ARIMA Base: 8–10 kWh</div>
          </div>
        </div>

        {/* Explainability & Drawers Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="text-[#554D42] dark:text-[#C5BCAD]">
            <span className="font-semibold text-[#1F2933] dark:text-[#FAF8F4]">Correlation chain:</span> Vibration ↑ (6.8 mm/s) + Current ↑ (17.6A) + ΔT ↓ (-3.1°C) → Mechanical Drag.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleDrawer('sop')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                activeDrawer === 'sop' 
                  ? 'bg-[#2C6E9B] text-white' 
                  : 'bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
              }`}
            >
              <FileText size={11} />
              <span>Prescriptive SOP (5 Steps)</span>
              {activeDrawer === 'sop' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            <button
              type="button"
              onClick={() => toggleDrawer('parts')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                activeDrawer === 'parts' 
                  ? 'bg-[#2C6E9B] text-white' 
                  : 'bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
              }`}
            >
              <Package size={11} />
              <span>Field Kit ($47)</span>
              {activeDrawer === 'parts' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        </div>

        {/* Drawer: SOP Action Plan */}
        {activeDrawer === 'sop' && (
          <div className="mt-3 p-3.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg animate-in fade-in">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10px] uppercase font-bold text-[#8A8175]">Prescriptive Standard Operating Procedure • AHU-03</span>
              <span className="font-mono text-[10px] text-[#2E7D5B] font-semibold">Estimated Duration: 45 min</span>
            </div>
            <ol className="space-y-1.5 font-mono text-[11px] text-[#3E4650] dark:text-[#C5BCAD]">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#E6E0D6] dark:bg-[#2C3847] flex items-center justify-center text-[10px] font-bold text-[#1F2933] dark:text-[#FAF8F4] shrink-0 mt-0.5">1</span>
                <span><strong className="text-[#1F2933] dark:text-[#FAF8F4]">Lockout/Tagout:</strong> Isolate AHU-03 at main disconnect • Verify zero energy (SOP-EL-03).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#E6E0D6] dark:bg-[#2C3847] flex items-center justify-center text-[10px] font-bold text-[#1F2933] dark:text-[#FAF8F4] shrink-0 mt-0.5">2</span>
                <span><strong className="text-[#1F2933] dark:text-[#FAF8F4]">Lubricate & Inspect:</strong> Inspect bearing housing grease for metal particles • Apply 2 pumps NLGI #2.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#E6E0D6] dark:bg-[#2C3847] flex items-center justify-center text-[10px] font-bold text-[#1F2933] dark:text-[#FAF8F4] shrink-0 mt-0.5">3</span>
                <span><strong className="text-[#1F2933] dark:text-[#FAF8F4]">Mechanical Check:</strong> Check pulley alignment (straight edge &lt;0.5mm offset) & belt tension (45–55 Hz).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#E6E0D6] dark:bg-[#2C3847] flex items-center justify-center text-[10px] font-bold text-[#1F2933] dark:text-[#FAF8F4] shrink-0 mt-0.5">4</span>
                <span><strong className="text-[#1F2933] dark:text-[#FAF8F4]">Electrical Verification:</strong> Verify phase current under manual bypass (14.2A ±0.5A, imbalance &lt;2%).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#E6E0D6] dark:bg-[#2C3847] flex items-center justify-center text-[10px] font-bold text-[#1F2933] dark:text-[#FAF8F4] shrink-0 mt-0.5">5</span>
                <span><strong className="text-[#1F2933] dark:text-[#FAF8F4]">Post-Repair Validation:</strong> Run 10min test, confirm vibration &lt;2.5 mm/s, log telemetry and close WO.</span>
              </li>
            </ol>
          </div>
        )}

        {/* Drawer: Parts Inventory */}
        {activeDrawer === 'parts' && (
          <div className="mt-3 p-3.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg animate-in fade-in">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10px] uppercase font-bold text-[#8A8175]">Field Kit & Replacement Stock • Total Kit: ~$47</span>
              <span className="font-mono text-[10px] text-[#2E7D5B] font-semibold">All Items In Stock</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="p-2.5 bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md">
                <div className="text-[10px] text-[#8A8175]">Bearing (x2)</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">6205-2RS SKF</div>
                <div className="text-[10px] text-[#2E7D5B] mt-0.5">Stock: 4 ($12/ea)</div>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md">
                <div className="text-[10px] text-[#8A8175]">Grease Gun</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">NLGI #2 Synth</div>
                <div className="text-[10px] text-[#2E7D5B] mt-0.5">Stock: 12 ($5)</div>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md">
                <div className="text-[10px] text-[#8A8175]">Drive Belt</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">Optibelt B-62</div>
                <div className="text-[10px] text-[#2E7D5B] mt-0.5">Stock: 6 ($18)</div>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-md">
                <div className="text-[10px] text-[#8A8175]">Diagnostics</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4]">Vib + Clamp Meter</div>
                <div className="text-[10px] text-[#2E7D5B] mt-0.5">Calibrated OK</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-4 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-3">
          <div>
            {isDispatched ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2E7D5B]/10 border border-[#2E7D5B]/30 font-mono text-[11px] text-[#2E7D5B] font-semibold">
                <CheckCircle2 size={13} />
                <span>Work Order #8821 dispatched to shift lead • ETA: Today 14:30</span>
              </div>
            ) : isReadOnly ? (
              <Button 
                variant="outline" 
                size="sm"
                disabled 
                className="border-[#B07B1C]/50 text-[#B07B1C] bg-[#B07B1C]/5 cursor-not-allowed opacity-90 text-[11px]"
              >
                <Lock size={12} className="mr-1.5" /> Read-Only Compliance • Dispatch Restricted to Operations Lead
              </Button>
            ) : (
              <Button 
                variant="critical" 
                size="sm"
                onClick={() => onCreateWorkOrder('AHU-03', '8821')}
              >
                <Wrench size={13} className="mr-1.5" /> Dispatch Work Order #8821
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onViewTelemetry}>
              <Eye size={12} className="mr-1" /> View Trends
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onPrintFieldSheet}
              className={role === 'technician' ? 'ring-1 ring-[#2E7D5B] text-[#2E7D5B]' : ''}
            >
              <FileText size={12} className="mr-1" /> Field Sheet (PDF)
            </Button>
            {isReadOnly ? (
              <span className="font-mono text-[11px] text-[#8A8175] px-2 py-1">Audited</span>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onAcknowledge('ahu03')}
              >
                {acknowledged?.has?.('ahu03') ? (
                  <span className="flex items-center text-[#2E7D5B] font-mono"><Check size={12} className="mr-1" /> Acked</span>
                ) : (
                  <span className="font-mono text-[#8A8175] hover:text-[#1F2933]">Acknowledge</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Advisory Card: CW-Pump-02 */}
      <Card className="border-[#D2C9BA] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <Badge variant="attention">Advisory</Badge>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  CW-Pump-02 • Chilled Water Secondary Pump #2
                </span>
                <span className="font-mono text-[10px] text-[#8A8175]">84% prob • Strainer clogging</span>
              </div>
              <p className="font-mono text-[11px] text-[#6E6558] dark:text-[#A0988A] truncate mt-0.5">
                Flow 4.1 L/s (nominal 5.8 L/s) &bull; Discharge +0.3 bar &bull; Action: Inspect during bi-weekly rounds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isReadOnly ? (
              <span className="font-mono text-[10px] text-[#8A8175]">Restricted</span>
            ) : (
              <Button variant="secondary" size="xs" onClick={() => onCreateWorkOrder('CW-Pump-02', '8822')}>
                <ClipboardList size={11} className="mr-1" /> Work Order #8822
              </Button>
            )}
            <Button variant="ghost" size="xs" onClick={() => !isReadOnly && onAcknowledge('cwp2')}>
              {acknowledged?.has?.('cwp2') ? (
                <span className="flex items-center text-[#2E7D5B] font-mono"><Check size={11} className="mr-1" /> Acked</span>
              ) : (
                'Acknowledge'
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Optimization Card: VAV-4B */}
      <Card className="border-[#D2C9BA] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <Badge variant="info">Optimization</Badge>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  VAV-4B • Variable Air Volume Box Zone 4B
                </span>
                <span className="font-mono text-[10px] text-[#8A8175]">Actuator hunting • Calibration drift</span>
              </div>
              <p className="font-mono text-[11px] text-[#6E6558] dark:text-[#A0988A] truncate mt-0.5">
                Cycling 20%–80% every 4m &bull; Supply oscillating ±1.2°C &bull; Est. waste: 2.1 kWh/day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="xs">
              <Wrench size={11} className="mr-1" /> Calibrate
            </Button>
            <Button variant="ghost" size="xs">
              Dismiss
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
