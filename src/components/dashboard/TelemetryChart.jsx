import React, { useMemo } from 'react';

export const TelemetryChart = ({ mode = 'fault', range = '24H' }) => {
  const points = range === '1H' ? 60 : range === '24H' ? 96 : 168;
  
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < points; i++) {
      const t = i / points;
      // Baseline: diurnal curve
      const hourFactor = Math.sin((t * Math.PI * 2) - Math.PI/2) * 0.3 + 0.7;
      const baseline = 8 + hourFactor * 4 + Math.sin(t * 20) * 0.3;
      let actual = baseline + (Math.random() - 0.5) * 0.6;
      if (mode === 'fault' && t > 0.35 && t < 0.75) {
        // Anomaly during morning startup and sustained
        const faultIntensity = t < 0.45 ? (t - 0.35) * 10 : 1;
        actual += faultIntensity * (2 + Math.sin(t*30)*0.5) + (t > 0.5 ? 1.5 : 0);
      }
      arr.push({ baseline, actual, t });
    }
    return arr;
  }, [mode, points]);

  const width = 800;
  const height = 220;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.baseline, d.actual))) + 2;
  const minVal = Math.min(...data.map(d => Math.min(d.baseline, d.actual))) - 1;

  const toX = (i) => pad.left + (i / (points - 1)) * innerW;
  const toY = (v) => pad.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const baselinePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.baseline)}`).join(' ');
  const actualPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.actual)}`).join(' ');

  // anomaly zone rect
  const anomalyStart = Math.floor(points * 0.35);
  const anomalyEnd = Math.floor(points * 0.75);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#1E2638] border-t border-dashed border-slate-500" />
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Baseline Expected Envelope (8–12 kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#0EA5E9]" />
            <span className="font-mono text-[10px] text-slate-300 uppercase tracking-wider">Actual Sensor Demand</span>
          </div>
        </div>
        {mode === 'fault' && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">ANOMALY ZONE • 06:40–14:20</span>
        )}
      </div>
      <div className="relative bg-[#0B0E14] border border-[#1E2638] rounded-lg p-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[240px]">
          {/* grid */}
          {[0,1,2,3,4].map(i => (
            <line key={i} x1={pad.left} x2={width - pad.right} y1={pad.top + (innerH/4)*i} y2={pad.top + (innerH/4)*i} stroke="#1E2638" strokeDasharray="3 3" opacity={0.6} />
          ))}
          {/* anomaly background */}
          {mode === 'fault' && (
            <rect x={toX(anomalyStart)} y={pad.top} width={toX(anomalyEnd)-toX(anomalyStart)} height={innerH} fill="#F59E0B" opacity={0.06} />
          )}
          {/* baseline envelope area */}
          <path
            d={`${baselinePath} L ${toX(points-1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`}
            fill="#1E2638"
            opacity={0.15}
          />
          {/* baseline line dashed */}
          <path d={baselinePath} fill="none" stroke="#475569" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.8} />
          {/* actual line */}
          <path d={actualPath} fill="none" stroke={mode === 'fault' ? "#F59E0B" : "#0EA5E9"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {/* dots for critical points */}
          {mode === 'fault' && data.filter((_,i)=> i % Math.floor(points/6)===0 && i> anomalyStart && i< anomalyEnd).map((d,iIdx)=> {
            const idx = anomalyStart + iIdx*Math.floor(points/6);
            if (idx >= points) return null;
            return <circle key={idx} cx={toX(idx)} cy={toY(data[idx].actual)} r={3} fill="#EF4444" stroke="#0B0E14" strokeWidth={1.5} />
          })}
          {/* Y labels */}
          {[maxVal, (maxVal+minVal)/2, minVal].map((v,i)=> (
            <text key={i} x={pad.left-6} y={toY(v)+3} textAnchor="end" fontSize="10" fontFamily="JetBrains Mono" fill="#64748B">{v.toFixed(1)}kW</text>
          ))}
          {/* X labels */}
          <text x={pad.left} y={height-5} fontSize="10" fontFamily="JetBrains Mono" fill="#475569">00:00</text>
          <text x={width/2} y={height-5} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" fill="#475569">{range} TIMELINE</text>
          <text x={width-pad.right} y={height-5} textAnchor="end" fontSize="10" fontFamily="JetBrains Mono" fill="#475569">23:59</text>
        </svg>
      </div>
      <div className="mt-2 flex gap-3 font-mono text-[10px] text-slate-500">
        <span>Envelope Deviation: <span className={mode==='fault' ? 'text-[#F59E0B]' : 'text-[#10B981]'}>{mode==='fault' ? '+6.4% • FLAGGED' : '+0.8% • NOMINAL'}</span></span>
        <span>•</span>
        <span>Sampling: {range} @ {range==='1H' ? '1m' : range==='24H' ? '15m' : '1h'} interval</span>
        <span>•</span>
        <span>Model: Seasonal ARIMA • Confidence 94%</span>
      </div>
    </div>
  );
};
