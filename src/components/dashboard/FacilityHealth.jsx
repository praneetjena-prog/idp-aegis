import React from 'react';
import { Gauge } from '../ui/Gauge';
import { Card } from '../ui/Card';
import { Activity, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';

export const FacilityHealth = ({ mode }) => {
  const isFault = mode === 'fault';
  const health = isFault ? 74 : 91;

  return (
    <Card className="bg-[#FFFFFF] border-[#E6E0D6] p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E6E0D6]">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isFault ? 'bg-[#C05043] animate-pulse' : 'bg-[#2E7D5B]'}`} />
          <div>
            <h2 className="font-display text-[15px] font-bold text-[#1F2933]">
              Fleet Condition & Operating Health
            </h2>
            <p className="font-mono text-[10px] text-[#8A8175]">
              Continuous telemetry synthesis across 38 monitored rotating assets
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold border flex items-center gap-1.5 ${
          isFault 
            ? 'bg-[#C05043]/10 border-[#C05043]/30 text-[#C05043]' 
            : 'bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B]'
        }`}>
          {isFault ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
          <span>{isFault ? '1 Critical · 1 Advisory Action' : 'All 38 Assets Nominal'}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        {/* Gauge */}
        <div className="shrink-0">
          <Gauge value={health} delta={isFault ? '-4.2%' : '+2.1%'} />
        </div>

        {/* 3 Metric Tiles */}
        <div className="flex-1 w-full space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] flex items-center gap-1">
                <Activity size={10} /> Fleet Status
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-[20px] font-bold text-[#2E7D5B]">{isFault ? '31' : '36'}</span>
                <span className="font-mono text-[11px] text-[#554D42]">/ 38 Nominal</span>
              </div>
              <div className="mt-1 flex gap-2 font-mono text-[10px]">
                <span className="text-[#B07B1C] font-semibold">{isFault ? '6 Advisory' : '2 Advisory'}</span>
                <span className="text-[#C05043] font-bold">{isFault ? '1 Critical' : '0 Critical'}</span>
              </div>
            </div>

            <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] flex items-center gap-1">
                <Zap size={10} /> Power Efficiency
              </div>
              <div className="font-mono text-[20px] font-bold text-[#1F2933] mt-1">
                {isFault ? '+12.4%' : '+2.1%'}
              </div>
              <div className="font-mono text-[10px] text-[#8A8175] mt-1 truncate">
                {isFault ? 'Friction load on AHU-03' : 'Within energy envelope'}
              </div>
            </div>

            <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] flex items-center gap-1">
                <ShieldCheck size={10} /> MTBF / Availability
              </div>
              <div className="font-mono text-[20px] font-bold text-[#2E7D5B] mt-1">
                99.8%
              </div>
              <div className="font-mono text-[10px] text-[#8A8175] mt-1">
                Proactive triage active
              </div>
            </div>
          </div>

          {/* 14-Day Risk Horizon Bar */}
          <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-2.5">
            <div className="flex justify-between font-mono text-[9px] text-[#8A8175] uppercase tracking-wider mb-1.5">
              <span>14-Day Maintenance Risk Horizon</span>
              <span className="font-bold text-[#1F2933]">{isFault ? 'Moderate Risk (Intervention Required)' : 'Low Risk'}</span>
            </div>
            <div className="h-1.5 bg-[#E6E0D6] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#2E7D5B]" style={{ width: isFault ? '60%' : '85%' }} />
              <div className="h-full bg-[#B07B1C]" style={{ width: isFault ? '25%' : '12%' }} />
              <div className="h-full bg-[#C05043]" style={{ width: isFault ? '15%' : '3%' }} />
            </div>
            <div className="flex gap-4 font-mono text-[9px] text-[#6E6558] mt-1.5">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2E7D5B]" />Nominal ({isFault ? '60%' : '85%'})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#B07B1C]" />Advisory ({isFault ? '25%' : '12%'})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C05043]" />Critical ({isFault ? '15%' : '3%'})</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
