import React, { useMemo } from 'react';
import { 
  ArrowRight, 
  ExternalLink, 
  Shield, 
  Cpu, 
  Radio, 
  Clock, 
  Activity, 
  Database, 
  Lock, 
  Box, 
  Users, 
  FileText, 
  Calendar as CalendarIcon, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Bell, 
  Sun, 
  Sliders, 
  ChevronRight,
  TrendingUp,
  Brain,
  FileCheck,
  Zap,
  Waves,
  Thermometer,
  Gauge,
  Layers,
  Wrench
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ASSET_REGISTRY } from '../asset/AssetQrModal';

// --- Equipment Vector Graphic Badges ---
const EquipmentIcon = ({ type, className = "w-16 h-16" }) => {
  switch (type) {
    case 'ahu-03':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="15" width="60" height="50" rx="8" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="40" cy="40" r="20" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
          <path d="M40 20L40 60M20 40L60 40M26 26L54 54M26 54L54 26" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="40" r="6" fill="#1E293B" />
          <rect x="62" y="32" width="10" height="16" rx="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
        </svg>
      );
    case 'cw-pump-02':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="36" cy="42" r="22" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
          <circle cx="36" cy="42" r="14" fill="#38BDF8" />
          <path d="M36 28V56M22 42H50" stroke="#0C4A6E" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="30" y="8" width="12" height="18" rx="2" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
          <rect x="52" y="36" width="22" height="12" rx="2" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
          <circle cx="36" cy="42" r="5" fill="#FFFFFF" />
        </svg>
      );
    case 'elec-01':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="10" width="44" height="60" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <rect x="23" y="15" width="16" height="50" rx="2" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
          <rect x="41" y="15" width="16" height="50" rx="2" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="35" cy="40" r="2" fill="#1E293B" />
          <circle cx="45" cy="40" r="2" fill="#1E293B" />
          <path d="M40 22L36 30H44L40 38" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chiller-01':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="24" width="56" height="22" rx="10" fill="#0D9488" stroke="#0F766E" strokeWidth="2" />
          <rect x="18" y="44" width="44" height="18" rx="8" fill="#14B8A6" stroke="#0F766E" strokeWidth="2" />
          <line x1="28" y1="24" x2="28" y2="44" stroke="#042F2E" strokeWidth="3" />
          <line x1="52" y1="24" x2="52" y2="44" stroke="#042F2E" strokeWidth="3" />
          <circle cx="40" cy="35" r="4" fill="#CCFBF1" />
        </svg>
      );
    case 'vav-4b':
    default:
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="20" width="52" height="40" rx="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
          <circle cx="40" cy="40" r="14" fill="#94A3B8" />
          <line x1="26" y1="40" x2="54" y2="40" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" transform="rotate(-30 40 40)" />
          <rect x="52" y="14" width="16" height="18" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
        </svg>
      );
  }
};

// --- Sensor Board Graphic Badges ---
const SensorIcon = ({ id, className = "w-12 h-12" }) => {
  switch (id) {
    case 'esp32':
      return (
        <svg viewBox="0 0 60 60" className={className} fill="none">
          <rect x="12" y="6" width="36" height="48" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <rect x="18" y="10" width="24" height="18" rx="2" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="1" />
          <rect x="22" y="32" width="16" height="16" rx="2" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
          <circle cx="15" cy="50" r="1.5" fill="#EF4444" />
          <circle cx="45" cy="50" r="1.5" fill="#10B981" />
        </svg>
      );
    case 'mpu6050':
      return (
        <svg viewBox="0 0 60 60" className={className} fill="none">
          <rect x="10" y="10" width="40" height="40" rx="4" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1.5" />
          <rect x="20" y="20" width="20" height="20" rx="2" fill="#0F172A" stroke="#93C5FD" strokeWidth="1" />
          <circle cx="15" cy="15" r="2" fill="#FCD34D" />
          <circle cx="45" cy="15" r="2" fill="#FCD34D" />
          <path d="M25 30H35M30 25V35" stroke="#60A5FA" strokeWidth="1.5" />
        </svg>
      );
    case 'acs712':
      return (
        <svg viewBox="0 0 60 60" className={className} fill="none">
          <rect x="8" y="14" width="44" height="32" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x="12" y="20" width="12" height="20" rx="2" fill="#047857" stroke="#34D399" strokeWidth="1" />
          <rect x="28" y="20" width="18" height="14" rx="2" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="18" cy="30" r="2" fill="#F8FAFC" />
        </svg>
      );
    case 'dht22':
      return (
        <svg viewBox="0 0 60 60" className={className} fill="none">
          <rect x="14" y="10" width="32" height="40" rx="3" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="18" y1="18" x2="42" y2="18" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="18" y1="24" x2="42" y2="24" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="18" y1="30" x2="42" y2="30" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
          <rect x="22" y="48" width="16" height="6" fill="#64748B" />
        </svg>
      );
    case 'scd40':
      return (
        <svg viewBox="0 0 60 60" className={className} fill="none">
          <rect x="10" y="14" width="40" height="32" rx="4" fill="#059669" stroke="#34D399" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="10" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="4" fill="#1E293B" />
        </svg>
      );
    case 'yfs201':
      return (
        <svg viewBox="0 0 60 60" className={className} fill="none">
          <circle cx="30" cy="30" r="18" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <circle cx="30" cy="30" r="10" fill="#DC2626" />
          <path d="M30 18V42M18 30H42" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="6" y="24" width="10" height="12" fill="#1E293B" stroke="#475569" />
          <rect x="44" y="24" width="10" height="12" fill="#1E293B" stroke="#475569" />
        </svg>
      );
    case 'pir':
    default:
      return (
        <svg viewBox="0 0 60 60" className={className} fill="none">
          <rect x="12" y="22" width="36" height="26" rx="3" fill="#059669" stroke="#34D399" strokeWidth="1.5" />
          <circle cx="30" cy="24" r="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <circle cx="30" cy="24" r="8" fill="#F1F5F9" />
        </svg>
      );
  }
};

export const LandingShowcase = ({
  onExploreDashboard,
  onSelectAsset,
  onOpenHardware,
  onOpenWorkflows,
  onOpenCalendar,
  onPrintFieldSheet,
  onOpenQrTags,
  feedMode = 'fault',
  liveValues,
  isLive,
  workOrders = []
}) => {
  const isFault = feedMode === 'fault';
  const activeAlertCount = isFault ? 2 : 0;

  return (
    <div className="space-y-12 pb-16 font-sans text-[#0F172A] antialiased">
      
      {/* =========================================================
          1. HERO SECTION WITH 3D FLOATING DASHBOARD PREVIEW
         ========================================================= */}
      <section className="relative pt-4 sm:pt-8 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-blue-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 left-10 w-[300px] h-[300px] bg-indigo-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Open Source Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
              <span>Open Source Facility Intelligence</span>
            </div>

            {/* Title with Gradient Accent */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-[1.08]">
                Aegis <br />
                <span className="text-[#334155] dark:text-[#CBD5E1]">Open Facility </span>
                <span className="bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
                  Intelligence
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94A3B8] font-normal leading-relaxed pt-2 max-w-xl">
                Democratized Predictive Maintenance for Public & Commercial Infrastructure.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreDashboard}
                className="group px-6 py-3.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-semibold text-sm shadow-xl shadow-slate-900/10 hover:bg-[#1E293B] dark:hover:bg-slate-100 transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <span>Explore Dashboard</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="https://github.com/praneetjena-prog/idp-aegis"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-white font-semibold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-[#283548] transition-all flex items-center gap-2"
              >
                <ExternalLink size={15} className="text-[#64748B]" />
                <span>View on GitHub</span>
              </a>
            </div>

            {/* Proof Points Strip */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#0284C7]" />
                <span>MIT License</span>
              </div>
              <span className="text-[#CBD5E1]">•</span>
              <div className="flex items-center gap-1.5">
                <Cpu size={14} className="text-[#059669]" />
                <span>Open Source Hardware & Software</span>
              </div>
              <span className="text-[#CBD5E1]">•</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">github.com/aegis-open</span>
            </div>

          </div>

          {/* Right Column: Isometric Floating Dashboard Preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none transform transition-all duration-500 lg:hover:rotate-0 lg:-rotate-1 lg:hover:scale-[1.02]">
              
              {/* Outer Card with Glassmorphism */}
              <div className="rounded-2xl border-2 border-[#CBD5E1] dark:border-[#334155] bg-white/95 dark:bg-[#0F172A]/95 p-4 sm:p-5 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
                
                {/* Mock Browser/Dashboard Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#2563EB] flex items-center justify-center text-white font-bold text-[10px]">
                      ▲
                    </div>
                    <span className="font-bold text-sm text-[#0F172A] dark:text-white">Aegis</span>
                  </div>

                  {/* Search pill */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-[#64748B] font-mono w-48">
                    <Search size={12} />
                    <span className="truncate">Search assets, locations...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative p-1 text-[#64748B]">
                      <Bell size={14} />
                      {activeAlertCount > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-[#0F172A] dark:text-white">
                      J
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats Row */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <div className="text-[10px] font-mono text-[#64748B] uppercase">Monitored Assets</div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-bold text-[#0F172A] dark:text-white">5</span>
                      <span className="w-2 h-2 rounded-full bg-[#0F172A] dark:bg-white" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <div className="text-[10px] font-mono text-[#64748B] uppercase">Active Alerts</div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-xl font-bold ${activeAlertCount > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                        {activeAlertCount}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${activeAlertCount > 0 ? 'bg-[#EF4444] animate-pulse' : 'bg-[#10B981]'}`} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <div className="text-[10px] font-mono text-[#64748B] uppercase">Healthy</div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-bold text-[#10B981]">
                        {isFault ? 3 : 5}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    </div>
                  </div>
                </div>

                {/* Trend Chart Mockup inside Preview */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">Equipment Health Trend</span>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-[#64748B]">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" /> Vibration</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Temperature</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> Current</span>
                    </div>
                  </div>

                  {/* SVG Multi-line Graph */}
                  <svg viewBox="0 0 380 90" className="w-full h-20 overflow-visible">
                    <line x1="0" y1="20" x2="380" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="380" y2="50" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="380" y2="80" stroke="#E2E8F0" />
                    
                    {/* Blue line (vibration) */}
                    <path 
                      d="M 10,70 Q 60,60 120,65 T 240,40 T 360,25" 
                      fill="none" 
                      stroke="#3B82F6" 
                      strokeWidth="2.5" 
                    />
                    {/* Red line (temperature) */}
                    <path 
                      d="M 10,35 Q 80,30 160,45 T 280,35 T 360,40" 
                      fill="none" 
                      stroke="#EF4444" 
                      strokeWidth="2" 
                    />
                    {/* Yellow line (current) */}
                    <path 
                      d="M 10,60 Q 90,75 180,68 T 290,60 T 360,55" 
                      fill="none" 
                      stroke="#F59E0B" 
                      strokeWidth="2" 
                    />
                  </svg>

                  <div className="flex justify-between text-[9px] font-mono text-[#94A3B8] mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Oct 20</span>
                    <span>Oct 21</span>
                    <span>Oct 22</span>
                    <span>Oct 23</span>
                    <span>Oct 24</span>
                    <span>Oct 25</span>
                    <span>Oct 26</span>
                  </div>
                </div>

                {/* 1-Click Interactive CTA Pill */}
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={onExploreDashboard}
                    className="w-full py-2 rounded-lg bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Click to Enter Full SCADA Console</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          2. FOUR CORE VALUE PILLARS (LOW COST, OPEN, COTS, FIELD)
         ========================================================= */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-3">
            <Database size={20} />
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">Low Cost</h3>
          <p className="font-mono text-xs text-[#0284C7] font-semibold mt-0.5">~$180 / Monitored Machine</p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">95% cheaper than proprietary legacy SCADA installations.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-3">
            <Lock size={20} />
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">Open Source</h3>
          <p className="font-mono text-xs text-[#0284C7] font-semibold mt-0.5">MIT License</p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Public good architecture for transparent, explainable facility health.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-3">
            <Box size={20} />
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">COTS Based</h3>
          <p className="font-mono text-xs text-[#0284C7] font-semibold mt-0.5">Zero Vendor Lock-in</p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Standard off-the-shelf breakout sensors available worldwide.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-3">
            <Users size={20} />
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">Built for the Field</h3>
          <p className="font-mono text-xs text-[#0284C7] font-semibold mt-0.5">Technicians & Shift Engineers</p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Mobile QR passports, LOTO protocols, and instant calendar sync.</p>
        </div>

      </section>

      {/* =========================================================
          3. REGISTERED CAMPUS ASSETS (THE 5 MONITORED MACHINES)
         ========================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
              Registered Campus Assets
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Select any machine to inspect its live sensors, engineering specs, and mobile field passport.
            </p>
          </div>

          <button
            type="button"
            onClick={onExploreDashboard}
            className="self-start sm:self-auto font-mono text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
          >
            <span>View All Telemetry Grid</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 5 Asset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {Object.values(ASSET_REGISTRY).map((asset) => {
            const isTargetAhu = asset.id === 'ahu-03';
            const isAlert = isFault && isTargetAhu;

            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between bg-white dark:bg-[#1E293B] ${
                  isAlert 
                    ? 'border-[#EF4444] shadow-lg shadow-red-500/10' 
                    : 'border-[#E2E8F0] dark:border-[#334155] hover:border-[#2563EB] shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Status Dot & Code */}
                  <div className="flex items-center justify-between">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" style={{
                      backgroundColor: isAlert ? '#EF4444' : asset.id === 'cw-pump-02' ? '#F59E0B' : '#10B981'
                    }} />
                    <span className="font-mono text-[10px] text-[#64748B] font-semibold">
                      {asset.code}
                    </span>
                  </div>

                  {/* Centered Graphic */}
                  <div className="py-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <EquipmentIcon type={asset.id} className="w-20 h-20" />
                  </div>

                  {/* Name & Subtitle */}
                  <h4 className="font-bold text-sm text-[#0F172A] dark:text-white line-clamp-1">
                    {asset.code}
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-0.5">
                    {asset.name}
                  </p>
                </div>

                {/* Bottom Action Arrow */}
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-[#2563EB]">
                  <span className="text-[10px] text-[#64748B]">
                    {isAlert ? 'Critical 7d' : 'Nominal'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          4. HARDWARE & SENSOR KIT (THE DEMOCRATIZED $180 BOM)
         ========================================================= */}
      <section className="rounded-3xl bg-[#0B132B] text-white p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Hardware & Sensor Kit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Commercial Off-The-Shelf (COTS) components forming the democratized edge gateway.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenHardware}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 font-mono text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <span>View Full BOM & Pinouts</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 7 Sensor Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
            <SensorIcon id="esp32" className="w-12 h-12 mb-2" />
            <div className="font-bold text-xs">ESP32-WROOM</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Edge Gateway</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
            <SensorIcon id="mpu6050" className="w-12 h-12 mb-2" />
            <div className="font-bold text-xs">MPU-6050</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Vibration & IMU</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
            <SensorIcon id="acs712" className="w-12 h-12 mb-2" />
            <div className="font-bold text-xs">ACS712</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Phase Current</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
            <SensorIcon id="dht22" className="w-12 h-12 mb-2" />
            <div className="font-bold text-xs">DHT22</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Temp & Humidity</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
            <SensorIcon id="scd40" className="w-12 h-12 mb-2" />
            <div className="font-bold text-xs">SCD40 & MQ-2</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Air Quality & Gas</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
            <SensorIcon id="yfs201" className="w-12 h-12 mb-2" />
            <div className="font-bold text-xs">YF-S201</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Hydraulic Flow</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
            <SensorIcon id="pir" className="w-12 h-12 mb-2" />
            <div className="font-bold text-xs">HC-SR501</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">PIR Occupancy</div>
          </div>

        </div>
      </section>

      {/* =========================================================
          5. PREDICTIVE INSIGHTS YOU CAN ACT ON (4 METRICS)
         ========================================================= */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
          Predictive Insights You Can Act On
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0F172A] dark:text-white">7–14 Days</div>
              <div className="text-xs font-semibold text-[#2563EB]">Early Warning (RUL)</div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Lead time before progressive bearing wear causes motor seizure.</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-[#7C3AED] shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0F172A] dark:text-white">Explainable AI</div>
              <div className="text-xs font-semibold text-[#7C3AED]">Isolation Forest + ARIMA + FFT</div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Statistical multi-parameter correlation with zero black-box bias.</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-[#059669] shrink-0">
              <FileCheck size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0F172A] dark:text-white">ISO 10816-3</div>
              <div className="text-xs font-semibold text-[#059669]">Vibration Standards</div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Calibrated to 2.5 mm/s baseline and 4.5 mm/s early action limits.</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-[#D97706] shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0F172A] dark:text-white">Dynamic Calibration</div>
              <div className="text-xs font-semibold text-[#D97706]">No Alert Fatigue</div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Filters out transient inrush spikes to prevent nuisance tripping.</div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          6. OPERATIONAL WORKFLOWS (LOTO, FIELD QR, SCHEDULING)
         ========================================================= */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
          Operational Workflows
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          
          {/* LOTO Safety */}
          <div 
            onClick={onPrintFieldSheet}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:border-[#2563EB] cursor-pointer transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] shrink-0 group-hover:scale-105 transition-transform">
              <Lock size={20} />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-[#0F172A] dark:text-white">LOTO Safety</div>
              <div className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">SOP-EL-03 Lockout/Tagout</div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1">
                Padlock isolation checklists preventing accidental re-energization during maintenance.
              </p>
            </div>
          </div>

          {/* Field Execution */}
          <div 
            onClick={onOpenQrTags}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:border-[#2563EB] cursor-pointer transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] shrink-0 group-hover:scale-105 transition-transform">
              <QrCode size={20} />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-[#0F172A] dark:text-white">Field Execution</div>
              <div className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">Vector QR Passports + PDF Field Sheets</div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1">
                On-site phone scan connects technicians instantly to machine BOM and historical work orders.
              </p>
            </div>
          </div>

          {/* Scheduling */}
          <div 
            onClick={onOpenCalendar}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:border-[#2563EB] cursor-pointer transition-all flex items-start gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] shrink-0 group-hover:scale-105 transition-transform">
              <CalendarIcon size={20} />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-[#0F172A] dark:text-white">Scheduling</div>
              <div className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">iCalendar (.ics) RFC 5545</div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1">
                Auto-slots predictive interventions into off-peak windows with 1-click Outlook & Google sync.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          7. FOOTER BANNER (BRAND ANCHOR)
         ========================================================= */}
      <footer className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-xs">
              ▲
            </span>
            <span className="font-display text-lg font-bold">Aegis</span>
            <span className="font-mono text-xs text-slate-400">Open Facility Intelligence</span>
          </div>
          <p className="font-sans text-xs text-slate-300 italic max-w-md">
            "Built for field technicians and shift engineers, not distant executive boardrooms."
          </p>
        </div>

        <a
          href="https://github.com/praneetjena-prog/idp-aegis"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-white text-[#0F172A] font-mono text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shrink-0 shadow"
        >
          <span>github.com/aegis-open</span>
          <ArrowRight size={14} />
        </a>
      </footer>

    </div>
  );
};
