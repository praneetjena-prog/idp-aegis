import React from 'react';

export const Card = ({ children, className = '', hover = false, padding = true, ...props }) => {
  return (
    <div
      className={`bg-[#FFFFFF] border border-[#D2C9BA] rounded-[4px] shadow-[2px_2px_0_rgba(210,201,186,0.65)] ${padding ? 'p-4' : ''} ${hover ? 'hover:border-[#2C6E9B] hover:bg-[#FAF8F4] hover:shadow-[3px_3px_0_rgba(44,110,155,0.18)] transition-[border-color,background-color,box-shadow] cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-[#D2C9BA] ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-display text-[13px] font-semibold text-[#1F2933] ${className}`}>{children}</h3>
);
