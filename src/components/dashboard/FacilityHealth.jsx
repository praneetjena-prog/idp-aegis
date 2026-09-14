import React from 'react';
import { Gauge } from '../ui/Gauge';
import { Card } from '../ui/Card';

export const FacilityHealth = ({ mode }) => {
  const health = mode === 'fault' ? 74 : 87;
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-[#E6E0D6]">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-[#1F2933]">Facility health</h2>
          <p className="mt-1 text-[11px] text-[#6E6558]">A quick view of equipment condition, energy use, and upcoming risk.</p>
        </div>
        <div className={`px-2.5 py-1 border font-display text-[11px] font-semibold ${mode === 'fault' ? 'bg-[#C05043]/10 border-[#C05043]/20 text-[#C05043]' : 'bg-[#2E7D5B]/10 border-[#2E7D5B]/20 text-[#2E7D5B]'}`}>
          {mode === 'fault' ? '2 items need attention' : 'Facility operating normally'}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <Gauge value={health} delta={mode==='fault' ? '-4.2%' : '+2.1%'} />
        <div className="flex-1 w-full">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
              <div className="text-[11px] text-[#6E6558] mb-1">Equipment</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[18px] font-bold text-[#2E7D5B]">{mode==='fault' ? '31' : '34'}</span>
                <span className="font-mono text-[11px] text-[#6E6558]">Nominal</span>
              </div>
              <div className="mt-1 flex gap-2 font-mono text-[10px]">
                <span className="text-[#B07B1C]">{mode==='fault' ? '5 Advisory' : '3 Advisory'}</span>
                <span className="text-[#C05043]">{mode==='fault' ? '2 Critical' : '1 Critical'}</span>
              </div>
            </div>
            <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
              <div className="text-[11px] text-[#6E6558] mb-1">Energy use</div>
              <div className="font-mono text-[12px] font-medium text-[#B07B1C]">{mode==='fault' ? '12.4%' : '6.4%'} above expected</div>
              <div className="mt-1 text-[10px] text-[#8A8175]">Inspect HVAC-E3</div>
              <div className="mt-2 h-1 bg-[#E6E0D6] rounded-full overflow-hidden">
                <div className="h-full bg-[#B07B1C]" style={{width: mode==='fault' ? '78%' : '64%'}} />
              </div>
            </div>
            <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg p-3">
              <div className="text-[11px] text-[#6E6558] mb-1">Uptime · last 30 days</div>
              <div className="font-mono text-[18px] font-bold text-[#1F2933]">99.8%</div>
              <div className="mt-1 text-[10px] text-[#2E7D5B]">94% of issues caught early</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-[10px] text-[#8A8175] uppercase">
              <span>Expected risk over the next 14 days</span>
              <span>{mode==='fault' ? 'Elevated' : 'Low'}</span>
            </div>
            <div className="h-1.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#2E7D5B]" style={{width: '60%'}} />
              <div className="h-full bg-[#B07B1C]" style={{width: mode==='fault' ? '25%' : '15%'}} />
              <div className="h-full bg-[#C05043]" style={{width: mode==='fault' ? '15%' : '5%'}} />
            </div>
            <div className="flex gap-3 font-mono text-[9px] text-[#A99F90]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2E7D5B]" />Nominal 60%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#B07B1C]" />Advisory {mode==='fault' ? '25%' : '15%'}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C05043]" />Critical {mode==='fault' ? '15%' : '5%'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
