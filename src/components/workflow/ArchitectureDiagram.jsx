import React from 'react';

const Node = ({ label, sub, color = "slate" }) => {
  const colors = {
    slate: "bg-[#1E2638] border-[#26324D] text-slate-300",
    cyan: "bg-[#0EA5E9]/10 border-[#0EA5E9]/30 text-[#0EA5E9]",
    teal: "bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#14B8A6]",
    amber: "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]",
    green: "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]"
  };
  return (
    <div className={`px-3 py-2 rounded-lg border font-mono text-[10px] text-center leading-tight ${colors[color]}`}>
      <div className="font-semibold text-[11px] whitespace-nowrap">{label}</div>
      {sub && <div className="text-[9px] opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
};

const Arrow = () => (
  <div className="flex items-center justify-center px-1 text-slate-600">
    <span className="font-mono text-[14px]">→</span>
  </div>
);

export const ArchitectureDiagram = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-3">Hardware to Console Pipeline</div>
        <div className="bg-[#0B0E14] border border-[#1E2638] rounded-[10px] p-4 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <Node label="Open Sensors" sub="DHT22, ACS712, MPU6050" color="slate" />
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
          <div className="mt-3 flex gap-4 font-mono text-[9px] text-slate-600">
            <span>• Low-cost COTS</span>
            <span>• Open protocol</span>
            <span>• No vendor lock-in</span>
            <span>• Explainable models</span>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-3">Workflow Processing Chain</div>
        <div className="bg-[#0B0E14] border border-[#1E2638] rounded-[10px] p-4 overflow-x-auto">
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
          <div className="mt-3 h-1 w-full bg-[#1E2638] rounded-full overflow-hidden flex">
            <div className="h-full bg-slate-600" style={{width: '15%'}} />
            <div className="h-full bg-slate-500" style={{width: '15%'}} />
            <div className="h-full bg-[#0EA5E9]" style={{width: '20%'}} />
            <div className="h-full bg-[#F59E0B]" style={{width: '20%'}} />
            <div className="h-full bg-[#EF4444]" style={{width: '15%'}} />
            <div className="h-full bg-[#10B981]" style={{width: '15%'}} />
          </div>
        </div>
      </div>
    </div>
  );
};
