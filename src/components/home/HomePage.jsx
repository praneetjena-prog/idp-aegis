import React from 'react';
import { 
  Shield, 
  Radio, 
  Cpu, 
  Activity, 
  ArrowRight, 
  Layers, 
  Zap, 
  Gauge, 
  FileText, 
  QrCode, 
  Wrench, 
  BarChart3, 
  Microscope, 
  CheckCircle2, 
  ExternalLink, 
  Sun, 
  Moon, 
  CalendarDays,
  Lock,
  ChevronRight,
  Clock,
  Sparkles,
  Waves,
  Thermometer,
  Volume2
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { GoogleIcon } from '../auth/GoogleSignInModal';

export function HomePage({ 
  onNavigate, 
  liveValues, 
  isLive, 
  feedMode, 
  darkMode, 
  toggleTheme, 
  onOpenQrTags, 
  onOpenCalendar 
}) {
  const { user, isAuthenticated, openSignInModal, signOut, roleConfig } = useAuth();

  const handleLaunchConsole = (targetTab = 'console', assetId = null) => {
    if (!isAuthenticated) {
      openSignInModal(targetTab);
    } else {
      onNavigate(targetTab, assetId);
    }
  };

  const scrollToSection = (e, sectionId) => {
    if (e && e.preventDefault) e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      id: 'console',
      tab: 'console',
      title: 'Live Operations Console',
      category: 'Telemetry & SCADA',
      icon: Radio,
      color: '#2C6E9B',
      borderClass: 'hover:border-[#2C6E9B]',
      badge: 'Real-Time SCADA',
      badgeColor: 'bg-[#2C6E9B]/10 text-[#2C6E9B] border-[#2C6E9B]/30',
      description: 'Centralized telemetry dashboard monitoring all facility subsystems (HVAC, Chilled Water, Switchgear). Visualizes health score, power envelope, and sensor feeds updated every 1.8 seconds.',
      metrics: ['5 Campus Subsystems', '1,428 Sensor Points', 'Live Sensor Gauges'],
      actionText: 'Launch Console'
    },
    {
      id: 'analysis',
      tab: 'analysis',
      title: 'Root Cause & Triage Queue',
      category: 'Predictive Intelligence',
      icon: Activity,
      color: '#C05043',
      borderClass: 'hover:border-[#C05043]',
      badge: 'Explainable AI',
      badgeColor: 'bg-[#C05043]/10 text-[#C05043] border-[#C05043]/30',
      description: 'Multivariate Isolation Forest and FFT spectral harmonic analysis. Predicts mechanical breakdown 7–14 days in advance and correlates vibration with current spikes to prevent catastrophic motor failure.',
      metrics: ['7–14 Day Early Warning', 'Zero Black-Box AI', 'Automated WO Dispatch'],
      actionText: 'Inspect Root Cause'
    },
    {
      id: 'simulator',
      tab: 'simulator',
      title: 'Physics Wear Scenario Engine',
      category: 'Digital Twin Simulation',
      icon: Gauge,
      color: '#2E7D5B',
      borderClass: 'hover:border-[#2E7D5B]',
      badge: 'Interactive Sandbox',
      badgeColor: 'bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/30',
      description: 'What-if degradation engine to test motor bearing spalling, belt slippage, and unbalance without risking physical machines. Verify alarm limits and ISO 10816 thresholds in real time.',
      metrics: ['Interactive Wear Sliders', 'ISO 10816-3 Thresholds', 'Fault Propagation'],
      actionText: 'Run Wear Simulator'
    },
    {
      id: 'platform',
      tab: 'platform',
      title: 'Open Hardware & Sensor Layer',
      category: 'Democratized Hardware',
      icon: Cpu,
      color: '#8A8175',
      borderClass: 'hover:border-[#8A8175]',
      badge: '$180 BOM',
      badgeColor: 'bg-[#8A8175]/10 text-[#8A8175] border-[#8A8175]/30',
      description: 'Complete bill of materials built on standard commercial off-the-shelf (COTS) electronics: ESP32 microcontrollers, MPU-6050 accelerometers, ACS712 current transformers, and MQTT broker pinouts.',
      metrics: ['$180 Per Machine Cost', 'Zero Vendor Lock-in', 'Open Schematics'],
      actionText: 'View Hardware Specs'
    },
    {
      id: 'asset',
      tab: 'asset',
      targetAsset: 'ahu-03',
      title: 'Mobile QR Asset Passports',
      category: 'Field Execution',
      icon: QrCode,
      color: '#B07B1C',
      borderClass: 'hover:border-[#B07B1C]',
      badge: 'Field Checklists',
      badgeColor: 'bg-[#B07B1C]/10 text-[#B07B1C] border-[#B07B1C]/30',
      description: 'Mobile-first QR passport for every physical machine. Scan on-site to inspect maintenance history, verify LOTO safety zero-energy procedures, and complete step-by-step field checklists.',
      metrics: ['LOTO Safety SOPs', 'Offline-First Checklist', 'Instant QR Scanning'],
      actionText: 'Open Asset Passport'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0F151C] text-[#1F2933] dark:text-[#FAF8F4] font-sans transition-colors duration-200">
      
      {/* 1. Global Portal Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FAF8F4]/95 dark:bg-[#141B22]/95 backdrop-blur-md border-b border-[#D2C9BA] dark:border-[#2C3847]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2C6E9B] text-white flex items-center justify-center font-mono font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-none">
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[16px] font-bold tracking-tight text-[#1F2933] dark:text-[#FAF8F4]">
                  AEGIS
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#2C6E9B]/10 text-[#2C6E9B] font-bold uppercase border border-[#2C6E9B]/30">
                  Open BMS
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#8A8175] hidden sm:block">
                Public Facility Operations & Anomaly Engine
              </div>
            </div>
          </div>

          {/* Center Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] text-[#6E6558] dark:text-[#A0988A]">
            <button 
              type="button" 
              onClick={(e) => scrollToSection(e, 'features')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              type="button" 
              onClick={(e) => scrollToSection(e, 'roles')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              Roles (RBAC)
            </button>
            <button 
              type="button" 
              onClick={(e) => scrollToSection(e, 'hardware')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              Hardware BOM
            </button>
            <button 
              type="button"
              onClick={() => handleLaunchConsole('platform')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              Architecture
            </button>
          </nav>

          {/* Right Controls: Theme + Auth / Launch Console */}
          <div className="flex items-center gap-3">
            
            {/* Live Status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2E7D5B]/10 border border-[#2E7D5B]/30 font-mono text-[10px] text-[#2E7D5B] font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse" />
              <span>5 Machines Monitored</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] transition-all"
            >
              {darkMode ? <Sun size={14} className="text-[#E0A83B]" /> : <Moon size={14} className="text-[#2C6E9B]" />}
            </button>

            {/* Auth State Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E6E0D6] dark:border-[#2C3847]">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-7 h-7 rounded-full border border-[#D2C9BA] dark:border-[#2C3847] object-cover" 
                  />
                  <div className="text-left">
                    <div className="font-display text-[11px] font-bold leading-tight">{user.name}</div>
                    <div className="font-mono text-[9px] text-[#8A8175]">{roleConfig?.shortName}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchConsole('console')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2C6E9B] text-white font-display text-[12px] font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:bg-[#255C83] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
                >
                  <span>Enter Console</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openSignInModal('console')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[11px] font-bold hover:border-[#2C6E9B] transition-all"
                >
                  <GoogleIcon size={14} />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchConsole('console')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2C6E9B] text-white font-display text-[12px] font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:bg-[#255C83] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
                >
                  <span>Launch Console</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#E6E0D6] dark:border-[#2C3847]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#1F2933_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] font-mono text-[10px] font-bold tracking-wider uppercase text-[#8A8175] mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2C6E9B] animate-pulse" />
              <span>Public Facility Intelligence • Open Source (MIT)</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[36px] sm:text-[46px] lg:text-[54px] font-bold text-[#1F2933] dark:text-[#FAF8F4] leading-[1.1] tracking-tight">
              Democratized Predictive Maintenance for Public Facilities.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-[15px] sm:text-[17px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed max-w-2xl">
              Aegis replaces multimillion-dollar proprietary building automation with inexpensive COTS sensor nodes, explainable AI, and transparent telemetry. Catches mechanical degradation <strong>7–14 days before catastrophic breakdown</strong> for under <strong>$180 per machine</strong>.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleLaunchConsole('console')}
                className="px-6 py-3 rounded-xl bg-[#2C6E9B] text-white font-display text-[14px] font-bold shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] hover:bg-[#255C83] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Facility Console</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={(e) => scrollToSection(e, 'features')}
                className="px-5 py-3 rounded-xl border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] font-display text-[14px] font-bold shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] hover:bg-[#FAF8F4] dark:hover:bg-[#202B37] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Features</span>
              </button>

              <a
                href="https://github.com/praneetjena-prog/idp-aegis"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-xl border border-[#D2C9BA] dark:border-[#2C3847] text-[#6E6558] dark:text-[#A0988A] hover:text-[#1F2933] dark:hover:text-[#FAF8F4] font-mono text-[12px] flex items-center gap-1.5 transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Value Highlights Pill Strip */}
            <div className="mt-10 pt-6 border-t border-[#E6E0D6] dark:border-[#2C3847] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[11px]">
              <div>
                <div className="text-[#8A8175] text-[10px] uppercase">Node Cost</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[14px]">$180 / Machine</div>
              </div>
              <div>
                <div className="text-[#8A8175] text-[10px] uppercase">Early Warning</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[14px]">7–14 Days RUL</div>
              </div>
              <div>
                <div className="text-[#8A8175] text-[10px] uppercase">Hardware Base</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[14px]">100% COTS (ESP32)</div>
              </div>
              <div>
                <div className="text-[#8A8175] text-[10px] uppercase">Open Standard</div>
                <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[14px]">MIT Licensed</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Live Telemetry Ticker Snapshot */}
      <section className="bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8A8175]">
                Live Sensor Telemetry Snapshot • AHU-03 Supply Fan
              </span>
            </div>
            <div className="font-mono text-[10px] text-[#8A8175]">
              {isLive ? 'Stream: Connected to ESP32 Hardware' : 'Stream: Simulated Physics Engine'} • 1.8s refresh
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847]">
              <div className="flex items-center gap-1.5 text-[#8A8175] mb-1">
                <Waves size={13} className="text-[#2C6E9B]" />
                <span className="font-mono text-[10px] uppercase font-bold">Vibration Velocity</span>
              </div>
              <div className="font-mono text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                {liveValues?.vib || '2.34'} <span className="text-[12px] font-normal text-[#8A8175]">mm/s</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-[#2E7D5B]">ISO 10816 Limit: 2.5 mm/s</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847]">
              <div className="flex items-center gap-1.5 text-[#8A8175] mb-1">
                <Zap size={13} className="text-[#B07B1C]" />
                <span className="font-mono text-[10px] uppercase font-bold">Motor Phase Current</span>
              </div>
              <div className="font-mono text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                {liveValues?.cur || '14.2'} <span className="text-[12px] font-normal text-[#8A8175]">A</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-[#8A8175]">Nominal: 14.2A ±0.5A</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847]">
              <div className="flex items-center gap-1.5 text-[#8A8175] mb-1">
                <Thermometer size={13} className="text-[#C05043]" />
                <span className="font-mono text-[10px] uppercase font-bold">Bearing Temperature</span>
              </div>
              <div className="font-mono text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                {liveValues?.temp || '54.2'} <span className="text-[12px] font-normal text-[#8A8175]">°C</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-[#2E7D5B]">Thermal Margin: +25.8°C</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847]">
              <div className="flex items-center gap-1.5 text-[#8A8175] mb-1">
                <Volume2 size={13} className="text-[#6E6558]" />
                <span className="font-mono text-[10px] uppercase font-bold">Acoustic HF Noise</span>
              </div>
              <div className="font-mono text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                +{liveValues?.acoustic || '1.8'} <span className="text-[12px] font-normal text-[#8A8175]">dB</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-[#8A8175]">Harmonic: 3.2 kHz Band</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core System Features Grid */}
      <section id="features" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175] mb-2">
            System Modules & Routing
          </div>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
            Engineered for Field Reliability & Action
          </h2>
          <p className="mt-2 text-[14px] text-[#6E6558] dark:text-[#A0988A] max-w-2xl leading-relaxed">
            Every feature routes directly into a functional operational interface. Click any module to enter the console in that specialized view.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#E6E0D6] dark:border-[#2C3847] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-[4px_4px_0_#1F2933] dark:hover:shadow-[4px_4px_0_#0F151C] ${feat.borderClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white" 
                      style={{ backgroundColor: feat.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] mb-1">
                    {feat.category}
                  </div>
                  <h3 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed mb-4">
                    {feat.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] mb-6">
                    {feat.metrics.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 font-mono text-[10px] text-[#6E6558] dark:text-[#A0988A]">
                        <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchConsole(feat.tab, feat.targetAsset)}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] font-display text-[12px] font-bold hover:bg-[#2C6E9B] hover:text-white hover:border-[#2C6E9B] transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <span>{feat.actionText}</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}

          {/* Special Quick Action Card: PM Calendar */}
          <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#E6E0D6] dark:border-[#2C3847] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-[#2C6E9B]">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2C6E9B] flex items-center justify-center text-white">
                  <CalendarDays size={20} />
                </div>
                <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border bg-[#2C6E9B]/10 text-[#2C6E9B] border-[#2C6E9B]/30">
                  RFC 5545 Sync
                </span>
              </div>

              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] mb-1">
                Automated Scheduling
              </div>
              <h3 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-2">
                Predictive PM Calendar
              </h3>
              <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed mb-4">
                Synchronizes dynamic maintenance intervals directly to Google Calendar, Apple Calendar, and Microsoft Outlook via standard `.ics` exports.
              </p>

              <div className="space-y-1.5 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847] mb-6 font-mono text-[10px] text-[#6E6558] dark:text-[#A0988A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                  <span>Dynamic RUL-driven intervals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                  <span>1-Click iCalendar (.ics) download</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                  <span>Google Calendar instant web link</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenCalendar) onOpenCalendar();
                else handleLaunchConsole('analysis');
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] font-display text-[12px] font-bold hover:bg-[#2C6E9B] hover:text-white hover:border-[#2C6E9B] transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
            >
              <span>Open PM Calendar</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Role-Based Access Control (RBAC) Section */}
      <section id="roles" className="py-16 sm:py-20 bg-[#FAF8F4] dark:bg-[#141B22] border-t border-b border-[#E6E0D6] dark:border-[#2C3847] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175] mb-2">
              Role-Based Access Control
            </div>
            <h2 className="font-display text-[28px] sm:text-[36px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              3 Dedicated Facility Roles
            </h2>
            <p className="mt-2 text-[14px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
              When entering the console with your Google Account, Aegis adapts its interface and workflows to your operational responsibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(ROLES).map((r) => {
              const icons = {
                technician: Wrench,
                manager: BarChart3,
                auditor: Microscope
              };
              const RoleIcon = icons[r.id] || Shield;

              return (
                <div 
                  key={r.id} 
                  className="p-6 rounded-2xl bg-white dark:bg-[#1A222B] border-2 border-[#E6E0D6] dark:border-[#2C3847] flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: r.color }}
                      >
                        <RoleIcon size={20} />
                      </div>
                      <span className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${r.badgeClass}`}>
                        {r.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-2">
                      {r.name}
                    </h3>
                    <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed mb-4">
                      {r.description}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-[#E6E0D6] dark:border-[#2C3847]">
                      <div className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#8A8175]">
                        Core Responsibilities:
                      </div>
                      {r.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-2 font-mono text-[10px] text-[#6E6558] dark:text-[#A0988A]">
                          <span className="text-[#2C6E9B] mt-0.5">•</span>
                          <span>{resp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        openSignInModal('console');
                      } else {
                        handleLaunchConsole('console');
                      }
                    }}
                    className="mt-6 w-full py-2 px-3 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] font-display text-[12px] font-bold hover:bg-[#2C6E9B] hover:text-white hover:border-[#2C6E9B] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sign In as {r.shortName}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Hardware BOM Summary Section */}
      <section id="hardware" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175] mb-2">
            Open Electronics & Cost Breakdown
          </div>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
            $180 Total Bill of Materials
          </h2>
          <p className="mt-2 text-[14px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
            Standard industrial BMS systems charge upwards of $8,000 per machine point. Aegis operates on standard commercial parts available off-the-shelf from any distributor.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1A222B] border-2 border-[#E6E0D6] dark:border-[#2C3847] overflow-x-auto shadow-sm">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-[#E6E0D6] dark:border-[#2C3847] text-[#8A8175] uppercase text-[10px]">
                <th className="pb-3">Component</th>
                <th className="pb-3">Function</th>
                <th className="pb-3">Telemetry Output</th>
                <th className="pb-3">Protocol</th>
                <th className="pb-3 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6] dark:divide-[#2C3847] text-[#554D42] dark:text-[#C5BCAD]">
              <tr>
                <td className="py-2.5 font-bold text-[#1F2933] dark:text-[#FAF8F4]">ESP32 DevKit V1</td>
                <td>Edge Microcontroller & Wi-Fi Gateway</td>
                <td>240 MHz Dual-Core • Wi-Fi 802.11 b/g/n</td>
                <td>MQTT / JSON</td>
                <td className="py-2.5 text-right font-bold text-[#2E7D5B]">$6.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#1F2933] dark:text-[#FAF8F4]">MPU-6050</td>
                <td>3-Axis Accelerometer & Vibration Sensor</td>
                <td>Vibration Velocity RMS (mm/s), FFT Harmonics</td>
                <td>I2C</td>
                <td className="py-2.5 text-right font-bold text-[#2E7D5B]">$3.50</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#1F2933] dark:text-[#FAF8F4]">ACS712 (30A)</td>
                <td>Hall-Effect Current Transformer</td>
                <td>Motor Phase Current Draw (A)</td>
                <td>Analog ADC</td>
                <td className="py-2.5 text-right font-bold text-[#2E7D5B]">$4.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#1F2933] dark:text-[#FAF8F4]">DHT22 (AM2302)</td>
                <td>Digital Temperature & Relative Humidity</td>
                <td>Motor Casing Temp (°C) & Ambient RH (%)</td>
                <td>1-Wire</td>
                <td className="py-2.5 text-right font-bold text-[#2E7D5B]">$4.20</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#1F2933] dark:text-[#FAF8F4]">SCD40 & MQ-2</td>
                <td>NDIR CO2 & Combustible Gas Sensor</td>
                <td>Air Quality Index & Gas PPM Leakage</td>
                <td>I2C / Analog</td>
                <td className="py-2.5 text-right font-bold text-[#2E7D5B]">$28.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#1F2933] dark:text-[#FAF8F4]">YF-S201 & HC-SR501</td>
                <td>Water Flow Turbine & PIR Presence</td>
                <td>Cooling Flow (L/s) & Mechanical Room Occupancy</td>
                <td>GPIO Pulse</td>
                <td className="py-2.5 text-right font-bold text-[#2E7D5B]">$10.00</td>
              </tr>
              <tr className="bg-[#FAF8F4] dark:bg-[#141B22] font-bold">
                <td className="py-3 text-[#1F2933] dark:text-[#FAF8F4]" colSpan={4}>
                  Complete 5-Transducer Edge Node (including IP65 enclosure & wiring harness)
                </td>
                <td className="py-3 text-right text-[13px] text-[#2C6E9B]">&lt; $180.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Bottom Action Banner */}
      <section className="py-16 bg-[#2C6E9B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-[30px] sm:text-[40px] font-bold tracking-tight">
            Ready to inspect facility telemetry?
          </h2>
          <p className="mt-3 text-[15px] text-white/80 max-w-xl mx-auto leading-relaxed">
            Access the live operations console, run what-if wear simulations, or review the triage queue.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleLaunchConsole('console')}
              className="px-6 py-3 rounded-xl bg-white text-[#1F2933] font-display text-[14px] font-bold shadow-[3px_3px_0_#141B22] hover:bg-[#FAF8F4] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Facility Console</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleLaunchConsole('simulator')}
              className="px-5 py-3 rounded-xl border-2 border-white/60 text-white font-display text-[14px] font-bold hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Test Simulator Engine</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Modern Footer */}
      <footer className="bg-[#141B22] text-[#A0988A] py-12 border-t border-[#2C3847] font-mono text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold">
              <Shield size={14} />
            </div>
            <div>
              <div className="font-display text-[13px] font-bold text-white">AEGIS</div>
              <div className="text-[10px]">Open Source Facility Intelligence • MIT License</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <button onClick={() => handleLaunchConsole('console')} className="hover:text-white transition-colors">Console</button>
            <button onClick={() => handleLaunchConsole('analysis')} className="hover:text-white transition-colors">Triage Queue</button>
            <button onClick={() => handleLaunchConsole('simulator')} className="hover:text-white transition-colors">Simulator</button>
            <button onClick={() => handleLaunchConsole('platform')} className="hover:text-white transition-colors">Hardware BOM</button>
            <a href="https://github.com/praneetjena-prog/idp-aegis" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a>
          </div>

          <div className="text-[10px] text-[#8A8175]">
            ISO 10816-3 • RFC 5545 • Built for Public Good
          </div>
        </div>
      </footer>

    </div>
  );
}
