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

  const width = 450;
  const height = 170;
  const pad = { top: 22, right: 28, bottom: 28, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const toX = (i) => pad.left + (i / 13) * innerW;
  const toY = (v) => pad.top + (1 - v) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.base)}`).join(' ');
  const upperPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.upper)}`).join(' ');
  const lowerPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.lower)}`).join(' ');

  const areaPath = `${upperPath} L ${toX(13)} ${toY(points[13].lower)} ${points.slice().reverse().map((p, idx) => `L ${toX(13-idx)} ${toY(p.lower)}`).join(' ')} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
  const xTicks = [
    { i: 0, label: 'Today' },
    { i: 3, label: 'Day 3' },
    { i: 7, label: 'Day 7' },
    { i: 10, label: 'Day 10' },
    { i: 13, label: 'Day 14' }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Failure risk · next 14 days</CardTitle>
        <Badge variant={mode === 'fault' ? 'critical' : 'nominal'}>{mode === 'fault' ? 'About 7 days to act' : 'No near-term risk'}</Badge>
      </CardHeader>
      <div className="space-y-3">
        <div className="bg-[#F1EDE6] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#242C35] rounded-lg p-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[170px] overflow-visible">
            {/* Y-axis title */}
            <text x={pad.left} y={12} fontSize="7.5" fontWeight="bold" fontFamily="JetBrains Mono" className="fill-[#8A8175] dark:fill-[#9CA3AF]" textAnchor="start">
              FAILURE RISK (%)
            </text>

            {/* Horizontal grid lines & Y-axis labels */}
            {yTicks.map(v => (
              <g key={v}>
                <line 
                  x1={pad.left} 
                  x2={width - pad.right} 
                  y1={toY(v)} 
                  y2={toY(v)} 
                  stroke="#D2C9BA" 
                  strokeOpacity="0.4"
                  strokeDasharray={v === 0 ? undefined : "2 3"} 
                  className="dark:stroke-[#2E3B4B]"
                />
                <text 
                  x={pad.left - 6} 
                  y={toY(v) + 3} 
                  fontSize="7.5" 
                  fontFamily="JetBrains Mono" 
                  className="fill-[#8A8175] dark:fill-[#9CA3AF]" 
                  textAnchor="end"
                >
                  {Math.round(v * 100)}%
                </text>
              </g>
            ))}

            {/* X-axis baseline */}
            <line 
              x1={pad.left} 
              x2={width - pad.right} 
              y1={toY(0)} 
              y2={toY(0)} 
              stroke="#D2C9BA" 
              strokeWidth="1" 
              className="dark:stroke-[#3A4756]" 
            />

            {/* X-axis tick marks & labels */}
            {xTicks.map(t => (
              <g key={t.i}>
                <line 
                  x1={toX(t.i)} 
                  x2={toX(t.i)} 
                  y1={toY(0)} 
                  y2={toY(0) + 4} 
                  stroke="#8A8175" 
                  strokeWidth="1" 
                  className="dark:stroke-[#7D8795]" 
                />
                <text 
                  x={toX(t.i)} 
                  y={toY(0) + 14} 
                  fontSize="7.5" 
                  fontFamily="JetBrains Mono" 
                  className="fill-[#8A8175] dark:fill-[#9CA3AF]" 
                  textAnchor="middle"
                >
                  {t.label}
                </text>
              </g>
            ))}

            {/* X-axis timeline indicator */}
            <text 
              x={width - pad.right} 
              y={height - 3} 
              fontSize="7" 
              fontWeight="600" 
              fontFamily="JetBrains Mono" 
              className="fill-[#8A8175] dark:fill-[#7D8795]" 
              textAnchor="end"
            >
              FORECAST HORIZON →
            </text>

            {/* Confidence Area & Trajectory Lines */}
            <path d={areaPath} fill={mode === 'fault' ? '#C05043' : '#2E7D5B'} opacity={0.12} />
            <path d={upperPath} fill="none" stroke={mode === 'fault' ? '#C05043' : '#2E7D5B'} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
            <path d={lowerPath} fill="none" stroke={mode === 'fault' ? '#C05043' : '#2E7D5B'} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
            <path d={linePath} fill="none" stroke={mode === 'fault' ? '#C05043' : '#2E7D5B'} strokeWidth={2} />
            
            {points.filter((_, i) => i % 2 === 0).map((p, i) => (
              <circle key={i} cx={toX(p.day)} cy={toY(p.base)} r={2.5} fill={mode === 'fault' ? '#C05043' : '#2E7D5B'} stroke="#F1EDE6" strokeWidth={1} />
            ))}

            {/* Action Limit (85%) Threshold line */}
            <line 
              x1={pad.left} 
              x2={width - pad.right} 
              y1={toY(0.85)} 
              y2={toY(0.85)} 
              stroke="#B07B1C" 
              strokeDasharray="4 3" 
              strokeWidth="1.2" 
            />

            {/* Action Limit (85%) Unclipped Pill Badge */}
            <g transform={`translate(${width - pad.right - 98}, ${toY(0.85) - 13})`}>
              <rect 
                width="96" 
                height="12" 
                rx="2" 
                fill="#FDFBF7" 
                stroke="#B07B1C" 
                strokeWidth="0.8" 
                className="dark:fill-[#1A222C]"
              />
              <text 
                x="48" 
                y="8.5" 
                fontSize="7.5" 
                fontWeight="700" 
                fontFamily="JetBrains Mono" 
                fill="#B07B1C" 
                textAnchor="middle"
                letterSpacing="0.2"
              >
                ACTION LIMIT 85%
              </text>
            </g>
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
          <div className="bg-[#F1EDE6] dark:bg-[#19222C] border border-[#E6E0D6] dark:border-[#2A3441] rounded p-2">
            <div className="text-[#8A8175] dark:text-[#8D96A0] text-[9px]">Rate of change</div>
            <div className="text-[#1F2933] dark:text-[#E6E0D6] font-bold mt-1">{mode === 'fault' ? '0.12 A/day' : '0.01 A/day'}</div>
            <div className="text-[#A99F90] dark:text-[#7D8795] text-[9px] mt-1">Current increase each day</div>
          </div>
          <div className="bg-[#F1EDE6] dark:bg-[#19222C] border border-[#E6E0D6] dark:border-[#2A3441] rounded p-2">
            <div className="text-[#8A8175] dark:text-[#8D96A0] text-[9px]">Forecast confidence</div>
            <div className="text-[#2C6E9B] dark:text-[#58A6FF] font-bold mt-1">±24h @ 91%</div>
            <div className="text-[#A99F90] dark:text-[#7D8795] text-[9px] mt-1">Based on vibration and current</div>
          </div>
          <div className="bg-[#F1EDE6] dark:bg-[#19222C] border border-[#E6E0D6] dark:border-[#2A3441] rounded p-2">
            <div className="text-[#8A8175] dark:text-[#8D96A0] text-[9px]">Next step</div>
            <div className={`font-bold mt-1 ${mode === 'fault' ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>{mode === 'fault' ? 'Inspect within 7 days' : 'Continue monitoring'}</div>
            <div className="text-[#A99F90] dark:text-[#7D8795] text-[9px] mt-1">Based on maintenance procedure</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
