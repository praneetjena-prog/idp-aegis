import React from 'react';
import { Gauge } from '../ui/Gauge';
import { Card } from '../ui/Card';

export const FacilityHealth = ({ mode }) => {
  const health = mode === 'fault' ? 74 : 87;
  return (
    <Card className="h-full">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <Gauge value={health} delta={mode==='fault' ? '-4.2%' : '+2.1%'} />
        <div className="flex-1 w-full">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">Equipment Status</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[18px] font-bold text-[#10B981]">{mode==='fault' ? '31' : '34'}</span>
                <span className="font-mono text-[11px] text-slate-400">Nominal</span>
              </div>
              <div className="mt-1 flex gap-2 font-mono text-[10px]">
                <span className="text-[#F59E0B]">{mode==='fault' ? '5 Advisory' : '3 Advisory'}</span>
                <span className="text-[#EF4444]">{mode==='fault' ? '2 Critical' : '1 Critical'}</span>
              </div>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">Resource Opt.</div>
              <div className="font-mono text-[12px] font-medium text-[#F59E0B]">Energy dev: {mode==='fault' ? '+12.4%' : '+6.4%'}</div>
              <div className="mt-1 font-mono text-[10px] text-slate-500">Flagged for inspection • HVAC-E3</div>
              <div className="mt-2 h-1 bg-[#1E2638] rounded-full overflow-hidden">
                <div className="h-full bg-[#F59E0B]" style={{width: mode==='fault' ? '78%' : '64%'}} />
              </div>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">Uptime • 30D</div>
              <div className="font-mono text-[18px] font-bold text-white">99.8%</div>
              <div className="mt-1 font-mono text-[10px] text-[#10B981]">94% pre-failure catch</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-[10px] text-slate-500 uppercase">
              <span>Failure Risk Trajectory (Next 14D)</span>
              <span>{mode==='fault' ? 'Elevated' : 'Low'}</span>
            </div>
            <div className="h-1.5 bg-[#0B0E14] border border-[#1E2638] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#10B981]" style={{width: '60%'}} />
              <div className="h-full bg-[#F59E0B]" style={{width: mode==='fault' ? '25%' : '15%'}} />
              <div className="h-full bg-[#EF4444]" style={{width: mode==='fault' ? '15%' : '5%'}} />
            </div>
            <div className="flex gap-3 font-mono text-[9px] text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" />Nominal 60%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />Advisory {mode==='fault' ? '25%' : '15%'}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]" />Critical {mode==='fault' ? '15%' : '5%'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
