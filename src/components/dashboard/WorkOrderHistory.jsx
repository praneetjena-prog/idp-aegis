import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, Check, Wrench, FileText } from 'lucide-react';

export const WorkOrderHistory = React.memo(({ workOrders, onExport, onClear }) => {
  const history = [
    { id: '8818', asset: 'AHU-02', title: 'Belt tension adjustment', status: 'completed', date: '2026-09-08', tech: 'M. Singh' },
    { id: '8819', asset: 'ELEC-E3', title: 'Phase imbalance correction L2', status: 'completed', date: '2026-09-09', tech: 'J. Rivera' },
    { id: '8820', asset: 'CW-P01', title: 'Seal replacement', status: 'in_progress', date: '2026-09-11', tech: 'A. Kumar' },
    ...workOrders.map(wo => ({ 
      id: wo.id, 
      asset: wo.asset, 
      title: wo.diagnosis || (wo.asset === 'AHU-03' ? 'Bearing degradation — outer race' : 'Strainer clogging'), 
      status: wo.status, 
      date: wo.created ? new Date(wo.created).toLocaleDateString() : new Date().toISOString().split('T')[0], 
      tech: 'J. Rivera' 
    }))
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance work orders</CardTitle>
        <div className="flex gap-1.5 items-center">
          <Badge variant="neutral">{history.length} Total</Badge>
          <Button variant="secondary" size="xs" onClick={() => onExport('json')}><FileText size={10} className="mr-1" /> Export list</Button>
          {workOrders?.length > 0 && onClear && (
            <Button variant="ghost" size="xs" onClick={onClear} title="Clear user dispatched work orders">Clear Dispatched</Button>
          )}
        </div>
      </CardHeader>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {history.map((wo) => (
          <div key={wo.id} className="flex items-center gap-3 p-2.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded-lg hover:border-[#D2C9BA] transition-colors">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${wo.status === 'completed' ? 'bg-[#2E7D5B]/10 border-[#2E7D5B]/20 text-[#2E7D5B]' : wo.status === 'in_progress' ? 'bg-[#B07B1C]/10 border-[#B07B1C]/20 text-[#B07B1C]' : 'bg-[#2C6E9B]/10 border-[#2C6E9B]/20 text-[#2C6E9B]'}`}>
              {wo.status === 'completed' ? <Check size={12} /> : wo.status === 'in_progress' ? <Clock size={12} /> : <Wrench size={12} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#1F2933]">#{wo.id}</span>
                <span className="font-mono text-[10px] text-[#6E6558]">{wo.asset}</span>
                <Badge variant={wo.status === 'completed' ? 'nominal' : wo.status === 'in_progress' ? 'attention' : 'info'}>{wo.status}</Badge>
              </div>
              <div className="font-mono text-[11px] text-[#3E4650] truncate mt-0.5">{wo.title}</div>
              <div className="font-mono text-[9px] text-[#8A8175] mt-0.5">{wo.date} • {wo.tech}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});
