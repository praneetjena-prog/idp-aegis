import React from 'react';

const rows = [
  { param: "Temperature", sensor: "DHT22 / DS18B20 Probes", target: "Duct air temperature, server rack heat, ambient rooms", iface: "1-Wire / Digital" },
  { param: "Humidity", sensor: "DHT22 Capacitive", target: "Envelope moisture, mold prevention, indoor air balance", iface: "1-Wire" },
  { param: "Current Draw", sensor: "ACS712 / SCT-013 Split-Core CT", target: "Motor power draw, pump strain, electrical balance", iface: "Analog ADC" },
  { param: "Line Voltage", sensor: "ZMPT101B Voltage Module", target: "Power quality, brownout detection, phase health", iface: "Analog AC" },
  { param: "Vibration", sensor: "MPU6050 6-Axis Accelerometer", target: "Supply fan imbalance, bearing race wear, motor health", iface: "I2C High-Speed" },
  { param: "Fluid Flow", sensor: "YF-S201 Hall-Effect Meter", target: "Closed-loop chilled water, domestic pipe leakage", iface: "Pulse Count" },
  { param: "Air Quality", sensor: "MQ-Series / NDIR CO2", target: "Ventilation efficiency, damper optimization", iface: "Analog / UART" },
  { param: "Safety Telemetry", sensor: "Optical Smoke / Gas Modules", target: "Early electrical short detection & localized safety", iface: "Digital Interruption" },
];

export const HardwareTable = () => {
  return (
    <div className="rounded-[10px] border border-[#1E2638] bg-[#121721] overflow-hidden">
      <div className="px-4 py-3 bg-[#0B0E14] border-b border-[#1E2638] flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-white">Democratized Sensor Kit • Cost-Effective Deployment</span>
        <span className="font-mono text-[10px] text-[#10B981] px-2 py-0.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded">Total Kit &lt; $180 / Asset</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1E2638]/60">
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Parameter</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Recommended Sensor</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Target Component / Application</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Interface</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-b border-[#1E2638]/40 last:border-0 hover:bg-[#151C29]">
                <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-white">{r.param}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#0EA5E9]">{r.sensor}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">{r.target}</td>
                <td className="px-4 py-2.5 font-mono text-[10px]"><span className="px-1.5 py-0.5 bg-[#1E2638] border border-[#26324D] rounded text-slate-300">{r.iface}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-[#0B0E14] border-t border-[#1E2638] font-mono text-[10px] text-slate-500 flex gap-4">
        <span>Open hardware • ESP32 edge • No proprietary gateway required</span>
        <span className="text-slate-600">•</span>
        <span>Docs: github.com/aegis-open/sensor-kit</span>
      </div>
    </div>
  );
};
