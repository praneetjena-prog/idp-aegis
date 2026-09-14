import React from 'react';
import { Card } from '../ui/Card';
import { AlertTriangle, Bell, BatteryWarning } from 'lucide-react';

export const OperationalReality = () => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#2C6E9B]/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E6E0D6] border border-[#D2C9BA] flex items-center justify-center text-[#6E6558]">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-mono text-[12px] font-semibold text-[#1F2933] uppercase tracking-wider">The Fragmented Monitoring Trap</h4>
            <p className="mt-2 font-mono text-[11px] leading-[1.6] text-[#6E6558]">
              Technicians waste hours jumping between separate, closed vendor apps for chillers, electrical boards, and water pumps. No unified timeline. No correlation. Manual copy-paste diagnostics.
            </p>
            <div className="mt-3 flex gap-1.5">
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded text-[#8A8175]">BMS Vendor A</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded text-[#8A8175]">IoT Vendor B</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded text-[#8A8175]">Energy Portal</span>
            </div>
          </div>
        </div>
      </Card>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#B07B1C]/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#B07B1C]/10 border border-[#B07B1C]/20 flex items-center justify-center text-[#B07B1C]">
            <Bell size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-mono text-[12px] font-semibold text-[#1F2933] uppercase tracking-wider">Threshold Alert Fatigue</h4>
            <p className="mt-2 font-mono text-[11px] leading-[1.6] text-[#6E6558]">
              Static alarms ("Temperature &gt; 24°C") flood inboxes with false alarms, while subtle mechanical wear goes completely unnoticed until physical breakdown. 94% noise, 6% signal.
            </p>
            <div className="mt-3 font-mono text-[10px] text-[#B07B1C] bg-[#B07B1C]/10 border border-[#B07B1C]/20 rounded px-2 py-1">
              INBOX (247) • 12:04 Temp 24.1°C HIGH • 12:07 Temp 24.3°C HIGH • 12:09...
            </div>
          </div>
        </div>
      </Card>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#C05043]/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C05043]/10 border border-[#C05043]/20 flex items-center justify-center text-[#C05043]">
            <BatteryWarning size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-mono text-[12px] font-semibold text-[#1F2933] uppercase tracking-wider">Preventative Burnout</h4>
            <p className="mt-2 font-mono text-[11px] leading-[1.6] text-[#6E6558]">
              Small public maintenance crews are forced into crisis-management mode, spending limited operational budgets on emergency repairs rather than planned care. No forecasting.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[9px]">
              <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded p-1.5 text-center"><span className="text-[#C05043] block text-[12px] font-bold">78%</span>Emergency Calls</div>
              <div className="bg-[#F1EDE6] border border-[#E6E0D6] rounded p-1.5 text-center"><span className="text-[#8A8175] block text-[12px] font-bold">22%</span>Planned PM</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
