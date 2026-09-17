import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  ArrowLeft, 
  Printer, 
  Wrench, 
  Activity, 
  Zap, 
  Thermometer, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { TelemetryChart } from './TelemetryChart';

export const AssetDetailView = ({
  subsystemId,
  onBack,
  liveValues,
  feedMode,
  range,
  onPrintFieldSheet,
  onCreateWorkOrder,
  isDispatched
}) => {
  const isFault = feedMode === 'fault';
  const vib = parseFloat(liveValues?.vib ?? (isFault ? 6.8 : 2.1));
  const cur = parseFloat(liveValues?.cur ?? (isFault ? 17.6 : 14.2));
  const temp = parseFloat(liveValues?.temp ?? (isFault ? 71.8 : 52.0));

  return (
    <section className="space-y-4 animate-in fade-in">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#FFFFFF] border border-[#E6E0D6] rounded-xl shadow-sm">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button 
            onClick={onBack} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF8F4] border border-[#E6E0D6] text-[#3E4650] hover:text-[#1F2933] hover:border-[#D2C9BA] transition-colors font-bold"
          >
            <ArrowLeft size={12} /> Console
          </button>
          <span className="text-[#8A8175]">/</span>
          <span className="text-[#8A8175] uppercase">{subsystemId}</span>
          <span className="text-[#8A8175]">/</span>
          <span className="text-[#1F2933] font-bold">AHU-03 Primary Supply Fan</span>
          <Badge variant={isFault ? 'critical' : 'nominal'}>
            {isFault ? 'Critical Alert: Bearing Wear' : 'Nominal'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={isDispatched ? 'secondary' : 'critical'} 
            size="xs"
            onClick={() => onCreateWorkOrder('AHU-03', '8821')}
            disabled={isDispatched}
          >
            <Wrench size={11} className="mr-1" />
            {isDispatched ? 'WO #8821 Dispatched' : 'Dispatch Work Order'}
          </Button>
          <Button 
            variant="secondary" 
            size="xs" 
            onClick={onPrintFieldSheet}
          >
            <Printer size={11} className="mr-1" /> Field Sheet (PDF)
          </Button>
        </div>
      </div>

      {/* 4 Clean Live Sensor Readout Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Vibration */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          vib > 2.5 ? 'bg-[#C05043]/5 border-[#C05043]/30' : 'bg-[#FFFFFF] border-[#E6E0D6]'
        }`}>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8175] uppercase">
            <span className="flex items-center gap-1.5"><Activity size={12} className={vib > 2.5 ? 'text-[#C05043]' : 'text-[#6E6558]'} /> Vibration Velocity</span>
            <span className="text-[#8A8175]">ISO 10816</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`font-mono text-[22px] font-bold ${vib > 2.5 ? 'text-[#C05043]' : 'text-[#1F2933]'}`}>
              {vib.toFixed(1)} <span className="text-[11px] font-normal text-[#8A8175]">mm/s</span>
            </span>
            <span className={`font-mono text-[10px] font-semibold ${vib > 2.5 ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
              {vib > 2.5 ? `+${Math.round((vib/2.5 - 1)*100)}% over` : 'Nominal'}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-[#E6E0D6] rounded-full overflow-hidden">
            <div className="h-full bg-[#C05043] transition-all" style={{ width: `${Math.min(100, (vib/8)*100)}%` }} />
          </div>
          <div className="font-mono text-[9px] text-[#8A8175] mt-1.5 flex justify-between">
            <span>Trip Limit: 2.5 mm/s</span>
            <span>MPU6050 (I2C)</span>
          </div>
        </div>

        {/* Current */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          cur > 14.5 ? 'bg-[#B07B1C]/5 border-[#B07B1C]/30' : 'bg-[#FFFFFF] border-[#E6E0D6]'
        }`}>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8175] uppercase">
            <span className="flex items-center gap-1.5"><Zap size={12} className={cur > 14.5 ? 'text-[#B07B1C]' : 'text-[#6E6558]'} /> Motor Current</span>
            <span className="text-[#8A8175]">Nameplate FLA</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`font-mono text-[22px] font-bold ${cur > 14.5 ? 'text-[#B07B1C]' : 'text-[#1F2933]'}`}>
              {cur.toFixed(1)} <span className="text-[11px] font-normal text-[#8A8175]">A</span>
            </span>
            <span className={`font-mono text-[10px] font-semibold ${cur > 14.5 ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}`}>
              {cur > 14.5 ? `+${Math.round((cur/14.2 - 1)*100)}% surge` : 'Rated'}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-[#E6E0D6] rounded-full overflow-hidden">
            <div className="h-full bg-[#B07B1C] transition-all" style={{ width: `${Math.min(100, (cur/20)*100)}%` }} />
          </div>
          <div className="font-mono text-[9px] text-[#8A8175] mt-1.5 flex justify-between">
            <span>FLA: 14.2 A</span>
            <span>ACS712 CT</span>
          </div>
        </div>

        {/* Temperature */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          temp > 65 ? 'bg-[#C05043]/5 border-[#C05043]/30' : 'bg-[#FFFFFF] border-[#E6E0D6]'
        }`}>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8175] uppercase">
            <span className="flex items-center gap-1.5"><Thermometer size={12} className={temp > 65 ? 'text-[#C05043]' : 'text-[#6E6558]'} /> Bearing Temp</span>
            <span className="text-[#8A8175]">Class F</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`font-mono text-[22px] font-bold ${temp > 65 ? 'text-[#C05043]' : 'text-[#1F2933]'}`}>
              {temp.toFixed(1)} <span className="text-[11px] font-normal text-[#8A8175]">°C</span>
            </span>
            <span className={`font-mono text-[10px] font-semibold ${temp > 65 ? 'text-[#C05043]' : 'text-[#2E7D5B]'}`}>
              {temp > 65 ? 'Overheat' : 'Nominal'}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-[#E6E0D6] rounded-full overflow-hidden">
            <div className="h-full bg-[#C05043] transition-all" style={{ width: `${Math.min(100, (temp/90)*100)}%` }} />
          </div>
          <div className="font-mono text-[9px] text-[#8A8175] mt-1.5 flex justify-between">
            <span>Limit: 65.0°C</span>
            <span>DHT22 Digital</span>
          </div>
        </div>

        {/* Acoustic Noise */}
        <div className="p-3.5 rounded-xl border border-[#E6E0D6] bg-[#FFFFFF]">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8A8175] uppercase">
            <span className="flex items-center gap-1.5"><Volume2 size={12} className="text-[#6E6558]" /> High-Freq Noise</span>
            <span className="text-[#8A8175]">Acoustics</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono text-[22px] font-bold text-[#1F2933]">
              {isFault ? '+14 dB' : '0 dB'}
            </span>
            <span className="font-mono text-[10px] text-[#8A8175]">
              {isFault ? 'Harmonic Peak' : 'Quiet'}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-[#E6E0D6] rounded-full overflow-hidden">
            <div className="h-full bg-[#2C6E9B] transition-all" style={{ width: `${isFault ? 75 : 15}%` }} />
          </div>
          <div className="font-mono text-[9px] text-[#8A8175] mt-1.5 flex justify-between">
            <span>Peak: 3.2 kHz</span>
            <span>Microphone MEMS</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid lg:grid-cols-12 gap-4 items-start">
        {/* Left: 24H Operational Trend */}
        <div className="lg:col-span-8">
          <Card className="p-4 bg-[#FFFFFF]">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-[#E6E0D6]">
              <CardTitle>24-Hour Telemetry Signature • Vibration vs Motor Draw</CardTitle>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <Badge variant={isFault ? 'critical' : 'nominal'}>
                  {isFault ? 'Correlation: Current ↑ + Vibration ↑' : 'Stable Profile'}
                </Badge>
              </div>
            </CardHeader>
            <TelemetryChart mode={feedMode} range={range} />
          </Card>
        </div>

        {/* Right: Asset Specifications & Diagnostic Summary */}
        <div className="lg:col-span-4 space-y-3">
          {/* Diagnostic Card */}
          <div className={`p-4 rounded-xl border ${
            isFault ? 'bg-[#C05043]/5 border-[#C05043]/30' : 'bg-[#FAF8F4] border-[#E6E0D6]'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D6]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6E6558]">
                Diagnostic Readout
              </span>
              <span className="font-mono text-[10px] text-[#C05043] font-bold">
                {isFault ? 'Action Required (7d)' : 'Nominal'}
              </span>
            </div>
            <div className="mt-2 space-y-2 font-mono text-[11px] text-[#3E4650] leading-relaxed">
              {isFault ? (
                <>
                  <div><strong className="text-[#1F2933]">Observation:</strong> Vibration surge ({vib} mm/s) + current overload ({cur}A) indicates mechanical binding from bearing micro-spalling.</div>
                  <div className="text-[10px] text-[#6E6558]"><strong className="text-[#1F2933]">Model:</strong> Isolation Forest + Harmonic FFT (91% confidence, RUL ~168h).</div>
                  <div className="pt-2">
                    <Button 
                      variant="critical" 
                      size="sm" 
                      onClick={() => onCreateWorkOrder('AHU-03', '8821')}
                      disabled={isDispatched}
                      className="w-full"
                    >
                      <Wrench size={12} className="mr-1.5" />
                      {isDispatched ? 'Work Order #8821 Active' : 'Create Work Order #8821'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-[#2E7D5B] flex items-center gap-2 py-2">
                  <CheckCircle2 size={14} />
                  <span>All 4 operational indicators tracking inside nominal envelope. Zero service action required.</span>
                </div>
              )}
            </div>
          </div>

          {/* Asset Context & Specs */}
          <Card className="p-4 bg-[#FFFFFF]">
            <CardHeader className="p-0 pb-2 mb-2 border-b border-[#E6E0D6]">
              <CardTitle>Asset Specifications & Crib List</CardTitle>
            </CardHeader>
            <div className="space-y-2 font-mono text-[10px] text-[#6E6558]">
              <div className="flex justify-between py-1 border-b border-[#E6E0D6]/60">
                <span className="text-[#8A8175]">Location</span>
                <strong className="text-[#1F2933]">East Wing • Roof Level 3</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E0D6]/60">
                <span className="text-[#8A8175]">Motor Rating</span>
                <strong className="text-[#1F2933]">15 kW • 3-Phase • 1750 RPM</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E0D6]/60">
                <span className="text-[#8A8175]">Bearing Spec</span>
                <strong className="text-[#2C6E9B]">SKF 6205-2RS (Stock: 4)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E0D6]/60">
                <span className="text-[#8A8175]">Belt Drive</span>
                <strong className="text-[#1F2933]">B-62 V-Belt (Tension 45-55 Hz)</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8A8175]">LOTO Procedure</span>
                <strong className="text-[#C05043]">SOP-EL-03 (Breaker Panel E-3)</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
