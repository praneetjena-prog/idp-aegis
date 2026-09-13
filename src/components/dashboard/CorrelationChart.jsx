import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const CorrelationChart = ({ mode = 'fault' }) => {
  const data = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const vib = mode === 'fault' ? 2 + i * 0.15 + Math.random() * 0.5 : 1.8 + Math.random() * 0.6;
      const cur = mode === 'fault' ? 14 + vib * 0.6 + Math.random() * 0.4 : 13.8 + Math.random() * 0.8;
      pts.push({ vib, cur });
    }
    return pts;
  }, [mode]);

  const width = 360;
  const height = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxVib = 9;
  const maxCur = 20;
  const toX = (v) => pad.left + (v / maxVib) * innerW;
  const toY = (c) => pad.top + innerH - (c / maxCur) * innerH;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cross-System Correlation • Vibration vs Current</CardTitle>
        <Badge variant={mode === 'fault' ? 'critical' : 'nominal'}>{mode === 'fault' ? 'Correlated ↑' : 'Nominal Scatter'}</Badge>
      </CardHeader>
      <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px]">
          {/* grid */}
          {[0, 2, 4, 6, 8].map(v => (
            <line key={`v${v}`} x1={toX(v)} x2={toX(v)} y1={pad.top} y2={pad.top + innerH} stroke="#1E2638" strokeDasharray="2 3" opacity={0.5} />
          ))}
          {[14, 16, 18, 20].map(c => (
            <line key={`c${c}`} x1={pad.left} x2={pad.left + innerW} y1={toY(c)} y2={toY(c)} stroke="#1E2638" strokeDasharray="2 3" opacity={0.5} />
          ))}
          {/* baseline zone */}
          <rect x={toX(0)} y={toY(15)} width={toX(3) - toX(0)} height={toY(13.5) - toY(15)} fill="#10B981" opacity={0.08} />
          <text x={toX(0) + 4} y={toY(15) - 4} fontSize="7" fontFamily="JetBrains Mono" fill="#10B981">NORMAL ENVELOPE</text>
          {/* fault zone */}
          {mode === 'fault' && (
            <>
              <rect x={toX(5)} y={toY(20)} width={toX(9) - toX(5)} height={toY(16) - toY(20)} fill="#EF4444" opacity={0.08} />
              <text x={toX(5) + 4} y={toY(20) - 4} fontSize="7" fontFamily="JetBrains Mono" fill="#EF4444">FAULT CLUSTER • Bearing Wear</text>
            </>
          )}
          {/* points */}
          {data.map((d, i) => (
            <circle key={i} cx={toX(d.vib)} cy={toY(d.cur)} r={3} fill={mode === 'fault' && d.vib > 5 ? '#EF4444' : '#0EA5E9'} opacity={0.8} stroke="#0B0E14" strokeWidth={0.5} />
          ))}
          {/* correlation line */}
          {mode === 'fault' && (
            <line x1={toX(2)} y1={toY(14.5)} x2={toX(8)} y2={toY(18.5)} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6} />
          )}
          {/* axes */}
          <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#64748B">VIBRATION mm/s • MPU6050</text>
          <text x={10} y={height / 2} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#64748B" transform={`rotate(-90 10 ${height / 2})`}>CURRENT A • ACS712</text>
        </svg>
      </div>
      <div className="mt-2 font-mono text-[10px] text-slate-500 leading-relaxed">
        {mode === 'fault' ? (
          <span className="text-[#F59E0B]">Strong correlation (r=0.89): Vibration ↑ drives Current ↑ → Mechanical drag. Model: Pearson + Isolation Forest. Explains 91% confidence bearing outer race.</span>
        ) : (
          <span>Weak correlation (r=0.12): Variables within learned seasonal boundaries. No technician intervention. Baseline 8–10 kWh.</span>
        )}
      </div>
    </Card>
  );
};
