import React from 'react';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  FileJson, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Hash, 
  Check, 
  Microscope,
  Lock,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function AuditorComplianceCard({ liveVibration = 6.8, onExport }) {
  const currentVib = typeof liveVibration === 'number' ? liveVibration : parseFloat(liveVibration) || 6.8;

  // ISO 10816-3 Class II (15kW–300kW Medium Machines, Rigid Foundation)
  const isoZones = [
    { zone: 'Zone A', range: '< 1.4 mm/s', label: 'Good (Newly Commissioned)', color: '#2E7D5B', bg: 'bg-[#2E7D5B]/10', active: currentVib < 1.4 },
    { zone: 'Zone B', range: '1.4 – 2.8 mm/s', label: 'Acceptable (Unrestricted Run)', color: '#2C6E9B', bg: 'bg-[#2C6E9B]/10', active: currentVib >= 1.4 && currentVib < 2.8 },
    { zone: 'Zone C', range: '2.8 – 7.1 mm/s', label: 'Unsatisfactory (Limited Run)', color: '#B07B1C', bg: 'bg-[#B07B1C]/15', active: currentVib >= 2.8 && currentVib <= 7.1 },
    { zone: 'Zone D', range: '> 7.1 mm/s', label: 'Unacceptable (Shutdown Hazard)', color: '#C05043', bg: 'bg-[#C05043]/15', active: currentVib > 7.1 },
  ];

  const currentZone = currentVib > 7.1 ? 'Zone D' : currentVib >= 2.8 ? 'Zone C' : currentVib >= 1.4 ? 'Zone B' : 'Zone A';

  return (
    <Card className="border-[#B07B1C]/40 bg-[#FFFFFF] dark:bg-[#1A222B] shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#B07B1C]/15 text-[#B07B1C] flex items-center justify-center font-bold">
            <Microscope size={14} />
          </div>
          <div>
            <CardTitle>ISO 10816-3 Vibration Severity Compliance & Explainability Audit</CardTitle>
            <p className="text-[10px] text-[#8A8175] font-mono mt-0.5">
              Standard: ISO 10816-3 • Class II Medium Rotating Machinery (15–300 kW Rigid Support)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="attention">Audit Mode</Badge>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#B07B1C]/10 text-[#B07B1C] border border-[#B07B1C]/20 font-bold">
            Current: {currentZone} ({currentVib} mm/s)
          </span>
        </div>
      </CardHeader>

      <div className="space-y-4 font-mono text-[11px]">
        {/* ISO 10816-3 Visual Severity Bar */}
        <div className="bg-[#FAF8F4] dark:bg-[#141B22] p-3.5 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847]">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#8A8175] mb-2">
            <span>ISO 10816-3 Severity Zones</span>
            <span className="text-[#C05043]">AHU-03: 6.8 mm/s RMS (96% of Zone C Limit)</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {isoZones.map((z) => (
              <div 
                key={z.zone} 
                className={`p-2 rounded border text-center transition-all ${
                  z.active 
                    ? 'border-[#B07B1C] ring-2 ring-[#B07B1C]/30 font-bold shadow-sm' 
                    : 'border-[#E6E0D6] dark:border-[#2C3847] opacity-60'
                } ${z.bg}`}
              >
                <div className="text-[10px] font-bold" style={{ color: z.color }}>{z.zone}</div>
                <div className="text-[9px] text-[#1F2933] dark:text-[#FAF8F4] font-semibold">{z.range}</div>
                <div className="text-[8px] text-[#8A8175] truncate mt-0.5">{z.label.split(' ')[0]}</div>
                {z.active && (
                  <span className="inline-block mt-1 text-[8px] bg-[#B07B1C] text-white px-1 rounded uppercase">
                    Current Reading
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2.5 text-[10px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
            <strong>Auditor Assessment:</strong> Machine is operating in <em>Zone C (Unsatisfactory)</em>. Continued operation is permitted under monitored conditions, but corrective bearing overhaul must occur within 168 hours to prevent crossover into Zone D catastrophic failure.
          </div>
        </div>

        {/* Mathematical Model Explainability Grid */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="text-[9px] uppercase font-bold text-[#8A8175] mb-1">Spectral Harmonic Peak</div>
            <div className="text-[14px] font-bold text-[#C05043]">3.2x RPM (BPFO)</div>
            <div className="text-[10px] text-[#8A8175] mt-1">Outer Race Ball Pass Frequency matches 6205-2RS geometric ball count.</div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="text-[9px] uppercase font-bold text-[#8A8175] mb-1">Isolation Forest Anomaly</div>
            <div className="text-[14px] font-bold text-[#2C6E9B]">Score: 0.91 (91%)</div>
            <div className="text-[10px] text-[#8A8175] mt-1">Multivariate correlation across vibration, current, and delta-T dimensions.</div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="text-[9px] uppercase font-bold text-[#8A8175] mb-1">ARIMA Residual Z-Score</div>
            <div className="text-[14px] font-bold text-[#B07B1C]">+3.82 σ Drift</div>
            <div className="text-[10px] text-[#8A8175] mt-1">Exceeds 3.0σ standard deviation boundary from 14-day seasonal baseline.</div>
          </div>
        </div>

        {/* Compliance Ledger Export Actions */}
        <div className="pt-2 border-t border-[#E6E0D6] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] text-[#8A8175]">
            <Hash size={12} className="text-[#B07B1C]" />
            <span>Audit Ledger SHA-256: <code className="text-[#1F2933] dark:text-[#FAF8F4]">e89b...3c14</code> &bull; Immutable Log</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="xs" onClick={() => onExport?.('csv')}>
              <FileSpreadsheet size={11} className="mr-1 text-[#2E7D5B]" /> Export ISO CSV
            </Button>
            <Button variant="secondary" size="xs" onClick={() => onExport?.('json')}>
              <FileJson size={11} className="mr-1 text-[#2C6E9B]" /> Export Full JSON
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
