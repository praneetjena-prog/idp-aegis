import React from 'react';
import { 
  Shield, 
  Cpu, 
  Radio, 
  Activity, 
  Layers, 
  Clock, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  AlertCircle, 
  Sun, 
  Moon, 
  QrCode, 
  FileText, 
  Gauge, 
  Waves, 
  Zap, 
  Thermometer, 
  Volume2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRoleDropdown } from '../layout/UserRoleDropdown';
import { OperationalReality } from '../workflow/OperationalReality';
import { ComparisonMatrix } from '../workflow/ComparisonMatrix';
import { Pillars } from '../workflow/Pillars';
import { ArchitectureDiagram } from '../workflow/ArchitectureDiagram';
import { HardwareTable } from '../workflow/HardwareTable';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function FeatureOnlyPage({ darkMode, toggleTheme }) {
  const { user, signOut, roleConfig, openRoleModal, pendingRequest } = useAuth();

  return (
    <div className={`min-h-screen bg-[#F1EDE6] dark:bg-[#0F151C] text-[#2A3138] dark:text-[#FAF8F4] font-sans transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* 1. Feature-Only Top Navigation Bar */}
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
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#6E6558]/15 text-[#6E6558] dark:text-[#A0988A] font-bold uppercase border border-[#6E6558]/30">
                  Feature Explorer
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#8A8175] hidden sm:block">
                Open Facility Intelligence • Architectural Tour & Reference
              </div>
            </div>
          </div>

          {/* Right Controls: Theme Toggle & Account Menu */}
          <div className="flex items-center gap-3">
            {/* Access Tier Tag */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B07B1C]/10 border border-[#B07B1C]/30 font-mono text-[10px] text-[#B07B1C] font-semibold">
              <Lock size={11} />
              <span>Restricted: No Facility Assigned</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] hover:border-[#2C6E9B] transition-all cursor-pointer"
            >
              {darkMode ? <Sun size={14} className="text-[#E0A83B]" /> : <Moon size={14} className="text-[#2C6E9B]" />}
            </button>

            {/* Account Menu */}
            <UserRoleDropdown />
          </div>
        </div>
      </header>

      {/* 2. Main Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner: Feature-Only Explanatory Callout */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B07B1C]/15 text-[#B07B1C] flex items-center justify-center shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8A8175]">
                  Tier: Feature Explorer Access
                </div>
                <h2 className="font-display text-[16px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  Authenticated as {user?.name || 'Verified Google Account'} ({user?.email})
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-1 rounded bg-[#B07B1C]/10 text-[#B07B1C] border border-[#B07B1C]/30 font-bold uppercase">
                Facility SCADA Locked
              </span>
            </div>
          </div>

          <p className="text-[13px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
            Your Google identity has been verified and registered in the database. However, no industrial facility is currently assigned to your profile (<code className="font-mono text-[11px] bg-[#F1EDE6] dark:bg-[#141B22] px-1 py-0.5 rounded">facility_id: null</code>). To preserve facility data isolation and operational safety, live telemetry streams, real sensor health scores, alarms, and work-order dispatch are restricted.
          </p>

          <div className="pt-2 border-t border-[#E6E0D6] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[#8A8175]">
            <div className="flex items-center gap-1.5">
              <Building2 size={13} className="text-[#2C6E9B]" />
              <span>Operational facility telemetry requires backend verification from a higher-level authority.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openRoleModal}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-none flex items-center gap-1.5 cursor-pointer transition-all ${
                  pendingRequest 
                    ? 'bg-[#B07B1C]/15 border border-[#B07B1C]/40 text-[#B07B1C] hover:bg-[#B07B1C]/25' 
                    : 'bg-[#2C6E9B] hover:bg-[#245b80] text-white'
                }`}
              >
                {pendingRequest ? <Clock size={12} /> : <Shield size={12} />}
                <span>
                  {pendingRequest 
                    ? `Verification Pending: ${pendingRequest.role.toUpperCase()}` 
                    : 'Request Role Access'}
                </span>
              </button>
              <a 
                href="#home"
                className="text-[#6E6558] hover:underline font-bold flex items-center gap-1"
              >
                <span>Return to Home</span>
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* 3. System Monitored Capacity (Architectural Specifications) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              AEGIS Architecture & Monitored Capacity
            </h3>
            <span className="font-mono text-[10px] text-[#8A8175] uppercase">Target Platform Benchmarks</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white dark:bg-[#1A222B]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Monitored Machines</span>
                <Cpu size={16} className="text-[#2C6E9B]" />
              </div>
              <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
                38 <span className="text-[13px] font-normal text-[#8A8175]">Units</span>
              </div>
              <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
                Air handlers (AHUs), chilled water pumps, cooling towers, and switchboards.
              </p>
            </Card>

            <Card className="p-4 bg-white dark:bg-[#1A222B]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Sensor Points</span>
                <Radio size={16} className="text-[#2C6E9B]" />
              </div>
              <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
                1,428 <span className="text-[13px] font-normal text-[#8A8175]">Points</span>
              </div>
              <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
                Continuous physical measurement of vibration, heat, current, and acoustic harmonics.
              </p>
            </Card>

            <Card className="p-4 bg-white dark:bg-[#1A222B]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">Early Warning Window</span>
                <Clock size={16} className="text-[#2C6E9B]" />
              </div>
              <div className="font-mono text-[24px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mt-2">
                7–14 <span className="text-[13px] font-normal text-[#8A8175]">Days</span>
              </div>
              <p className="font-sans text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-1.5">
                Lead time provided before mechanical breakdown via explainable model forecasts.
              </p>
            </Card>
          </div>
        </section>

        {/* 4. Illustrative Reference Example (Clearly Labeled Static Fixture, NOT Real Telemetry) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-bold">
                Design Reference Specimen
              </span>
              <h3 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                Illustrative Telemetry Representation
              </h3>
            </div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] text-[#8A8175] uppercase font-bold">
              Isolated Reference Fixture • Not Live Data
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E0D6] dark:border-[#2C3847] pb-3">
              <div className="font-mono text-[11px] text-[#6E6558] dark:text-[#A0988A]">
                Example Asset: <strong>AHU-03 (Supply Fan Motor)</strong> • ISO 10816 Class II Standard
              </div>
              <span className="font-mono text-[10px] text-[#B07B1C] bg-[#B07B1C]/10 px-2 py-0.5 rounded border border-[#B07B1C]/20">
                Static Benchmark Specimen
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div className="flex items-center gap-1.5 text-[#8A8175] mb-1 font-mono text-[10px] uppercase">
                  <Waves size={12} className="text-[#2C6E9B]" />
                  <span>Vibration (RMS)</span>
                </div>
                <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  2.34 <span className="text-[11px] font-normal text-[#8A8175]">mm/s</span>
                </div>
                <div className="font-mono text-[9px] text-[#8A8175] mt-1">Nominal baseline: &lt; 2.5 mm/s</div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div className="flex items-center gap-1.5 text-[#8A8175] mb-1 font-mono text-[10px] uppercase">
                  <Zap size={12} className="text-[#B07B1C]" />
                  <span>Drive Current</span>
                </div>
                <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  14.2 <span className="text-[11px] font-normal text-[#8A8175]">A</span>
                </div>
                <div className="font-mono text-[9px] text-[#8A8175] mt-1">Nominal rating: 14.2A ± 0.5A</div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div className="flex items-center gap-1.5 text-[#8A8175] mb-1 font-mono text-[10px] uppercase">
                  <Thermometer size={12} className="text-[#C05043]" />
                  <span>Bearing Surface</span>
                </div>
                <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  54.2 <span className="text-[11px] font-normal text-[#8A8175]">°C</span>
                </div>
                <div className="font-mono text-[9px] text-[#8A8175] mt-1">Warning limit: 65.0°C</div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div className="flex items-center gap-1.5 text-[#8A8175] mb-1 font-mono text-[10px] uppercase">
                  <Volume2 size={12} className="text-[#6E6558]" />
                  <span>Acoustic Drift</span>
                </div>
                <div className="font-mono text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                  +1.8 <span className="text-[11px] font-normal text-[#8A8175]">dB</span>
                </div>
                <div className="font-mono text-[9px] text-[#8A8175] mt-1">Harmonic band: 3.2 kHz</div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Technician 101 Onboarding Guide */}
        <section className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-6 rounded-2xl space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">Technician 101 • Field Primer</span>
            <h3 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              How Aegis Predictive Monitoring Operates
            </h3>
            <p className="text-[12px] text-[#6E6558] dark:text-[#A0988A] mt-1">
              A 3-step physical and mathematical workflow for public facility operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-[#2C6E9B]/10 text-[#2C6E9B] flex items-center justify-center font-mono text-[13px] font-bold mb-3">
                01
              </div>
              <h4 className="font-display text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Sensors Sample 24/7</h4>
              <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1.5 leading-relaxed">
                COTS sensor nodes measure mechanical vibration (mm/s), bearing temperature (°C), and motor current (Amps) every second over MQTT.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-[#2F8A7E]/10 text-[#2F8A7E] flex items-center justify-center font-mono text-[13px] font-bold mb-3">
                02
              </div>
              <h4 className="font-display text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Catches Micro-Drift</h4>
              <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1.5 leading-relaxed">
                When bearing grease dries out or a belt loosens, vibration velocity rises weeks before human hearing or thermal imaging detects it.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-[#2E7D5B]/10 text-[#2E7D5B] flex items-center justify-center font-mono text-[13px] font-bold mb-3">
                03
              </div>
              <h4 className="font-display text-[14px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Dispatches Prescriptive SOP</h4>
              <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] mt-1.5 leading-relaxed">
                Instead of replacing entire machine assemblies, technicians receive step-by-step checklists: grease volume, bolt torque, and LOTO steps.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Role Access Governance & Verification */}
        <section className="p-6 rounded-2xl bg-[#2C6E9B]/5 dark:bg-[#2C6E9B]/10 border border-[#2C6E9B]/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#2C6E9B]" />
              <h3 className="font-display text-[16px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                Role Access Governance & Verification
              </h3>
            </div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#2C6E9B]/15 text-[#2C6E9B] border border-[#2C6E9B]/30 font-bold uppercase">
              {pendingRequest ? 'Request Pending' : 'Governed Workflow'}
            </span>
          </div>

          <p className="text-[12px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
            All accounts receive <strong>Feature Explorer</strong> access by default. Operational roles (Technician, Operations Manager, Auditor) grant live SCADA controls and dispatch telemetry, requiring verification and approval by a backend administrator.
          </p>

          <div className="p-4 rounded-xl bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase text-[#8A8175] font-bold">Target Account</div>
              <div className="font-mono text-[12px] font-bold text-[#2C6E9B] mt-0.5">
                {user?.email || 'Current Signed-In Account'}
              </div>
              <div className="font-mono text-[10px] text-[#8A8175] mt-1">
                Current Role: <strong>Feature Explorer</strong> • Facility: <strong>Unassigned</strong>
              </div>
              {pendingRequest && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#B07B1C]/15 border border-[#B07B1C]/30 text-[#B07B1C] font-mono text-[10px] font-bold">
                  <span>⏳ Verification Pending: Requesting access for <strong>{pendingRequest.roleLabel || pendingRequest.requested_role}</strong> ({pendingRequest.facility_id})</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openRoleModal}
              className={`py-2.5 px-4 rounded-xl text-white font-display text-[13px] font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 ${
                pendingRequest
                  ? 'bg-[#B07B1C] hover:bg-[#8F6314]'
                  : 'bg-[#2C6E9B] hover:bg-[#245b80]'
              }`}
            >
              <Shield size={14} />
              <span>{pendingRequest ? 'Review / Update Request' : 'Request Role Access'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="font-mono text-[11px] bg-[#FAF8F4] dark:bg-[#141B22] p-3 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] text-[#1F2933] dark:text-[#FAF8F4] space-y-1">
            <div className="text-[#8A8175] text-[10px] uppercase font-bold">// Administrator verification CLI — review and approve pending requests:</div>
            <code>
              python backend/manage_roles.py --pending
            </code>
          </div>
        </section>

        {/* 7. Comprehensive Architectural & Hardware Documentation */}
        <div className="space-y-6 pt-4 border-t border-[#E6E0D6] dark:border-[#2C3847]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">01 • Workflow Bottlenecks</span>
            <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-3">The Operational Reality</h3>
            <OperationalReality />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">02 • Comparison Matrix</span>
            <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-3">Existing Approaches vs. Aegis Workflow</h3>
            <ComparisonMatrix />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">03 • Operational Pillars</span>
            <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-3">The 5 Pillars: Sensor Data → Maintenance Action</h3>
            <Pillars />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">04 • System Architecture</span>
            <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-3">Transparent & Open Flow Architecture</h3>
            <ArchitectureDiagram />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">05 • Hardware Specifications</span>
            <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] mb-3">$180 COTS Sensor BOM & Edge Microcontroller Pinouts</h3>
            <HardwareTable />
          </div>
        </div>

      </main>

      {/* 8. Feature Explorer Footer */}
      <footer className="mt-16 bg-[#141B22] text-[#A0988A] py-10 border-t border-[#2C3847] font-mono text-[11px]">
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

          <div className="flex items-center gap-4 text-[10px] text-[#8A8175]">
            <span>Account: {user?.email}</span>
            <span>•</span>
            <span>Role: Feature Explorer</span>
            <span>•</span>
            <button onClick={signOut} className="text-[#C05043] hover:underline cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
