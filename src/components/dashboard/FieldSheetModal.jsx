import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  X, 
  Shield, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  CheckSquare, 
  Square, 
  Download,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const FieldSheetModal = ({ 
  open, 
  onClose, 
  liveValues, 
  params, 
  onExport 
}) => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'LOTO • Isolate AHU-03 breaker • Padlock & Danger Tag applied • Verify zero energy with multimeter', done: true },
    { id: 2, text: 'Visual inspection • Inspect bearing seal for metal glitter & grease discoloration (take photo for audit)', done: true },
    { id: 3, text: 'Lubrication • Purge and inject 2 pumps NLGI #2 synthetic lithium grease into bearing housing', done: false },
    { id: 4, text: 'Pulley & Belt alignment • Check laser / straight-edge alignment (<0.5mm tolerance)', done: false },
    { id: 5, text: 'Belt tension test • Measure frequency vibration (expected: 45 - 55 Hz)', done: false },
    { id: 6, text: 'Mechanical fast check • Torque foundation mounting bolts to 8 Nm with Loctite 243', done: false },
    { id: 7, text: 'Electrical verification • Verify 3-phase motor draw under bypass (14.2A ±0.5A, imbalance <2%)', done: false },
    { id: 8, text: 'Post-service spin test • 10-minute idle run. Verify vibration < 2.5 mm/s RMS & temp < 52°C', done: false },
    { id: 9, text: 'Closeout • Remove LOTO padlock, sign work order, and update Aegis shift maintenance log', done: false }
  ]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const percent = Math.round((completedCount / tasks.length) * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="field-sheet-title"
    >
      {/* Background click to dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} aria-hidden="true" />

      {/* Printable Sheet Container */}
      <div 
        id="printable-field-sheet"
        className="relative z-10 w-full max-w-[800px] max-h-[92vh] bg-[#FFFFFF] dark:bg-[#141B22] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#1F2933] dark:text-[#FAF8F4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Screen-only Modal Header */}
        <div className="print:hidden px-5 py-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border-b-2 border-[#1F2933] dark:border-[#2C3847] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center shadow-[2px_2px_0_#1F2933]">
              <Printer size={16} />
            </div>
            <div>
              <h2 id="field-sheet-title" className="font-display text-[15px] font-bold uppercase tracking-wide">
                Maintenance Work Order & Field Sheet
              </h2>
              <p className="font-mono text-[10px] text-[#8A8175]">
                Official ISO 10816 dispatch ticket for on-site field technician
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handlePrint} className="hidden sm:flex items-center gap-1.5">
              <Printer size={13} />
              <span>Print to PDF</span>
            </Button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] flex items-center justify-center text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933] dark:hover:text-white"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 font-mono text-[11px] leading-relaxed">
          
          {/* Printable Ticket Header (Visible in print) */}
          <div className="border-b-2 border-[#1F2933] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#2C6E9B] text-white flex items-center justify-center font-bold font-display text-[18px]">
                <Shield size={22} />
              </div>
              <div>
                <div className="font-display text-[18px] font-bold tracking-wider uppercase text-[#1F2933] dark:text-white">
                  AEGIS Predictive Maintenance Facility Ticket
                </div>
                <div className="text-[10px] text-[#8A8175]">
                  Central Campus • Unit 01 • Facility Operations Department
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-block px-2.5 py-1 bg-[#C05043]/10 border border-[#C05043] rounded text-[#C05043] font-bold text-[12px]">
                WORK ORDER #8821 • CRITICAL
              </div>
              <div className="text-[9px] text-[#8A8175] mt-1">
                Issued: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Section 1: Equipment Nameplate & Telemetry Snapshot */}
          <div className="grid sm:grid-cols-2 gap-3 p-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg">
            <div className="space-y-1">
              <div><span className="text-[#8A8175] uppercase">Target Asset:</span> <strong className="text-[#1F2933] dark:text-white ml-1">AHU-03 Primary Supply Fan</strong></div>
              <div><span className="text-[#8A8175] uppercase">Location:</span> <span className="ml-1">East Wing • Roof Mechanical Room 3</span></div>
              <div><span className="text-[#8A8175] uppercase">Equipment Model:</span> <span className="ml-1">Trane M-Series (2018) • 15 kW • 1750 RPM</span></div>
              <div><span className="text-[#8A8175] uppercase">Assigned Tech:</span> <strong className="ml-1">J. Rivera (Shift A Lead)</strong></div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-[#D2C9BA] sm:dark:border-[#2C3847] sm:pl-3">
              <div><span className="text-[#8A8175] uppercase">Vibration Velocity:</span> <strong className="text-[#C05043] ml-1">{liveValues?.vib ?? 6.8} mm/s RMS</strong> (Limit: 2.5 mm/s)</div>
              <div><span className="text-[#8A8175] uppercase">Drive Current:</span> <span className="ml-1">{liveValues?.cur ?? 17.2} A (Nominal: 14.2 A)</span></div>
              <div><span className="text-[#8A8175] uppercase">Motor Casing Temp:</span> <span className="ml-1">{liveValues?.temp ?? 71.8} °C (Limit: 52 °C)</span></div>
              <div><span className="text-[#8A8175] uppercase">Action Window:</span> <strong className="text-[#B07B1C] ml-1">&lt; 168 Hours (7 Days)</strong></div>
            </div>
          </div>

          {/* Section 2: AI Diagnostic Findings */}
          <div className="p-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-bold uppercase text-[10px] text-[#2C6E9B]">
              <AlertTriangle size={13} className="text-[#C05043]" />
              <span>Diagnostic Finding • Multivariate Isolation Forest + FFT Harmonics</span>
            </div>
            <p className="text-[#3E4650] dark:text-[#C5BCAD] text-[11px] leading-relaxed">
              <strong>91% Confidence: Bearing Outer Race Flaking (Defect frequency peak at 3.2x RPM).</strong> Sensor correlation confirms mechanical drag with high rotational velocity and casing overheating without pump pressure loss. No immediate catastrophic seizure today, but proactive servicing is required this shift.
            </p>
          </div>

          {/* Section 3: Required Tool Kit & Replacement Stock */}
          <div className="space-y-1.5">
            <div className="font-bold uppercase text-[10px] text-[#8A8175] flex items-center justify-between">
              <span>Required Parts & Tool Bag</span>
              <span className="text-[9px] text-[#2E7D5B]">Stock Verified • Central Crib</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 border border-[#E6E0D6] dark:border-[#2C3847] rounded bg-[#FAF8F4] dark:bg-[#1A222B]">
                <div className="text-[#8A8175]">Replacement Bearing</div>
                <div className="font-bold text-[#1F2933] dark:text-white">SKF 6205-2RS (4 in stock)</div>
              </div>
              <div className="p-2 border border-[#E6E0D6] dark:border-[#2C3847] rounded bg-[#FAF8F4] dark:bg-[#1A222B]">
                <div className="text-[#8A8175]">Approved Lubricant</div>
                <div className="font-bold text-[#1F2933] dark:text-white">NLGI #2 Synthetic Grease</div>
              </div>
              <div className="p-2 border border-[#E6E0D6] dark:border-[#2C3847] rounded bg-[#FAF8F4] dark:bg-[#1A222B]">
                <div className="text-[#8A8175]">Diagnostic Tool</div>
                <div className="font-bold text-[#1F2933] dark:text-white">Fluke 376 Clamp Meter</div>
              </div>
              <div className="p-2 border border-[#E6E0D6] dark:border-[#2C3847] rounded bg-[#FAF8F4] dark:bg-[#1A222B]">
                <div className="text-[#8A8175]">Alignment Tool</div>
                <div className="font-bold text-[#1F2933] dark:text-white">Laser Pulley Straightedge</div>
              </div>
            </div>
          </div>

          {/* Section 4: Interactive LOTO & Maintenance Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-[#8A8175]">
                LOTO Safety & Maintenance Protocol ({completedCount}/{tasks.length} Complete • {percent}%)
              </span>
              <span className="text-[10px] text-[#8A8175] font-normal print:hidden">Click items as you finish in the field</span>
            </div>

            <div className="h-1.5 w-full bg-[#E6E0D6] dark:bg-[#2C3847] rounded-full overflow-hidden print:hidden">
              <div 
                className="h-full bg-[#2C6E9B] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="space-y-1.5">
              {tasks.map(t => (
                <div 
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-2 rounded border flex items-start gap-2.5 cursor-pointer transition-colors ${
                    t.done 
                      ? 'bg-[#2E7D5B]/5 border-[#2E7D5B]/30 text-[#1F2933] dark:text-white' 
                      : 'bg-[#FAF8F4] dark:bg-[#1A222B] border-[#E6E0D6] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD]'
                  }`}
                >
                  <button type="button" className="mt-0.5 shrink-0 text-[#2C6E9B]" aria-label={`Toggle task ${t.id}`}>
                    {t.done ? <CheckSquare size={14} className="text-[#2E7D5B]" /> : <Square size={14} className="text-[#8A8175]" />}
                  </button>
                  <span className={`text-[11px] leading-snug ${t.done ? 'line-through opacity-70' : ''}`}>
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Signatures & Sign-off */}
          <div className="pt-4 border-t-2 border-[#1F2933] dark:border-[#2C3847] grid grid-cols-2 gap-8 text-[10px]">
            <div>
              <div className="text-[#8A8175] uppercase">Technician Completion Sign-off:</div>
              <div className="mt-6 border-b border-[#1F2933] dark:border-white w-full" />
              <div className="mt-1 flex justify-between text-[#8A8175]">
                <span>Signature / Badge #</span>
                <span>Date: ____/____/2026</span>
              </div>
            </div>

            <div>
              <div className="text-[#8A8175] uppercase">Shift Lead Approval:</div>
              <div className="mt-6 border-b border-[#1F2933] dark:border-white w-full" />
              <div className="mt-1 flex justify-between text-[#8A8175]">
                <span>Approval Stamp</span>
                <span>Time: ____:____</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls (Screen only) */}
        <div className="print:hidden px-5 py-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border-t-2 border-[#1F2933] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="xs" onClick={() => onExport('checklist')}>
              <FileText size={11} className="mr-1" /> Export Checklist JSON
            </Button>
            <Button variant="secondary" size="xs" onClick={() => onExport('csv')}>
              <Download size={11} className="mr-1" /> Export CSV
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer size={13} />
              <span>Print Work Order / PDF</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
