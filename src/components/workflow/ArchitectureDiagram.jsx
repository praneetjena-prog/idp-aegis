import React from 'react';

const Node = ({ label, sub, color = "slate" }) => {
  const colors = {
    slate: "bg-[#E6E0D6] border-[#D2C9BA] text-[#3E4650]",
    cyan: "bg-[#2C6E9B]/10 border-[#2C6E9B]/30 text-[#2C6E9B]",
    teal: "bg-[#2F8A7E]/10 border-[#2F8A7E]/30 text-[#2F8A7E]",
    amber: "bg-[#B07B1C]/10 border-[#B07B1C]/30 text-[#B07B1C]",
    green: "bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B]"
  };
  return (
    <div className={`px-3 py-2 rounded-lg border font-mono text-[10px] text-center leading-tight ${colors[color]}`}>
      <div className="font-semibold text-[11px] whitespace-nowrap">{label}</div>
      {sub && <div className="text-[9px] opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
};

const Arrow = () => (
  <div className="flex items-center justify-center px-1 text-[#A99F90]">
    <span className="font-mono text-[14px]">→</span>
  </div>
);

export const ArchitectureDiagram = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#6E6558] mb-3">Hardware to Console Pipeline</div>
        <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-[10px] p-4 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <Node label="Open Sensors" sub="MPU6050, MQ2, SCD40, PIR, CT" color="slate" />
            <Arrow />
            <Node label="Edge MCU" sub="ESP32 / Open Gateway" color="cyan" />
            <Arrow />
            <Node label="MQTT Broker" sub="Standard • TLS" color="cyan" />
            <Arrow />
            <Node label="Aegis Engine" sub="Processing + Inference" color="teal" />
            <Arrow />
            <Node label="Telemetry Store" sub="Store + ML Inference" color="amber" />
            <Arrow />
            <Node label="Operational UI" sub="This Console" color="green" />
          </div>
          <div className="mt-3 flex gap-4 font-mono text-[9px] text-[#A99F90]">
            <span>• Low-cost COTS</span>
            <span>• Open protocol</span>
            <span>• No vendor lock-in</span>
            <span>• Explainable models</span>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#6E6558] mb-3">Workflow Processing Chain</div>
        <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-[10px] p-4 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <Node label="Raw Sensor Feed" sub="1,428 pts • 1m avg" color="slate" />
            <Arrow />
            <Node label="Validation & Cleaning" sub="Outlier reject • Sync" color="slate" />
            <Arrow />
            <Node label="Baseline Comparison" sub="Seasonal ARIMA" color="cyan" />
            <Arrow />
            <Node label="Multivariate Correlation" sub="Vib + Current + ΔT" color="amber" />
            <Arrow />
            <Node label="Failure Probability" sub="91% conf • RUL 168h" color="amber" />
            <Arrow />
            <Node label="Field Work Order" sub="Actionable • Printable" color="green" />
          </div>
          <div className="mt-3 h-1 w-full bg-[#E6E0D6] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#C9C0B2]" style={{width: '15%'}} />
            <div className="h-full bg-[#A99F90]" style={{width: '15%'}} />
            <div className="h-full bg-[#2C6E9B]" style={{width: '20%'}} />
            <div className="h-full bg-[#B07B1C]" style={{width: '20%'}} />
            <div className="h-full bg-[#C05043]" style={{width: '15%'}} />
            <div className="h-full bg-[#2E7D5B]" style={{width: '15%'}} />
          </div>
        </div>
      </div>
    </div>
  );
};
