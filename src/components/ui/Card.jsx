import React from 'react';

export const Card = ({ children, className = '', hover = false, padding = true, ...props }) => {
  return (
    <div
      className={`bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] ${padding ? 'p-4 sm:p-5' : ''} ${hover ? 'hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#1F2933] dark:hover:shadow-[5px_5px_0_#0F151C] transition-all cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between gap-3 mb-3.5 pb-3 border-b-2 border-[#1F2933]/15 dark:border-[#2C3847] ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-display text-[14px] font-bold tracking-tight text-[#1F2933] dark:text-[#FAF8F4] uppercase ${className}`}>{children}</h3>
);
