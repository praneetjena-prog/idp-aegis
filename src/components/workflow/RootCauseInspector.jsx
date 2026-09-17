import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Activity, Zap, Thermometer, GitCommit, CheckCircle2, ArrowRight } from 'lucide-react';

export const RootCauseInspector = ({ mode = 'fault' }) => {
  const isFault = mode === 'fault';

  return (
    <Card className="border-[#2C6E9B]/30 bg-[#FFFFFF]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C6E9B] animate-pulse" />
          <CardTitle>Multivariate Root Cause Inspector</CardTitle>
          <Badge variant={isFault ? 'critical' : 'nominal'}>
            {isFault ? 'Active Anomaly Signature' : 'Nominal Baseline'}
          </Badge>
        </div>
        <div className="font-mono text-[11px] text-[#8A8175]">
          Target: <span className="text-[#1F2933] font-semibold">AHU-03 Supply Fan</span> • Model: <span className="text-[#2C6E9B]">Isolation Forest + FFT</span>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {/* 1. Telemetry Drift Signature */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg border transition-all ${
            isFault ? 'bg-[#C05043]/5 border-[#C05043]/30' : 'bg-[#F1EDE6] border-[#E6E0D6]'
          }`}>
            <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8175] uppercase">
              <span className="flex items-center gap-1.5"><Activity size={12} className={isFault ? 'text-[#C05043]' : 'text-[#6E6558]'} /> Vibration</span>
              <span className="text-[#8A8175]">ISO 10816</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`font-mono text-[18px] font-bold ${isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
                {isFault ? '6.8 mm/s' : '2.1 mm/s'}
              </span>
              <span className={`font-mono text-[10px] font-semibold ${isFault ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
                {isFault ? '+172% over limit' : 'Normal'}
              </span>
            </div>
            <div className="font-mono text-[9px] text-[#8A8175] mt-1">Limit: 2.5 mm/s RMS • MPU6050</div>
          </div>

          <div className={`p-3 rounded-lg border transition-all ${
            isFault ? 'bg-[#B07B1C]/5 border-[#B07B1C]/30' : 'bg-[#F1EDE6] border-[#E6E0D6]'
          }`}>
            <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8175] uppercase">
              <span className="flex items-center gap-1.5"><Zap size={12} className={isFault ? 'text-[#B07B1C]' : 'text-[#6E6558]'} /> Drive Current</span>
              <span className="text-[#8A8175]">Motor FLA</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`font-mono text-[18px] font-bold ${isFault ? 'text-[#B07B1C]' : 'text-[#1F2933]'}`}>
                {isFault ? '17.6 A' : '14.2 A'}
              </span>
              <span className={`font-mono text-[10px] font-semibold ${isFault ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}`}>
                {isFault ? '+24% surge' : 'Rated Load'}
              </span>
            </div>
            <div className="font-mono text-[9px] text-[#8A8175] mt-1">Rated: 14.2 A • ACS712 CT</div>
          </div>

          <div className={`p-3 rounded-lg border transition-all ${
            isFault ? 'bg-[#2C6E9B]/5 border-[#2C6E9B]/30' : 'bg-[#F1EDE6] border-[#E6E0D6]'
          }`}>
            <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8175] uppercase">
              <span className="flex items-center gap-1.5"><Thermometer size={12} className="text-[#2C6E9B]" /> Delta-T / Airflow</span>
              <span className="text-[#8A8175]">Duct Gradient</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`font-mono text-[18px] font-bold ${isFault ? 'text-[#2C6E9B]' : 'text-[#1F2933]'}`}>
                {isFault ? '-3.1°C' : '+0.2°C'}
              </span>
              <span className="font-mono text-[10px] text-[#8A8175]">
                {isFault ? 'Airflow Drop' : 'Optimal'}
              </span>
            </div>
            <div className="font-mono text-[9px] text-[#8A8175] mt-1">Expected: 0.0°C • DHT22 Probes</div>
          </div>
        </div>

        {/* 2. Physics-Informed Correlation Chain */}
        <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#6E6558] flex items-center gap-1.5">
              <GitCommit size={13} className="text-[#2C6E9B]" /> Physical Mechanism & Fault Propagation
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-[#8A8175]">Confidence: <strong className="text-[#1F2933]">91%</strong></span>
              <span>•</span>
              <span className="text-[#8A8175]">RUL: <strong className="text-[#C05043]">168 Hours (7 Days)</strong></span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2.5 flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-[#C05043]/10 text-[#C05043] flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <div>
                <div className="font-semibold text-[#1F2933]">Bearing Micro-Flaking</div>
                <div className="text-[10px] text-[#6E6558] mt-0.5">Outer race contact stress produces 3.2x RPM spectral vibration spike.</div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2.5 flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-[#B07B1C]/10 text-[#B07B1C] flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <div>
                <div className="font-semibold text-[#1F2933]">Mechanical Binding</div>
                <div className="text-[10px] text-[#6E6558] mt-0.5">Elevated friction forces motor to draw +24% current (17.6 A) to hold speed.</div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded p-2.5 flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-[#2C6E9B]/10 text-[#2C6E9B] flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <div>
                <div className="font-semibold text-[#1F2933]">Thermal & Airflow Loss</div>
                <div className="text-[10px] text-[#6E6558] mt-0.5">Fan slip decreases volumetric flow; coil delta-T collapses by 3.1°C.</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Concise Field Action Directive */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-[#2E7D5B]/5 border border-[#2E7D5B]/20 rounded-lg font-mono text-[11px]">
          <div className="flex items-center gap-2 text-[#2A3138]">
            <CheckCircle2 size={15} className="text-[#2E7D5B] shrink-0" />
            <span><strong>Targeted Field Action:</strong> Relubricate bearing housing (NLGI #2), inspect belt tension (45–55 Hz), verify phase balance.</span>
          </div>
          <span className="text-[#2E7D5B] font-bold whitespace-nowrap">Service Window: 7 Days</span>
        </div>
      </div>
    </Card>
  );
};
