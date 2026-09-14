import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GitBranch, Eye, Cpu, AlertTriangle } from 'lucide-react';

export const RootCauseInspector = ({ mode = 'fault' }) => {
  return (
    <Card className="border-[#2C6E9B]/20">
      <CardHeader>
        <CardTitle>Root Cause Inspector • Explainable AI • No Black Box</CardTitle>
        <Badge variant="info">Transparent Model</Badge>
      </CardHeader>
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-5 space-y-3">
          <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={12} className="text-[#2C6E9B]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6E6558]">Multivariate Correlation Chain</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="w-6 h-6 rounded bg-[#C05043]/10 border border-[#C05043]/20 flex items-center justify-center text-[#C05043]">1</div>
                <span className="text-[#3E4650]">Vibration Velocity</span>
                <span className="text-[#C05043] font-bold">6.8 mm/s (+172%)</span>
                <span className="text-[#8A8175] text-[10px]">MPU6050</span>
              </div>
              <div className="ml-3 w-px h-4 bg-[#E6E0D6]" />
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="w-6 h-6 rounded bg-[#B07B1C]/10 border border-[#B07B1C]/20 flex items-center justify-center text-[#B07B1C]">2</div>
                <span className="text-[#3E4650]">Current Draw</span>
                <span className="text-[#B07B1C] font-bold">17.6A (+24%)</span>
                <span className="text-[#8A8175] text-[10px]">ACS712</span>
              </div>
              <div className="ml-3 w-px h-4 bg-[#E6E0D6]" />
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="w-6 h-6 rounded bg-[#2C6E9B]/10 border border-[#2C6E9B]/20 flex items-center justify-center text-[#2C6E9B]">3</div>
                <span className="text-[#3E4650]">Delta-T Drop</span>
                <span className="text-[#2C6E9B] font-bold">-3.1°C</span>
                <span className="text-[#8A8175] text-[10px]">DHT22</span>
              </div>
            </div>
            <div className="mt-3 p-2 rounded bg-[#C05043]/5 border border-[#C05043]/20 font-mono text-[11px] text-[#C05043]">
              → Mechanical Drag & Bearing Wear • Outer Race Defect Frequency 3.2x RPM • Confidence 91%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-2.5">
              <div className="font-mono text-[9px] uppercase text-[#8A8175]">Model</div>
              <div className="font-mono text-[11px] text-[#1F2933] mt-1">Isolation Forest + FFT</div>
              <div className="font-mono text-[9px] text-[#A99F90] mt-1">Trained on 14D seasonal</div>
            </div>
            <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-2.5">
              <div className="font-mono text-[9px] uppercase text-[#8A8175]">Baseline</div>
              <div className="font-mono text-[11px] text-[#2E7D5B] mt-1">8–10 kWh nominal</div>
              <div className="font-mono text-[9px] text-[#A99F90] mt-1">Learned per cycle</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-3">
          <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={12} className="text-[#2F8A7E]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6E6558]">Physical System Correlation</span>
              <Badge variant="neutral">AHU-03</Badge>
            </div>
            <div className="relative">
              <svg viewBox="0 0 360 120" className="w-full h-[120px]">
                {/* nodes */}
                <rect x="10" y="10" width="80" height="30" rx="6" fill="#E6E0D6" stroke="#D2C9BA" />
                <text x="50" y="28" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#A99F90">Motor 15kW</text>
                <rect x="130" y="10" width="80" height="30" rx="6" fill="#C05043" fillOpacity="0.1" stroke="#C05043" strokeOpacity="0.3" />
                <text x="170" y="22" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#C05043">Bearing 6205</text>
                <text x="170" y="32" textAnchor="middle" fontSize="7" fontFamily="JetBrains Mono" fill="#B07B1C">Outer Race Wear</text>
                <rect x="250" y="10" width="80" height="30" rx="6" fill="#E6E0D6" stroke="#D2C9BA" />
                <text x="290" y="28" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#A99F90">Supply Fan</text>
                {/* arrows */}
                <line x1="90" y1="25" x2="130" y2="25" stroke="#6E6558" strokeWidth="1" markerEnd="url(#arrow)" />
                <line x1="210" y1="25" x2="250" y2="25" stroke="#6E6558" strokeWidth="1" />
                {/* sensors */}
                <rect x="10" y="70" width="70" height="24" rx="5" fill="#2C6E9B" fillOpacity="0.1" stroke="#2C6E9B" strokeOpacity="0.3" />
                <text x="45" y="84" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#2C6E9B">Vib 6.8mm/s</text>
                <rect x="100" y="70" width="70" height="24" rx="5" fill="#B07B1C" fillOpacity="0.1" stroke="#B07B1C" strokeOpacity="0.3" />
                <text x="135" y="84" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#B07B1C">Current 17.6A</text>
                <rect x="190" y="70" width="70" height="24" rx="5" fill="#2F8A7E" fillOpacity="0.1" stroke="#2F8A7E" strokeOpacity="0.3" />
                <text x="225" y="84" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#2F8A7E">ΔT -3.1°C</text>
                <line x1="45" y1="70" x2="45" y2="40" stroke="#E6E0D6" strokeDasharray="3 2" />
                <line x1="135" y1="70" x2="135" y2="40" stroke="#E6E0D6" strokeDasharray="3 2" />
                <line x1="225" y1="70" x2="225" y2="40" stroke="#E6E0D6" strokeDasharray="3 2" />
              </svg>
            </div>
            <div className="mt-2 font-mono text-[10px] text-[#8A8175]">Mechanical binding increases friction → motor draws more current → reduced airflow → delta-T drops. All three must correlate to avoid false positives.</div>
          </div>

          <div className="bg-[#B07B1C]/5 border border-[#B07B1C]/20 rounded-lg p-2.5 flex gap-2">
            <AlertTriangle size={14} className="text-[#B07B1C] shrink-0 mt-0.5" />
            <div className="font-mono text-[10px] leading-relaxed text-[#3E4650]">
              <span className="text-[#B07B1C] font-bold">Why not static threshold?</span> Temperature &gt;24°C would fire 247 false alarms. Aegis learns normal seasonal boundaries (8–10 kWh) and flags subtle multi-parameter drift before thermal safety switch trips. Prevents alert fatigue.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
