import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, Check, Wrench, FileText } from 'lucide-react';

export const WorkOrderHistory = ({ workOrders, onExport }) => {
  const history = [
    { id: '8818', asset: 'AHU-02', title: 'Belt tension adjustment', status: 'completed', date: '2026-09-08', tech: 'M. Singh' },
    { id: '8819', asset: 'ELEC-E3', title: 'Phase imbalance correction L2', status: 'completed', date: '2026-09-09', tech: 'J. Rivera' },
    { id: '8820', asset: 'CW-P01', title: 'Seal replacement', status: 'in_progress', date: '2026-09-11', tech: 'A. Kumar' },
    ...workOrders.map(wo => ({ id: wo.id, asset: wo.asset, title: wo.asset === 'AHU-03' ? 'Bearing degradation — outer race' : 'Strainer clogging', status: wo.status, date: new Date().toISOString().split('T')[0], tech: 'J. Rivera' }))
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Order Ledger • Field Operations</CardTitle>
        <div className="flex gap-1.5">
          <Badge variant="neutral">{history.length} Total</Badge>
          <Button variant="secondary" size="xs" onClick={() => onExport('json')}><FileText size={10} className="mr-1" /> Export Ledger</Button>
        </div>
      </CardHeader>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {history.map((wo) => (
          <div key={wo.id} className="flex items-center gap-3 p-2.5 bg-[#0B0E14] border border-[#1E2638] rounded-lg hover:border-[#26324D] transition-colors">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${wo.status === 'completed' ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]' : wo.status === 'in_progress' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#0EA5E9]/10 border-[#0EA5E9]/20 text-[#0EA5E9]'}`}>
              {wo.status === 'completed' ? <Check size={12} /> : wo.status === 'in_progress' ? <Clock size={12} /> : <Wrench size={12} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-white">#{wo.id}</span>
                <span className="font-mono text-[10px] text-slate-400">{wo.asset}</span>
                <Badge variant={wo.status === 'completed' ? 'nominal' : wo.status === 'in_progress' ? 'attention' : 'info'}>{wo.status}</Badge>
              </div>
              <div className="font-mono text-[11px] text-slate-300 truncate mt-0.5">{wo.title}</div>
              <div className="font-mono text-[9px] text-slate-500 mt-0.5">{wo.date} • {wo.tech}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
