import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ExternalLink, 
  User, 
  MapPin, 
  Shield, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  QrCode, 
  Sparkles, 
  RefreshCw, 
  Check, 
  CalendarDays,
  ListFilter,
  Users,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ASSET_REGISTRY } from '../asset/AssetQrModal';

const STORAGE_PM_KEY = 'aegis-pm-schedule';

export const INITIAL_PM_TASKS = [
  {
    id: 'pm-ahu03-urgent',
    assetId: 'ahu-03',
    assetCode: 'AHU-03',
    title: 'Bearing Overhaul & Dynamic Alignment',
    subsystem: 'HVAC Air Handlers',
    type: 'predictive',
    date: '2026-10-06',
    startTime: '06:00',
    endTime: '09:30',
    tech: 'J. Rivera',
    priority: 'critical',
    location: 'East Wing • Roof Level 3',
    status: 'scheduled',
    windowReason: 'Slotted in off-peak morning window before tenant occupancy (7-day RUL target)',
    parts: 'SKF 6205-2RS Bearings (x2), NLGI #2 Synthetic Grease, B-62 Belts',
    sop: 'SOP-EL-03 (LOTO) & SOP-MECH-01 (Bearing Replacement)'
  },
  {
    id: 'pm-pump02-routine',
    assetId: 'cw-pump-02',
    assetCode: 'CW-PUMP-02',
    title: 'Duplex Strainer Cleanout & Seal Leak Audit',
    subsystem: 'Hydraulic / Water Loops',
    type: 'preventive',
    date: '2026-10-08',
    startTime: '13:00',
    endTime: '15:00',
    tech: 'A. Kumar',
    priority: 'attention',
    location: 'Basement Mechanical Penthouse B2',
    status: 'scheduled',
    windowReason: 'Bi-weekly hydraulic differential pressure inspection',
    parts: 'Strainer O-Ring Gaskets, Polyurea #2 Grease',
    sop: 'SOP-HY-02 (Hydraulic Circuit Isolation)'
  },
  {
    id: 'pm-elec01-quarterly',
    assetId: 'elec-01',
    assetCode: 'SW-PANEL-01',
    title: 'Main Busbar Thermal IR Scan & Feeder Torquing',
    subsystem: 'Electrical Infrastructure',
    type: 'preventive',
    date: '2026-10-14',
    startTime: '05:00',
    endTime: '07:30',
    tech: 'M. Singh',
    priority: 'nominal',
    location: 'Electrical Vault West',
    status: 'scheduled',
    windowReason: 'Quarterly thermographic audit & phase torque validation',
    parts: 'FLIR Thermal Imager, Calibrated Torque Wrench (50 Nm)',
    sop: 'SOP-NFPA-70E (Arc Flash Category 2)'
  },
  {
    id: 'pm-vav4b-hunting',
    assetId: 'vav-4b',
    assetCode: 'VAV-BOX-4B',
    title: 'Damper Actuator Stroke & Pitot Zeroing',
    subsystem: 'HVAC Network',
    type: 'optimization',
    date: '2026-10-19',
    startTime: '16:00',
    endTime: '17:30',
    tech: 'J. Rivera',
    priority: 'info',
    location: 'Building B • 4th Floor Ceiling Plen.',
    status: 'scheduled',
    windowReason: 'Correction of 20-80% actuator hunting oscillation',
    parts: 'Belimo 24VAC Actuator Calibration Tool',
    sop: 'SOP-VAV-CAL-04'
  },
  {
    id: 'pm-chiller01-routine',
    assetId: 'chiller-01',
    assetCode: 'CHILLER-01',
    title: 'Refrigerant Pressure Delta & Condenser Approach Audit',
    subsystem: 'Chilled Water Plant',
    type: 'preventive',
    date: '2026-10-24',
    startTime: '07:00',
    endTime: '11:00',
    tech: 'A. Kumar',
    priority: 'nominal',
    location: 'Central Plant Room A',
    status: 'scheduled',
    windowReason: 'Scheduled biannual centrifugal chiller efficiency check',
    parts: 'R-134a Diagnostic Manifold, Synthetic Ester Oil Sample Kit',
    sop: 'SOP-CH-01 (Chiller Plant SOP)'
  },
  {
    id: 'pm-ahu02-done',
    assetId: 'ahu-03',
    assetCode: 'AHU-02',
    title: 'Belt Replacement & Tension Verification',
    subsystem: 'HVAC Air Handlers',
    type: 'preventive',
    date: '2026-09-28',
    startTime: '09:00',
    endTime: '11:00',
    tech: 'M. Singh',
    priority: 'nominal',
    location: 'East Wing Roof Level 2',
    status: 'completed',
    windowReason: 'Routine PM successfully completed and audited',
    parts: 'B-60 Match Belts',
    sop: 'SOP-MECH-02'
  }
];

export function generateIcsFile(task) {
  const start = task.date.replace(/-/g, '') + 'T' + task.startTime.replace(/:/g, '') + '00Z';
  const end = task.date.replace(/-/g, '') + 'T' + task.endTime.replace(/:/g, '') + '00Z';
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aegis Facility OS//Preventive Maintenance Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:aegis-pm-${task.id}-${Date.now()}@aegis-open`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Aegis PM: ${task.assetCode} • ${task.title}`,
    `DESCRIPTION:Asset: ${task.assetCode} (${task.subsystem})\\nLocation: ${task.location}\\nAssigned Technician: ${task.tech}\\nPriority: ${task.priority.toUpperCase()}\\nSOP: ${task.sop}\\nRequired Spare Parts: ${task.parts}\\nContext: ${task.windowReason}\\nPassport: https://praneetjena-prog.github.io/idp-aegis/#asset/${task.assetId}`,
    `LOCATION:${task.location}, Campus Unit 01`,
    'STATUS:CONFIRMED',
    `PRIORITY:${task.priority === 'critical' ? '1' : '3'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aegis-pm-${task.assetCode.toLowerCase()}-${task.date}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function getGoogleCalendarUrl(task) {
  const start = task.date.replace(/-/g, '') + 'T' + task.startTime.replace(/:/g, '') + '00Z';
  const end = task.date.replace(/-/g, '') + 'T' + task.endTime.replace(/:/g, '') + '00Z';
  const title = encodeURIComponent(`Aegis PM: ${task.assetCode} • ${task.title}`);
  const details = encodeURIComponent(
    `Asset: ${task.assetCode} (${task.subsystem})\n` +
    `Location: ${task.location}\n` +
    `Technician: ${task.tech}\n` +
    `SOP: ${task.sop}\n` +
    `Required Parts: ${task.parts}\n` +
    `Window Context: ${task.windowReason}\n` +
    `Direct QR Passport: https://praneetjena-prog.github.io/idp-aegis/#asset/${task.assetId}`
  );
  const location = encodeURIComponent(`${task.location}, Campus Facility Unit 01`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export const MaintenanceScheduler = ({
  feedMode = 'fault',
  onSelectAsset,
  onPrintFieldSheet,
  showToast
}) => {
  const [tasks, setTasks] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_PM_TASKS;
    try {
      const saved = window.localStorage.getItem(STORAGE_PM_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PM_TASKS;
    } catch {
      return INITIAL_PM_TASKS;
    }
  });

  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'timeline' | 'roster'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'predictive' | 'preventive' | 'completed'
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Custom new task form state
  const [newAssetId, setNewAssetId] = useState('ahu-03');
  const [newDate, setNewDate] = useState('2026-10-12');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newTech, setNewTech] = useState('J. Rivera');
  const [newTitle, setNewTitle] = useState('Quarterly Comprehensive PM');
  const [newPriority, setNewPriority] = useState('nominal');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_PM_KEY, JSON.stringify(tasks));
      } catch {
        // storage quota fallback
      }
    }
  }, [tasks]);

  const toggleTaskStatus = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'scheduled' : 'completed';
        if (showToast) {
          showToast(`PM ${t.assetCode}: Status marked as ${nextStatus.toUpperCase()}`);
        }
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleAutoSlotAhu03 = () => {
    const existing = tasks.find(t => t.id === 'pm-ahu03-urgent');
    if (existing) {
      if (showToast) showToast('AHU-03 Bearing Overhaul is already auto-slotted for 2026-10-06 06:00');
      return;
    }
    const urgentTask = {
      id: 'pm-ahu03-urgent',
      assetId: 'ahu-03',
      assetCode: 'AHU-03',
      title: 'Bearing Overhaul & Dynamic Alignment',
      subsystem: 'HVAC Air Handlers',
      type: 'predictive',
      date: '2026-10-06',
      startTime: '06:00',
      endTime: '09:30',
      tech: 'J. Rivera',
      priority: 'critical',
      location: 'East Wing • Roof Level 3',
      status: 'scheduled',
      windowReason: 'Auto-slotted off-peak window based on 7-day RUL failure forecast',
      parts: 'SKF 6205-2RS Bearings (x2), NLGI #2 Grease, B-62 Belts',
      sop: 'SOP-EL-03 & SOP-MECH-01'
    };
    setTasks(prev => [urgentTask, ...prev]);
    if (showToast) showToast('✓ Auto-slotted AHU-03 maintenance window for 2026-10-06 (06:00–09:30)');
  };

  const handleAddNewTask = (e) => {
    e.preventDefault();
    const asset = ASSET_REGISTRY[newAssetId] || ASSET_REGISTRY['ahu-03'];
    const newTask = {
      id: `pm-custom-${Date.now()}`,
      assetId: asset.id,
      assetCode: asset.code,
      title: newTitle || 'Scheduled Preventive Maintenance',
      subsystem: asset.subsystem,
      type: 'preventive',
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      tech: newTech,
      priority: newPriority,
      location: asset.location,
      status: 'scheduled',
      windowReason: 'Manually scheduled preventive maintenance window',
      parts: `${asset.bearing || 'OEM Parts'}, ${asset.grease || 'Lubricants'}`,
      sop: 'Standard Facility PM Protocol'
    };
    setTasks(prev => [newTask, ...prev]);
    setShowAddModal(false);
    if (showToast) {
      showToast(`✓ Scheduled PM for ${asset.code} on ${newDate} (${newStartTime})`);
    }
  };

  const handleExportAllIcs = () => {
    tasks.forEach((t, i) => {
      setTimeout(() => generateIcsFile(t), i * 300);
    });
    if (showToast) showToast('✓ Downloading iCal (.ics) events for all scheduled PMs');
  };

  // KPI Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const scheduledTasks = tasks.filter(t => t.status === 'scheduled').length;
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status === 'scheduled').length;
  const complianceRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterType === 'predictive') return t.type === 'predictive';
      if (filterType === 'preventive') return t.type === 'preventive';
      if (filterType === 'completed') return t.status === 'completed';
      if (selectedDay) return t.date === selectedDay;
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tasks, filterType, selectedDay]);

  // Calendar Day Map for October 2026 (1st is Thursday)
  const daysInOctober = 31;
  const startDayOffset = 4; // Thursday: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* 1. Header & Operational KPI Ribbon */}
      <Card className="border-2 border-[#1F2933] dark:border-[#2C3847] p-4 bg-white dark:bg-[#1A222B]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#2C6E9B]/10 text-[#2C6E9B] border border-[#2C6E9B]/30">
                <CalendarIcon size={16} />
              </span>
              <h2 className="font-display text-[16px] font-bold text-[#1F2933] dark:text-[#FAF8F4] tracking-wide">
                Preventive Maintenance Schedule & Calendar Integration
              </h2>
            </div>
            <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1">
              Synchronizes wear-degradation velocity with physical maintenance windows, technician shifts, and 1-click calendar sync.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoSlotAhu03}
              className="flex items-center gap-1.5 border-[#C05043] text-[#C05043] hover:bg-[#C05043] hover:text-white"
              title="Slot AHU-03 into optimal window before 7-day RUL expiry"
            >
              <Sparkles size={12} />
              <span>Auto-Slot AI PM</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportAllIcs}
              className="flex items-center gap-1.5"
              title="Download standard .ics iCalendar events for phone/Outlook"
            >
              <Download size={12} />
              <span>Sync All (.ics)</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Schedule PM</span>
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847]">
          <div className="p-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="flex items-center justify-between text-[#8A8175]">
              <span className="font-mono text-[9px] uppercase font-bold">PM Compliance</span>
              <Shield size={12} className="text-[#2E7D5B]" />
            </div>
            <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5">
              96.4%
            </div>
            <div className="font-mono text-[9px] text-[#2E7D5B] mt-0.5">
              Target: &gt;90% on-time execution
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="flex items-center justify-between text-[#8A8175]">
              <span className="font-mono text-[9px] uppercase font-bold">Slotted Windows</span>
              <Clock size={12} className="text-[#2C6E9B]" />
            </div>
            <div className="font-mono text-[18px] font-bold text-[#2C6E9B] mt-0.5">
              {scheduledTasks} Active
            </div>
            <div className="font-mono text-[9px] text-[#8A8175] mt-0.5">
              October 2026 Cycle
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="flex items-center justify-between text-[#8A8175]">
              <span className="font-mono text-[9px] uppercase font-bold">Predictive Urgent</span>
              <AlertTriangle size={12} className={criticalTasks > 0 ? 'text-[#C05043]' : 'text-[#2E7D5B]'} />
            </div>
            <div className={`font-mono text-[18px] font-bold mt-0.5 ${criticalTasks > 0 ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
              {criticalTasks > 0 ? `${criticalTasks} Immediate` : '0 Critical'}
            </div>
            <div className="font-mono text-[9px] text-[#8A8175] mt-0.5">
              AHU-03 RUL Window
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="flex items-center justify-between text-[#8A8175]">
              <span className="font-mono text-[9px] uppercase font-bold">Duty Crew</span>
              <Users size={12} className="text-[#B07B1C]" />
            </div>
            <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5">
              3 Technicians
            </div>
            <div className="font-mono text-[9px] text-[#8A8175] mt-0.5">
              J. Rivera • M. Singh • A. Kumar
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Controls & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-2.5 rounded-xl">
        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#141B22] p-1 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847]">
          <button
            type="button"
            onClick={() => { setViewMode('calendar'); setSelectedDay(null); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all ${
              viewMode === 'calendar'
                ? 'bg-[#2C6E9B] text-white shadow-sm'
                : 'text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933]'
            }`}
          >
            <CalendarDays size={13} />
            <span>Month Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all ${
              viewMode === 'timeline'
                ? 'bg-[#2C6E9B] text-white shadow-sm'
                : 'text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933]'
            }`}
          >
            <ListFilter size={13} />
            <span>Timeline</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('roster')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all ${
              viewMode === 'roster'
                ? 'bg-[#2C6E9B] text-white shadow-sm'
                : 'text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933]'
            }`}
          >
            <Users size={13} />
            <span>Crew Roster</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] font-bold shrink-0 mr-1">
            Filter:
          </span>
          {[
            { id: 'all', label: 'All PMs' },
            { id: 'predictive', label: 'AI Predictive' },
            { id: 'preventive', label: 'Routine PM' },
            { id: 'completed', label: 'Completed' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setFilterType(f.id); setSelectedDay(null); }}
              className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold transition-all border ${
                filterType === f.id && !selectedDay
                  ? 'bg-[#1F2933] border-[#1F2933] text-white dark:bg-[#FAF8F4] dark:text-[#1F2933]'
                  : 'bg-white dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] text-[#6E6558] dark:text-[#A0988A] hover:border-[#2C6E9B]'
              }`}
            >
              {f.label}
            </button>
          ))}
          {selectedDay && (
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="px-2 py-0.5 bg-[#C05043]/10 border border-[#C05043] text-[#C05043] rounded font-mono text-[10px] font-bold flex items-center gap-1"
            >
              <span>{selectedDay}</span>
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main View Render: Calendar Month View */}
      {viewMode === 'calendar' && (
        <Card className="p-4 bg-white dark:bg-[#1A222B]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-[15px] font-bold uppercase tracking-wider text-[#1F2933] dark:text-[#FAF8F4]">
                October 2026
              </span>
              <Badge variant="neutral">Active Facility Cycle</Badge>
            </div>
            <div className="font-mono text-[10px] text-[#8A8175]">
              Tap any date to inspect slotted tasks
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] font-bold uppercase text-[#8A8175] pb-2 border-b border-[#E6E0D6] dark:border-[#2C3847]">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {/* Blank offset days for start of month */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="min-h-[72px] sm:min-h-[88px] p-1.5 rounded-lg bg-[#FAF8F4]/40 dark:bg-[#141B22]/30 border border-transparent opacity-30" 
              />
            ))}

            {/* Days 1 to 31 */}
            {Array.from({ length: daysInOctober }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-10-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const dayTasks = tasksByDate[dateStr] || [];
              const isToday = dayNum === 1; // Simulated current day
              const isSelected = selectedDay === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (dayTasks.length > 0) {
                      setSelectedDay(isSelected ? null : dateStr);
                    }
                  }}
                  className={`min-h-[72px] sm:min-h-[88px] p-1.5 rounded-lg border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#2C6E9B] ring-2 ring-[#2C6E9B]/30 bg-[#2C6E9B]/5'
                      : isToday
                      ? 'border-[#2C6E9B] bg-[#2C6E9B]/5'
                      : dayTasks.length > 0
                      ? 'bg-white dark:bg-[#141B22] border-[#D2C9BA] dark:border-[#2C3847] hover:border-[#2C6E9B]'
                      : 'bg-[#FAF8F4] dark:bg-[#141B22]/50 border-[#E6E0D6] dark:border-[#242E3B] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[11px] font-bold ${
                      isToday 
                        ? 'px-1.5 py-0.5 rounded bg-[#2C6E9B] text-white' 
                        : 'text-[#1F2933] dark:text-[#FAF8F4]'
                    }`}>
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2C6E9B]" />
                    )}
                  </div>

                  {/* Task Chips in Calendar Cell */}
                  <div className="space-y-1 mt-1">
                    {dayTasks.map(t => {
                      const isCrit = t.priority === 'critical';
                      const isDone = t.status === 'completed';
                      return (
                        <div
                          key={t.id}
                          className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold truncate leading-tight border ${
                            isDone
                              ? 'bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B] line-through'
                              : isCrit
                              ? 'bg-[#C05043]/15 border-[#C05043] text-[#C05043] animate-pulse'
                              : 'bg-[#FAF8F4] dark:bg-[#1F2933] border-[#D2C9BA] dark:border-[#3E4D61] text-[#1F2933] dark:text-[#FAF8F4]'
                          }`}
                          title={`${t.assetCode}: ${t.title} (${t.startTime})`}
                        >
                          {t.startTime} • {t.assetCode}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. Task Cards List (Used for Timeline, Roster, or Selected Day Drilldown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[14px] font-bold uppercase tracking-wider text-[#1F2933] dark:text-[#FAF8F4]">
              {selectedDay 
                ? `Tasks Scheduled on ${selectedDay}` 
                : viewMode === 'roster' 
                ? 'Technician Assignment Roster' 
                : 'Chronological Maintenance Windows'}
            </h3>
            <span className="font-mono text-[10px] text-[#8A8175]">
              ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'})
            </span>
          </div>
          {selectedDay && (
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-[#2C6E9B] font-mono text-[11px] underline"
            >
              Show all dates
            </button>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center text-[#8A8175] font-mono text-[11px]">
            No maintenance tasks match the active filter.
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3.5">
            {filteredTasks.map(t => {
              const isCrit = t.priority === 'critical';
              const isDone = t.status === 'completed';
              const googleCalUrl = getGoogleCalendarUrl(t);

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between bg-white dark:bg-[#1A222B] ${
                    isDone
                      ? 'border-[#2E7D5B]/40 opacity-80'
                      : isCrit
                      ? 'border-[#C05043] shadow-[3px_3px_0_#C05043]'
                      : 'border-[#1F2933] dark:border-[#2C3847] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C]'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-[#1F2933] text-white font-mono text-[10px] font-bold">
                          {t.assetCode}
                        </span>
                        <Badge variant={isDone ? 'nominal' : isCrit ? 'critical' : 'neutral'}>
                          {isDone ? '✓ Completed' : isCrit ? 'Predictive Urgent' : 'Scheduled PM'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[10px] text-[#8A8175] font-semibold">
                        <Clock size={12} className="text-[#2C6E9B]" />
                        <span>{t.date} • {t.startTime}–{t.endTime}</span>
                      </div>
                    </div>

                    {/* Task Title & Subsystem */}
                    <div>
                      <h4 className={`font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4] ${
                        isDone ? 'line-through text-[#6E6558]' : ''
                      }`}>
                        {t.title}
                      </h4>
                      <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                        {t.subsystem} • {t.location}
                      </p>
                    </div>

                    {/* Operational Reason */}
                    <div className="p-2 rounded bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] text-[11px] font-mono text-[#554D42] dark:text-[#C5BCAD]">
                      <strong>Window Logic:</strong> {t.windowReason}
                    </div>

                    {/* Meta: Tech, Parts, SOP */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#6E6558] dark:text-[#A0988A] pt-1">
                      <div>
                        <strong>Technician:</strong> {t.tech}
                      </div>
                      <div>
                        <strong>SOP:</strong> {t.sop.split(' ')[0]}
                      </div>
                      <div className="col-span-2 truncate">
                        <strong>Parts Kit:</strong> {t.parts}
                      </div>
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="mt-4 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* 1-Click .ICS Download */}
                      <button
                        type="button"
                        onClick={() => generateIcsFile(t)}
                        className="px-2 py-1 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] font-mono text-[10px] font-semibold text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] hover:text-[#2C6E9B] flex items-center gap-1 transition-all"
                        title="Download iCal (.ics) file for Apple Calendar or Outlook"
                      >
                        <Download size={11} className="text-[#2C6E9B]" />
                        <span>.ICS</span>
                      </button>

                      {/* Google Calendar Link */}
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] font-mono text-[10px] font-semibold text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] hover:text-[#2C6E9B] flex items-center gap-1 transition-all"
                        title="Add directly to Google Calendar in browser"
                      >
                        <ExternalLink size={11} className="text-[#2E7D5B]" />
                        <span>Google Cal</span>
                      </a>

                      {/* Direct QR Passport Jump */}
                      {onSelectAsset && (
                        <button
                          type="button"
                          onClick={() => onSelectAsset(t.assetId)}
                          className="px-2 py-1 rounded border border-[#2C6E9B]/30 bg-[#2C6E9B]/10 font-mono text-[10px] font-semibold text-[#2C6E9B] hover:bg-[#2C6E9B] hover:text-white flex items-center gap-1 transition-all"
                          title="Open Asset Passport"
                        >
                          <QrCode size={11} />
                          <span>Passport</span>
                        </button>
                      )}

                      {/* Print Field Sheet */}
                      {onPrintFieldSheet && (
                        <button
                          type="button"
                          onClick={onPrintFieldSheet}
                          className="px-2 py-1 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] font-mono text-[10px] font-semibold text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] flex items-center gap-1 transition-all"
                          title="Print physical SOP Field Sheet"
                        >
                          <Printer size={11} className="text-[#B07B1C]" />
                          <span>PDF</span>
                        </button>
                      )}
                    </div>

                    {/* Status Toggle Button */}
                    <Button
                      variant={isDone ? 'secondary' : 'teal'}
                      size="xs"
                      onClick={() => toggleTaskStatus(t.id)}
                    >
                      <CheckCircle2 size={12} className="mr-1" />
                      <span>{isDone ? 'Undo Close' : 'Sign Off PM'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Add Custom Scheduled PM Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between bg-[#FAF8F4] dark:bg-[#141B22]">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#2C6E9B]" />
                <h3 className="font-display text-[15px] font-bold uppercase text-[#1F2933] dark:text-[#FAF8F4]">
                  Schedule Preventive Maintenance Window
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8A8175] hover:text-[#1F2933] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNewTask} className="p-4 space-y-3 font-mono text-[11px]">
              <div>
                <label className="block text-[#8A8175] uppercase text-[9px] font-bold mb-1">
                  Target Equipment
                </label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full p-2 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                >
                  {Object.values(ASSET_REGISTRY).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} • {a.name} ({a.subsystem})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8A8175] uppercase text-[9px] font-bold mb-1">
                  PM Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Dynamic Vibration Check & Bearing Lube"
                  className="w-full p-2 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#8A8175] uppercase text-[9px] font-bold mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#8A8175] uppercase text-[9px] font-bold mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#8A8175] uppercase text-[9px] font-bold mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8A8175] uppercase text-[9px] font-bold mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full p-2 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  >
                    <option value="J. Rivera">J. Rivera (Mechanical Lead)</option>
                    <option value="M. Singh">M. Singh (Electrical Specialist)</option>
                    <option value="A. Kumar">A. Kumar (Hydraulics & HVAC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A8175] uppercase text-[9px] font-bold mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full p-2 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  >
                    <option value="nominal">Nominal • Routine PM</option>
                    <option value="attention">Attention • Elevated Wear</option>
                    <option value="critical">Critical • RUL Action Limit</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save to Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
