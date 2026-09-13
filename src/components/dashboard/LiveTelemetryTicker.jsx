import React, { useEffect, useState } from 'react';
import { Activity, Zap, Thermometer, Waves, Droplets } from 'lucide-react';

export const LiveTelemetryTicker = ({ mode = 'fault' }) => {
  const [ticks, setTicks] = useState([]);

  useEffect(() => {
    const generate = () => {
      const now = new Date();
      const base = [
        { asset: 'AHU-03', param: 'VIB', value: mode === 'fault' ? (6.5 + Math.random()*0.6).toFixed(1) : (2.0 + Math.random()*0.3).toFixed(1), unit: 'mm/s', icon: Waves, status: mode === 'fault' ? 'critical' : 'nominal' },
        { asset: 'AHU-03', param: 'CUR', value: mode === 'fault' ? (17.2 + Math.random()*0.8).toFixed(1) : (14.1 + Math.random()*0.3).toFixed(1), unit: 'A', icon: Zap, status: mode === 'fault' ? 'critical' : 'nominal' },
        { asset: 'AHU-03', param: 'TEMP', value: mode === 'fault' ? (70 + Math.random()*3).toFixed(1) : (53 + Math.random()*2).toFixed(1), unit: '°C', icon: Thermometer, status: mode === 'fault' ? 'warning' : 'nominal' },
        { asset: 'CW-P02', param: 'FLOW', value: mode === 'fault' ? (4.0 + Math.random()*0.4).toFixed(1) : (5.6 + Math.random()*0.3).toFixed(1), unit: 'L/s', icon: Droplets, status: mode === 'fault' ? 'advisory' : 'nominal' },
        { asset: 'ELEC-E3', param: 'PF', value: (0.94 + Math.random()*0.04).toFixed(2), unit: '', icon: Activity, status: 'nominal' },
      ];
      return base.map(b => ({ ...b, time: now.toLocaleTimeString('en-GB'), ts: now.getTime() + Math.random()*1000 }));
    };
    setTicks(generate());
    const iv = setInterval(() => setTicks(generate()), 2500);
    return () => clearInterval(iv);
  }, [mode]);

  return (
    <div className="bg-[#0B0E14] border border-[#1E2638] rounded-[10px] overflow-hidden">
      <div className="px-3 py-2 bg-[#121721] border-b border-[#1E2638] flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Live Telemetry Bus • 1,428 Points • MQTT Stream</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-mono text-[9px] text-[#10B981]">STREAMING</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#1E2638] divide-y md:divide-y-0">
        {ticks.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="px-3 py-2.5 flex items-center gap-2.5 bg-[#121721]/50 hover:bg-[#151C29] transition-colors">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${t.status === 'critical' ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]' : t.status === 'warning' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]' : t.status === 'advisory' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#1E2638] border-[#26324D] text-slate-400'}`}>
                <Icon size={12} />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[9px] text-slate-500 uppercase leading-none">{t.asset} • {t.param}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`font-mono text-[13px] font-bold leading-none ${t.status === 'critical' ? 'text-[#EF4444]' : t.status === 'warning' ? 'text-[#F59E0B]' : 'text-white'}`}>{t.value}</span>
                  <span className="font-mono text-[9px] text-slate-500">{t.unit}</span>
                </div>
                <div className="font-mono text-[8px] text-slate-600 mt-0.5">{t.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
