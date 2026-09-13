import React from 'react';

export const Button = ({ variant = 'primary', size = 'sm', children, className = '', ...props }) => {
  const base = "inline-flex items-center justify-center font-mono text-[11px] font-semibold tracking-wider uppercase rounded-md transition-all focus:outline-none focus:ring-1 disabled:opacity-50";
  const variants = {
    primary: "bg-[#0EA5E9] text-white hover:bg-[#0284C7] focus:ring-[#0EA5E9]/50",
    secondary: "bg-[#1E2638] text-slate-300 border border-[#26324D] hover:bg-[#26324D] hover:text-white",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-[#1E2638]",
    critical: "bg-[#EF4444] text-white hover:bg-[#DC2626]",
    teal: "bg-[#14B8A6] text-black hover:bg-[#0D9488] font-bold"
  };
  const sizes = {
    xs: "px-2.5 py-1 text-[10px]",
    sm: "px-3 py-1.5",
    md: "px-4 py-2 text-xs"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
