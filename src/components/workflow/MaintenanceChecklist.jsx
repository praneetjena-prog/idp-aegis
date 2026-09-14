import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckSquare, Square, Printer, Download } from 'lucide-react';

const initialTasks = [
  { id: 1, text: "Lockout/Tagout • Isolate AHU-03 at disconnect • Verify zero energy", category: "Safety", checked: true },
  { id: 2, text: "Inspect bearing housing grease • Check for metal particulate • Photo log", category: "Inspection", checked: true },
  { id: 3, text: "Lubricate bearing • NLGI #2 • 2 pumps • Wipe excess", category: "Repair", checked: false },
  { id: 4, text: "Check pulley alignment • Straight edge • <0.5mm offset", category: "Mechanical", checked: false },
  { id: 5, text: "Verify belt tension • 45-55 Hz • Tension gauge", category: "Mechanical", checked: false },
  { id: 6, text: "Torque set screws • 8 Nm • Loctite 243", category: "Mechanical", checked: false },
  { id: 7, text: "Phase current under manual bypass • Expected 14.2A ±0.5A • Imbalance <2%", category: "Electrical", checked: false },
  { id: 8, text: "Run 10min validation • Vibration target <2.5 mm/s • Current <14.8A", category: "Validation", checked: false },
  { id: 9, text: "Log repair to Aegis • Upload vibration spectrum • Close WO #8821", category: "Documentation", checked: false },
];

export const MaintenanceChecklist = ({ onExport }) => {
  const [tasks, setTasks] = useState(initialTasks);

  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  const progress = Math.round((tasks.filter(t => t.checked).length / tasks.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportable Maintenance Checklist • AHU-03 • WO #8821</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{tasks.filter(t => t.checked).length}/{tasks.length} Done</Badge>
          <div className="w-20 h-1.5 bg-[#F1EDE6] border border-[#E6E0D6] rounded-full overflow-hidden">
            <div className="h-full bg-[#2E7D5B] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </CardHeader>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {tasks.map(task => (
          <button key={task.id} onClick={() => toggle(task.id)} className="w-full text-left flex items-start gap-2.5 p-2 rounded-lg bg-[#F1EDE6] border border-[#E6E0D6] hover:border-[#D2C9BA] transition-colors">
            {task.checked ? <CheckSquare size={14} className="text-[#2E7D5B] mt-0.5 shrink-0" /> : <Square size={14} className="text-[#A99F90] mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] px-1 py-0.5 bg-[#E6E0D6] border border-[#D2C9BA] rounded text-[#6E6558] uppercase">{task.category}</span>
                <span className={`font-mono text-[11px] leading-[1.4] ${task.checked ? 'text-[#8A8175] line-through' : 'text-[#3E4650]'}`}>{task.text}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="teal" size="sm" className="flex-1" onClick={() => onExport('checklist')}><Printer size={12} className="mr-1.5" /> Print Field Sheet (PDF)</Button>
        <Button variant="secondary" size="sm" onClick={() => onExport('json')}><Download size={12} className="mr-1" /> Export JSON</Button>
      </div>
      <div className="mt-2 font-mono text-[9px] text-[#A99F90]">Designed for mobile field tablets • High contrast • Offline capable • No vendor lock-in</div>
    </Card>
  );
};
