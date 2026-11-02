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
import { UserRoleDropdown } from '../layout/UserRoleDropdown';
import { AegisSchematicIllustration } from './AegisSchematicIllustration';

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
      index: '01',
      title: 'Live Operations Console',
      category: 'Telemetry & SCADA',
      icon: Radio,
      color: '#2C6E9B',
      pastelBg: 'bg-[#E8F2F8] dark:bg-[#1A3347]',
      badge: 'Real-Time SCADA',
      badgeColor: 'bg-[#E8F2F8] dark:bg-[#2C6E9B]/20 text-[#1D5174] dark:text-[#62a8d2] border-[#2C6E9B]',
      description: 'Centralized telemetry dashboard monitoring all facility subsystems (HVAC, Chilled Water, Switchgear). Visualizes health score, power envelope, and sensor feeds updated every 1.8 seconds.',
      metrics: ['5 Campus Subsystems', '1,428 Sensor Points', 'Live Sensor Gauges'],
      actionText: 'Launch Console'
    },
    {
      id: 'analysis',
      tab: 'analysis',
      index: '02',
      title: 'Root Cause & Triage Queue',
      category: 'Predictive Intelligence',
      icon: Activity,
      color: '#C05043',
      pastelBg: 'bg-[#FDECE9] dark:bg-[#45201C]',
      badge: 'Explainable AI',
      badgeColor: 'bg-[#FDECE9] dark:bg-[#C05043]/20 text-[#8C2E24] dark:text-[#e07569] border-[#C05043]',
      description: 'Multivariate Isolation Forest and FFT spectral harmonic analysis. Predicts mechanical breakdown 7–14 days in advance and correlates vibration with current spikes to prevent catastrophic motor failure.',
      metrics: ['7–14 Day Early Warning', 'Zero Black-Box AI', 'Automated WO Dispatch'],
      actionText: 'Inspect Root Cause'
    },
    {
      id: 'simulator',
      tab: 'simulator',
      index: '03',
      title: 'Physics Wear Scenario Engine',
      category: 'Digital Twin Simulation',
      icon: Gauge,
      color: '#2E7D5B',
      pastelBg: 'bg-[#EAF5EE] dark:bg-[#173827]',
      badge: 'Interactive Sandbox',
      badgeColor: 'bg-[#EAF5EE] dark:bg-[#2E7D5B]/20 text-[#1E563E] dark:text-[#72c987] border-[#2E7D5B]',
      description: 'What-if degradation engine to test motor bearing spalling, belt slippage, and unbalance without risking physical machines. Verify alarm limits and ISO 10816 thresholds in real time.',
      metrics: ['Interactive Wear Sliders', 'ISO 10816-3 Thresholds', 'Fault Propagation'],
      actionText: 'Run Wear Simulator'
    },
    {
      id: 'audit',
      tab: 'audit',
      index: '04',
      title: 'ISO 10816 Reliability Audit',
      category: 'Compliance & Standards',
      icon: Microscope,
      color: '#B07B1C',
      pastelBg: 'bg-[#FEF6E6] dark:bg-[#3D2E14]',
      badge: 'Regulatory Audit',
      badgeColor: 'bg-[#FEF6E6] dark:bg-[#B07B1C]/20 text-[#7A530F] dark:text-[#e5b158] border-[#B07B1C]',
      description: 'Continuous ISO 10816-3 Class II vibration severity monitoring, Remaining Useful Life (RUL) statistical validation, and immutable SHA-256 tamper-evident compliance audit ledgers.',
      metrics: ['ISO 10816 Severity Zones', 'SHA-256 Ledger', 'Explainable Models'],
      actionText: 'View Reliability Audit'
    },
    {
      id: 'platform',
      tab: 'platform',
      index: '05',
      title: 'Open Hardware & Sensor Layer',
      category: 'Democratized Hardware',
      icon: Cpu,
      color: '#8A8175',
      pastelBg: 'bg-[#F4EFEA] dark:bg-[#2D2A26]',
      badge: '$180 BOM',
      badgeColor: 'bg-[#F1EDE6] dark:bg-[#1A222B] text-[#4F463B] dark:text-[#A0988A] border-[#1F2933]',
      description: 'Complete bill of materials built on standard commercial off-the-shelf (COTS) electronics: ESP32 microcontrollers, MPU-6050 accelerometers, ACS712 current transformers, and MQTT broker pinouts.',
      metrics: ['$180 Per Machine Cost', 'Zero Vendor Lock-in', 'Open Schematics'],
      actionText: 'View Hardware Specs'
    },
    {
      id: 'asset',
      tab: 'asset',
      targetAsset: 'ahu-03',
      index: '06',
      title: 'Mobile QR Asset Passports',
      category: 'Field Execution',
      icon: QrCode,
      color: '#2C6E9B',
      pastelBg: 'bg-[#E8F2F8] dark:bg-[#1A3347]',
      badge: 'Field Checklists',
      badgeColor: 'bg-[#E8F2F8] dark:bg-[#2C6E9B]/20 text-[#1D5174] dark:text-[#62a8d2] border-[#2C6E9B]',
      description: 'Mobile-first QR passport for every physical machine. Scan on-site to inspect maintenance history, verify LOTO safety zero-energy procedures, and complete step-by-step field checklists.',
      metrics: ['LOTO Safety SOPs', 'Offline-First Checklist', 'Instant QR Scanning'],
      actionText: 'Open Asset Passport'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0F151C] text-[#1F2933] dark:text-[#FAF8F4] font-sans transition-colors duration-200 editorial-grid">
      
      {/* 1. Global Portal Navigation Bar (Swiss Brutalist) */}
      <header className="sticky top-0 z-50 bg-[#FAF8F4]/95 dark:bg-[#141B22]/95 backdrop-blur-md border-b-2 border-[#1F2933] dark:border-[#304346]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-mono font-bold border-2 border-[#1F2933] shadow-[2px_2px_0_#1F2933] dark:shadow-none">
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[17px] font-black tracking-tight text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                  AEGIS
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#1F2933] dark:border-[#304346] bg-[#E8F2F8] dark:bg-[#2C6E9B]/20 text-[#1D5174] dark:text-[#62a8d2] font-bold uppercase shadow-[1px_1px_0_#1F2933]">
                  SPEC 2026.1
                </span>
              </div>
              <div className="font-mono text-[9px] text-[#8A8175] tracking-wider uppercase hidden sm:block">
                Open Telemetry & Failure Defense
              </div>
            </div>
          </div>

          {/* Center Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] font-bold text-[#6E6558] dark:text-[#A0988A] uppercase tracking-wider">
            <button 
              type="button" 
              onClick={(e) => scrollToSection(e, 'schematic')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              [ Schematic ]
            </button>
            <button 
              type="button" 
              onClick={(e) => scrollToSection(e, 'features')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              [ Features ]
            </button>
            <button 
              type="button" 
              onClick={(e) => scrollToSection(e, 'roles')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              [ Roles ]
            </button>
            <button 
              type="button" 
              onClick={(e) => scrollToSection(e, 'hardware')} 
              className="hover:text-[#1F2933] dark:hover:text-[#FAF8F4] transition-colors cursor-pointer"
            >
              [ Hardware ]
            </button>
          </nav>

          {/* Right Controls: Theme + Auth State with UserRoleDropdown */}
          <div className="flex items-center gap-3">
            
            {/* Live Status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF5EE] dark:bg-[#2E7D5B]/20 border border-[#2E7D5B] font-mono text-[10px] text-[#1E563E] dark:text-[#72c987] font-bold">
              <div className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
              <span>5 MACHINES MONITORED</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-[#1F2933] dark:border-[#304346] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] shadow-[2px_2px_0_#1F2933] dark:shadow-none hover:bg-[#FAF8F4] transition-all cursor-pointer"
            >
              {darkMode ? <Sun size={14} className="text-[#E0A83B]" /> : <Moon size={14} className="text-[#2C6E9B]" />}
            </button>

            {/* Auth Dropdown & Console Navigation Button */}
            <div className="flex items-center gap-2">
              <UserRoleDropdown />
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => handleLaunchConsole('console')}
                  className="px-4 py-2 rounded-lg bg-[#2C6E9B] text-white font-mono text-[11px] font-bold uppercase tracking-wider border-2 border-[#1F2933] shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] hover:bg-[#255C83] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Enter Console</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 2. Hero Section (Editorial Swiss Layout + Generous Whitespace) */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 border-b-2 border-[#1F2933] dark:border-[#304346]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Swiss Typography Manifesto */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Editorial Section Number */}
              <div className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-widest text-[#8A8175] uppercase">
                <span className="px-2 py-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#1F2933] dark:border-[#304346] rounded text-[#1F2933] dark:text-[#FAF8F4]">
                  § 00
                </span>
                <span>OPEN INDUSTRIAL INTELLIGENCE</span>
                <span className="flex-1 h-px bg-[#1F2933]/15 dark:bg-[#304346]" />
              </div>

              {/* Bold Swiss Headline */}
              <h1 className="font-display text-[40px] sm:text-[54px] lg:text-[64px] font-black text-[#1F2933] dark:text-[#FAF8F4] leading-[0.98] tracking-[-0.035em]">
                Democratized Predictive Maintenance.
              </h1>

              {/* Sub-headline / Core Principle */}
              <p className="text-[16px] sm:text-[18px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed max-w-2xl font-medium">
                Aegis replaces multimillion-dollar proprietary building automation with inexpensive commercial sensor nodes, explainable AI, and transparent telemetry. Catches mechanical degradation <strong>7–14 days before catastrophic failure</strong> for under <strong>$180 per machine</strong>.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleLaunchConsole('console')}
                  className="px-6 py-3.5 rounded-xl bg-[#2C6E9B] text-white font-mono text-[13px] font-bold uppercase tracking-wider border-2 border-[#1F2933] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] hover:bg-[#255C83] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Operations Console</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={(e) => scrollToSection(e, 'schematic')}
                  className="px-5 py-3.5 rounded-xl border-2 border-[#1F2933] dark:border-[#304346] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[13px] font-bold uppercase tracking-wider shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] hover:bg-[#FAF8F4] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Inspect CAD Schematic</span>
                </button>

                <a
                  href="https://github.com/praneetjena-prog/idp-aegis"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3.5 rounded-xl border-2 border-[#1F2933] dark:border-[#304346] bg-[#F1EDE6] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[12px] font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0_#1F2933] hover:bg-[#FFFFFF] transition-all"
                >
                  <span>GitHub</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Technical Spec Matrix (Swiss Editorial Grid) */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] rounded-lg shadow-[2px_2px_0_#1F2933]">
                  <div className="text-[9px] uppercase tracking-wider text-[#8A8175] font-bold">Node Hardware</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[15px] mt-0.5">$180 / Unit</div>
                </div>
                <div className="p-3 bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] rounded-lg shadow-[2px_2px_0_#1F2933]">
                  <div className="text-[9px] uppercase tracking-wider text-[#8A8175] font-bold">Early Warning</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[15px] mt-0.5">7–14 Days</div>
                </div>
                <div className="p-3 bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] rounded-lg shadow-[2px_2px_0_#1F2933]">
                  <div className="text-[9px] uppercase tracking-wider text-[#8A8175] font-bold">Architecture</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[15px] mt-0.5">ESP32 + COTS</div>
                </div>
                <div className="p-3 bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] rounded-lg shadow-[2px_2px_0_#1F2933]">
                  <div className="text-[9px] uppercase tracking-wider text-[#8A8175] font-bold">License</div>
                  <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] text-[15px] mt-0.5">MIT Open</div>
                </div>
              </div>

            </div>

            {/* Right Column: Pastel Geometric Schematic Illustration */}
            <div id="schematic" className="lg:col-span-5 scroll-mt-24">
              <AegisSchematicIllustration liveValues={liveValues} feedMode={feedMode} />
            </div>

          </div>

        </div>
      </section>

      {/* 3. Section 01: Live Telemetry Snapshot (Neo-Brutalist Tiles) */}
      <section className="py-16 sm:py-24 border-b-2 border-[#1F2933] dark:border-[#304346]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-[#8A8175] uppercase">
                <span className="px-2 py-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#1F2933] dark:border-[#304346] rounded text-[#1F2933] dark:text-[#FAF8F4]">
                  § 01
                </span>
                <span>REAL-TIME SENSOR BUS</span>
              </div>
              <h2 className="font-display text-[26px] sm:text-[34px] font-black text-[#1F2933] dark:text-[#FAF8F4] uppercase tracking-tight mt-1">
                AHU-03 Primary Supply Fan Telemetry
              </h2>
            </div>
            <div className="font-mono text-[10px] text-[#8A8175] border-2 border-[#1F2933] dark:border-[#304346] p-2 bg-[#FFFFFF] dark:bg-[#1A222B] rounded-lg shadow-[2px_2px_0_#1F2933]">
              {isLive ? 'Hardware Active • ESP32 Node' : 'Simulated Physics • 1.8s Pulse'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            {/* TILE 1: Vibration (Pastel Blueprint Ice) */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded border border-[#2C6E9B] bg-[#E8F2F8] dark:bg-[#2C6E9B]/20 text-[#1D5174] dark:text-[#62a8d2] font-mono text-[9px] font-bold uppercase">
                    VELOCITY RMS
                  </span>
                  <Waves size={16} className="text-[#2C6E9B]" />
                </div>
                <div className="font-mono text-[28px] sm:text-[32px] font-black text-[#1F2933] dark:text-[#FAF8F4] leading-none">
                  {liveValues?.vib || '2.34'} <span className="text-[13px] font-normal text-[#8A8175]">mm/s</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2933]/15 dark:border-[#304346] font-mono text-[10px] text-[#2E7D5B] font-bold">
                ISO 10816 Limit: 2.5 mm/s
              </div>
            </div>

            {/* TILE 2: Current (Pastel Warning Amber) */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded border border-[#B07B1C] bg-[#FEF6E6] dark:bg-[#B07B1C]/20 text-[#7A530F] dark:text-[#e5b158] font-mono text-[9px] font-bold uppercase">
                    PHASE DRAW
                  </span>
                  <Zap size={16} className="text-[#B07B1C]" />
                </div>
                <div className="font-mono text-[28px] sm:text-[32px] font-black text-[#1F2933] dark:text-[#FAF8F4] leading-none">
                  {liveValues?.cur || '14.2'} <span className="text-[13px] font-normal text-[#8A8175]">A</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2933]/15 dark:border-[#304346] font-mono text-[10px] text-[#8A8175] font-bold">
                Nominal: 14.2A ±0.5A
              </div>
            </div>

            {/* TILE 3: Temperature (Pastel Alert Vermilion) */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded border border-[#C05043] bg-[#FDECE9] dark:bg-[#C05043]/20 text-[#8C2E24] dark:text-[#e07569] font-mono text-[9px] font-bold uppercase">
                    BEARING HOUSING
                  </span>
                  <Thermometer size={16} className="text-[#C05043]" />
                </div>
                <div className="font-mono text-[28px] sm:text-[32px] font-black text-[#1F2933] dark:text-[#FAF8F4] leading-none">
                  {liveValues?.temp || '54.2'} <span className="text-[13px] font-normal text-[#8A8175]">°C</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2933]/15 dark:border-[#304346] font-mono text-[10px] text-[#2E7D5B] font-bold">
                Thermal Delta: +25.8°C
              </div>
            </div>

            {/* TILE 4: Acoustic Noise (Pastel Sage Green) */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded border border-[#2E7D5B] bg-[#EAF5EE] dark:bg-[#2E7D5B]/20 text-[#1E563E] dark:text-[#72c987] font-mono text-[9px] font-bold uppercase">
                    HIGH-FREQ BAND
                  </span>
                  <Volume2 size={16} className="text-[#2E7D5B]" />
                </div>
                <div className="font-mono text-[28px] sm:text-[32px] font-black text-[#1F2933] dark:text-[#FAF8F4] leading-none">
                  +{liveValues?.acoustic || '1.8'} <span className="text-[13px] font-normal text-[#8A8175]">dB</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2933]/15 dark:border-[#304346] font-mono text-[10px] text-[#8A8175] font-bold">
                Harmonic: 3.2x RPM Peak
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Section 02: Core System Features Grid */}
      <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        
        <div className="mb-14">
          <div className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-widest text-[#8A8175] uppercase">
            <span className="px-2 py-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#1F2933] dark:border-[#304346] rounded text-[#1F2933] dark:text-[#FAF8F4]">
              § 02
            </span>
            <span>SYSTEM MODULES & ARCHITECTURE</span>
            <span className="flex-1 h-px bg-[#1F2933]/15 dark:bg-[#304346]" />
          </div>
          <h2 className="font-display text-[32px] sm:text-[44px] font-black text-[#1F2933] dark:text-[#FAF8F4] tracking-tight mt-2 uppercase">
            Engineered for Field Action
          </h2>
          <p className="mt-2 text-[15px] text-[#554D42] dark:text-[#C5BCAD] max-w-2xl leading-relaxed">
            Every module delivers concrete, verifiable outcomes. Select any module to route directly into that operational view.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[5px_5px_0_#1F2933] dark:shadow-[5px_5px_0_#0F151C] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_#1F2933] transition-all duration-200"
              >
                <div>
                  {/* Pastel Header Banner */}
                  <div className={`-mx-6 sm:-mx-7 -mt-6 sm:-mt-7 p-4 border-b-2 border-[#1F2933] dark:border-[#304346] flex items-center justify-between rounded-t-xl ${feat.pastelBg}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1F2933] text-white flex items-center justify-center font-bold">
                        <Icon size={16} />
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1F2933] dark:text-white">
                        MOD. {feat.index}
                      </span>
                    </div>
                    <span className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border shadow-[1px_1px_0_#1F2933] ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold mt-5 mb-1">
                    {feat.category}
                  </div>
                  <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-[13px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed mb-6 font-normal">
                    {feat.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t-2 border-[#1F2933]/15 dark:border-[#304346] mb-6">
                    {feat.metrics.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 font-mono text-[10px] text-[#554D42] dark:text-[#C5BCAD]">
                        <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchConsole(feat.tab, feat.targetAsset)}
                  className="w-full py-3 px-4 rounded-xl border-2 border-[#1F2933] dark:border-[#304346] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_#1F2933] hover:bg-[#2C6E9B] hover:text-white hover:border-[#1F2933] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{feat.actionText}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}

          {/* Special Quick Action Card: PM Calendar */}
          <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[5px_5px_0_#1F2933] dark:shadow-[5px_5px_0_#0F151C] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_#1F2933] transition-all duration-200">
            <div>
              <div className="-mx-6 sm:-mx-7 -mt-6 sm:-mt-7 p-4 border-b-2 border-[#1F2933] dark:border-[#304346] flex items-center justify-between rounded-t-xl bg-[#E8F2F8] dark:bg-[#1A3347]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold">
                    <CalendarDays size={16} />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1F2933] dark:text-white">
                    MOD. 07
                  </span>
                </div>
                <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-[#2C6E9B] bg-[#E8F2F8] text-[#1D5174] shadow-[1px_1px_0_#1F2933]">
                  RFC 5545 SYNC
                </span>
              </div>

              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold mt-5 mb-1">
                Automated Scheduling
              </div>
              <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-3">
                Predictive PM Calendar
              </h3>
              <p className="text-[13px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed mb-6 font-normal">
                Synchronizes dynamic maintenance intervals directly to Google Calendar, Apple Calendar, and Outlook via standard RFC 5545 `.ics` export.
              </p>

              <div className="space-y-2 pt-4 border-t-2 border-[#1F2933]/15 dark:border-[#304346] mb-6 font-mono text-[10px] text-[#554D42] dark:text-[#C5BCAD]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                  <span>Dynamic RUL-driven off-peak slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                  <span>1-Click iCalendar (.ics) download</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#2E7D5B] shrink-0" />
                  <span>Google Calendar instant web links</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenCalendar) onOpenCalendar();
                else handleLaunchConsole('analysis');
              }}
              className="w-full py-3 px-4 rounded-xl border-2 border-[#1F2933] dark:border-[#304346] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_#1F2933] hover:bg-[#2C6E9B] hover:text-white hover:border-[#1F2933] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Open PM Calendar</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Section 03: Role-Based Access Control (RBAC Operator Cards) */}
      <section id="roles" className="py-20 sm:py-28 bg-[#FAF8F4] dark:bg-[#141B22] border-t-2 border-b-2 border-[#1F2933] dark:border-[#304346] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <div className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-widest text-[#8A8175] uppercase">
              <span className="px-2 py-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#1F2933] dark:border-[#304346] rounded text-[#1F2933] dark:text-[#FAF8F4]">
                § 03
              </span>
              <span>ROLE-BASED GOVERNANCE</span>
              <span className="flex-1 h-px bg-[#1F2933]/15 dark:bg-[#304346]" />
            </div>
            <h2 className="font-display text-[32px] sm:text-[44px] font-black text-[#1F2933] dark:text-[#FAF8F4] uppercase tracking-tight mt-2">
              3 Dedicated Facility Personas
            </h2>
            <p className="mt-2 text-[15px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
              When entering the console, Aegis adapts its interface and workflows to your operational responsibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {Object.values(ROLES).filter((r) => r.id !== 'feature_user').map((r) => {
              const icons = {
                technician: Wrench,
                manager: BarChart3,
                auditor: Microscope
              };
              const pastels = {
                technician: 'bg-[#EAF5EE] dark:bg-[#173827]',
                manager: 'bg-[#E8F2F8] dark:bg-[#1A3347]',
                auditor: 'bg-[#FEF6E6] dark:bg-[#3D2E14]'
              };
              const RoleIcon = icons[r.id] || Shield;

              return (
                <div 
                  key={r.id} 
                  className="rounded-2xl bg-white dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] p-6 sm:p-7 flex flex-col justify-between shadow-[5px_5px_0_#1F2933] dark:shadow-[5px_5px_0_#0F151C]"
                >
                  <div>
                    <div className={`-mx-6 sm:-mx-7 -mt-6 sm:-mt-7 p-4 border-b-2 border-[#1F2933] dark:border-[#304346] flex items-center justify-between rounded-t-xl ${pastels[r.id] || 'bg-[#F1EDE6]'}`}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white border border-[#1F2933]"
                          style={{ backgroundColor: r.color }}
                        >
                          <RoleIcon size={16} />
                        </div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1F2933] dark:text-white">
                          PASS: {r.id.toUpperCase()}
                        </span>
                      </div>
                      <span className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border shadow-[1px_1px_0_#1F2933] ${r.badgeClass}`}>
                        {r.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-[22px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-5 mb-2">
                      {r.name}
                    </h3>
                    <p className="text-[13px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed mb-5 font-normal">
                      {r.description}
                    </p>

                    <div className="space-y-2 pt-4 border-t-2 border-[#1F2933]/15 dark:border-[#304346]">
                      <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">
                        Standard Operating Duties:
                      </div>
                      {r.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-2 font-mono text-[10px] text-[#554D42] dark:text-[#C5BCAD]">
                          <span className="text-[#2C6E9B] mt-0.5">▶</span>
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
                    className="mt-7 w-full py-3 px-4 rounded-xl border-2 border-[#1F2933] dark:border-[#304346] bg-[#FAF8F4] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_#1F2933] hover:bg-[#2C6E9B] hover:text-white hover:border-[#1F2933] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isAuthenticated ? 'Enter Console' : 'Sign in with Google'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Section 04: Hardware BOM Summary Section */}
      <section id="hardware" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-widest text-[#8A8175] uppercase">
            <span className="px-2 py-0.5 bg-[#F1EDE6] dark:bg-[#1A222B] border border-[#1F2933] dark:border-[#304346] rounded text-[#1F2933] dark:text-[#FAF8F4]">
              § 04
            </span>
            <span>DEMOCRATIZED BILL OF MATERIALS</span>
            <span className="flex-1 h-px bg-[#1F2933]/15 dark:bg-[#304346]" />
          </div>
          <h2 className="font-display text-[32px] sm:text-[44px] font-black text-[#1F2933] dark:text-[#FAF8F4] uppercase tracking-tight mt-2">
            $180 Total Edge Hardware Kit
          </h2>
          <p className="mt-2 text-[15px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
            Standard industrial BMS systems charge upwards of $8,000 per machine point. Aegis operates on standard commercial parts available off-the-shelf from any electronics distributor.
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#304346] overflow-x-auto shadow-[6px_6px_0_#1F2933] dark:shadow-[6px_6px_0_#0F151C]">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b-2 border-[#1F2933] dark:border-[#304346] bg-[#F1EDE6] dark:bg-[#141B22] text-[#1F2933] dark:text-[#FAF8F4] uppercase text-[10px] font-bold">
                <th className="py-3.5 px-4">Component</th>
                <th className="py-3.5 px-4">Function</th>
                <th className="py-3.5 px-4">Telemetry Output</th>
                <th className="py-3.5 px-4">Protocol</th>
                <th className="py-3.5 px-4 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1F2933]/10 dark:divide-[#304346] text-[#554D42] dark:text-[#C5BCAD]">
              <tr className="hover:bg-[#FAF8F4] dark:hover:bg-[#1A222B]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-[#1F2933] dark:text-[#FAF8F4]">ESP32 DevKit V1</td>
                <td className="py-3 px-4">Edge Microcontroller & Wi-Fi Gateway</td>
                <td className="py-3 px-4">240 MHz Dual-Core • Wi-Fi 802.11 b/g/n</td>
                <td className="py-3 px-4"><span className="px-1.5 py-0.5 bg-[#E8F2F8] border border-[#2C6E9B] rounded text-[#1D5174] font-bold text-[9px]">MQTT / JSON</span></td>
                <td className="py-3 px-4 text-right font-bold text-[#2E7D5B]">$6.00</td>
              </tr>
              <tr className="hover:bg-[#FAF8F4] dark:hover:bg-[#1A222B]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-[#1F2933] dark:text-[#FAF8F4]">MPU-6050</td>
                <td className="py-3 px-4">3-Axis Accelerometer & Vibration Sensor</td>
                <td className="py-3 px-4">Vibration Velocity RMS (mm/s), FFT Harmonics</td>
                <td className="py-3 px-4"><span className="px-1.5 py-0.5 bg-[#EAF5EE] border border-[#2E7D5B] rounded text-[#1E563E] font-bold text-[9px]">I2C</span></td>
                <td className="py-3 px-4 text-right font-bold text-[#2E7D5B]">$3.50</td>
              </tr>
              <tr className="hover:bg-[#FAF8F4] dark:hover:bg-[#1A222B]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-[#1F2933] dark:text-[#FAF8F4]">ACS712 (30A)</td>
                <td className="py-3 px-4">Hall-Effect Current Transformer</td>
                <td className="py-3 px-4">Motor Phase Current Draw (A)</td>
                <td className="py-3 px-4"><span className="px-1.5 py-0.5 bg-[#FEF6E6] border border-[#B07B1C] rounded text-[#7A530F] font-bold text-[9px]">ANALOG ADC</span></td>
                <td className="py-3 px-4 text-right font-bold text-[#2E7D5B]">$4.00</td>
              </tr>
              <tr className="hover:bg-[#FAF8F4] dark:hover:bg-[#1A222B]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-[#1F2933] dark:text-[#FAF8F4]">DHT22 (AM2302)</td>
                <td className="py-3 px-4">Digital Temperature & Relative Humidity</td>
                <td className="py-3 px-4">Motor Casing Temp (°C) & Ambient RH (%)</td>
                <td className="py-3 px-4"><span className="px-1.5 py-0.5 bg-[#FDECE9] border border-[#C05043] rounded text-[#8C2E24] font-bold text-[9px]">1-WIRE</span></td>
                <td className="py-3 px-4 text-right font-bold text-[#2E7D5B]">$4.20</td>
              </tr>
              <tr className="hover:bg-[#FAF8F4] dark:hover:bg-[#1A222B]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-[#1F2933] dark:text-[#FAF8F4]">SCD40 & MQ-2</td>
                <td className="py-3 px-4">NDIR CO2 & Combustible Gas Sensor</td>
                <td className="py-3 px-4">Air Quality Index & Gas PPM Leakage</td>
                <td className="py-3 px-4"><span className="px-1.5 py-0.5 bg-[#E8F2F8] border border-[#2C6E9B] rounded text-[#1D5174] font-bold text-[9px]">I2C / ANALOG</span></td>
                <td className="py-3 px-4 text-right font-bold text-[#2E7D5B]">$28.00</td>
              </tr>
              <tr className="hover:bg-[#FAF8F4] dark:hover:bg-[#1A222B]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-[#1F2933] dark:text-[#FAF8F4]">YF-S201 & HC-SR501</td>
                <td className="py-3 px-4">Water Flow Turbine & PIR Presence</td>
                <td className="py-3 px-4">Cooling Flow (L/s) & Room Occupancy</td>
                <td className="py-3 px-4"><span className="px-1.5 py-0.5 bg-[#F1EDE6] border border-[#1F2933] rounded text-[#1F2933] font-bold text-[9px]">GPIO PULSE</span></td>
                <td className="py-3 px-4 text-right font-bold text-[#2E7D5B]">$10.00</td>
              </tr>
              <tr className="bg-[#FAF8F4] dark:bg-[#141B22] font-bold border-t-2 border-[#1F2933] dark:border-[#304346]">
                <td className="py-4 px-4 text-[#1F2933] dark:text-[#FAF8F4] uppercase tracking-wider" colSpan={4}>
                  Complete 5-Transducer Edge Node (including IP65 enclosure & wiring harness)
                </td>
                <td className="py-4 px-4 text-right text-[14px] text-[#2C6E9B] font-black">&lt; $180.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Bottom Action Banner (Brutalist High-Contrast) */}
      <section className="py-16 sm:py-20 bg-[#2C6E9B] text-white border-t-2 border-[#1F2933] dark:border-[#304346]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-3 py-1 rounded bg-white/10 border border-white/30 font-mono text-[10px] font-bold tracking-widest uppercase mb-4">
            AEGIS CONSOLE ACCESS
          </div>
          <h2 className="font-display text-[32px] sm:text-[46px] font-black tracking-tight uppercase">
            Ready to inspect facility telemetry?
          </h2>
          <p className="mt-3 text-[16px] text-white/90 max-w-xl mx-auto leading-relaxed">
            Access the live operations console, run what-if wear simulations, or review the triage queue.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleLaunchConsole('console')}
              className="px-6 py-3.5 rounded-xl bg-white text-[#1F2933] font-mono text-[13px] font-bold uppercase tracking-wider border-2 border-[#1F2933] shadow-[4px_4px_0_#141B22] hover:bg-[#FAF8F4] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Operations Console</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleLaunchConsole('simulator')}
              className="px-6 py-3.5 rounded-xl border-2 border-white text-white font-mono text-[13px] font-bold uppercase tracking-wider hover:bg-white/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Test Simulator Engine</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Modern Swiss Editorial Footer */}
      <footer className="bg-[#141B22] text-[#A0988A] py-14 border-t-2 border-[#1F2933] font-mono text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold border border-white/20">
              <Shield size={16} />
            </div>
            <div>
              <div className="font-display text-[14px] font-bold text-white uppercase tracking-wider">AEGIS</div>
              <div className="text-[10px] text-[#8A8175]">Open Facility Intelligence • MIT License</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold uppercase">
            <button onClick={() => handleLaunchConsole('console')} className="hover:text-white transition-colors cursor-pointer">Console</button>
            <button onClick={() => handleLaunchConsole('analysis')} className="hover:text-white transition-colors cursor-pointer">Triage</button>
            <button onClick={() => handleLaunchConsole('simulator')} className="hover:text-white transition-colors cursor-pointer">Simulator</button>
            <button onClick={() => handleLaunchConsole('audit')} className="hover:text-white transition-colors cursor-pointer">Reliability Audit</button>
            <button onClick={() => handleLaunchConsole('platform')} className="hover:text-white transition-colors cursor-pointer">Hardware BOM</button>
            <a href="https://github.com/praneetjena-prog/idp-aegis" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repo</a>
          </div>

          <div className="text-[10px] text-[#8A8175] border border-[#2C3847] px-3 py-1.5 rounded bg-[#11161C]">
            ISO 10816-3 • RFC 5545 • BUILT FOR PUBLIC GOOD
          </div>
        </div>
      </footer>

    </div>
  );
}
