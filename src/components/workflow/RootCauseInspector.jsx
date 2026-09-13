import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GitBranch, Eye, Cpu, AlertTriangle } from 'lucide-react';

export const RootCauseInspector = ({ mode = 'fault' }) => {
  return (
    <Card className="border-[#0EA5E9]/20">
      <CardHeader>
        <CardTitle>Root Cause Inspector • Explainable AI • No Black Box</CardTitle>
        <Badge variant="info">Transparent Model</Badge>
      </CardHeader>
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-5 space-y-3">
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={12} className="text-[#0EA5E9]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Multivariate Correlation Chain</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="w-6 h-6 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">1</div>
                <span className="text-slate-300">Vibration Velocity</span>
                <span className="text-[#EF4444] font-bold">6.8 mm/s (+172%)</span>
                <span className="text-slate-500 text-[10px]">MPU6050</span>
              </div>
              <div className="ml-3 w-px h-4 bg-[#1E2638]" />
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="w-6 h-6 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">2</div>
                <span className="text-slate-300">Current Draw</span>
                <span className="text-[#F59E0B] font-bold">17.6A (+24%)</span>
                <span className="text-slate-500 text-[10px]">ACS712</span>
              </div>
              <div className="ml-3 w-px h-4 bg-[#1E2638]" />
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="w-6 h-6 rounded bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center text-[#0EA5E9]">3</div>
                <span className="text-slate-300">Delta-T Drop</span>
                <span className="text-[#0EA5E9] font-bold">-3.1°C</span>
                <span className="text-slate-500 text-[10px]">DHT22</span>
              </div>
            </div>
            <div className="mt-3 p-2 rounded bg-[#EF4444]/5 border border-[#EF4444]/20 font-mono text-[11px] text-[#EF4444]">
              → Mechanical Drag & Bearing Wear • Outer Race Defect Frequency 3.2x RPM • Confidence 91%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5">
              <div className="font-mono text-[9px] uppercase text-slate-500">Model</div>
              <div className="font-mono text-[11px] text-white mt-1">Isolation Forest + FFT</div>
              <div className="font-mono text-[9px] text-slate-600 mt-1">Trained on 14D seasonal</div>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2.5">
              <div className="font-mono text-[9px] uppercase text-slate-500">Baseline</div>
              <div className="font-mono text-[11px] text-[#10B981] mt-1">8–10 kWh nominal</div>
              <div className="font-mono text-[9px] text-slate-600 mt-1">Learned per cycle</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-3">
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={12} className="text-[#14B8A6]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Physical System Correlation</span>
              <Badge variant="neutral">AHU-03</Badge>
            </div>
            <div className="relative">
              <svg viewBox="0 0 360 120" className="w-full h-[120px]">
                {/* nodes */}
                <rect x="10" y="10" width="80" height="30" rx="6" fill="#1E2638" stroke="#26324D" />
                <text x="50" y="28" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#94A3B8">Motor 15kW</text>
                <rect x="130" y="10" width="80" height="30" rx="6" fill="#EF4444" fillOpacity="0.1" stroke="#EF4444" strokeOpacity="0.3" />
                <text x="170" y="22" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#EF4444">Bearing 6205</text>
                <text x="170" y="32" textAnchor="middle" fontSize="7" fontFamily="JetBrains Mono" fill="#F59E0B">Outer Race Wear</text>
                <rect x="250" y="10" width="80" height="30" rx="6" fill="#1E2638" stroke="#26324D" />
                <text x="290" y="28" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#94A3B8">Supply Fan</text>
                {/* arrows */}
                <line x1="90" y1="25" x2="130" y2="25" stroke="#475569" strokeWidth="1" markerEnd="url(#arrow)" />
                <line x1="210" y1="25" x2="250" y2="25" stroke="#475569" strokeWidth="1" />
                {/* sensors */}
                <rect x="10" y="70" width="70" height="24" rx="5" fill="#0EA5E9" fillOpacity="0.1" stroke="#0EA5E9" strokeOpacity="0.3" />
                <text x="45" y="84" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#0EA5E9">Vib 6.8mm/s</text>
                <rect x="100" y="70" width="70" height="24" rx="5" fill="#F59E0B" fillOpacity="0.1" stroke="#F59E0B" strokeOpacity="0.3" />
                <text x="135" y="84" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#F59E0B">Current 17.6A</text>
                <rect x="190" y="70" width="70" height="24" rx="5" fill="#14B8A6" fillOpacity="0.1" stroke="#14B8A6" strokeOpacity="0.3" />
                <text x="225" y="84" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#14B8A6">ΔT -3.1°C</text>
                <line x1="45" y1="70" x2="45" y2="40" stroke="#1E2638" strokeDasharray="3 2" />
                <line x1="135" y1="70" x2="135" y2="40" stroke="#1E2638" strokeDasharray="3 2" />
                <line x1="225" y1="70" x2="225" y2="40" stroke="#1E2638" strokeDasharray="3 2" />
              </svg>
            </div>
            <div className="mt-2 font-mono text-[10px] text-slate-500">Mechanical binding increases friction → motor draws more current → reduced airflow → delta-T drops. All three must correlate to avoid false positives.</div>
          </div>

          <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-2.5 flex gap-2">
            <AlertTriangle size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="font-mono text-[10px] leading-relaxed text-slate-300">
              <span className="text-[#F59E0B] font-bold">Why not static threshold?</span> Temperature &gt;24°C would fire 247 false alarms. Aegis learns normal seasonal boundaries (8–10 kWh) and flags subtle multi-parameter drift before thermal safety switch trips. Prevents alert fatigue.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
