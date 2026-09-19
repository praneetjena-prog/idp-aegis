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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {adjusted.map((sys) => {
        const Icon = sys.icon;
        const tone = sys.health > 85 ? 'text-[#2E7D5B]' : sys.health > 75 ? 'text-[#B07B1C]' : 'text-[#C05043]';
        const toneBg = sys.health > 85 ? 'bg-[#2E7D5B]' : sys.health > 75 ? 'bg-[#B07B1C]' : 'bg-[#C05043]';
        return (
          <button
            key={sys.id}
            type="button"
            onClick={() => onSelect(sys.id)}
            className="text-left p-2.5 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] hover:border-[#2C6E9B] dark:hover:border-[#58A6FF] hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className={`w-6 h-6 rounded flex items-center justify-center border ${
                sys.variant === 'nominal'
                  ? 'bg-[#2E7D5B]/10 border-[#2E7D5B]/20 text-[#2E7D5B]'
                  : sys.variant === 'attention'
                  ? 'bg-[#B07B1C]/10 border-[#B07B1C]/20 text-[#B07B1C]'
                  : 'bg-[#C05043]/10 border-[#C05043]/20 text-[#C05043]'
              }`}>
                <Icon size={13} />
              </div>
              <Badge variant={sys.variant}>{sys.status}</Badge>
            </div>
            <div className="font-mono text-[10px] font-bold text-[#1F2933] dark:text-[#FAF8F4] truncate uppercase tracking-tight">
              {sys.name}
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className={`font-mono text-[16px] font-bold ${tone}`}>{sys.health}%</span>
              <span className="font-mono text-[9px] text-[#8A8175] dark:text-[#A99F90] truncate max-w-[85px]">{sys.metric}</span>
            </div>
            <div className="mt-1.5 h-1 bg-[#F1EDE6] dark:bg-[#2C3847] rounded-full overflow-hidden">
              <div className={`h-full transition-all ${toneBg}`} style={{ width: `${sys.health}%` }} />
            </div>
          </button>
        );
      })}
    </div>
  );
});
