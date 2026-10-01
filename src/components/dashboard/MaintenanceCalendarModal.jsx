import React, { useEffect } from 'react';
import { X, Calendar as CalendarIcon, Download, Printer } from 'lucide-react';
import { MaintenanceScheduler } from './MaintenanceScheduler';
import { Button } from '../ui/Button';

export const MaintenanceCalendarModal = ({
  open,
  onClose,
  feedMode,
  onSelectAsset,
  onPrintFieldSheet,
  showToast
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#F1EDE6] dark:bg-[#141B22] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-4 bg-white dark:bg-[#1A222B] border-b border-[#D2C9BA] dark:border-[#2C3847] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center shadow-sm">
              <CalendarIcon size={16} />
            </div>
            <div>
              <h2 className="font-display text-[16px] font-bold text-[#1F2933] dark:text-[#FAF8F4] leading-tight uppercase tracking-wider">
                Facility Preventive Maintenance Calendar
              </h2>
              <p className="font-mono text-[10px] text-[#8A8175]">
                AI Failure Forecast &bull; Off-Peak Shift Auto-Slotting &bull; .ICS Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#8A8175] hover:text-[#1F2933] dark:hover:text-white hover:border-[#2C6E9B] transition-all"
              aria-label="Close PM Calendar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <MaintenanceScheduler
            feedMode={feedMode}
            onSelectAsset={(id) => {
              onClose();
              if (onSelectAsset) onSelectAsset(id);
            }}
            onPrintFieldSheet={onPrintFieldSheet}
            showToast={showToast}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white dark:bg-[#1A222B] border-t border-[#D2C9BA] dark:border-[#2C3847] flex items-center justify-between font-mono text-[10px] text-[#8A8175] shrink-0">
          <span>Synced with Aegis Local Cache &bull; Standard iCalendar RFC 5545</span>
          <Button variant="secondary" size="xs" onClick={onClose}>
            Close Window
          </Button>
        </div>

      </div>
    </div>
  );
};
