import React from 'react';
import { Card } from '../ui/Card';
import { AlertTriangle, Bell, BatteryWarning } from 'lucide-react';

export const OperationalReality = () => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#0EA5E9]/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1E2638] border border-[#26324D] flex items-center justify-center text-slate-400">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-mono text-[12px] font-semibold text-white uppercase tracking-wider">The Fragmented Monitoring Trap</h4>
            <p className="mt-2 font-mono text-[11px] leading-[1.6] text-slate-400">
              Technicians waste hours jumping between separate, closed vendor apps for chillers, electrical boards, and water pumps. No unified timeline. No correlation. Manual copy-paste diagnostics.
            </p>
            <div className="mt-3 flex gap-1.5">
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#0B0E14] border border-[#1E2638] rounded text-slate-500">BMS Vendor A</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#0B0E14] border border-[#1E2638] rounded text-slate-500">IoT Vendor B</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#0B0E14] border border-[#1E2638] rounded text-slate-500">Energy Portal</span>
            </div>
          </div>
        </div>
      </Card>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B]/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
            <Bell size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-mono text-[12px] font-semibold text-white uppercase tracking-wider">Threshold Alert Fatigue</h4>
            <p className="mt-2 font-mono text-[11px] leading-[1.6] text-slate-400">
              Static alarms ("Temperature &gt; 24°C") flood inboxes with false alarms, while subtle mechanical wear goes completely unnoticed until physical breakdown. 94% noise, 6% signal.
            </p>
            <div className="mt-3 font-mono text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded px-2 py-1">
              INBOX (247) • 12:04 Temp 24.1°C HIGH • 12:07 Temp 24.3°C HIGH • 12:09...
            </div>
          </div>
        </div>
      </Card>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#EF4444]/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
            <BatteryWarning size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-mono text-[12px] font-semibold text-white uppercase tracking-wider">Preventative Burnout</h4>
            <p className="mt-2 font-mono text-[11px] leading-[1.6] text-slate-400">
              Small public maintenance crews are forced into crisis-management mode, spending limited operational budgets on emergency repairs rather than planned care. No forecasting.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[9px]">
              <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-1.5 text-center"><span className="text-[#EF4444] block text-[12px] font-bold">78%</span>Emergency Calls</div>
              <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-1.5 text-center"><span className="text-slate-500 block text-[12px] font-bold">22%</span>Planned PM</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
