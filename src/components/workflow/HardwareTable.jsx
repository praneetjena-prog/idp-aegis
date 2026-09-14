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
    <div className="rounded-[10px] border border-[#E6E0D6] bg-[#FFFFFF] overflow-hidden">
      <div className="px-4 py-3 bg-[#F1EDE6] border-b border-[#E6E0D6] flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#1F2933]">Democratized Sensor Kit • Cost-Effective Deployment</span>
        <span className="font-mono text-[10px] text-[#2E7D5B] px-2 py-0.5 bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 rounded">Total Kit &lt; $180 / Asset</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E6E0D6]/60">
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Parameter</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Recommended Sensor</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Target Component / Application</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Interface</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-b border-[#E6E0D6]/40 last:border-0 hover:bg-[#FAF8F4]">
                <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-[#1F2933]">{r.param}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#2C6E9B]">{r.sensor}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#6E6558]">{r.target}</td>
                <td className="px-4 py-2.5 font-mono text-[10px]"><span className="px-1.5 py-0.5 bg-[#E6E0D6] border border-[#D2C9BA] rounded text-[#3E4650]">{r.iface}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-[#F1EDE6] border-t border-[#E6E0D6] font-mono text-[10px] text-[#8A8175] flex gap-4">
        <span>Open hardware • ESP32 edge • No proprietary gateway required</span>
        <span className="text-[#A99F90]">•</span>
        <span>Docs: github.com/aegis-open/sensor-kit</span>
      </div>
    </div>
  );
};
