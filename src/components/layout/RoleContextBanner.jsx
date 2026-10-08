import React, { useState } from 'react';
import { 
  Wrench, 
  BarChart3, 
  Microscope, 
  Shield, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Printer, 
  QrCode, 
  CalendarDays, 
  Sliders, 
  Download, 
  ChevronRight, 
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function RoleContextBanner({ 
  onPrintFieldSheet, 
  onOpenQrTags, 
  onOpenCalendar, 
  onOpenSettings, 
  onExport,
  setTab 
}) {
  const { user, roleConfig, permissions } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;

  const role = user.role || 'manager';

  const roleTheme = {
    technician: {
      border: 'border-[#2E7D5B]/40',
      bg: 'bg-[#2E7D5B]/5 dark:bg-[#2E7D5B]/10',
      text: 'text-[#2E7D5B]',
      icon: Wrench,
      title: 'Field Technician Enforcement Mode',
      subtitle: 'Streamlined for field checklist execution, LOTO zero-energy safety, and physical QR audits.',
      tag: 'SAFETY & EXECUTION'
    },
    manager: {
      border: 'border-[#2C6E9B]/40',
      bg: 'bg-[#2C6E9B]/5 dark:bg-[#2C6E9B]/10',
      text: 'text-[#2C6E9B]',
      icon: BarChart3,
      title: 'Operations Manager Authority Mode',
      subtitle: 'Full facility management access: equipment fleet telemetry, automated PM calendar scheduling, and threshold tuning.',
      tag: 'DISPATCH & FLEET'
    },
    auditor: {
      border: 'border-[#B07B1C]/40',
      bg: 'bg-[#B07B1C]/5 dark:bg-[#B07B1C]/10',
      text: 'text-[#B07B1C]',
      icon: Microscope,
      title: 'Reliability Auditor (Read-Only Compliance)',
      subtitle: 'Mutation actions locked. Highlighting ISO 10816 Class II vibration severity zones, model explainability, and cryptographic export.',
      tag: 'READ-ONLY COMPLIANCE'
    }
  };

  const currentTheme = roleTheme[role] || roleTheme.manager;
  const RoleIcon = currentTheme.icon;

  return (
    <div className={`p-3.5 sm:p-4 rounded-xl border-2 ${currentTheme.border} ${currentTheme.bg} transition-all shadow-sm animate-in fade-in`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Role Icon & Context Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${currentTheme.border} ${currentTheme.text} bg-white dark:bg-[#1A222B]`}>
            <RoleIcon size={16} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                {currentTheme.title}
              </span>
              <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${roleConfig?.badgeClass}`}>
                {currentTheme.tag}
              </span>
              <span className="font-mono text-[10px] text-[#8A8175]">
                Signed in as <strong className="text-[#1F2933] dark:text-[#FAF8F4]">{user.name}</strong>
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#6E6558] dark:text-[#A0988A] mt-0.5 leading-relaxed">
              {currentTheme.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Role-Specific Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#E6E0D6] dark:border-[#2C3847]">
          {role === 'technician' && (
            <>
              {onPrintFieldSheet && (
                <button
                  type="button"
                  onClick={onPrintFieldSheet}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#2E7D5B]/40 text-[#2E7D5B] font-mono text-[10px] font-semibold hover:bg-[#2E7D5B] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Printer size={11} />
                  <span>Print Field Sheet</span>
                </button>
              )}
              {onOpenQrTags && (
                <button
                  type="button"
                  onClick={onOpenQrTags}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#2E7D5B]/40 text-[#2E7D5B] font-mono text-[10px] font-semibold hover:bg-[#2E7D5B] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <QrCode size={11} />
                  <span>Asset QR Tag</span>
                </button>
              )}
              <span className="font-mono text-[9px] px-2 py-1 rounded bg-[#E6E0D6] dark:bg-[#2C3847] text-[#6E6558] dark:text-[#A0988A] flex items-center gap-1">
                <Lock size={10} />
                <span>Macro financial data hidden</span>
              </span>
            </>
          )}

          {role === 'manager' && (
            <>
              {onOpenCalendar && (
                <button
                  type="button"
                  onClick={onOpenCalendar}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#2C6E9B]/40 text-[#2C6E9B] font-mono text-[10px] font-semibold hover:bg-[#2C6E9B] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <CalendarDays size={11} />
                  <span>PM Calendar</span>
                </button>
              )}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#2C6E9B]/40 text-[#2C6E9B] font-mono text-[10px] font-semibold hover:bg-[#2C6E9B] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Sliders size={11} />
                  <span>Alert Thresholds</span>
                </button>
              )}
              {onExport && (
                <button
                  type="button"
                  onClick={() => onExport('csv')}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[10px] font-semibold hover:border-[#2C6E9B] transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={11} />
                  <span>Export CSV</span>
                </button>
              )}
            </>
          )}

          {role === 'auditor' && (
            <>
              <button
                type="button"
                onClick={() => setTab('analysis')}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#B07B1C]/50 text-[#B07B1C] font-mono text-[10px] font-semibold hover:bg-[#B07B1C] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Microscope size={11} />
                <span>ISO 10816 View</span>
              </button>
              {onExport && (
                <button
                  type="button"
                  onClick={() => onExport('csv')}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#B07B1C]/50 text-[#B07B1C] font-mono text-[10px] font-semibold hover:bg-[#B07B1C] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={11} />
                  <span>CSV Audit Trail</span>
                </button>
              )}
              {onExport && (
                <button
                  type="button"
                  onClick={() => onExport('json')}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1A222B] border border-[#B07B1C]/50 text-[#B07B1C] font-mono text-[10px] font-semibold hover:bg-[#B07B1C] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={11} />
                  <span>JSON Snapshot</span>
                </button>
              )}
              <span className="font-mono text-[9px] px-2 py-1 rounded bg-[#B07B1C]/15 text-[#B07B1C] font-bold border border-[#B07B1C]/30 flex items-center gap-1">
                <Lock size={10} />
                <span>Dispatches Locked</span>
              </span>
            </>
          )}

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-[#8A8175] hover:text-[#1F2933] dark:hover:text-white transition-colors ml-1"
            title="Dismiss banner"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
