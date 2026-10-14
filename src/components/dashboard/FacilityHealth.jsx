import React from 'react';
import { Gauge } from '../ui/Gauge';
import { Card } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, CheckCircle2, Shield, Wrench, Clock, Activity } from 'lucide-react';

export const FacilityHealth = ({ mode, onInspectAlert, onCreateWorkOrder, isDispatched }) => {
  const { user } = useAuth();
  const role = user?.role || 'manager';
  const isFault = mode === 'fault';
  const health = isFault ? 74 : 91;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#E6E0D6] dark:border-[#2C3847]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[17px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              Facility Health & Condition Index
            </h2>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              isFault 
                ? 'bg-[#C05043]/10 border-[#C05043]/30 text-[#C05043]' 
                : 'bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B]'
            }`}>
              {isFault ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
              {isFault ? 'Attention Required (AHU-03)' : 'All 38 Units Nominal'}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
            {isFault
              ? 'Multi-parameter anomaly detected on Air Handler AHU-03 supply fan. Other 37 campus machines operating within nominal ISO baseline.'
              : 'Fleet vibration velocity, phase currents, and bearing temperatures are balanced across all 5 monitored campus subsystems.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-[#8A8175]">Target Baseline: &gt; 85%</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Overall Health Gauge */}
        <div className="md:col-span-4 lg:col-span-3 flex justify-center py-1">
          <Gauge value={health} delta={isFault ? '-4.2% (7D)' : '+2.1% (7D)'} />
        </div>

        {/* Right: Operational KPI Grid */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
              <div className="text-[10px] font-mono uppercase font-bold text-[#8A8175] flex items-center justify-between">
                <span>Equipment</span>
                <Activity size={12} className="text-[#2C6E9B]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-mono text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  {isFault ? '37/38' : '38/38'}
                </span>
                <span className="text-[10px] font-mono text-[#2E7D5B] font-semibold">Running</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#8A8175]">
                {isFault ? '1 Unit Advisory' : '0 Offline'}
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
              <div className="text-[10px] font-mono uppercase font-bold text-[#8A8175] flex items-center justify-between">
                <span>Active Alerts</span>
                <AlertTriangle size={12} className={isFault ? 'text-[#C05043]' : 'text-[#8A8175]'} />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className={`font-mono text-[20px] font-bold ${isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
                  {isFault ? '1 Critical' : '0 Active'}
                </span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#8A8175]">
                {isFault ? '1 Advisory (Strainer)' : 'Zero Alarm State'}
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
              <div className="text-[10px] font-mono uppercase font-bold text-[#8A8175] flex items-center justify-between">
                <span>Work Orders</span>
                <Wrench size={12} className="text-[#2C6E9B]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-mono text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  {isDispatched ? '1 Dispatched' : isFault ? '1 Pending' : '0 Open'}
                </span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#8A8175]">
                {isDispatched ? 'WO #8821 Active' : isFault ? 'WO #8821 Ready' : 'Routine Cycle'}
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg">
              <div className="text-[10px] font-mono uppercase font-bold text-[#8A8175] flex items-center justify-between">
                <span>Facility Uptime</span>
                <Clock size={12} className="text-[#2E7D5B]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-mono text-[20px] font-bold text-[#2E7D5B]">
                  99.8%
                </span>
                <span className="text-[10px] font-mono text-[#8A8175]">30d</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#8A8175]">
                94% issues caught early
              </div>
            </div>
          </div>

          {/* 14-Day Risk Horizon Projection */}
          <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#8A8175] font-semibold">
              <span>Projected 14-Day Risk Horizon</span>
              <span className={isFault ? 'text-[#C05043] font-bold' : 'text-[#2E7D5B] font-bold'}>
                {isFault ? 'Elevated (Intervention in ~7 Days)' : 'Low Risk (Nominal Operation)'}
              </span>
            </div>
            <div className="h-2 bg-[#E6E0D6] dark:bg-[#2C3847] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#2E7D5B]" style={{ width: isFault ? '60%' : '88%' }} title="Nominal Equipment" />
              <div className="h-full bg-[#B07B1C]" style={{ width: isFault ? '25%' : '9%' }} title="Advisory Attention" />
              <div className="h-full bg-[#C05043]" style={{ width: isFault ? '15%' : '3%' }} title="Critical Risk" />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#8A8175] pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E7D5B]" /> 60% Safe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B07B1C]" /> 25% Watch
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C05043]" /> 15% Intervention Window
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
