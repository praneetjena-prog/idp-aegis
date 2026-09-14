import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Database, Eye, GitBranch, TrendingUp, Wrench } from 'lucide-react';

const pillars = [
  { id: 1, title: "Unified Telemetry Bus", icon: Database, desc: "Ingests thermal, acoustic, electrical, and hydraulic sensor data into one synchronized timeline.", detail: "1,428 points @ 1-15min • MQTT • Time-sync NTP • 38 assets", example: "DHT22 + ACS712 + MPU6050 + YF-S201 → single timestamp" },
  { id: 2, title: "Transparent Baseline Modeling", icon: Eye, desc: "Learns what 'normal' looks like per operational cycle.", detail: "Seasonal ARIMA • Per-asset envelope • No black box", example: "HVAC runs at 8–10 kWh standard. 17 kWh + vibration = flagged before thermal trip." },
  { id: 3, title: "Cross-System Fault Correlation", icon: GitBranch, desc: "Connects the physical chain.", detail: "Vibration ↑ + Current Draw ↑ + Delta-T ↓ → Mechanical Drag", example: "Isolation Forest correlates 3 params → bearing wear vs belt slip vs clog" },
  { id: 4, title: "Failure Trajectory Forecasting", icon: TrendingUp, desc: "Replaces ambiguous error codes with an estimated degradation timeline and remaining useful hours.", detail: "RUL estimation • 168h window • Confidence intervals", example: "Outer race defect: RUL 168h ±24h • Phase current trend slope 0.12A/day" },
  { id: 5, title: "Practical Maintenance Guidance", icon: Wrench, desc: "Converts raw math into a clear work order: recommended tools, replacement parts, and prioritized steps.", detail: "Auto work order • Tool list • Stock check • Print field sheet", example: "Lubricate, check pulley, verify phase current under bypass" },
];

export const Pillars = () => {
  const [active, setActive] = useState(1);
  const activePillar = pillars.find(p => p.id === active);
  return (
    <div className="grid lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 space-y-2">
        {pillars.map(p => {
          const Icon = p.icon;
          const isActive = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-[10px] border transition-all ${isActive ? 'bg-[#2C6E9B]/10 border-[#2C6E9B]/30' : 'bg-[#FFFFFF] border-[#E6E0D6] hover:border-[#D2C9BA] hover:bg-[#FAF8F4]'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${isActive ? 'bg-[#2C6E9B] text-[#FFFFFF] border-[#2C6E9B]' : 'bg-[#E6E0D6] text-[#6E6558] border-[#D2C9BA]'}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#8A8175]">0{p.id}</span>
                  <span className={`font-mono text-[12px] font-semibold uppercase tracking-wide ${isActive ? 'text-[#1F2933]' : 'text-[#3E4650]'}`}>{p.title}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] leading-[1.5] text-[#6E6558] line-clamp-2">{p.desc}</div>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2C6E9B] mt-2 animate-pulse" />}
            </button>
          );
        })}
      </div>
      <div className="lg:col-span-7">
        <Card className="h-full border-[#2C6E9B]/20 bg-[#FFFFFF]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#2C6E9B] flex items-center justify-center text-[#FFFFFF]">
              {activePillar && <activePillar.icon size={20} />}
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#2C6E9B] tracking-widest uppercase">PILLAR 0{activePillar.id} • ACTIVE</div>
              <div className="font-mono text-[14px] font-bold text-[#1F2933] uppercase">{activePillar.title}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
              <div className="font-mono text-[10px] text-[#8A8175] uppercase tracking-wider mb-1">How it works</div>
              <div className="font-mono text-[12px] text-[#2A3138] leading-relaxed">{activePillar.desc}</div>
              <div className="mt-2 font-mono text-[10px] text-[#2F8A7E]">{activePillar.detail}</div>
            </div>
            <div className="bg-[#2C6E9B]/5 border border-[#2C6E9B]/20 rounded-lg p-3">
              <div className="font-mono text-[10px] text-[#2C6E9B] uppercase tracking-wider mb-1">Technician Example</div>
              <div className="font-mono text-[11px] text-[#3E4650] leading-relaxed italic">"{activePillar.example}"</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#8A8175]">
              <div className="flex-1 h-px bg-[#E6E0D6]" />
              <span>Observe → Understand → Flag → Correlate → Explain → Act</span>
              <div className="flex-1 h-px bg-[#E6E0D6]" />
            </div>
            <div className="grid grid-cols-5 gap-1">
              {pillars.map(p => (
                <div key={p.id} className={`h-1 rounded-full ${p.id <= active ? 'bg-[#2C6E9B]' : 'bg-[#E6E0D6]'}`} />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
