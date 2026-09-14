import React from 'react';

export const Badge = ({ variant = 'nominal', children, className = '' }) => {
  const variants = {
    nominal: "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/30",
    attention: "bg-[#B07B1C]/10 text-[#B07B1C] border-[#B07B1C]/30",
    critical: "bg-[#C05043]/10 text-[#C05043] border-[#C05043]/30",
    info: "bg-[#2C6E9B]/10 text-[#2C6E9B] border-[#2C6E9B]/30",
    neutral: "bg-[#E6E0D6] text-[#6E6558] border-[#D2C9BA]"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
