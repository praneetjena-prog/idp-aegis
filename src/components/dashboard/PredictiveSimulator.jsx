import React, { useMemo, useState } from 'react';
import { 
  Activity, 
  Zap, 
  Thermometer, 
  Droplets, 
  Gauge, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Crosshair, 
  Wrench, 
  Printer, 
  FileJson,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { runForecast, inferWear } from '@/lib/facility';

const PRESETS = [
  {
    id: 'normal',
    label: 'Normal Baseline',
    color: 'text-[#2E7D5B]',
    border: 'border-[#2E7D5B]/30 hover:bg-[#2E7D5B]/10',
    values: { load: 85, ambient: 25, wear: 5, severity: 10, horizon: 90 }
  },
  {
    id: 'summer',
    label: 'Thermal Overload',
    color: 'text-[#B07B1C]',
    border: 'border-[#B07B1C]/30 hover:bg-[#B07B1C]/10',
    values: { load: 110, ambient: 42, wear: 25, severity: 40, horizon: 90 }
  },
  {
    id: 'degradation',
    label: 'Bearing Wear (Critical)',
    color: 'text-[#C05043]',
    border: 'border-[#C05043]/30 hover:bg-[#C05043]/10',
    values: { load: 95, ambient: 32, wear: 75, severity: 75, horizon: 90 }
  }
];

const Slider = ({ label, value, min, max, step, unit, onChange, hint }) => (
  <div className="space-y-1">
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#6E6558]">{label}</span>
      <span className="font-mono text-[12px] font-bold text-[#1F2933]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#2C6E9B] h-1.5 bg-[#E6E0D6] rounded-lg cursor-pointer"
    />
    {hint && <div className="font-mono text-[9px] text-[#8A8175]">{hint}</div>}
  </div>
);

const Readout = ({ icon: Icon, label, value, unit, limit, status }) => {
  const tone = status === 'critical' ? 'text-[#C05043]' : status === 'warning' ? 'text-[#B07B1C]' : 'text-[#1F2933]';
  const bg = status === 'critical' ? 'bg-[#C05043]/5 border-[#C05043]/20' : status === 'warning' ? 'bg-[#B07B1C]/5 border-[#B07B1C]/20' : 'bg-[#FAF8F4] border-[#E6E0D6]';
  return (
    <div className={`border rounded-lg p-2.5 transition-colors ${bg}`}>
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">
        <span className="flex items-center gap-1"><Icon size={11} /> {label}</span>
        {limit != null && <span>Max {limit}</span>}
      </div>
      <div className={`font-mono text-[17px] font-bold mt-1 ${tone}`}>
        {value}<span className="text-[10px] font-normal text-[#8A8175] ml-0.5">{unit}</span>
      </div>
    </div>
  );
};

export const PredictiveSimulator = ({ 
  params, 
  liveValues, 
  isLive,
  onCreateWorkOrder,
  onOpenFieldSheet,
  onExport,
  isDispatched
}) => {
  const [load, setLoad] = useState(85);
  const [ambient, setAmbient] = useState(30);
  const [severity, setSeverity] = useState(35);
  const [horizon, setHorizon] = useState(90);
  const [wear, setWear] = useState(15);
  const [activePreset, setActivePreset] = useState('custom');

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setLoad(p.values.load);
    setAmbient(p.values.ambient);
    setWear(p.values.wear);
    setSeverity(p.values.severity);
    setHorizon(p.values.horizon);
  };

  const matchLive = () => {
    setActivePreset('live');
    const inferred = Math.round(inferWear(params, liveValues) * 100);
    setWear(Math.min(95, Math.max(1, inferred)));
    if (liveValues?.temp) setAmbient(Math.min(48, Math.max(15, Math.round(liveValues.temp - 25))));
  };

  const forecast = useMemo(
    () => runForecast(params, {
      load: load / 100,
      ambientC: ambient,
      severity: severity / 100,
      wear: wear / 100,
      horizonDays: horizon,
    }),
    [params, load, ambient, severity, wear, horizon],
  );

  const { now, series, rulDays, warnDays, failureProbability, wastedKwh, status } = forecast;

  // Projection chart geometry
  const W = 560, H = 140, PAD = 10;
  const maxVib = Math.max(params.vibrationCritical * 1.4, ...series.map(s => s.vibration));
  const x = (d) => PAD + (d / horizon) * (W - PAD * 2);
  const yVib = (v) => H - PAD - (v / maxVib) * (H - PAD * 2);
  const yHealth = (h) => H - PAD - (h / 100) * (H - PAD * 2);
  const vibPath = series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.day).toFixed(1)} ${yVib(s.vibration).toFixed(1)}`).join(' ');
  const healthPath = series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.day).toFixed(1)} ${yHealth(s.health).toFixed(1)}`).join(' ');

  const statusLabel = status === 'critical' ? 'Action Required' : status === 'warning' ? 'Advisory' : 'Nominal';

  return (
    <Card className="border-[#2C6E9B]/30 bg-[#FFFFFF]">
      <CardHeader className="pb-3 border-b border-[#E6E0D6]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B]/10 text-[#2C6E9B] flex items-center justify-center font-bold">
              <Gauge size={16} />
            </div>
            <div>
              <CardTitle>Digital Twin Engineering Simulator • {params.assetTag}</CardTitle>
              <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
                Asset: {params.assetType} • 15 kW 3-Phase Induction Motor • Baseline {params.ratedCurrentA}A FLA
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[9px] uppercase text-[#8A8175] mr-1">Presets:</span>
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`px-2.5 py-1 rounded font-mono text-[10px] font-semibold border transition-all ${
                  activePreset === p.id 
                    ? 'bg-[#1F2933] text-white border-[#1F2933]' 
                    : `bg-[#FAF8F4] text-[#3E4650] ${p.border}`
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={matchLive}
              className={`px-2.5 py-1 rounded font-mono text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                activePreset === 'live' 
                  ? 'bg-[#2C6E9B] text-white border-[#2C6E9B]' 
                  : 'bg-[#2C6E9B]/10 text-[#2C6E9B] border-[#2C6E9B]/30 hover:bg-[#2C6E9B]/20'
              }`}
            >
              <Crosshair size={10} /> Sync Live Feed
            </button>
          </div>
        </div>
      </CardHeader>

      <div className="grid lg:grid-cols-12 gap-5 pt-4 items-start">
        {/* Left: Interactive Input Tuning */}
        <div className="lg:col-span-4 space-y-4 bg-[#FAF8F4] p-3.5 rounded-lg border border-[#E6E0D6]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D6]">
            <span className="font-mono text-[11px] font-bold uppercase text-[#1F2933] flex items-center gap-1.5">
              <Sliders size={13} className="text-[#2C6E9B]" /> Operating Inputs
            </span>
            <Badge variant={status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : 'nominal'}>
              {statusLabel}
            </Badge>
          </div>

          <Slider 
            label="Duty Load" 
            value={load} 
            min={30} 
            max={125} 
            step={5} 
            unit="%" 
            onChange={(v) => { setLoad(v); setActivePreset('custom'); }} 
            hint={`Draw: ${(params.ratedCurrentA * (load/100)).toFixed(1)} A of ${params.ratedCurrentA} A rating`}
          />

          <Slider 
            label="Ambient Temperature" 
            value={ambient} 
            min={15} 
            max={50} 
            step={1} 
            unit="°C" 
            onChange={(v) => { setAmbient(v); setActivePreset('custom'); }} 
            hint="Plant room ambient boundary"
          />

          <Slider 
            label="Mechanical Wear Degree" 
            value={wear} 
            min={0} 
            max={95} 
            step={5} 
            unit="%" 
            onChange={(v) => { setWear(v); setActivePreset('custom'); }} 
            hint="0% = Freshly serviced SKF 6205-2RS"
          />

          <Slider 
            label="Progression Severity" 
            value={severity} 
            min={10} 
            max={100} 
            step={5} 
            unit="%" 
            onChange={(v) => { setSeverity(v); setActivePreset('custom'); }} 
            hint="Fault rate acceleration factor"
          />

          <Slider 
            label="Forecast Horizon" 
            value={horizon} 
            min={14} 
            max={180} 
            step={7} 
            unit=" Days" 
            onChange={(v) => { setHorizon(v); setActivePreset('custom'); }} 
          />
        </div>

        {/* Right: Projected State & Forecast Curves */}
        <div className="lg:col-span-8 space-y-4">
          {/* 5 Real-Time Readout Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Readout 
              icon={Activity} 
              label="Vibration" 
              value={now.vibration} 
              unit=" mm/s" 
              limit={params.vibrationCritical} 
              status={now.vibration >= params.vibrationCritical ? 'critical' : now.vibration >= params.vibrationWarn ? 'warning' : 'nominal'} 
            />
            <Readout 
              icon={Zap} 
              label="Drive Current" 
              value={now.current} 
              unit=" A" 
              limit={params.currentCritical} 
              status={now.current >= params.currentCritical ? 'critical' : now.current >= params.currentWarn ? 'warning' : 'nominal'} 
            />
            <Readout 
              icon={Thermometer} 
              label="Winding Temp" 
              value={now.temperature} 
              unit=" °C" 
              limit={params.tempCritical} 
              status={now.temperature >= params.tempCritical ? 'critical' : now.temperature >= params.tempWarn ? 'warning' : 'nominal'} 
            />
            <Readout 
              icon={Droplets} 
              label="Flow Rate" 
              value={now.flow} 
              unit=" L/m" 
              limit={params.flowMin} 
              status={now.flow <= params.flowMin ? 'warning' : 'nominal'} 
            />
            <Readout 
              icon={Gauge} 
              label="Health Score" 
              value={now.health} 
              unit="/100" 
              status={now.health < 50 ? 'critical' : now.health < 75 ? 'warning' : 'nominal'} 
            />
          </div>

          {/* Dynamic Forecast Projection Chart */}
          <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6E6558] font-bold">
                Projected Degradation Trajectory • Next {horizon} Days
              </span>
              <div className="flex items-center gap-3 font-mono text-[9px] text-[#8A8175]">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#C05043] inline-block" /> Vibration (mm/s)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#2C6E9B] inline-block" /> Health (%)</span>
                <span className="flex items-center gap-1"><span className="w-3 border-t border-dashed border-[#C05043] inline-block" /> Limit ({params.vibrationCritical} mm/s)</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]">
              {/* Threshold lines */}
              <line x1={PAD} y1={yVib(params.vibrationCritical)} x2={W - PAD} y2={yVib(params.vibrationCritical)} stroke="#C05043" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
              <line x1={PAD} y1={yVib(params.vibrationWarn)} x2={W - PAD} y2={yVib(params.vibrationWarn)} stroke="#B07B1C" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
              
              {/* Curve paths */}
              <path d={healthPath} fill="none" stroke="#2C6E9B" strokeWidth="1.5" opacity="0.75" />
              <path d={vibPath} fill="none" stroke="#C05043" strokeWidth="2" />
              
              {/* Crossing marker */}
              {rulDays != null && rulDays <= horizon && (
                <g>
                  <line x1={x(rulDays)} y1={PAD} x2={x(rulDays)} y2={H - PAD} stroke="#C05043" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x={Math.min(x(rulDays) + 4, W - 90)} y={PAD + 12} className="font-mono font-bold" fontSize="9" fill="#C05043">
                    TRIP: DAY {rulDays}
                  </text>
                </g>
              )}
            </svg>
            <div className="flex justify-between font-mono text-[9px] text-[#8A8175] pt-1 border-t border-[#E6E0D6] mt-1">
              <span>Day 0 (Now)</span>
              <span>Day {Math.round(horizon/2)}</span>
              <span>Day {horizon}</span>
            </div>
          </div>

          {/* 3 Key Decision KPIs */}
          <div className="grid sm:grid-cols-3 gap-3 font-mono">
            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
              <div className="text-[9px] text-[#8A8175] uppercase tracking-wider flex items-center gap-1">
                <TrendingDown size={11} /> Remaining Useful Life
              </div>
              <div className={`text-[20px] font-bold mt-1 ${rulDays == null ? 'text-[#2E7D5B]' : rulDays < 14 ? 'text-[#C05043]' : 'text-[#B07B1C]'}`}>
                {rulDays == null ? `>${horizon}d` : `${rulDays} Days`}
              </div>
              <div className="text-[9px] text-[#8A8175] mt-0.5">
                {rulDays == null ? 'Zero trip in simulation window' : `Action required before day ${Math.max(1, Math.round(rulDays * 0.7))}`}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
              <div className="text-[9px] text-[#8A8175] uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={11} /> Failure Probability
              </div>
              <div className={`text-[20px] font-bold mt-1 ${failureProbability > 70 ? 'text-[#C05043]' : failureProbability > 35 ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}`}>
                {failureProbability}%
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[#E6E0D6] overflow-hidden">
                <div 
                  className={`h-full transition-all ${failureProbability > 70 ? 'bg-[#C05043]' : failureProbability > 35 ? 'bg-[#B07B1C]' : 'bg-[#2E7D5B]'}`} 
                  style={{ width: `${failureProbability}%` }} 
                />
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
              <div className="text-[9px] text-[#8A8175] uppercase tracking-wider flex items-center gap-1">
                <Zap size={11} /> Excess Power Loss
              </div>
              <div className="text-[20px] font-bold mt-1 text-[#1F2933]">
                {wastedKwh} <span className="text-[11px] font-normal text-[#8A8175]">kWh/mo</span>
              </div>
              <div className="text-[9px] text-[#8A8175] mt-0.5">
                Est. ~${(wastedKwh * 0.14).toFixed(1)}/month in friction drag
              </div>
            </div>
          </div>

          {/* Prescriptive Dispatch Bar */}
          <div className="p-3 bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="font-mono text-[11px] text-[#3E4650]">
              <strong className="text-[#1F2933]">Maintenance Recommendation: </strong>
              {status === 'critical'
                ? `Vibration exceeds ${params.vibrationCritical} mm/s limit. Dispatch technician to replace bearing 6205-2RS and adjust belt tension.`
                : status === 'warning'
                ? `Vibration entering advisory zone (${now.vibration} mm/s). Plan grease replenishment during next scheduled round.`
                : 'All parameters tracking inside nominal baseline. Continue normal runtime logging.'}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button 
                variant={status === 'critical' ? 'critical' : 'primary'} 
                size="xs"
                onClick={() => onCreateWorkOrder && onCreateWorkOrder('AHU-03', '8821')}
                disabled={isDispatched}
              >
                <Wrench size={11} className="mr-1" />
                {isDispatched ? 'WO #8821 Dispatched' : 'Dispatch Work Order'}
              </Button>
              <Button 
                variant="secondary" 
                size="xs"
                onClick={onOpenFieldSheet}
              >
                <Printer size={11} className="mr-1" /> Field Sheet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
