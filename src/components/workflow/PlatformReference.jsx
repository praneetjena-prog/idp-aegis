import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Cpu, 
  Layers, 
  Table, 
  GitBranch, 
  Radio, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const HARDWARE_BOM = [
  { param: "Vibration Velocity", sensor: "MPU6050 (6-Axis MEMS)", iface: "I2C High-Speed", pinout: "GPIO 21 (SDA), 22 (SCL)", range: "±2g to ±16g (0–1000 Hz)", cost: "$3.50" },
  { param: "Motor Current (FLA)", sensor: "ACS712 / SCT-013 Split-Core", iface: "Analog ADC (12-bit)", pinout: "GPIO 34 (ADC1_CH6)", range: "0–30 A RMS (66 mV/A)", cost: "$4.20" },
  { param: "Bearing & Ambient Temp", sensor: "DHT22 / DS18B20 Digital", iface: "1-Wire Digital Bus", pinout: "GPIO 4 (Pull-up 4.7kΩ)", range: "-40°C to +80°C (±0.5°C)", cost: "$3.80" },
  { param: "Hydraulic Loop Flow", sensor: "YF-S201 Hall-Effect Meter", iface: "Interrupt Pulse Count", pinout: "GPIO 18 (Edge Trigger)", range: "1–30 L/min (450 p/L)", cost: "$5.50" },
  { param: "Edge MCU Gateway", sensor: "ESP32-WROOM-32D Dual-Core", iface: "WiFi 802.11 b/g/n / BLE", pinout: "Main System Board", range: "240 MHz, 520 KB SRAM", cost: "$4.50" },
  { param: "Enclosure & Power Supply", sensor: "IP65 ABS Case + 5V 2A Buck", iface: "100–240V AC to 5V DC", pinout: "Fused Terminal Block", range: "-20°C to +70°C DIN Rail", cost: "$12.00" }
];

const COMPARISON_DATA = [
  { capability: "Architecture", legacy: "Closed proprietary bus (BACnet/LonWorks locked)", aegis: "Open COTS sensors, standard MQTT v3.1.1 & HTTP REST" },
  { capability: "Deployment Cost", legacy: "$6,500 – $15,000 per monitored air handler", aegis: "<$180 per machine using standardized open hardware" },
  { capability: "Anomaly Detection", legacy: "Rigid static thresholds (fires 200+ false alarms/week)", aegis: "Multivariate Isolation Forest & FFT harmonic analysis" },
  { capability: "Action Horizon", legacy: "Trips alarm only after thermal switch has broken down", aegis: "7 to 14 days early warning with Remaining Useful Life (RUL)" },
  { capability: "Field Guidance", legacy: "Raw numeric error code (e.g., 'ERR-4021')", aegis: "Automated work order ticket with tools, parts & LOTO steps" },
  { capability: "Licensing & Lock-In", legacy: "Annual recurring seats + proprietary vendor technicians", aegis: "100% MIT Open Source; zero vendor lock-in" }
];

export const PlatformReference = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  return (
    <div className="space-y-4">
      {/* Segmented Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#FFFFFF] border border-[#E6E0D6] rounded-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'architecture'
                ? 'bg-[#1F2933] text-white shadow-sm'
                : 'text-[#6E6558] hover:bg-[#F1EDE6] hover:text-[#1F2933]'
            }`}
          >
            <GitBranch size={13} />
            <span>Signal Chain & Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'hardware'
                ? 'bg-[#1F2933] text-white shadow-sm'
                : 'text-[#6E6558] hover:bg-[#F1EDE6] hover:text-[#1F2933]'
            }`}
          >
            <Cpu size={13} />
            <span>Hardware BOM & Sensor Kit</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'matrix'
                ? 'bg-[#1F2933] text-white shadow-sm'
                : 'text-[#6E6558] hover:bg-[#F1EDE6] hover:text-[#1F2933]'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Aegis vs Legacy SCADA</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[#8A8175] px-2">
          <Badge variant="nominal">MIT License</Badge>
          <span>ESP32 • SQLite • Scikit-Learn</span>
        </div>
      </div>

      {/* Tab 1: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-4 animate-in fade-in">
          <Card className="p-5 bg-[#FFFFFF]">
            <CardHeader className="p-0 pb-4 border-b border-[#E6E0D6] mb-4">
              <div>
                <CardTitle>End-to-End Industrial Telemetry Pipeline</CardTitle>
                <p className="font-mono text-[11px] text-[#8A8175] mt-0.5">
                  Synchronized multi-tier data path from physical transducers to predictive maintenance dispatch.
                </p>
              </div>
              <Badge variant="info">Sub-2.0s Ingestion Loop</Badge>
            </CardHeader>

            {/* Pipeline Flowchart */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 my-2">
              <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3 relative">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#8A8175] mb-1">
                  <span>Layer 01</span>
                  <Radio size={12} className="text-[#2C6E9B]" />
                </div>
                <div className="font-display text-[13px] font-bold text-[#1F2933]">Field Sensors</div>
                <div className="font-mono text-[10px] text-[#6E6558] mt-1">
                  MPU6050, ACS712, DHT22, YF-S201 analog/digital probes.
                </div>
                <div className="mt-2 text-[9px] font-mono font-semibold text-[#2C6E9B] bg-[#2C6E9B]/10 px-1.5 py-0.5 rounded inline-block">
                  Analog / I2C / Pulse
                </div>
              </div>

              <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3 relative">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#8A8175] mb-1">
                  <span>Layer 02</span>
                  <Cpu size={12} className="text-[#2F8A7E]" />
                </div>
                <div className="font-display text-[13px] font-bold text-[#1F2933]">Edge Gateway</div>
                <div className="font-mono text-[10px] text-[#6E6558] mt-1">
                  ESP32 MCU running FreeRTOS. Samples, averages & buffers packets.
                </div>
                <div className="mt-2 text-[9px] font-mono font-semibold text-[#2F8A7E] bg-[#2F8A7E]/10 px-1.5 py-0.5 rounded inline-block">
                  1.8s Poll • WiFi/BLE
                </div>
              </div>

              <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3 relative">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#8A8175] mb-1">
                  <span>Layer 03</span>
                  <Layers size={12} className="text-[#B07B1C]" />
                </div>
                <div className="font-display text-[13px] font-bold text-[#1F2933]">Backend Ingestion</div>
                <div className="font-mono text-[10px] text-[#6E6558] mt-1">
                  Flask REST API + SQLite time-series telemetry store.
                </div>
                <div className="mt-2 text-[9px] font-mono font-semibold text-[#B07B1C] bg-[#B07B1C]/10 px-1.5 py-0.5 rounded inline-block">
                  POST /api/sensor-data
                </div>
              </div>

              <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3 relative">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#8A8175] mb-1">
                  <span>Layer 04</span>
                  <Zap size={12} className="text-[#C05043]" />
                </div>
                <div className="font-display text-[13px] font-bold text-[#1F2933]">ML Diagnostics</div>
                <div className="font-mono text-[10px] text-[#6E6558] mt-1">
                  Isolation Forest + Random Forest fault classifier & RUL regression.
                </div>
                <div className="mt-2 text-[9px] font-mono font-semibold text-[#C05043] bg-[#C05043]/10 px-1.5 py-0.5 rounded inline-block">
                  Scikit-Learn • Joblib
                </div>
              </div>

              <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3 relative">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#8A8175] mb-1">
                  <span>Layer 05</span>
                  <CheckCircle2 size={12} className="text-[#2E7D5B]" />
                </div>
                <div className="font-display text-[13px] font-bold text-[#1F2933]">SCADA Console</div>
                <div className="font-mono text-[10px] text-[#6E6558] mt-1">
                  React 19 + Tailwind dashboard with automated ticket dispatch.
                </div>
                <div className="mt-2 text-[9px] font-mono font-semibold text-[#2E7D5B] bg-[#2E7D5B]/10 px-1.5 py-0.5 rounded inline-block">
                  Printable Field Sheets
                </div>
              </div>
            </div>

            {/* Technical Specifications Summary */}
            <div className="mt-4 pt-3 border-t border-[#E6E0D6] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[10px]">
              <div>
                <span className="text-[#8A8175] uppercase block text-[9px]">Ingestion Latency</span>
                <strong className="text-[#1F2933] text-[12px]">&lt; 120 ms</strong>
              </div>
              <div>
                <span className="text-[#8A8175] uppercase block text-[9px]">Sampling Rate</span>
                <strong className="text-[#1F2933] text-[12px]">1.8s Continuous</strong>
              </div>
              <div>
                <span className="text-[#8A8175] uppercase block text-[9px]">Transport Security</span>
                <strong className="text-[#1F2933] text-[12px]">TLS 1.3 / HTTP Basic</strong>
              </div>
              <div>
                <span className="text-[#8A8175] uppercase block text-[9px]">Offline Resilience</span>
                <strong className="text-[#2E7D5B] text-[12px]">Local Buffer + Sync</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Hardware BOM */}
      {activeTab === 'hardware' && (
        <div className="space-y-4 animate-in fade-in">
          <Card className="p-0 overflow-hidden bg-[#FFFFFF]">
            <div className="p-4 bg-[#FAF8F4] border-b border-[#E6E0D6] flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Democratized Sensor Kit • Bill of Materials (BOM)</CardTitle>
                <p className="font-mono text-[11px] text-[#8A8175] mt-0.5">
                  Standard Commercial Off-The-Shelf (COTS) industrial sensors readily available globally.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#2E7D5B]/10 border border-[#2E7D5B]/30 text-[#2E7D5B] font-mono text-[11px] font-bold rounded">
                Complete Kit: &lt; $35 / Node (&lt; $180 / Machine)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="bg-[#F1EDE6] border-b border-[#E6E0D6] text-[#8A8175] text-[10px] uppercase">
                    <th className="px-4 py-2.5 font-bold">Physical Parameter</th>
                    <th className="px-4 py-2.5 font-bold">Sensor Part</th>
                    <th className="px-4 py-2.5 font-bold">Hardware Interface</th>
                    <th className="px-4 py-2.5 font-bold">ESP32 Pinout</th>
                    <th className="px-4 py-2.5 font-bold">Measurement Range</th>
                    <th className="px-4 py-2.5 font-bold text-right">Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {HARDWARE_BOM.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#E6E0D6]/60 last:border-0 hover:bg-[#FAF8F4] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1F2933]">{row.param}</td>
                      <td className="px-4 py-3 text-[#2C6E9B] font-semibold">{row.sensor}</td>
                      <td className="px-4 py-3 text-[#554D42]">{row.iface}</td>
                      <td className="px-4 py-3 text-[#8A8175]">{row.pinout}</td>
                      <td className="px-4 py-3 text-[#554D42]">{row.range}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#2E7D5B]">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#FAF8F4] border-t border-[#E6E0D6] flex items-center justify-between text-[10px] font-mono text-[#8A8175]">
              <span>Zero vendor lock-in • Easy screw-terminal wiring • Standard 3.3V / 5V DC supply</span>
              <span className="text-[#2C6E9B] font-semibold">Wiring diagram: wokwi/diagram.json</span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Aegis vs Legacy SCADA Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4 animate-in fade-in">
          <Card className="p-0 overflow-hidden bg-[#FFFFFF]">
            <div className="p-4 bg-[#FAF8F4] border-b border-[#E6E0D6] flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Architectural Benchmark • Aegis Open vs Legacy BMS</CardTitle>
                <p className="font-mono text-[11px] text-[#8A8175] mt-0.5">
                  How open predictive maintenance replaces closed, expensive legacy building management systems.
                </p>
              </div>
              <Badge variant="nominal">Full Comparison</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="bg-[#F1EDE6] border-b border-[#E6E0D6] text-[#8A8175] text-[10px] uppercase">
                    <th className="px-4 py-2.5 font-bold w-[20%]">Capability / Dimension</th>
                    <th className="px-4 py-2.5 font-bold w-[40%] text-[#C05043]">Legacy Proprietary BMS</th>
                    <th className="px-4 py-2.5 font-bold w-[40%] text-[#2E7D5B]">Aegis Open Architecture</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#E6E0D6]/60 last:border-0 hover:bg-[#FAF8F4] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1F2933]">{row.capability}</td>
                      <td className="px-4 py-3 text-[#6E6558] leading-relaxed bg-[#C05043]/[0.02]">
                        {row.legacy}
                      </td>
                      <td className="px-4 py-3 text-[#1F2933] font-semibold leading-relaxed bg-[#2E7D5B]/[0.03]">
                        {row.aegis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#FAF8F4] border-t border-[#E6E0D6] flex items-center justify-between text-[10px] font-mono text-[#8A8175]">
              <span>Designed for small municipal teams, school districts, and community infrastructure.</span>
              <span className="text-[#2E7D5B] font-semibold">100% Free & Open Source</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
