import React from 'react';

/**
 * Circular arc gauge for industrial facility health and condition index.
 * Designed with proper bounding geometry to eliminate text clipping at any zoom level or screen scale.
 */
export const Gauge = ({ value = 87, max = 100, label = "HEALTH", delta = "+2.1%" }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, value / max));
  const offset = circumference - progress * circumference * 0.75; // 270 deg arc
  const rotation = 135; // start angle

  // Clean delta string so it doesn't duplicate '7D'
  const cleanDelta = delta ? (delta.includes('7D') ? delta : `${delta} (7D)`) : null;
  const isNegative = cleanDelta ? cleanDelta.trim().startsWith('-') : false;

  // Arc stroke color based on standard health thresholds
  const strokeColor = value > 80 ? '#2E7D5B' : value > 60 ? '#B07B1C' : '#C05043';

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-[160px] h-[160px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background Track Circle */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            className="stroke-[#E6E0D6] dark:stroke-[#2C3847]"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            transform={`rotate(${rotation} 80 80)`}
          />
          {/* Animated Value Arc */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={offset}
            transform={`rotate(${rotation} 80 80)`}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center Content: Numerical Health Score & Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pt-1">
          <div className="flex items-baseline justify-center">
            <span className="font-mono text-[36px] font-bold tracking-tight text-[#1F2933] dark:text-[#FAF8F4] leading-none">
              {value}
            </span>
            <span className="font-mono text-[12px] text-[#8A8175] ml-0.5 font-semibold">
              /{max}
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#8A8175] uppercase mt-1 font-bold">
            {label}
          </span>
        </div>
      </div>

      {/* Trend Pill: Placed safely below the circular arc to guarantee zero clipping at any zoom */}
      {cleanDelta && (
        <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
          isNegative
            ? 'bg-[#C05043]/10 border-[#C05043]/25 text-[#C05043]'
            : 'bg-[#2E7D5B]/10 border-[#2E7D5B]/25 text-[#2E7D5B]'
        }`}>
          <span>{cleanDelta}</span>
        </div>
      )}
    </div>
  );
};
