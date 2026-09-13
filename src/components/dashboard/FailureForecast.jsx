import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const FailureForecast = ({ mode = 'fault' }) => {
  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const base = mode === 'fault' ? 0.15 + i * 0.06 + Math.sin(i)*0.02 : 0.05 + i*0.01 + Math.random()*0.02;
      const upper = base + 0.08;
      const lower = Math.max(0, base - 0.05);
      arr.push({ day: i, base, upper, lower });
    }
    return arr;
  }, [mode]);

  const width = 400;
  const height = 140;
  const pad = { top: 10, right: 10, bottom: 20, left: 30 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const toX = (i) => pad.left + (i / 13) * innerW;
  const toY = (v) => pad.top + innerH - v * innerH * 0.9;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.base)}`).join(' ');
  const upperPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.upper)}`).join(' ');
  const lowerPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.lower)}`).join(' ');

  const areaPath = `${upperPath} L ${toX(13)} ${toY(points[13].lower)} ${points.slice().reverse().map((p, idx) => `L ${toX(13-idx)} ${toY(p.lower)}`).join(' ')} Z`;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Failure Trajectory Forecast • Remaining Useful Life</CardTitle>
        <Badge variant={mode === 'fault' ? 'critical' : 'nominal'}>{mode === 'fault' ? 'RUL 168h ±24h' : 'RUL 720h+'}</Badge>
      </CardHeader>
      <div className="space-y-3">
        <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[150px]">
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <line key={v} x1={pad.left} x2={width - pad.right} y1={toY(v)} y2={toY(v)} stroke="#1E2638" strokeDasharray="2 3" opacity={0.5} />
            ))}
            <path d={areaPath} fill={mode === 'fault' ? '#EF4444' : '#10B981'} opacity={0.08} />
            <path d={upperPath} fill="none" stroke={mode === 'fault' ? '#EF4444' : '#10B981'} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
            <path d={lowerPath} fill="none" stroke={mode === 'fault' ? '#EF4444' : '#10B981'} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
            <path d={linePath} fill="none" stroke={mode === 'fault' ? '#EF4444' : '#10B981'} strokeWidth={2} />
            {points.filter((_, i) => i % 2 === 0).map((p, i) => (
              <circle key={i} cx={toX(p.day)} cy={toY(p.base)} r={2.5} fill={mode === 'fault' ? '#EF4444' : '#10B981'} stroke="#0B0E14" strokeWidth={1} />
            ))}
            {/* threshold */}
            <line x1={pad.left} x2={width - pad.right} y1={toY(0.85)} y2={toY(0.85)} stroke="#F59E0B" strokeDasharray="5 3" />
            <text x={width - pad.right - 2} y={toY(0.85) - 4} fontSize="8" fontFamily="JetBrains Mono" fill="#F59E0B" textAnchor="end">FAILURE THRESHOLD 85%</text>
          </svg>
          <div className="flex justify-between font-mono text-[8px] text-slate-600 px-1">
            <span>Today</span><span>Day 7</span><span>Day 14</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-2">
            <div className="text-slate-500 uppercase text-[9px]">Degradation Slope</div>
            <div className="text-white font-bold mt-1">{mode === 'fault' ? '0.12 A/day' : '0.01 A/day'}</div>
            <div className="text-slate-600 text-[9px] mt-1">Current draw trend</div>
          </div>
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-2">
            <div className="text-slate-500 uppercase text-[9px]">Confidence Interval</div>
            <div className="text-[#0EA5E9] font-bold mt-1">±24h @ 91%</div>
            <div className="text-slate-600 text-[9px] mt-1">Spectral + current</div>
          </div>
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-2">
            <div className="text-slate-500 uppercase text-[9px]">Recommended Action</div>
            <div className={`font-bold mt-1 ${mode === 'fault' ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>{mode === 'fault' ? 'Inspect <7D' : 'Monitor'}</div>
            <div className="text-slate-600 text-[9px] mt-1">Per maintenance SOP</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
