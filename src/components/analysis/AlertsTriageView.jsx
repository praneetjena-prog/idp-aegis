import React, { useState } from 'react';
import { 
  AlertTriangle, 
  GitBranch, 
  Activity, 
  Wrench, 
  CheckCircle2, 
  Printer, 
  QrCode, 
  FileSpreadsheet, 
  FileJson,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { RootCauseInspector } from '../workflow/RootCauseInspector';
import { TriageQueue } from '../dashboard/TriageQueue';
import { TelemetryChart } from '../dashboard/TelemetryChart';
import { CorrelationChart } from '../dashboard/CorrelationChart';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function AlertsTriageView({
  feedMode = 'fault',
  liveValues,
  range = '24H',
  setRange,
  workOrders,
  acknowledged,
  onAcknowledge,
  onCreateWorkOrder,
  onViewTelemetry,
  onPrintFieldSheet,
  onExport,
  onSelectAsset
}) {
  const [subView, setSubView] = useState('queue'); // 'queue' | 'telemetry' | 'correlation'
  const isFault = feedMode === 'fault';

  return (
    <div className="space-y-6">
      {/* 1. Alerts & Triage Header */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-xs ${
              isFault ? 'bg-[#C05043] text-white' : 'bg-[#2E7D5B] text-white'
            }`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-[18px] sm:text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] tracking-tight uppercase">
                  Alerts & Equipment Triage
                </h1>
                <Badge variant={isFault ? 'critical' : 'nominal'}>
                  {isFault ? 'Fault Active • AHU-03 High Severity' : 'All Systems Nominal'}
                </Badge>
              </div>
              <p className="font-mono text-[11px] text-[#8A8175] mt-0.5">
                Active fault queue &bull; Prescriptive intervention protocols &bull; Work order dispatch
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Strip */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setSubView('queue')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              subView === 'queue'
                ? 'bg-[#2C6E9B] text-white shadow-xs'
                : 'text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933]'
            }`}
          >
            Fault Queue & Actions
          </button>
          <button
            type="button"
            onClick={() => setSubView('telemetry')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              subView === 'telemetry'
                ? 'bg-[#2C6E9B] text-white shadow-xs'
                : 'text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933]'
            }`}
          >
            Sensor Trends
          </button>
          <button
            type="button"
            onClick={() => setSubView('correlation')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              subView === 'correlation'
                ? 'bg-[#2C6E9B] text-white shadow-xs'
                : 'text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933]'
            }`}
          >
            Multi-Sensor Correlation
          </button>
        </div>
      </div>

      {/* 2. SubView: Fault Queue & Actions */}
      {subView === 'queue' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Root Cause Inspector */}
          <RootCauseInspector mode={feedMode} />

          {/* Active Triage Queue Component */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                  Prioritized Equipment Fault Queue
                </h2>
                <span className="font-mono text-[10px] text-[#8A8175]">Acknowledge &bull; Dispatch &bull; Resolve</span>
              </div>

              {onExport && (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="xs" onClick={() => onExport('csv')}>
                    <FileSpreadsheet size={11} className="mr-1 text-[#2E7D5B]" /> Export CSV
                  </Button>
                </div>
              )}
            </div>

            <TriageQueue
              onCreateWorkOrder={onCreateWorkOrder}
              onViewTelemetry={() => setSubView('telemetry')}
              acknowledged={acknowledged}
              onAcknowledge={onAcknowledge}
              workOrders={workOrders}
              onPrintFieldSheet={onPrintFieldSheet}
            />
          </div>
        </div>
      )}

      {/* 3. SubView: Sensor Trends */}
      {subView === 'telemetry' && (
        <div className="space-y-4 animate-in fade-in">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Multi-Line Trend Telemetry • AHU-03 Primary Supply Fan</CardTitle>
                <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                  Vibration RMS velocity, motor phase current, and bearing temperature over time window.
                </p>
              </div>

              {setRange && (
                <div className="flex items-center gap-1 p-0.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded-md font-mono text-[10px]">
                  {['1H', '24H', '7D'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2.5 py-0.5 rounded transition-colors ${
                        range === r 
                          ? 'bg-[#2C6E9B] text-white font-bold' 
                          : 'text-[#8A8175] hover:text-[#1F2933]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </CardHeader>

            <div className="p-4">
              <TelemetryChart mode={feedMode} range={range} />
            </div>
          </Card>
        </div>
      )}

      {/* 4. SubView: Multi-Sensor Correlation */}
      {subView === 'correlation' && (
        <div className="space-y-4 animate-in fade-in">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Cross-Sensor Scatter Correlation • Vibration vs Motor Current</CardTitle>
                <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                  Pearson r = 0.89 • High positive correlation validates mechanical bearing friction vs electrical load surge
                </p>
              </div>
              <Badge variant={isFault ? 'critical' : 'nominal'}>
                {isFault ? 'Friction Induced Load Surge Flagged' : 'Normal Operating Cluster'}
              </Badge>
            </CardHeader>

            <div className="p-4">
              <CorrelationChart mode={feedMode} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
