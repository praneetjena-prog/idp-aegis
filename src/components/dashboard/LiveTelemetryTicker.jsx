import React, { useEffect, useState } from 'react';
import { Activity, Zap, Thermometer, Waves, Droplets } from 'lucide-react';
import { DEFAULT_PARAMS, metricStatus } from '@/lib/facility';

/**
 * Compact real-time sensor readout strip.
 * Clearly differentiates hardware telemetry from demonstration data,
 * and highlights abnormal thresholds with explicit engineering units and timestamps.
 */
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
        { 
          asset, 
          param: 'Vibration RMS', 
          value: Number(vib).toFixed(1), 
          unit: 'mm/s', 
          limit: `Safe < ${params.vibrationCritical || 2.5} mm/s`,
          icon: Waves, 
          status: metricStatus(params, 'vibration', vib) 
        },
        { 
          asset, 
          param: 'Drive Current', 
          value: Number(cur).toFixed(1), 
          unit: 'A', 
          limit: `Rated ${params.ratedCurrentA || 14.2} A`,
          icon: Zap, 
          status: metricStatus(params, 'current', cur) 
        },
        { 
          asset, 
          param: 'Bearing Temp', 
          value: Number(temp).toFixed(1), 
          unit: '°C', 
          limit: `Limit < ${params.tempCritical || 65}°C`,
          icon: Thermometer, 
          status: metricStatus(params, 'temperature', temp) 
        },
        { 
          asset: 'CW-P02', 
          param: 'Water Flow', 
          value: Number(flow).toFixed(1), 
          unit: 'L/min', 
          limit: 'Min > 60 L/min',
          icon: Droplets, 
          status: metricStatus(params, 'flow', flow) 
        },
        humidity != null
          ? { 
              asset: 'ENV-01', 
              param: 'Relative Humidity', 
              value: Number(humidity).toFixed(1), 
              unit: '%', 
              limit: '30-70% Range',
              icon: Activity, 
              status: metricStatus(params, 'humidity', humidity) 
            }
          : { 
              asset: 'ELEC-E3', 
              param: 'Power Factor', 
              value: (0.94 + Math.random() * 0.04).toFixed(2), 
              unit: '', 
              limit: 'Target > 0.92',
              icon: Activity, 
              status: 'nominal' 
            },
      ];
      return base.map(b => ({ ...b, time: now.toLocaleTimeString('en-GB') }));
    };

    setTicks(generate());
    const iv = setInterval(() => setTicks(generate()), 2500);
    return () => clearInterval(iv);
  }, [mode, values, params]);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-xl overflow-hidden shadow-xs">
      <div className="px-4 py-2 bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#6E6558] dark:text-[#A0988A]">
            Current Sensor Readings
          </span>
          <span className="text-[#D2C9BA] dark:text-[#2C3847]">•</span>
          <span className="font-mono text-[10px] text-[#8A8175]">
            {isLive ? 'Active MQTT Telemetry Stream' : 'Calibrated Physics Simulation'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#2E7D5B] animate-pulse' : 'bg-[#B07B1C]'}`} />
          <span className={isLive ? 'text-[#2E7D5B]' : 'text-[#B07B1C]'}>
            {isLive ? 'HARDWARE FEED' : 'SIMULATION FEED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E0D6] dark:divide-[#2C3847]">
        {ticks.map((t, i) => {
          const Icon = t.icon;
          const isWarning = t.status === 'critical' || t.status === 'warning';
          return (
            <div 
              key={i} 
              className={`p-3 flex items-start gap-3 transition-colors ${
                isWarning 
                  ? 'bg-[#C05043]/5 dark:bg-[#C05043]/10' 
                  : 'bg-white dark:bg-[#1A222B] hover:bg-[#FAF8F4] dark:hover:bg-[#141B22]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                t.status === 'critical' 
                  ? 'bg-[#C05043]/10 border-[#C05043]/30 text-[#C05043]' 
                  : t.status === 'warning'
                  ? 'bg-[#B07B1C]/10 border-[#B07B1C]/30 text-[#B07B1C]'
                  : 'bg-[#FAF8F4] dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#6E6558] dark:text-[#A0988A]'
              }`}>
                <Icon size={14} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[9px] uppercase font-bold text-[#8A8175] truncate">
                    {t.asset} · {t.param}
                  </span>
                  <span className="font-mono text-[8px] text-[#A99F90]">{t.time}</span>
                </div>

                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`font-mono text-[16px] font-bold ${
                    t.status === 'critical' 
                      ? 'text-[#C05043]' 
                      : t.status === 'warning'
                      ? 'text-[#B07B1C]'
                      : 'text-[#1F2933] dark:text-[#FAF8F4]'
                  }`}>
                    {t.value}
                  </span>
                  <span className="font-mono text-[10px] text-[#8A8175]">{t.unit}</span>
                </div>

                <div className="font-mono text-[9px] text-[#8A8175] truncate mt-0.5">
                  {t.limit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
