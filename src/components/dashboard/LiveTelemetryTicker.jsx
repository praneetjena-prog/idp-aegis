import React, { useEffect, useState } from 'react';
import { Activity, Zap, Thermometer, Waves, Droplets } from 'lucide-react';
import { DEFAULT_PARAMS, metricStatus } from '@/lib/facility';

export const LiveTelemetryTicker = ({ mode = 'fault', values = null, params = DEFAULT_PARAMS, isLive = false }) => {
  const [ticks, setTicks] = useState([]);

  useEffect(() => {
    const generate = () => {
      const now = new Date();
      const asset = params.assetTag || 'AHU-03';

      const vib = values?.vib ?? (mode === 'fault' ? 6.5 + Math.random() * 0.6 : 2.0 + Math.random() * 0.3);
      const cur = values?.cur ?? (mode === 'fault' ? 17.2 + Math.random() * 0.8 : 14.1 + Math.random() * 0.3);
      const temp = values?.temp ?? (mode === 'fault' ? 70 + Math.random() * 3 : 53 + Math.random() * 2);
      const flow = values?.flow ?? (mode === 'fault' ? params.ratedFlowLpm * 0.55 : params.ratedFlowLpm * 0.92);
      const humidity = values?.humidity;

      const base = [
        { asset, param: 'Vibration', value: Number(vib).toFixed(1), unit: 'mm/s', icon: Waves, status: metricStatus(params, 'vibration', vib) },
        { asset, param: 'Current', value: Number(cur).toFixed(1), unit: 'A', icon: Zap, status: metricStatus(params, 'current', cur) },
        { asset, param: 'Temperature', value: Number(temp).toFixed(1), unit: '°C', icon: Thermometer, status: metricStatus(params, 'temperature', temp) },
        { asset: 'CW-P02', param: 'Water flow', value: Number(flow).toFixed(1), unit: 'L/min', icon: Droplets, status: metricStatus(params, 'flow', flow) },
        humidity != null
          ? { asset: 'ENV-01', param: 'Humidity', value: Number(humidity).toFixed(1), unit: '%', icon: Activity, status: metricStatus(params, 'humidity', humidity) }
          : { asset: 'ELEC-E3', param: 'Power factor', value: (0.94 + Math.random() * 0.04).toFixed(2), unit: '', icon: Activity, status: 'nominal' },
      ];
      return base.map(b => ({ ...b, time: now.toLocaleTimeString('en-GB'), ts: now.getTime() + Math.random() * 1000 }));
    };
    setTicks(generate());
    const iv = setInterval(() => setTicks(generate()), 2500);
    return () => clearInterval(iv);
  }, [mode, values, params]);

  return (
    <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-[10px] overflow-hidden">
      <div className="px-3 py-2 bg-[#FFFFFF] border-b border-[#E6E0D6] flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#6E6558]">
          Current sensor readings · {isLive ? 'Connected sensor' : 'Demonstration data'}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLive ? 'bg-[#2E7D5B]' : 'bg-[#B07B1C]'}`} />
          <span className={`font-mono text-[9px] ${isLive ? 'text-[#2E7D5B]' : 'text-[#B07B1C]'}`}>{isLive ? 'LIVE' : 'DEMO'}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#E6E0D6] divide-y md:divide-y-0">
        {ticks.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="px-3 py-2.5 flex items-center gap-2.5 bg-[#FFFFFF] hover:bg-[#FAF8F4] transition-colors">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${t.status === 'critical' ? 'bg-[#C05043]/10 border-[#C05043]/20 text-[#C05043]' : t.status === 'warning' ? 'bg-[#B07B1C]/10 border-[#B07B1C]/20 text-[#B07B1C]' : t.status === 'advisory' ? 'bg-[#B07B1C]/10 border-[#B07B1C]/20 text-[#B07B1C]' : 'bg-[#E6E0D6] border-[#D2C9BA] text-[#6E6558]'}`}>
                <Icon size={12} />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[9px] text-[#8A8175] uppercase leading-none">{t.asset} • {t.param}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`font-mono text-[13px] font-bold leading-none ${t.status === 'critical' ? 'text-[#C05043]' : t.status === 'warning' ? 'text-[#B07B1C]' : 'text-[#1F2933]'}`}>{t.value}</span>
                  <span className="font-mono text-[9px] text-[#8A8175]">{t.unit}</span>
                </div>
                <div className="font-mono text-[8px] text-[#A99F90] mt-0.5">{t.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
