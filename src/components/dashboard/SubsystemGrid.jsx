import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Activity, Zap, Droplets, Cog, BarChart3 } from 'lucide-react';

const subsystems = [
  { id: 'hvac', name: 'HVAC Network', icon: Activity, health: 91, status: 'Nominal', variant: 'nominal', metric: 'Load: 242 kW', detail: 'AHU-01/02/03 • VAV 12 zones' },
  { id: 'electrical', name: 'Electrical Infrastructure', icon: Zap, health: 82, status: 'Attention', variant: 'attention', metric: 'Load Balance: 94.1%', detail: 'Phase imbalance L2 • Panel E-3' },
  { id: 'water', name: 'Hydraulic / Water Loops', icon: Droplets, health: 95, status: 'Nominal', variant: 'nominal', metric: 'Loop Pressure: 4.2 bar', detail: 'CW Loop • Domestic • 2 pumps' },
  { id: 'mechanical', name: 'Mechanical Equipment', icon: Cog, health: 74, status: 'Action Required', variant: 'critical', metric: 'Active Units: 38 Monitored', detail: 'Bearing wear AHU-03 • Belt AHU-02' },
  { id: 'energy', name: 'Overall Energy Efficiency', icon: BarChart3, health: 88, status: 'Nominal', variant: 'nominal', metric: 'Power Factor: 0.96', detail: 'Baseline +6.4% deviation' },
];

export const SubsystemGrid = React.memo(({ mode, onSelect }) => {
  const adjusted = subsystems.map(s => {
    if (mode === 'fault' && s.id === 'mechanical') return { ...s, health: 61, status: 'Critical', variant: 'critical' };
    if (mode === 'fault' && s.id === 'electrical') return { ...s, health: 74, status: 'Attention', variant: 'attention' };
    if (mode === 'fault' && s.id === 'hvac') return { ...s, health: 79, status: 'Attention', variant: 'attention' };
    return s;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {adjusted.map((sys) => {
        const Icon = sys.icon;
        return (
          <Card key={sys.id} hover padding={false} className="p-3.5 group" onClick={() => onSelect(sys.id)}>
            <div className="flex items-start justify-between mb-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${sys.variant==='nominal' ? 'bg-[#2E7D5B]/10 border-[#2E7D5B]/20 text-[#2E7D5B]' : sys.variant==='attention' ? 'bg-[#B07B1C]/10 border-[#B07B1C]/20 text-[#B07B1C]' : 'bg-[#C05043]/10 border-[#C05043]/20 text-[#C05043]'}`}>
                <Icon size={16} />
              </div>
              <Badge variant={sys.variant}>{sys.status}</Badge>
            </div>
            <div className="font-mono text-[11px] font-semibold text-[#1F2933] tracking-wide uppercase">{sys.name}</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="font-mono text-[20px] font-bold leading-none" style={{color: sys.health>85 ? '#2E7D5B' : sys.health>75 ? '#B07B1C' : '#C05043'}}>{sys.health}%</div>
                <div className="font-mono text-[9px] text-[#8A8175] uppercase tracking-wider mt-1">Health</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-[#3E4650]">{sys.metric}</div>
                <div className="font-mono text-[9px] text-[#8A8175] mt-0.5 max-w-[110px] truncate">{sys.detail}</div>
              </div>
            </div>
            <div className="mt-3 h-1 bg-[#F1EDE6] rounded-full overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${sys.health}%`, background: sys.health>85 ? '#2E7D5B' : sys.health>75 ? '#B07B1C' : '#C05043' }} />
            </div>
          </Card>
        );
      })}
    </div>
  );
});
