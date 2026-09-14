import React from 'react';

export const Button = ({ variant = 'primary', size = 'sm', children, className = '', ...props }) => {
  const base = "inline-flex items-center justify-center font-display text-[10px] font-bold uppercase rounded-[3px] border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50";
  const variants = {
    primary: "bg-[#2C6E9B] border-[#2C6E9B] text-[#FFFFFF] hover:bg-[#1F5679] hover:border-[#1F5679] focus:ring-[#2C6E9B]/50",
    secondary: "bg-[#FFFFFF] text-[#3E4650] border-[#D2C9BA] hover:bg-[#F1EDE6] hover:text-[#1F2933]",
    ghost: "bg-transparent border-transparent text-[#6E6558] hover:text-[#1F2933] hover:bg-[#F1EDE6]",
    critical: "bg-[#C05043] border-[#C05043] text-[#FFFFFF] hover:bg-[#9E3E33] hover:border-[#9E3E33]",
    teal: "bg-[#2F8A7E] border-[#2F8A7E] text-[#FFFFFF] hover:bg-[#23665D] hover:border-[#23665D]"
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
