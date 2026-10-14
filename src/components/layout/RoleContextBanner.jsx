import React, { useState } from 'react';
import { 
  Wrench, 
  BarChart3, 
  Microscope, 
  Shield, 
  CheckCircle2, 
  Lock, 
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Compact, unobtrusive role context bar.
 * Replaces the previously oversized enforcement banner with a sleek,
 * dismissible context indicator that preserves critical role awareness
 * without consuming excessive viewport height.
 */
export function RoleContextBanner({ setTab }) {
  const { user, roleConfig } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;

  const role = user.role || 'technician';

  const roleMeta = {
    technician: {
      border: 'border-[#2E7D5B]/30',
      bg: 'bg-[#2E7D5B]/5 dark:bg-[#2E7D5B]/10',
      text: 'text-[#2E7D5B]',
      icon: Wrench,
      title: 'Field Technician Mode',
      subtitle: 'Optimized for physical checklists, LOTO zero-energy safety, and work order execution.',
      pill: 'Safety & Execution'
    },
    manager: {
      border: 'border-[#2C6E9B]/30',
      bg: 'bg-[#2C6E9B]/5 dark:bg-[#2C6E9B]/10',
      text: 'text-[#2C6E9B]',
      icon: BarChart3,
      title: 'Operations Manager Mode',
      subtitle: 'Full facility authority: fleet telemetry, automated PM scheduling, and threshold calibration.',
      pill: 'Dispatch & Fleet'
    },
    auditor: {
      border: 'border-[#B07B1C]/30',
      bg: 'bg-[#B07B1C]/5 dark:bg-[#B07B1C]/10',
      text: 'text-[#B07B1C]',
      icon: Microscope,
      title: 'Reliability Auditor Mode (Read-Only)',
      subtitle: 'Audit focus: ISO 10816 vibration severity compliance, explainable models, and cryptographic export.',
      pill: 'Read-Only Compliance'
    }
  };

  const current = roleMeta[role] || roleMeta.technician;
  const RoleIcon = current.icon;

  return (
    <div className={`px-3 py-2 rounded-lg border ${current.border} ${current.bg} transition-all shadow-xs flex items-center justify-between gap-3 text-xs`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border border-current ${current.text} bg-white dark:bg-[#1A222B]`}>
          <RoleIcon size={13} />
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-display text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4] whitespace-nowrap">
            {current.title}
          </span>
          <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase ${roleConfig?.badgeClass || ''}`}>
            {current.pill}
          </span>
          <span className="font-mono text-[10px] text-[#6E6558] dark:text-[#A0988A] truncate hidden sm:inline">
            {current.subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-[#8A8175] hover:text-[#1F2933] dark:hover:text-white transition-colors cursor-pointer"
          title="Dismiss notice"
          aria-label="Dismiss notice"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
