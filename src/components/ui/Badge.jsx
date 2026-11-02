import React from 'react';

export const Badge = ({ variant = 'nominal', children, className = '' }) => {
  const variants = {
    nominal: "bg-[#EAF5EE] dark:bg-[#2E7D5B]/20 text-[#1E563E] dark:text-[#72c987] border-[#2E7D5B]",
    attention: "bg-[#FEF6E6] dark:bg-[#B07B1C]/20 text-[#7A530F] dark:text-[#e5b158] border-[#B07B1C]",
    critical: "bg-[#FDECE9] dark:bg-[#C05043]/20 text-[#8C2E24] dark:text-[#e07569] border-[#C05043]",
    info: "bg-[#E8F2F8] dark:bg-[#2C6E9B]/20 text-[#1D5174] dark:text-[#62a8d2] border-[#2C6E9B]",
    neutral: "bg-[#F1EDE6] dark:bg-[#1A222B] text-[#4F463B] dark:text-[#A0988A] border-[#1F2933] dark:border-[#3D5355]"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase border-[1.5px] shadow-[1px_1px_0_#1F2933] dark:shadow-none ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
