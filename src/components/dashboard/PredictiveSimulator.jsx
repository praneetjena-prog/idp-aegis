import React, { useMemo, useState } from 'react';
import { Activity, Zap, Thermometer, Droplets, Gauge, TrendingDown, AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { runForecast, inferWear } from '@/lib/facility';

const Slider = ({ label, value, min, max, step, unit, onChange, hint }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#8A8175]">{label}</span>
      <span className="font-mono text-[12px] font-bold text-[#1F2933]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full mt-1.5 accent-[#2C6E9B]"
    />
    {hint && <div className="font-mono text-[9px] text-[#A99F90] mt-0.5">{hint}</div>}
  </div>
);

const Readout = ({ icon: Icon, label, value, unit, limit, status }) => {
  const tone = status === 'critical' ? 'text-[#C05043]' : status === 'warning' ? 'text-[#B07B1C]' : 'text-[#1F2933]';
  return (
    <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#8A8175]">
        <Icon size={10} /> {label}
      </div>
      <div className={`font-mono text-[16px] font-bold mt-1 ${tone}`}>{value}<span className="text-[10px] font-normal text-[#8A8175] ml-0.5">{unit}</span></div>
      {limit != null && <div className="font-mono text-[9px] text-[#A99F90] mt-0.5">Limit {limit}{unit}</div>}
    </div>
  );
};

export const PredictiveSimulator = ({ params, liveValues, isLive }) => {
  const [load, setLoad] = useState(85);
  const [ambient, setAmbient] = useState(30);
  const [severity, setSeverity] = useState(35);
  const [horizon, setHorizon] = useState(90);
  const [wear, setWear] = useState(8);

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

  const matchLive = () => {
    const inferred = Math.round(inferWear(params, liveValues) * 100);
    setWear(Math.min(95, Math.max(1, inferred)));
  };

  // Projection chart geometry
  const W = 560, H = 150, PAD = 8;
  const maxVib = Math.max(params.vibrationCritical * 1.35, ...series.map(s => s.vibration));
  const x = (d) => PAD + (d / horizon) * (W - PAD * 2);
  const yVib = (v) => H - PAD - (v / maxVib) * (H - PAD * 2);
  const yHealth = (h) => H - PAD - (h / 100) * (H - PAD * 2);
  const vibPath = series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.day).toFixed(1)} ${yVib(s.vibration).toFixed(1)}`).join(' ');
  const healthPath = series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.day).toFixed(1)} ${yHealth(s.health).toFixed(1)}`).join(' ');

  const statusLabel = status === 'critical' ? 'Action Required' : status === 'warning' ? 'Watch' : 'Nominal';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictive Model • {params.assetTag} {params.assetType}</CardTitle>
        <Badge variant={status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : 'nominal'}>{statusLabel}</Badge>
      </CardHeader>

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6E6558] pb-2 border-b border-[#F1EDE6]">Operating inputs</div>
          <Slider label="Duty load" value={load} min={20} max={120} step={1} unit="%" onChange={setLoad} hint={`${params.ratedCurrentA} A rated • ${params.operatingHoursPerDay} h/day`} />
          <Slider label="Ambient temperature" value={ambient} min={10} max={50} step={1} unit="°C" onChange={setAmbient} />
          <Slider label="Bearing wear now" value={wear} min={0} max={95} step={1} unit="%" onChange={setWear} hint="0% = freshly serviced" />
          <Slider label="Degradation severity" value={severity} min={0} max={100} step={1} unit="%" onChange={setSeverity} hint="How aggressively the fault is progressing" />
          <Slider label="Forecast horizon" value={horizon} min={14} max={365} step={1} unit=" days" onChange={setHorizon} />
          <Button variant="secondary" className="w-full" onClick={matchLive}>
            <Crosshair size={11} className="mr-1.5" /> Fit model to {isLive ? 'live' : 'current'} readings
          </Button>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Readout icon={Activity} label="Vibration" value={now.vibration} unit=" mm/s" limit={params.vibrationCritical} status={now.vibration >= params.vibrationCritical ? 'critical' : now.vibration >= params.vibrationWarn ? 'warning' : 'nominal'} />
            <Readout icon={Zap} label="Current" value={now.current} unit=" A" limit={params.currentCritical} status={now.current >= params.currentCritical ? 'critical' : now.current >= params.currentWarn ? 'warning' : 'nominal'} />
            <Readout icon={Thermometer} label="Temperature" value={now.temperature} unit=" °C" limit={params.tempCritical} status={now.temperature >= params.tempCritical ? 'critical' : now.temperature >= params.tempWarn ? 'warning' : 'nominal'} />
            <Readout icon={Droplets} label="Flow" value={now.flow} unit=" L/min" limit={params.flowMin} status={now.flow <= params.flowMin ? 'warning' : 'nominal'} />
            <Readout icon={Gauge} label="Health index" value={now.health} unit="/100" status={now.health < 45 ? 'critical' : now.health < 70 ? 'warning' : 'nominal'} />
          </div>

          <div className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6558]">Projection • next {horizon} days</span>
              <div className="flex items-center gap-3 font-mono text-[9px] text-[#8A8175]">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#C05043] inline-block" /> Vibration</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#2C6E9B] inline-block" /> Health</span>
                <span className="flex items-center gap-1"><span className="w-3 border-t border-dashed border-[#A99F90] inline-block" /> Critical limit</span>
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]">
              <line x1={PAD} y1={yVib(params.vibrationCritical)} x2={W - PAD} y2={yVib(params.vibrationCritical)} stroke="#C05043" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
              <line x1={PAD} y1={yVib(params.vibrationWarn)} x2={W - PAD} y2={yVib(params.vibrationWarn)} stroke="#B07B1C" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
              <path d={healthPath} fill="none" stroke="#2C6E9B" strokeWidth="1.5" opacity="0.75" />
              <path d={vibPath} fill="none" stroke="#C05043" strokeWidth="2" />
              {rulDays != null && rulDays <= horizon && (
                <g>
                  <line x1={x(rulDays)} y1={PAD} x2={x(rulDays)} y2={H - PAD} stroke="#C05043" strokeWidth="1" strokeDasharray="2 3" />
                  <text x={Math.min(x(rulDays) + 4, W - 90)} y={PAD + 10} className="font-mono" fontSize="9" fill="#C05043">limit day {rulDays}</text>
                </g>
              )}
            </svg>
          </div>

          <div className="grid md:grid-cols-3 gap-2">
            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#8A8175] flex items-center gap-1"><TrendingDown size={10} /> Remaining useful life</div>
              <div className={`font-mono text-[20px] font-bold mt-1 ${rulDays == null ? 'text-[#2E7D5B]' : rulDays < 14 ? 'text-[#C05043]' : 'text-[#B07B1C]'}`}>
                {rulDays == null ? `>${horizon}` : rulDays}<span className="text-[11px] font-normal text-[#8A8175] ml-1">days</span>
              </div>
              <div className="font-mono text-[9px] text-[#A99F90] mt-1">
                {warnDays == null ? 'No warning crossing in horizon' : `Warning threshold on day ${warnDays}`}
              </div>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#8A8175] flex items-center gap-1"><AlertTriangle size={10} /> Failure probability</div>
              <div className={`font-mono text-[20px] font-bold mt-1 ${failureProbability > 70 ? 'text-[#C05043]' : failureProbability > 40 ? 'text-[#B07B1C]' : 'text-[#2E7D5B]'}`}>
                {failureProbability}<span className="text-[11px] font-normal text-[#8A8175] ml-0.5">%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[#F1EDE6] overflow-hidden">
                <div className="h-full bg-[#C05043] transition-all duration-500" style={{ width: `${failureProbability}%` }} />
              </div>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E0D6] rounded-lg p-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#8A8175] flex items-center gap-1"><Zap size={10} /> Excess energy / month</div>
              <div className="font-mono text-[20px] font-bold mt-1 text-[#1F2933]">
                {wastedKwh}<span className="text-[11px] font-normal text-[#8A8175] ml-1">kWh</span>
              </div>
              <div className="font-mono text-[9px] text-[#A99F90] mt-1">{now.powerKw} kW drawn vs nameplate duty</div>
            </div>
          </div>

          <div className={`rounded-lg border p-3 font-mono text-[11px] leading-relaxed flex gap-2.5 ${status === 'nominal' ? 'bg-[#2E7D5B]/5 border-[#2E7D5B]/20 text-[#3E4650]' : 'bg-[#C05043]/5 border-[#C05043]/20 text-[#3E4650]'}`}>
            {status === 'nominal' ? <CheckCircle2 size={14} className="text-[#2E7D5B] shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="text-[#C05043] shrink-0 mt-0.5" />}
            <span>
              At {load}% duty and {ambient}°C ambient, {params.assetTag} sits at a health index of {now.health}/100 with vibration {now.vibration} mm/s against your {params.vibrationCritical} mm/s limit.
              {rulDays == null
                ? ` No threshold crossing within ${horizon} days — keep the current service interval.`
                : ` Schedule the bearing intervention within ${Math.max(1, Math.round(rulDays * 0.6))} days to stay ahead of the ${rulDays}-day limit crossing.`}
              {` Motor draw is ${now.current} A against ${params.ratedCurrentA} A rated.`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
