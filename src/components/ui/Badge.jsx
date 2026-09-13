import React from 'react';

export const Badge = ({ variant = 'nominal', children, className = '' }) => {
  const variants = {
    nominal: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30",
    attention: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    critical: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
    info: "bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30",
    neutral: "bg-[#1E2638] text-slate-400 border-[#26324D]"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
