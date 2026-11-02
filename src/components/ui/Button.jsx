import React from 'react';

export const Button = ({ variant = 'primary', size = 'sm', children, className = '', ...props }) => {
  const base = "inline-flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg border-2 border-[#1F2933] dark:border-[#2C3847] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  const variants = {
    primary: "bg-[#2C6E9B] text-[#FFFFFF] hover:bg-[#23587c]",
    secondary: "bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] hover:bg-[#FAF8F4] dark:hover:bg-[#202B37]",
    ghost: "bg-transparent border-transparent shadow-none text-[#6E6558] dark:text-[#A0988A] hover:text-[#1F2933] dark:hover:text-[#FAF8F4] hover:bg-[#FAF8F4] dark:hover:bg-[#1A222B]",
    critical: "bg-[#C05043] text-[#FFFFFF] hover:bg-[#9E3E33]",
    teal: "bg-[#2E7D5B] text-[#FFFFFF] hover:bg-[#246348]"
  };
  const sizes = {
    xs: "px-2 py-0.5 text-[9px]",
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
