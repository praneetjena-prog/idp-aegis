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
        <CardTitle>Failure risk · next 14 days</CardTitle>
        <Badge variant={mode === 'fault' ? 'critical' : 'nominal'}>{mode === 'fault' ? 'About 7 days to act' : 'No near-term risk'}</Badge>
      </CardHeader>
      <div className="space-y-3">
        <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[150px]">
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <line key={v} x1={pad.left} x2={width - pad.right} y1={toY(v)} y2={toY(v)} stroke="#E6E0D6" strokeDasharray="2 3" opacity={0.5} />
            ))}
            <path d={areaPath} fill={mode === 'fault' ? '#C05043' : '#2E7D5B'} opacity={0.08} />
            <path d={upperPath} fill="none" stroke={mode === 'fault' ? '#C05043' : '#2E7D5B'} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
            <path d={lowerPath} fill="none" stroke={mode === 'fault' ? '#C05043' : '#2E7D5B'} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
            <path d={linePath} fill="none" stroke={mode === 'fault' ? '#C05043' : '#2E7D5B'} strokeWidth={2} />
            {points.filter((_, i) => i % 2 === 0).map((p, i) => (
              <circle key={i} cx={toX(p.day)} cy={toY(p.base)} r={2.5} fill={mode === 'fault' ? '#C05043' : '#2E7D5B'} stroke="#F1EDE6" strokeWidth={1} />
            ))}
            {/* threshold */}
            <line x1={pad.left} x2={width - pad.right} y1={toY(0.85)} y2={toY(0.85)} stroke="#B07B1C" strokeDasharray="5 3" />
              <text x={width - pad.right - 2} y={toY(0.85) - 4} fontSize="8" fontFamily="JetBrains Mono" fill="#B07B1C" textAnchor="end">ACTION LIMIT 85%</text>
          </svg>
          <div className="flex justify-between font-mono text-[8px] text-[#A99F90] px-1">
            <span>Today</span><span>Day 7</span><span>Day 14</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
          <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded p-2">
            <div className="text-[#8A8175] text-[9px]">Rate of change</div>
            <div className="text-[#1F2933] font-bold mt-1">{mode === 'fault' ? '0.12 A/day' : '0.01 A/day'}</div>
            <div className="text-[#A99F90] text-[9px] mt-1">Current increase each day</div>
          </div>
          <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded p-2">
            <div className="text-[#8A8175] text-[9px]">Forecast confidence</div>
            <div className="text-[#2C6E9B] font-bold mt-1">±24h @ 91%</div>
            <div className="text-[#A99F90] text-[9px] mt-1">Based on vibration and current</div>
          </div>
          <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded p-2">
            <div className="text-[#8A8175] text-[9px]">Next step</div>
            <div className={`font-bold mt-1 ${mode === 'fault' ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>{mode === 'fault' ? 'Inspect within 7 days' : 'Continue monitoring'}</div>
            <div className="text-[#A99F90] text-[9px] mt-1">Based on maintenance procedure</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
