import React from 'react';

const rows = [
  { system: "Traditional BMS", func: "HVAC, lighting, basic thermostat control", gap: "Supervisory control only; no predictive modeling", aegis: "Layered cross-system intelligence without proprietary lock-in" },
  { system: "Raw IoT Platforms", func: "Aggregates temperature, humidity, energy", gap: "Raw data dumps without context; creates manual work", aegis: "Automated baseline inference and actionable maintenance tips" },
  { system: "Point Predictive Tools", func: "Monitors specialized factory machinery", gap: "Cost-prohibitive for schools, municipal, or community buildings", aegis: "Accessible, open-architecture predictive models for standard assets" },
  { system: "Energy Dashboards", func: "Logs kWh usage and electric bills", gap: "Flags high bills after the fact; ignores mechanical root causes", aegis: "Correlates electrical surges directly with motor friction and wear" },
  { system: "Static Threshold Rules", func: "Fires alarms when Value > Threshold", gap: "Misses low-level multi-parameter drift; triggers alert fatigue", aegis: "Multivariate anomaly modeling that learns normal seasonal behavior" },
  { system: "3D Digital Twins", func: "High-cost 3D building models", gap: "Impractical for everyday technician repairs and fast triage", aegis: "Lightweight, data-dense views designed for immediate field resolution" },
];

export const ComparisonMatrix = () => {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#1E2638] bg-[#121721]">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#0B0E14] border-b border-[#1E2638]">
            <th className="px-4 py-3 font-mono text-[10px] font-semibold tracking-wider uppercase text-slate-500">Existing System</th>
            <th className="px-4 py-3 font-mono text-[10px] font-semibold tracking-wider uppercase text-slate-500">Primary Function</th>
            <th className="px-4 py-3 font-mono text-[10px] font-semibold tracking-wider uppercase text-slate-500">Workflow Limitation / Gap</th>
            <th className="px-4 py-3 font-mono text-[10px] font-semibold tracking-wider uppercase text-[#14B8A6]">Aegis Open Approach</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[#1E2638]/60 last:border-0 hover:bg-[#151C29] transition-colors">
              <td className="px-4 py-3 font-mono text-[11px] font-semibold text-white whitespace-nowrap">{r.system}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-slate-400 max-w-[200px]">{r.func}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-[#F59E0B]/80 max-w-[260px]">{r.gap}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-[#14B8A6] max-w-[280px] bg-[#14B8A6]/[0.03]">{r.aegis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
