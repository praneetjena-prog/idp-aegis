import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, 
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
  ListFilter, 
  Users, 
  X, 
  FileSpreadsheet, 
  Share2, 
  Upload, 
  Copy, 
  Link,
  Settings2
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ASSET_REGISTRY } from '../asset/AssetQrModal';
import { INITIAL_PM_TASKS, generateIcsFile, getGoogleCalendarUrl, exportScheduleCsv } from './MaintenanceScheduler';

const STORAGE_PM_KEY = 'aegis-pm-schedule';

export function MaintenanceCalendarPage({
  feedMode = 'fault',
  onSelectAsset,
  onPrintFieldSheet,
  showToast,
  canManageSchedules = true
}) {
  const [tasks, setTasks] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_PM_TASKS;
    try {
      const saved = window.localStorage.getItem(STORAGE_PM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_PM_TASKS;
    } catch {
      return INITIAL_PM_TASKS;
    }
  });

  // Calendar View & Filter Controls
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [searchQuery, setSearchQuery] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');

  // New Maintenance Task Form State
  const [newAssetId, setNewAssetId] = useState('ahu-03');
  const [newTitle, setNewTitle] = useState('Bearing Lubrication & Balance Check');
  const [newDate, setNewDate] = useState('2026-10-18');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newTech, setNewTech] = useState('J. Rivera');
  const [newPriority, setNewPriority] = useState('nominal');
  const [newType, setNewType] = useState('preventive');
  const [newParts, setNewParts] = useState('SKF Grease NLGI #2, Gaskets');
  const [newSOP, setNewSOP] = useState('SOP-MECH-01 (Bearing Overhaul)');

  // Calendar Integration Status State
  const [integrationStatus, setIntegrationStatus] = useState({
    google: { configured: false, connected: false, sync_direction: 'export_only' },
    microsoft: { configured: false, connected: false, sync_direction: 'export_only' },
    ical: { feed_url: '/api/calendar/feed.ics', import_supported: true, export_supported: true }
  });
  const [loadingSync, setLoadingSync] = useState(false);

  // Persist tasks in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Array.isArray(tasks)) {
      try {
        window.localStorage.setItem(STORAGE_PM_KEY, JSON.stringify(tasks));
      } catch {
        // storage quota fallback
      }
    }
  }, [tasks]);

  // Fetch integration status from backend if available
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/calendar/status');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && typeof data === 'object') {
            setIntegrationStatus(prev => ({
              google: { ...prev.google, ...(data.google || {}) },
              microsoft: { ...prev.microsoft, ...(data.microsoft || {}) },
              ical: { ...prev.ical, ...(data.ical || {}) }
            }));
          }
        }
      } catch {
        // Backend not running or endpoint unroutable; default unconfigured state safely preserved
      }
    };
    fetchStatus();
    return () => { isMounted = false; };
  }, []);

  // Filter tasks based on search & filter selectors
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task || typeof task !== 'object') return false;
      if (assetFilter !== 'all' && task.assetId !== assetFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (typeFilter !== 'all' && task.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = String(task.title || '').toLowerCase().includes(q);
        const matchCode = String(task.assetCode || '').toLowerCase().includes(q);
        const matchTech = String(task.tech || '').toLowerCase().includes(q);
        const matchLocation = String(task.location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchTech && !matchLocation) return false;
      }
      return true;
    });
  }, [tasks, assetFilter, priorityFilter, statusFilter, typeFilter, searchQuery]);

  // Month Grid Calculation (for currentYear and currentMonth)
  const monthData = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });

    const days = [];
    // Padding days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false, dateStr: null, tasks: [] });
    }
    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(currentMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${mm}-${dd}`;
      const dayTasks = Array.isArray(filteredTasks) ? filteredTasks.filter(t => t?.date === dateStr) : [];
      days.push({ dayNumber: d, isCurrentMonth: true, dateStr, tasks: dayTasks });
    }
    return { monthName, days };
  }, [currentYear, currentMonth, filteredTasks]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // October 2026
  };

  // Toggle complete / scheduled
  const handleToggleStatus = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const next = t.status === 'completed' ? 'scheduled' : 'completed';
        if (showToast) showToast(`PM ${t.assetCode}: Status set to ${next.toUpperCase()}`);
        return { ...t, status: next };
      }
      return t;
    }));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: prev.status === 'completed' ? 'scheduled' : 'completed' }));
    }
  };

  // Create new task
  const handleCreateTask = (e) => {
    e.preventDefault();
    const assetMeta = ASSET_REGISTRY[newAssetId] || { name: 'Machine', location: 'Campus', subsystem: 'General' };
    const newTask = {
      id: `pm-${newAssetId}-${Date.now().toString().slice(-4)}`,
      assetId: newAssetId,
      assetCode: newAssetId.toUpperCase(),
      title: newTitle,
      subsystem: assetMeta.subsystem,
      type: newType,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      tech: newTech,
      priority: newPriority,
      location: assetMeta.location,
      status: 'scheduled',
      windowReason: 'Scheduled maintenance intervention created via AEGIS Calendar',
      parts: newParts,
      sop: newSOP
    };

    setTasks(prev => [newTask, ...prev]);
    setShowScheduleModal(false);
    if (showToast) showToast(`Created PM for ${newTask.assetCode} on ${newTask.date}`);

    // Try posting to backend
    fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    }).catch(() => {});
  };

  // Reschedule existing task
  const handleSaveReschedule = () => {
    if (!selectedTask || !rescheduleDate) return;
    setTasks(prev => prev.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          date: rescheduleDate,
          startTime: rescheduleStartTime || t.startTime,
          endTime: rescheduleEndTime || t.endTime,
          status: 'scheduled'
        };
      }
      return t;
    }));

    if (showToast) showToast(`Rescheduled ${selectedTask.assetCode} to ${rescheduleDate}`);
    setSelectedTask(null);
  };

  // Google OAuth connect flow
  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/calendar/google/auth-url');
      const data = await res.json();
      if (res.ok && data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        if (showToast) showToast(`Google OAuth: ${data.message || 'Configuration required (set GOOGLE_CLIENT_ID)'}`);
      }
    } catch (e) {
      if (showToast) showToast('Backend offline or Google OAuth not configured.');
    }
  };

  // Microsoft OAuth connect flow
  const handleConnectMicrosoft = async () => {
    try {
      const res = await fetch('/api/calendar/microsoft/auth-url');
      const data = await res.json();
      if (res.ok && data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        if (showToast) showToast(`Microsoft OAuth: ${data.message || 'Configuration required (set MICROSOFT_CLIENT_ID)'}`);
      }
    } catch (e) {
      if (showToast) showToast('Backend offline or Microsoft OAuth not configured.');
    }
  };

  // Google Sync
  const handleSyncGoogle = async () => {
    setLoadingSync(true);
    try {
      const res = await fetch('/api/calendar/google/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        if (showToast) showToast(data.message || 'Synchronized events to Google Calendar');
      } else {
        if (showToast) showToast(`Sync notice: ${data.error || 'Connection required'}`);
      }
    } catch {
      if (showToast) showToast('Sync failed: backend endpoint unavailable');
    } finally {
      setLoadingSync(false);
    }
  };

  // Handle .ICS file upload import
  const handleIcsUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result;
      if (typeof content !== 'string') return;

      try {
        const res = await fetch('/api/calendar/ics/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        const data = await res.json();
        if (res.ok) {
          if (showToast) showToast(`Imported ${data.imported_count} tasks (${data.duplicate_count} duplicates skipped)`);
        } else {
          if (showToast) showToast(`Import error: ${data.error}`);
        }
      } catch {
        if (showToast) showToast('iCalendar imported into local session');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold shadow-xs">
              <CalendarDays size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-[18px] sm:text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] tracking-tight uppercase">
                  Maintenance Calendar
                </h1>
                <Badge variant="neutral">Shift 1 Active</Badge>
              </div>
              <p className="font-mono text-[11px] text-[#8A8175] mt-0.5">
                AI Off-Peak Slotting &bull; Predictive Overhauls &bull; External Calendar Synchronization
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canManageSchedules && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>Schedule Maintenance</span>
            </Button>
          )}

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowConnectionsModal(true)}
            className="flex items-center gap-1.5"
          >
            <Share2 size={13} className="text-[#2C6E9B]" />
            <span>Calendar Connections</span>
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => exportScheduleCsv(tasks)}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet size={13} className="text-[#2E7D5B]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 2. Calendar View Switcher & Filter Controls Bar */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-3 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: View Modes + Month Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg font-mono text-[11px]">
            {['month', 'agenda'].map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded-md font-semibold capitalize transition-colors cursor-pointer ${
                  viewMode === m 
                    ? 'bg-[#2C6E9B] text-white shadow-xs' 
                    : 'text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933]'
                }`}
              >
                {m === 'agenda' ? 'Agenda & List' : m}
              </button>
            ))}
          </div>

          {/* Month Navigation */}
          {viewMode === 'month' && (
            <div className="flex items-center gap-1 pl-2 border-l border-[#E6E0D6] dark:border-[#2C3847]">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                aria-label="Previous Month"
                className="w-7 h-7 flex items-center justify-center rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933] cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4] px-2 min-w-[120px] text-center">
                {monthData.monthName} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                aria-label="Next Month"
                className="w-7 h-7 flex items-center justify-center rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933] cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="ml-1 text-[10px] font-mono font-bold px-2 py-1 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#2C6E9B] hover:bg-[#2C6E9B]/10 cursor-pointer"
              >
                Today
              </button>
            </div>
          )}
        </div>

        {/* Right: Search & Practical Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks or assets..."
            className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] placeholder:text-[#8A8175] focus:outline-hidden focus:border-[#2C6E9B] w-40 sm:w-48"
          />

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2 py-1 text-[10px] font-mono rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#554D42] dark:text-[#C5BCAD] cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="attention">Attention</option>
            <option value="nominal">Nominal</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 text-[10px] font-mono rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#554D42] dark:text-[#C5BCAD] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* 3. Main Calendar View: Month Grid */}
      {viewMode === 'month' && (
        <Card className="p-0 overflow-hidden shadow-xs border-[#D2C9BA] dark:border-[#2C3847]">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] font-mono text-[10px] uppercase font-bold text-[#8A8175] text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2.5 border-r last:border-r-0 border-[#E6E0D6] dark:border-[#2C3847]">
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E6E0D6] dark:divide-[#2C3847] bg-white dark:bg-[#1A222B]">
            {monthData.days.map((day, idx) => {
              if (!day.isCurrentMonth) {
                return (
                  <div key={idx} className="min-h-[105px] p-2 bg-[#FAF8F4]/50 dark:bg-[#141B22]/40" />
                );
              }

              const isToday = day.dateStr === '2026-10-14';

              return (
                <div 
                  key={idx} 
                  className={`min-h-[105px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-[#2C6E9B]/5' : 'hover:bg-[#FAF8F4] dark:hover:bg-[#141B22]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-[11px] font-bold ${
                      isToday 
                        ? 'w-5 h-5 rounded-full bg-[#2C6E9B] text-white flex items-center justify-center text-[10px]' 
                        : 'text-[#6E6558] dark:text-[#A0988A]'
                    }`}>
                      {day.dayNumber}
                    </span>
                    {day.tasks?.length > 0 && (
                      <span className="font-mono text-[9px] text-[#8A8175]">
                        {day.tasks.length} {day.tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Tasks List inside Day Cell */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                    {day.tasks?.map((t) => {
                      const isDone = t.status === 'completed';
                      const isCrit = t.priority === 'critical';

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTask(t);
                            setRescheduleDate(t.date);
                            setRescheduleStartTime(t.startTime);
                            setRescheduleEndTime(t.endTime);
                          }}
                          className={`w-full text-left p-1 rounded font-mono text-[9px] sm:text-[10px] leading-tight truncate transition-all flex items-center gap-1 cursor-pointer ${
                            isDone 
                              ? 'bg-[#EAE4D9] dark:bg-[#2C3847] text-[#8A8175] line-through'
                              : isCrit
                              ? 'bg-[#C05043]/15 text-[#C05043] font-bold border border-[#C05043]/30 hover:bg-[#C05043]/25'
                              : 'bg-[#2C6E9B]/10 text-[#2C6E9B] dark:text-[#58A6FF] font-semibold border border-[#2C6E9B]/20 hover:bg-[#2C6E9B]/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? 'bg-[#8A8175]' : isCrit ? 'bg-[#C05043]' : 'bg-[#2C6E9B]'
                          }`} />
                          <span className="font-bold shrink-0">{t.assetCode}:</span>
                          <span className="truncate">{t.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. Agenda & Chronological Task List View */}
      {viewMode === 'agenda' && (
        <Card className="p-0 overflow-hidden shadow-xs">
          <CardHeader className="bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#D2C9BA] dark:border-[#2C3847]">
            <div>
              <CardTitle>Upcoming Preventive & Predictive Maintenance Schedule</CardTitle>
              <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                Sorted chronologically by scheduled date and time window.
              </p>
            </div>
            <Badge variant="neutral">{filteredTasks.length} Scheduled Work Orders</Badge>
          </CardHeader>

          <div className="divide-y divide-[#E6E0D6] dark:divide-[#2C3847]">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-[#8A8175] font-mono text-[12px]">
                No maintenance tasks match the selected filters.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCrit = task.priority === 'critical';
                const isDone = task.status === 'completed';

                return (
                  <div 
                    key={task.id}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#FAF8F4]/80 dark:hover:bg-[#141B22]/50 transition-colors ${
                      isDone ? 'opacity-60 bg-[#FAF8F4]/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0 mt-0.5 ${
                        isDone 
                          ? 'bg-[#EAE4D9] text-[#8A8175]' 
                          : isCrit 
                          ? 'bg-[#C05043]/15 text-[#C05043]' 
                          : 'bg-[#2C6E9B]/15 text-[#2C6E9B]'
                      }`}>
                        <Wrench size={15} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                            {task.assetCode}
                          </span>
                          <span className="text-[#8A8175]">•</span>
                          <span className={`text-[13px] font-semibold ${isDone ? 'line-through text-[#8A8175]' : 'text-[#1F2933] dark:text-[#FAF8F4]'}`}>
                            {task.title}
                          </span>
                          <span className={`px-2 py-0.2 rounded font-mono text-[9px] uppercase font-bold ${
                            isDone 
                              ? 'bg-[#EAE4D9] text-[#8A8175]' 
                              : isCrit 
                              ? 'bg-[#C05043]/15 text-[#C05043]' 
                              : 'bg-[#2C6E9B]/15 text-[#2C6E9B]'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-[#8A8175]" />
                            <span>{task.date} ({task.startTime}–{task.endTime})</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-[#8A8175]" />
                            <span>{task.tech}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#8A8175]" />
                            <span>{task.location}</span>
                          </span>
                        </div>

                        <div className="font-mono text-[10px] text-[#8A8175] mt-1">
                          Reason: {task.windowReason}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button
                        variant={isDone ? 'outline' : 'secondary'}
                        size="xs"
                        onClick={() => handleToggleStatus(task.id)}
                        className="flex items-center gap-1"
                      >
                        <Check size={12} />
                        <span>{isDone ? 'Reopen' : 'Mark Complete'}</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          setSelectedTask(task);
                          setRescheduleDate(task.date);
                          setRescheduleStartTime(task.startTime);
                          setRescheduleEndTime(task.endTime);
                        }}
                      >
                        Details
                      </Button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => generateIcsFile(task)}
                        title="Download .ICS for Apple / Google Calendar"
                      >
                        <Download size={12} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* 5. Event Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#2C6E9B]/15 text-[#2C6E9B] flex items-center justify-center font-bold">
                  <Wrench size={14} />
                </div>
                <div>
                  <h3 className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                    Maintenance Task Details
                  </h3>
                  <div className="font-mono text-[10px] text-[#8A8175]">ID: {selectedTask.id}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="w-7 h-7 rounded border border-[#D2C9BA] dark:border-[#2C3847] text-[#8A8175] hover:text-[#1F2933] flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-[#8A8175] uppercase">Work Order Title</span>
                <div className="text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  {selectedTask.assetCode} &bull; {selectedTask.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div>
                  <div className="text-[#8A8175] text-[9px] uppercase">Assigned Technician</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5">{selectedTask.tech}</div>
                </div>
                <div>
                  <div className="text-[#8A8175] text-[9px] uppercase">Priority & Status</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5 uppercase">
                    {selectedTask.priority} &bull; {selectedTask.status}
                  </div>
                </div>
                <div>
                  <div className="text-[#8A8175] text-[9px] uppercase">Scheduled Date</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5">{selectedTask.date}</div>
                </div>
                <div>
                  <div className="text-[#8A8175] text-[9px] uppercase">Time Window</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-0.5">
                    {selectedTask.startTime} &ndash; {selectedTask.endTime}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#8A8175] uppercase">Required Parts & Materials</span>
                <div className="text-[#1F2933] dark:text-[#FAF8F4]">{selectedTask.parts}</div>
              </div>

              <div>
                <span className="text-[10px] text-[#8A8175] uppercase">Standard Operating Procedure (SOP)</span>
                <div className="text-[#2C6E9B] dark:text-[#58A6FF] font-semibold">{selectedTask.sop}</div>
              </div>

              <div>
                <span className="text-[10px] text-[#8A8175] uppercase">Window Context & Rationale</span>
                <div className="text-[#6E6558] dark:text-[#A0988A] leading-relaxed">{selectedTask.windowReason}</div>
              </div>

              {/* Reschedule Controls */}
              {canManageSchedules && (
                <div className="pt-2 border-t border-[#E6E0D6] dark:border-[#2C3847] space-y-2">
                  <span className="text-[10px] text-[#8A8175] uppercase font-bold">Reschedule Date & Shift</span>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="px-2 py-1 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] flex-1 text-[11px]"
                    />
                    <Button variant="secondary" size="xs" onClick={handleSaveReschedule}>
                      Save Reschedule
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border-t border-[#E6E0D6] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="xs" 
                  onClick={() => handleToggleStatus(selectedTask.id)}
                >
                  <Check size={11} className="mr-1" />
                  {selectedTask.status === 'completed' ? 'Reopen Task' : 'Mark Completed'}
                </Button>

                {onSelectAsset && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      onSelectAsset(selectedTask.assetId);
                      setSelectedTask(null);
                    }}
                  >
                    <QrCode size={11} className="mr-1" /> Asset Passport
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="xs" 
                  onClick={() => generateIcsFile(selectedTask)}
                >
                  <Download size={11} className="mr-1" /> Export .ICS
                </Button>

                <a 
                  href={getGoogleCalendarUrl(selectedTask)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-[#2C6E9B] text-white hover:bg-[#255C83] text-[10px] font-mono font-semibold flex items-center gap-1"
                >
                  <ExternalLink size={11} /> Google Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Calendar Connections & Synchronization Modal */}
      {showConnectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-[#2C6E9B]" />
                <h3 className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                  Calendar Provider Integrations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectionsModal(false)}
                className="w-7 h-7 rounded border border-[#D2C9BA] dark:border-[#2C3847] text-[#8A8175] hover:text-[#1F2933] flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-4 font-mono text-[11px]">
              {/* Provider 1: Google Calendar */}
              <div className="p-3 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[12px]">
                    Google Calendar
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                    integrationStatus?.google?.connected 
                      ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] border border-[#2E7D5B]/30'
                      : integrationStatus?.google?.configured
                      ? 'bg-[#2C6E9B]/15 text-[#2C6E9B] border border-[#2C6E9B]/30'
                      : 'bg-[#B07B1C]/15 text-[#B07B1C] border border-[#B07B1C]/30'
                  }`}>
                    {integrationStatus?.google?.connected 
                      ? 'Connected' 
                      : integrationStatus?.google?.configured 
                      ? 'Ready to Connect' 
                      : 'Configuration Required'}
                  </span>
                </div>

                <p className="text-[10px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
                  Genuine Google Calendar OAuth token exchange. Pushes AEGIS maintenance events directly into your authorized Google Calendar.
                </p>

                {integrationStatus?.google?.connected ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#2E7D5B]">
                      Connected: {integrationStatus?.google?.account_email || 'Verified Account'}
                    </span>
                    <Button 
                      variant="secondary" 
                      size="xs" 
                      onClick={handleSyncGoogle}
                      disabled={loadingSync}
                    >
                      <RefreshCw size={11} className={`mr-1 ${loadingSync ? 'animate-spin' : ''}`} /> Sync Now
                    </Button>
                  </div>
                ) : (
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[9px] text-[#8A8175]">
                      Requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
                    </span>
                    <Button 
                      variant="default" 
                      size="xs" 
                      onClick={handleConnectGoogle}
                    >
                      Connect Google
                    </Button>
                  </div>
                )}
              </div>

              {/* Provider 2: Microsoft 365 / Outlook */}
              <div className="p-3 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[12px]">
                    Microsoft 365 / Outlook
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                    integrationStatus?.microsoft?.connected 
                      ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] border border-[#2E7D5B]/30'
                      : integrationStatus?.microsoft?.configured
                      ? 'bg-[#2C6E9B]/15 text-[#2C6E9B] border border-[#2C6E9B]/30'
                      : 'bg-[#B07B1C]/15 text-[#B07B1C] border border-[#B07B1C]/30'
                  }`}>
                    {integrationStatus?.microsoft?.connected 
                      ? 'Connected' 
                      : integrationStatus?.microsoft?.configured 
                      ? 'Ready to Connect' 
                      : 'Configuration Required'}
                  </span>
                </div>

                <p className="text-[10px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
                  Microsoft Graph API calendar synchronization with enterprise Outlook and Office 365 tenants.
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[9px] text-[#8A8175]">
                    Requires MICROSOFT_CLIENT_ID in backend environment
                  </span>
                  <Button 
                    variant="secondary" 
                    size="xs" 
                    onClick={handleConnectMicrosoft}
                  >
                    Connect Outlook
                  </Button>
                </div>
              </div>

              {/* Provider 3: iCalendar RFC 5545 Live Feed & File Import */}
              <div className="p-3 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[12px]">
                    iCalendar / ICS Subscription Feed
                  </div>
                  <Badge variant="nominal">RFC 5545 Active</Badge>
                </div>

                <p className="text-[10px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
                  Subscribe from Apple Calendar, Google Calendar, or Thunderbird via the live ICS endpoint.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar/feed.ics`}
                    className="px-2 py-1 text-[10px] rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#1A222B] text-[#554D42] dark:text-[#C5BCAD] flex-1 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/api/calendar/feed.ics`);
                        if (showToast) showToast('Copied iCalendar feed URL to clipboard');
                      }
                    }}
                  >
                    <Copy size={11} className="mr-1" /> Copy
                  </Button>
                </div>

                <div className="pt-2 border-t border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
                  <span className="text-[10px] text-[#8A8175]">Import .ICS Schedule File:</span>
                  <label className="px-2.5 py-1 rounded bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-[#FAF8F4] text-[10px] font-mono cursor-pointer hover:border-[#2C6E9B] flex items-center gap-1">
                    <Upload size={11} /> Import .ICS
                    <input type="file" accept=".ics" onChange={handleIcsUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border-t border-[#E6E0D6] dark:border-[#2C3847] text-right">
              <Button variant="secondary" size="xs" onClick={() => setShowConnectionsModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Schedule Maintenance Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-[#2C6E9B]" />
                <h3 className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                  Schedule Facility Maintenance Task
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-7 h-7 rounded border border-[#D2C9BA] dark:border-[#2C3847] text-[#8A8175] hover:text-[#1F2933] flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-3 font-mono text-[11px]">
              <div>
                <label className="block text-[10px] text-[#8A8175] uppercase mb-1">Target Asset</label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                >
                  <option value="ahu-03">AHU-03 (Primary Supply Fan)</option>
                  <option value="cw-pump-02">CW-PUMP-02 (Circulator Pump)</option>
                  <option value="elec-01">SW-PANEL-01 (Main Feeder Switchboard)</option>
                  <option value="vav-4b">VAV-BOX-4B (4th Floor Terminal)</option>
                  <option value="chiller-01">CHILLER-01 (Centrifugal Chiller)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#8A8175] uppercase mb-1">Work Order Description</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-[#8A8175] uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8A8175] uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8A8175] uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#8A8175] uppercase mb-1">Technician</label>
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8A8175] uppercase mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                  >
                    <option value="critical">Critical</option>
                    <option value="attention">Attention</option>
                    <option value="nominal">Nominal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#8A8175] uppercase mb-1">Required Spare Parts</label>
                <input
                  type="text"
                  value={newParts}
                  onChange={(e) => setNewParts(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4]"
                />
              </div>

              <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border-t border-[#E6E0D6] dark:border-[#2C3847] flex justify-end gap-2 -mx-4 -mb-4 mt-4">
                <Button variant="ghost" size="xs" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button variant="default" size="xs" type="submit">
                  Save Maintenance Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
