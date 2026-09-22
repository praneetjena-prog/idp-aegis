import React from 'react';

const rows = [
  { 
    param: "Vibration Velocity", 
    sensor: "MPU6050 6-Axis Accelerometer", 
    target: "Supply fan motor, bearing outer race wear, rotational imbalance", 
    iface: "I2C High-Speed (0x68)" 
  },
  { 
    param: "Motor Current Draw", 
    sensor: "ACS712 / SCT-013 Split-Core CT", 
    target: "Drive motor phase draw, mechanical drag surges, phase imbalance", 
    iface: "Analog ADC" 
  },
  { 
    param: "Bearing Surface Temp", 
    sensor: "DHT22 / DS18B20 Probes", 
    target: "Bearing housing heat dissipation, thermal friction buildup", 
    iface: "1-Wire / Digital" 
  },
  { 
    param: "Combustible Gas & Smoke", 
    sensor: "MQ-2 Semiconductor Gas Sensor", 
    target: "Electrical switchgear panels, motor terminal boxes, early insulation burnout & fire safety", 
    iface: "Analog ADC / Digital GPIO" 
  },
  { 
    param: "CO₂ & Air Quality", 
    sensor: "Sensirion SCD40 Photoacoustic NDIR", 
    target: "HVAC supply/return air ducts, ventilation damper modulation & indoor air balance", 
    iface: "I2C Digital (0x62)" 
  },
  { 
    param: "Occupancy & Motion", 
    sensor: "HC-SR501 / AM312 PIR Sensor", 
    target: "Mechanical plant rooms, equipment bay access safety, zone demand-controlled ventilation", 
    iface: "Digital GPIO (Interrupt)" 
  },
  { 
    param: "Line Voltage", 
    sensor: "ZMPT101B Voltage Module", 
    target: "Power quality, brownout detection, phase health", 
    iface: "Analog AC" 
  },
  { 
    param: "Fluid Flow", 
    sensor: "YF-S201 Hall-Effect Meter", 
    target: "Closed-loop chilled water, domestic pipe leakage, pump cavitation", 
    iface: "Pulse Count (GPIO)" 
  },
  { 
    param: "Ambient Humidity", 
    sensor: "DHT22 Capacitive", 
    target: "Envelope moisture, mold prevention, indoor air balance", 
    iface: "1-Wire Digital" 
  },
];

export const HardwareTable = () => {
  return (
    <div className="rounded-[10px] border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] overflow-hidden">
      <div className="px-4 py-3 bg-[#F1EDE6] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#1F2933] dark:text-[#FAF8F4]">Democratized Sensor Kit • Cost-Effective Deployment</span>
        <span className="font-mono text-[10px] text-[#2E7D5B] px-2 py-0.5 bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 rounded font-bold">Total Kit &lt; $180 / Asset</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E6E0D6]/60 dark:border-[#2C3847]">
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Parameter</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Recommended Sensor</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Target Component / Application</th>
              <th className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8175]">Interface</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-b border-[#E6E0D6]/40 dark:border-[#2C3847]/40 last:border-0 hover:bg-[#FAF8F4] dark:hover:bg-[#141B22]/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-[#1F2933] dark:text-[#FAF8F4] whitespace-nowrap">{r.param}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-[#2C6E9B] whitespace-nowrap">{r.sensor}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">{r.target}</td>
                <td className="px-4 py-2.5 font-mono text-[10px] whitespace-nowrap"><span className="px-1.5 py-0.5 bg-[#E6E0D6] dark:bg-[#2C3847] border border-[#D2C9BA] dark:border-[#3E4D61] rounded text-[#3E4650] dark:text-[#FAF8F4]">{r.iface}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-[#F1EDE6] dark:bg-[#141B22] border-t border-[#E6E0D6] dark:border-[#2C3847] font-mono text-[10px] text-[#8A8175] flex flex-wrap gap-4 items-center">
        <span>Open hardware • ESP32 edge • No proprietary gateway required</span>
        <span className="text-[#A99F90]">•</span>
        <span>Includes MQ-2 Gas, SCD40 NDIR CO₂ & HC-SR501 PIR Occupancy</span>
        <span className="text-[#A99F90]">•</span>
        <span>Docs: github.com/aegis-open/sensor-kit</span>
      </div>
    </div>
  );
};
