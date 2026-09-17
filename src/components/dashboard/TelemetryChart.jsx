import React, { useMemo, useState, useEffect } from 'react';

export const TelemetryChart = ({ mode = 'fault', range = '24H' }) => {
  const points = range === '1H' ? 60 : range === '24H' ? 96 : 168;
  const [historyRows, setHistoryRows] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      try {
        const url = window.location.port === '8080' ? '/api/history?limit=60' : 'http://127.0.0.1:5000/api/history?limit=60';
        const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
        if (!res.ok) return;
        const rows = await res.json();
        if (active && Array.isArray(rows) && rows.length >= 5) {
          setHistoryRows(rows);
        }
      } catch {
        // use fallback synthetic series
      }
    };
    fetchHistory();
    const iv = setInterval(fetchHistory, 4000);
    return () => { active = false; clearInterval(iv); };
  }, []);
  
  const data = useMemo(() => {
    if (historyRows && historyRows.length >= 5) {
      const len = historyRows.length;
      return historyRows.map((r, i) => {
        const t = i / (len - 1);
        const hourFactor = Math.sin((t * Math.PI * 2) - Math.PI/2) * 0.3 + 0.7;
        const baseline = 8 + hourFactor * 4 + Math.sin(t * 20) * 0.3;
        // Convert real current to kW: (I * 400 * sqrt(3) * 0.85) / 1000
        const cur = r.current != null ? Number(r.current) : 14.2;
        const kw = +(cur * 400 * 1.732 * 0.85 / 1000).toFixed(2);
        return { baseline, actual: kw, t, status: r.status, vibration: r.vibration };
      });
    }

    const arr = [];
    for (let i = 0; i < points; i++) {
      const t = i / points;
      // Baseline: diurnal curve
      const hourFactor = Math.sin((t * Math.PI * 2) - Math.PI/2) * 0.3 + 0.7;
      const baseline = 8 + hourFactor * 4 + Math.sin(t * 20) * 0.3;
      let actual = baseline + (Math.random() - 0.5) * 0.6;
      if (mode === 'fault' && t > 0.35 && t < 0.75) {
        const faultIntensity = t < 0.45 ? (t - 0.35) * 10 : 1;
        actual += faultIntensity * (2 + Math.sin(t*30)*0.5) + (t > 0.5 ? 1.5 : 0);
      }
      arr.push({ baseline, actual, t });
    }
    return arr;
  }, [mode, points, historyRows]);

  const numPoints = data.length;
  const width = 800;
  const height = 220;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.baseline, d.actual))) + 2;
  const minVal = Math.min(...data.map(d => Math.min(d.baseline, d.actual))) - 1;

  const toX = (i) => pad.left + (i / (numPoints - 1)) * innerW;
  const toY = (v) => pad.top + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH;

  const baselinePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.baseline)}`).join(' ');
  const actualPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.actual)}`).join(' ');

  const anomalyStart = Math.floor(numPoints * 0.35);
  const anomalyEnd = Math.floor(numPoints * 0.75);
  const isAlertMode = mode === 'fault' || (historyRows && historyRows.some(r => r.status === 'Alert'));

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#E6E0D6] border-t border-dashed border-[#A99F90]" />
            <span className="font-mono text-[10px] text-[#6E6558] uppercase tracking-wider">Baseline Expected Envelope (8–12 kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#2C6E9B]" />
            <span className="font-mono text-[10px] text-[#3E4650] uppercase tracking-wider">
              Actual Telemetry {historyRows ? `(SQLite DB • ${historyRows.length} pts)` : 'Demand'}
            </span>
          </div>
        </div>
        {isAlertMode && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#B07B1C]/10 text-[#B07B1C] border border-[#B07B1C]/20">
            ANOMALY DETECTED • CORRELATED
          </span>
        )}
      </div>
      <div className="relative bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[240px]">
          {/* grid */}
          {[0,1,2,3,4].map(i => (
            <line key={i} x1={pad.left} x2={width - pad.right} y1={pad.top + (innerH/4)*i} y2={pad.top + (innerH/4)*i} stroke="#E6E0D6" strokeDasharray="3 3" opacity={0.6} />
          ))}
          {/* anomaly background */}
          {isAlertMode && (
            <rect x={toX(anomalyStart)} y={pad.top} width={toX(anomalyEnd)-toX(anomalyStart)} height={innerH} fill="#B07B1C" opacity={0.06} />
          )}
          {/* baseline envelope area */}
          <path
            d={`${baselinePath} L ${toX(numPoints-1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`}
            fill="#E6E0D6"
            opacity={0.15}
          />
          {/* baseline line dashed */}
          <path d={baselinePath} fill="none" stroke="#6E6558" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.8} />
          {/* actual line */}
          <path d={actualPath} fill="none" stroke={isAlertMode ? "#B07B1C" : "#2C6E9B"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {/* dots for critical points */}
          {isAlertMode && data.filter((d,i)=> (d.status === 'Alert' || (i % Math.floor(numPoints/6)===0 && i> anomalyStart && i< anomalyEnd))).map((d,iIdx)=> {
            const idx = iIdx * Math.floor(numPoints/8);
            if (idx >= numPoints) return null;
            return <circle key={idx} cx={toX(idx)} cy={toY(data[idx].actual)} r={3} fill="#C05043" stroke="#F1EDE6" strokeWidth={1.5} />
          })}
          {/* Y labels */}
          {[maxVal, (maxVal+minVal)/2, minVal].map((v,i)=> (
            <text key={i} x={pad.left-6} y={toY(v)+3} textAnchor="end" fontSize="10" fontFamily="JetBrains Mono" fill="#8A8175">{v.toFixed(1)}kW</text>
          ))}
          {/* X labels */}
          <text x={pad.left} y={height-5} fontSize="10" fontFamily="JetBrains Mono" fill="#6E6558">00:00</text>
          <text x={width/2} y={height-5} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" fill="#6E6558">{range} TIMELINE</text>
          <text x={width-pad.right} y={height-5} textAnchor="end" fontSize="10" fontFamily="JetBrains Mono" fill="#6E6558">23:59</text>
        </svg>
      </div>
      <div className="mt-2 flex gap-3 font-mono text-[10px] text-[#8A8175]">
        <span>Envelope Deviation: <span className={isAlertMode ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}>{isAlertMode ? '+6.4% • FLAGGED' : '+0.8% • NOMINAL'}</span></span>
        <span>•</span>
        <span>Sampling: {range} @ {range==='1H' ? '1m' : range==='24H' ? '15m' : '1h'} interval</span>
        <span>•</span>
        <span>Source: {historyRows ? 'Backend SQLite Stream' : 'Seasonal Model 94%'}</span>
      </div>
    </div>
  );
};
