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
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { runForecast, inferWear } from '@/lib/facility';

const Slider = ({ label, value, min, max, step, unit, onChange, hint, normalRange }) => (
  <div className="bg-[#FAF8F4] dark:bg-[#1A222B] p-2.5 rounded-lg border border-[#E6E0D6] dark:border-[#2C3847]">
    <div className="flex items-baseline justify-between mb-1">
      <span className="font-mono text-[11px] font-semibold text-[#1F2933] dark:text-[#FAF8F4]">{label}</span>
      <span className="font-mono text-[12px] font-bold text-[#2C6E9B] dark:text-[#5BA3D9]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min} 
      max={max} 
      step={step} 
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-[#E6E0D6] dark:bg-[#2C3847] rounded-lg appearance-none cursor-pointer accent-[#2C6E9B]"
    />
    <div className="flex items-center justify-between font-mono text-[9px] text-[#8A8175] mt-1.5">
      <span>{hint}</span>
      {normalRange && <span className="text-[#2E7D5B] dark:text-[#4EAA82] font-medium">{normalRange}</span>}
    </div>
  </div>
);

const Readout = ({ icon: Icon, label, value, unit, limit, status }) => {
  const tone = status === 'critical' 
    ? 'text-[#C05043] dark:text-[#E06C5E]' 
    : status === 'warning' 
    ? 'text-[#B07B1C] dark:text-[#D49835]' 
    : 'text-[#1F2933] dark:text-[#FAF8F4]';

  const bgTone = status === 'critical'
    ? 'border-[#C05043]/30 bg-[#C05043]/5'
    : status === 'warning'
    ? 'border-[#B07B1C]/30 bg-[#B07B1C]/5'
    : 'border-[#E6E0D6] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B]';

  return (
    <div className={`border rounded-lg p-2.5 transition-colors ${bgTone}`}>
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">
        <Icon size={11} /> {label}
      </div>
      <div className={`font-mono text-[17px] font-bold mt-1 ${tone}`}>
        {value}<span className="text-[10px] font-normal text-[#8A8175] ml-0.5">{unit}</span>
      </div>
      {limit != null && (
        <div className="font-mono text-[9px] text-[#8A8175] mt-0.5">
          Limit: <span className="font-semibold">{limit}{unit}</span>
        </div>
      )}
    </div>
  );
};

const BASELINE_SCENARIO = {
  load: 85,
  ambient: 30,
  severity: 35,
  horizon: 90,
  wear: 8
};

export const PredictiveSimulator = ({ params, liveValues, isLive }) => {
  const [load, setLoad] = useState(BASELINE_SCENARIO.load);
  const [ambient, setAmbient] = useState(BASELINE_SCENARIO.ambient);
  const [severity, setSeverity] = useState(BASELINE_SCENARIO.severity);
  const [horizon, setHorizon] = useState(BASELINE_SCENARIO.horizon);
  const [wear, setWear] = useState(BASELINE_SCENARIO.wear);
  const [lastFitSource, setLastFitSource] = useState(null);

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

  const handleReset = () => {
    setLoad(BASELINE_SCENARIO.load);
    setAmbient(BASELINE_SCENARIO.ambient);
    setSeverity(BASELINE_SCENARIO.severity);
    setHorizon(BASELINE_SCENARIO.horizon);
    setWear(BASELINE_SCENARIO.wear);
    setLastFitSource(null);
  };

  const matchLive = () => {
    const inferred = Math.round(inferWear(params, liveValues) * 100);
    const clamped = Math.min(95, Math.max(1, inferred));
    setWear(clamped);
    setLastFitSource({
      vib: liveValues?.vib || '2.1',
      cur: liveValues?.cur || '14.2',
      inferred: clamped,
      isLive
    });
  };

  // Projection chart geometry
  const W = 560, H = 160, PAD = 10;
  const maxVib = Math.max(params.vibrationCritical * 1.35, ...series.map(s => s.vibration));
  const x = (d) => PAD + (d / horizon) * (W - PAD * 2);
  const yVib = (v) => H - PAD - (v / maxVib) * (H - PAD * 2);
  const yHealth = (h) => H - PAD - (h / 100) * (H - PAD * 2);
  const vibPath = series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.day).toFixed(1)} ${yVib(s.vibration).toFixed(1)}`).join(' ');
  const healthPath = series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.day).toFixed(1)} ${yHealth(s.health).toFixed(1)}`).join(' ');

  const statusLabel = status === 'critical' ? 'Action Required' : status === 'warning' ? 'Watch Window' : 'Nominal Degradation';

  return (
    <div className="space-y-4">
      {/* 1. Persistent Simulation Environment Banner */}
      <div className="bg-[#FAF4EB] dark:bg-[#1E1B15] border-2 border-[#B07B1C]/50 dark:border-[#D49835]/40 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#B07B1C] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Sliders size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8A5A0A] dark:text-[#E0A84E] bg-[#B07B1C]/15 px-2 py-0.5 rounded">
                Simulation Environment
              </span>
              <span className="font-mono text-[10px] text-[#8A8175] dark:text-[#A0988A]">
                Predictive Sandbox • No live hardware commands issued
              </span>
            </div>
            <p className="font-sans text-[12px] text-[#554E43] dark:text-[#C5BCAD] mt-1 leading-snug">
              Experiment with stress parameters and progressive wear safely. Changes here project degradation curves for <strong>{params.assetTag} ({params.assetType})</strong> without affecting live facility SCADA or dispatching field teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="flex items-center gap-1.5 font-mono text-[11px] bg-white dark:bg-[#141B22]"
            title="Restore default standard baseline operating conditions"
          >
            <RotateCcw size={12} />
            <span>Reset Scenario</span>
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={matchLive}
            className="flex items-center gap-1.5 font-mono text-[11px]"
            title="Calibrate simulator wear to current live telemetry values"
          >
            <Crosshair size={12} className="text-[#2C6E9B]" />
            <span>Fit Model to {isLive ? 'Live' : 'Current'} Readings</span>
          </Button>
        </div>
      </div>

      {/* Fit Feedback Indicator if triggered */}
      {lastFitSource && (
        <div className="bg-[#2C6E9B]/10 border border-[#2C6E9B]/30 rounded-lg px-3 py-2 flex items-center justify-between text-[11px] font-mono text-[#2C6E9B] dark:text-[#5BA3D9] animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>
              Model fitted to {lastFitSource.isLive ? 'Live Sensor Stream' : 'Current Feed'}: Vibration = {lastFitSource.vib} mm/s, Current = {lastFitSource.cur} A → Inferred Bearing Wear set to <strong>{lastFitSource.inferred}%</strong>
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setLastFitSource(null)}
            className="text-[10px] text-[#8A8175] hover:text-[#1F2933] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Sandbox Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <CardTitle>Predictive Degradation Model • {params.assetTag} {params.assetType}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#8A8175] hidden sm:inline">ISO 10816 Class II Standard</span>
            <Badge variant={status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : 'nominal'}>
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>

        <div className="grid lg:grid-cols-12 gap-5 items-start">
          {/* Controls Column (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Group A: Operational Conditions */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#6E6558] dark:text-[#A0988A]">
                  1. Operational Conditions
                </span>
                <span className="font-mono text-[9px] text-[#8A8175]">Facility Environment</span>
              </div>

              <Slider 
                label="Duty Load" 
                value={load} 
                min={20} 
                max={120} 
                step={1} 
                unit="%" 
                onChange={setLoad} 
                hint="Motor load factor vs nameplate" 
                normalRange="Normal: 70–90%"
              />

              <Slider 
                label="Ambient Temperature" 
                value={ambient} 
                min={10} 
                max={50} 
                step={1} 
                unit="°C" 
                onChange={setAmbient} 
                hint="Surrounding plant room air temp" 
                normalRange="Normal: 20–32°C"
              />

              <Slider 
                label="Forecast Projection Horizon" 
                value={horizon} 
                min={14} 
                max={365} 
                step={1} 
                unit=" days" 
                onChange={setHorizon} 
                hint="Forward simulation timespan" 
                normalRange="Default: 90d"
              />
            </div>

            {/* Group B: Mechanical Degradation */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-[#E6E0D6] dark:border-[#2C3847]">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#6E6558] dark:text-[#A0988A]">
                  2. Mechanical Degradation
                </span>
                <span className="font-mono text-[9px] text-[#8A8175]">Physical Wear Sandbox</span>
              </div>

              <Slider 
                label="Current Bearing Wear" 
                value={wear} 
                min={0} 
                max={95} 
                step={1} 
                unit="%" 
                onChange={setWear} 
                hint="0% = freshly greased; >70% = raceway spalling" 
                normalRange="Safe: <25%"
              />

              <Slider 
                label="Degradation Growth Severity" 
                value={severity} 
                min={0} 
                max={100} 
                step={1} 
                unit="%" 
                onChange={setSeverity} 
                hint="Exponential progression rate under load" 
                normalRange="Nominal: 20–40%"
              />
            </div>

            {/* Model Explanation Card */}
            <div className="bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3 space-y-1.5 font-mono text-[10px] text-[#6E6558] dark:text-[#A0988A]">
              <div className="flex items-center gap-1.5 font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                <Info size={11} className="text-[#2C6E9B]" />
                <span>How 'Fit Model' Works:</span>
              </div>
              <p className="leading-relaxed">
                Reverse-calculates equivalent bearing raceway fatigue from live RMS vibration ({liveValues?.vib || '2.1'} mm/s) and Phase A current ({liveValues?.cur || '14.2'} A) using empirical Arrhenius thermal wear constants.
              </p>
            </div>
          </div>

          {/* Outputs Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Projected Sensor Readouts */}
            <div>
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#6E6558] dark:text-[#A0988A] mb-2">
                Projected Instantaneous Sensor State
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
                  label="Current" 
                  value={now.current} 
                  unit=" A" 
                  limit={params.currentCritical} 
                  status={now.current >= params.currentCritical ? 'critical' : now.current >= params.currentWarn ? 'warning' : 'nominal'} 
                />
                <Readout 
                  icon={Thermometer} 
                  label="Bearing Temp" 
                  value={now.temperature} 
                  unit=" °C" 
                  limit={params.tempCritical} 
                  status={now.temperature >= params.tempCritical ? 'critical' : now.temperature >= params.tempWarn ? 'warning' : 'nominal'} 
                />
                <Readout 
                  icon={Droplets} 
                  label="Airflow" 
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
                  status={now.health < 45 ? 'critical' : now.health < 70 ? 'warning' : 'nominal'} 
                />
              </div>
            </div>

            {/* Projection Chart */}
            <div className="bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#6E6558] dark:text-[#A0988A]">
                  Degradation Trajectory • Next {horizon} Days
                </span>
                <div className="flex items-center gap-3 font-mono text-[9px] text-[#8A8175]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#C05043] inline-block rounded" /> Vibration</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#2C6E9B] inline-block rounded" /> Health Score</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-[#C05043] inline-block" /> Limit ({params.vibrationCritical} mm/s)</span>
                </div>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[160px] overflow-visible">
                {/* Critical threshold line */}
                <line x1={PAD} y1={yVib(params.vibrationCritical)} x2={W - PAD} y2={yVib(params.vibrationCritical)} stroke="#C05043" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
                {/* Warning threshold line */}
                <line x1={PAD} y1={yVib(params.vibrationWarn)} x2={W - PAD} y2={yVib(params.vibrationWarn)} stroke="#B07B1C" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
                
                {/* Health curve */}
                <path d={healthPath} fill="none" stroke="#2C6E9B" strokeWidth="1.5" opacity="0.8" />
                {/* Vibration curve */}
                <path d={vibPath} fill="none" stroke="#C05043" strokeWidth="2.2" />

                {rulDays != null && rulDays <= horizon && (
                  <g>
                    <line x1={x(rulDays)} y1={PAD} x2={x(rulDays)} y2={H - PAD} stroke="#C05043" strokeWidth="1.5" strokeDasharray="2 3" />
                    <rect x={Math.min(x(rulDays) + 4, W - 92)} y={PAD + 2} width="88" height="18" rx="4" fill="#C05043" opacity="0.9" />
                    <text x={Math.min(x(rulDays) + 8, W - 88)} y={PAD + 15} className="font-mono font-bold" fontSize="9" fill="#FFFFFF">
                      RUL Limit: Day {rulDays}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Key Outcome Metrics */}
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3 shadow-2xs">
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] flex items-center gap-1 font-semibold">
                  <TrendingDown size={11} /> Remaining Useful Life
                </div>
                <div className={`font-mono text-[22px] font-bold mt-1 ${rulDays == null ? 'text-[#2E7D5B]' : rulDays < 14 ? 'text-[#C05043]' : 'text-[#B07B1C]'}`}>
                  {rulDays == null ? `>${horizon}` : rulDays}
                  <span className="text-[11px] font-normal text-[#8A8175] ml-1">days</span>
                </div>
                <div className="font-mono text-[9px] text-[#8A8175] mt-1">
                  {warnDays == null ? 'No threshold breach expected' : `Warning trip expected at day ${warnDays}`}
                </div>
              </div>

              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3 shadow-2xs">
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] flex items-center gap-1 font-semibold">
                  <AlertTriangle size={11} /> Failure Probability
                </div>
                <div className={`font-mono text-[22px] font-bold mt-1 ${failureProbability > 70 ? 'text-[#C05043]' : failureProbability > 40 ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}`}>
                  {failureProbability}<span className="text-[12px] font-normal text-[#8A8175] ml-0.5">%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#E6E0D6] dark:bg-[#2C3847] overflow-hidden">
                  <div className="h-full bg-[#C05043] transition-all duration-500" style={{ width: `${failureProbability}%` }} />
                </div>
              </div>

              <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg p-3 shadow-2xs">
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] flex items-center gap-1 font-semibold">
                  <Zap size={11} /> Parasitic Energy Drag
                </div>
                <div className="font-mono text-[22px] font-bold mt-1 text-[#1F2933] dark:text-[#FAF8F4]">
                  {wastedKwh}<span className="text-[11px] font-normal text-[#8A8175] ml-1">kWh / mo</span>
                </div>
                <div className="font-mono text-[9px] text-[#8A8175] mt-1">
                  {now.powerKw} kW active draw vs baseline
                </div>
              </div>
            </div>

            {/* Natural-Language Engineering Synthesis */}
            <div className={`rounded-xl border p-3.5 font-mono text-[11px] leading-relaxed flex gap-3 ${
              status === 'nominal' 
                ? 'bg-[#2E7D5B]/5 border-[#2E7D5B]/25 text-[#1F2933] dark:text-[#FAF8F4]' 
                : 'bg-[#C05043]/5 border-[#C05043]/25 text-[#1F2933] dark:text-[#FAF8F4]'
            }`}>
              {status === 'nominal' ? (
                <CheckCircle2 size={16} className="text-[#2E7D5B] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-[#C05043] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-[12px]">
                  {status === 'nominal' ? 'Optimal Machine Health Trajectory' : 'Predictive Action Recommendation'}
                </div>
                <div>
                  Under simulated <strong>{load}% duty</strong> and <strong>{ambient}°C ambient</strong>, {params.assetTag} operates at an overall health score of <strong>{now.health}/100</strong> with predicted vibration of <strong>{now.vibration} mm/s</strong> (ISO Class II limit: {params.vibrationCritical} mm/s).
                  {rulDays == null ? (
                    ' No ISO limit crossing occurs within the specified simulation horizon. Standard scheduled preventative maintenance interval remains adequate.'
                  ) : (
                    <span>
                      {' '}To avoid catastrophic raceway spalling and unplanned downtime, schedule bearing grease replacement within <strong>{Math.max(1, Math.round(rulDays * 0.6))} days</strong> (before projected Day {rulDays} limit crossing).
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
