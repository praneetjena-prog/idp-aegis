import React from 'react';

export const Gauge = ({ value = 87, max = 100, label = "HEALTH", delta = "+2.1%" }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = value / max;
  const offset = circumference - progress * circumference * 0.75; // 270 deg arc
  const rotation = 135; // start angle

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-[160px] h-[160px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#E6E0D6"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            transform={`rotate(${rotation} 80 80)`}
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={value > 80 ? "#2E7D5B" : value > 60 ? "#B07B1C" : "#C05043"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={offset}
            transform={`rotate(${rotation} 80 80)`}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[36px] font-bold tracking-tight text-[#1F2933]">{value}</span>
          <span className="font-mono text-[11px] text-[#8A8175] -mt-1">/ {max}</span>
          <div className="mt-1 px-1.5 py-0.5 rounded bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 text-[10px] font-mono text-[#2E7D5B]">{delta} 7D</div>
        </div>
      </div>
      <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[#8A8175] uppercase">{label}</span>
    </div>
  );
};
