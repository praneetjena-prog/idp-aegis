import React, { useState } from 'react';
import { 
  GitBranch, 
  Activity, 
  Microscope, 
  Wrench, 
  HelpCircle, 
  Download, 
  Printer, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { RootCauseInspector } from '../workflow/RootCauseInspector';
import { AuditorComplianceCard } from './AuditorComplianceCard';
import { TriageQueue } from '../dashboard/TriageQueue';
import { TelemetryChart } from '../dashboard/TelemetryChart';
import { CorrelationChart } from '../dashboard/CorrelationChart';
import { MaintenanceChecklist } from '../workflow/MaintenanceChecklist';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ACRONYM_GLOSSARY = {
  BPFO: {
    term: 'Ball Pass Frequency Outer (BPFO)',
    def: 'The characteristic defect frequency generated when bearing balls roll over an imperfection on the stationary outer race. For SKF 6205-2RS at 1750 RPM, BPFO occurs precisely at 3.2x rotational speed (93.3 Hz).'
  },
  'ISO 10816': {
    term: 'ISO 10816-3 Vibration Standard',
    def: 'International standard evaluating mechanical vibration severity in non-reciprocating machines. Class II defines medium industrial machines (15–300 kW): Zone A (<1.4 mm/s), Zone B (1.4–2.8 mm/s), Zone C (2.8–7.1 mm/s), Zone D (>7.1 mm/s).'
  },
  RMS: {
    term: 'Root Mean Square (RMS) Velocity',
    def: 'A measure of overall destructive vibration energy over a frequency band (10–1000 Hz), measured in millimeters per second (mm/s).'
  },
  RUL: {
    term: 'Remaining Useful Life (RUL)',
    def: 'Statistical estimate of hours of operational run-time remaining before an asset crosses from an unsatisfactory warning state into catastrophic failure.'
  },
  LOTO: {
    term: 'Lockout / Tagout (LOTO)',
    def: 'OSHA-mandated safety procedure isolating hazardous electrical and mechanical energy sources before maintenance to protect field technicians.'
  },
  'Isolation Forest': {
    term: 'Multivariate Isolation Forest',
    def: 'An unsupervised tree-based anomaly detection algorithm that isolates subtle multi-sensor drift across vibration, current, and temperature dimensions simultaneously.'
  },
  'ARIMA Residual': {
    term: 'ARIMA Residual Z-Score',
    def: 'AutoRegressive Integrated Moving Average time-series model that removes daily load patterns to flag unexpected baseline divergence exceeding 3 standard deviations (+3.82σ).'
  }
};

export function AnalysisDashboard({
  feedMode,
  liveValues,
  range,
  setRange,
  workOrders,
  acknowledged,
  onAcknowledge,
  onCreateWorkOrder,
  onViewTelemetry,
  onPrintFieldSheet,
  onExport,
  initialSubTab = 'diagnosis'
}) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [showGlossary, setShowGlossary] = useState(false);
  const isFault = feedMode === 'fault';

  const subTabs = [
    { id: 'diagnosis', label: '1. Diagnosis & Triage', icon: GitBranch, badge: isFault ? 'Fault Active' : 'Nominal' },
    { id: 'telemetry', label: '2. Telemetry & Trends', icon: Activity },
    { id: 'compliance', label: '3. Compliance & Audit', icon: Microscope, badge: 'ISO 10816' },
    { id: 'maintenance', label: '4. Maintenance & SOP', icon: Wrench, badge: 'WO #8821' }
  ];

  return (
    <div className="space-y-5">
      {/* 1. Subview Navigation & Context Bar */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-3 sm:p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[18px] sm:text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase tracking-tight">
              Root Cause & Predictive Analysis
            </h1>
            <Badge variant={isFault ? 'critical' : 'nominal'}>
              {isFault ? 'AHU-03 Bearing Degradation (91%)' : 'All Systems Nominal'}
            </Badge>
          </div>
          <p className="font-sans text-[12px] text-[#6E6558] dark:text-[#A0988A] mt-1">
            Separates practical diagnosis from raw sensor evidence, regulatory standards compliance, and field checklists.
          </p>
        </div>

        {/* Engineering Acronyms Toggle */}
        <button
          type="button"
          onClick={() => setShowGlossary(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#2C6E9B] hover:border-[#2C6E9B] text-[11px] font-mono transition-colors shrink-0"
        >
          <HelpCircle size={13} className="text-[#2C6E9B]" />
          <span>Technical Acronyms</span>
          {showGlossary ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expandable Engineering Glossary */}
      {showGlossary && (
        <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#2C6E9B]/30 shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#E6E0D6] dark:border-[#2C3847] pb-2">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-[#2C6E9B]" />
              <h3 className="font-display text-[13px] font-bold uppercase text-[#1F2933] dark:text-[#FAF8F4]">
                Industrial Diagnostics Glossary & Scientific Evidence
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#8A8175]">Progressive Technical Disclosure</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(ACRONYM_GLOSSARY).map(([key, item]) => (
              <div key={key} className="p-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847]">
                <div className="font-mono text-[11px] font-bold text-[#2C6E9B]">
                  {item.term}
                </div>
                <div className="font-sans text-[11px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-relaxed">
                  {item.def}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Subview Tabs Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D2C9BA] dark:border-[#2C3847] pb-2 font-mono">
        {subTabs.map(tabItem => {
          const Icon = tabItem.icon;
          const isActive = subTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setSubTab(tabItem.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2C6E9B] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B] hover:text-[#1F2933]'
              }`}
            >
              <Icon size={14} />
              <span>{tabItem.label}</span>
              {tabItem.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-[#F1EDE6] dark:bg-[#2C3847] text-[#6E6558] dark:text-[#A0988A]'
                }`}>
                  {tabItem.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Subview Content Panels */}

      {/* PANEL 1: Diagnosis & Triage */}
      {subTab === 'diagnosis' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Root Cause Inspector Component */}
          <RootCauseInspector mode={feedMode} />

          {/* Active Triage Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                  Active Triage Queue & Prescriptive Interventions
                </h3>
                <span className="font-mono text-[10px] text-[#8A8175]">Prioritized Faults</span>
              </div>
            </div>

            <TriageQueue
              onCreateWorkOrder={onCreateWorkOrder}
              onViewTelemetry={() => setSubTab('telemetry')}
              acknowledged={acknowledged}
              onAcknowledge={onAcknowledge}
              workOrders={workOrders}
              onPrintFieldSheet={onPrintFieldSheet}
            />
          </div>
        </div>
      )}

      {/* PANEL 2: Telemetry & Trends */}
      {subTab === 'telemetry' && (
        <div className="space-y-5 animate-in fade-in">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>24-Hour Operational Telemetry Chart • Baseline vs Actual</CardTitle>
                <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                  AHU-03 Power Envelope • Sampling: 15m intervals • Source: High-Speed SQLite Store
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Time range selector */}
                <div className="flex items-center gap-1 p-0.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded-md font-mono text-[10px]">
                  {['1H', '24H', '7D'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        range === r 
                          ? 'bg-[#2C6E9B] text-white font-bold' 
                          : 'text-[#8A8175] hover:text-[#1F2933]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <Badge variant={isFault ? 'critical' : 'nominal'}>
                  {isFault ? 'Vibration & Current Drift Flagged' : 'Within Normal Bounds'}
                </Badge>
              </div>
            </CardHeader>

            <div className="p-4">
              <TelemetryChart mode={feedMode} range={range} />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Cross-System Correlation • Vibration vs Motor Current</CardTitle>
                <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                  Pearson r = 0.89 • High positive correlation validates mechanical bearing friction vs electrical load surge
                </p>
              </div>
              <Badge variant="attention">Correlated Anomaly</Badge>
            </CardHeader>

            <div className="p-4">
              <CorrelationChart mode={feedMode} />
            </div>
          </Card>
        </div>
      )}

      {/* PANEL 3: Compliance & Audit */}
      {subTab === 'compliance' && (
        <div className="space-y-5 animate-in fade-in">
          <AuditorComplianceCard 
            liveVibration={liveValues?.vib || 6.8} 
            onExport={onExport} 
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 space-y-2">
              <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175]">
                Scope & Calculation Limitations
              </div>
              <p className="font-sans text-[12px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
                ISO 10816-3 thresholds apply to 15kW–300kW medium industrial rotating machines with rigid foundation support. Compliance scores represent physical vibration velocity envelopes and do not substitute for mandatory statutory electrical or pressure vessel safety inspections.
              </p>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="font-mono text-[10px] uppercase font-bold text-[#8A8175]">
                Cryptographic Integrity
              </div>
              <p className="font-sans text-[12px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
                Telemetry snapshots are indexed with SHA-256 block hashes to establish tamper-evident audit logs. Suitable for municipal, insurance, and warranty compliance reviews.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* PANEL 4: Maintenance & SOP */}
      {subTab === 'maintenance' && (
        <div className="grid lg:grid-cols-12 gap-5 items-start animate-in fade-in">
          <div className="lg:col-span-8 space-y-4">
            <MaintenanceChecklist 
              onExport={onExport} 
              onPrintFieldSheet={onPrintFieldSheet} 
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            {/* Open Architecture Guardrail */}
            <Card>
              <CardHeader>
                <CardTitle>Public Good Guardrail</CardTitle>
                <Badge variant="nominal">MIT Licensed</Badge>
              </CardHeader>
              <div className="space-y-2.5 font-mono text-[11px] leading-relaxed text-[#6E6558] dark:text-[#A0988A]">
                <div>• Democratizes predictive maintenance using low-cost $180 COTS sensor nodes.</div>
                <div>• Transparent algorithms: Seasonal ARIMA, Isolation Forest, and FFT with zero black-box obscurity.</div>
                <div>• Eliminates alert fatigue: learns normal seasonality and flags subtle multi-parameter drift.</div>
                <div>• Designed for public infrastructure: municipal water, schools, and hospitals.</div>
                <div className="p-2.5 bg-[#2C6E9B]/10 border border-[#2C6E9B]/30 rounded text-[#2C6E9B] dark:text-[#58A6FF] font-semibold text-[10px]">
                  Open Specs: github.com/praneetjena-prog/idp-aegis • COTS Hardware Kit • MIT
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
