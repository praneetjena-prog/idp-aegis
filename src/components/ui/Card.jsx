import React from 'react';

export const Card = ({ children, className = '', hover = false, padding = true, ...props }) => {
  return (
    <div
      className={`bg-[#121721] border border-[#1E2638] rounded-[10px] ${padding ? 'p-4' : ''} ${hover ? 'hover:border-[#26324D] hover:bg-[#151C29] transition-all cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-3 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-[13px] font-semibold tracking-wide text-slate-200 uppercase ${className}`}>{children}</h3>
);
