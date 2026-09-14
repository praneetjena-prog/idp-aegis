import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_PARAMS = {
  facilityName: 'Aegis Demonstration Facility',
  assetTag: 'AHU-03',
  assetType: 'Air Handling Unit',
  ratedCurrentA: 14.2,
  ratedFlowLpm: 120,
  vibrationWarn: 1.8,
  vibrationCritical: 2.5,
  currentWarn: 12.5,
  currentCritical: 14.2,
  tempWarn: 45,
  tempCritical: 52,
  humidityWarn: 70,
  gasWarn: 300,
  flowMin: 60,
  lightMin: 120,
  operatingHoursPerDay: 16,
  lastServiceDate: '2026-06-01',
};

export const PARAM_FIELDS = [
  { group: 'Facility & asset', fields: [
    { key: 'facilityName', label: 'Facility name', type: 'text' },
    { key: 'assetTag', label: 'Asset tag', type: 'text' },
    { key: 'assetType', label: 'Asset type', type: 'text' },
    { key: 'lastServiceDate', label: 'Last service date', type: 'date' },
    { key: 'operatingHoursPerDay', label: 'Operating hours / day', type: 'number', unit: 'h', step: 1 },
  ]},
  { group: 'Nameplate ratings', fields: [
    { key: 'ratedCurrentA', label: 'Rated motor current', type: 'number', unit: 'A', step: 0.1 },
    { key: 'ratedFlowLpm', label: 'Rated water flow', type: 'number', unit: 'L/min', step: 1 },
  ]},
  { group: 'Alarm thresholds', fields: [
    { key: 'vibrationWarn', label: 'Vibration warning', type: 'number', unit: 'mm/s', step: 0.1 },
    { key: 'vibrationCritical', label: 'Vibration critical', type: 'number', unit: 'mm/s', step: 0.1 },
    { key: 'currentWarn', label: 'Current warning', type: 'number', unit: 'A', step: 0.1 },
    { key: 'currentCritical', label: 'Current critical', type: 'number', unit: 'A', step: 0.1 },
    { key: 'tempWarn', label: 'Temperature warning', type: 'number', unit: '\u00b0C', step: 0.5 },
    { key: 'tempCritical', label: 'Temperature critical', type: 'number', unit: '\u00b0C', step: 0.5 },
    { key: 'humidityWarn', label: 'Humidity warning', type: 'number', unit: '%', step: 1 },
    { key: 'gasWarn', label: 'Gas / smoke warning', type: 'number', unit: 'ppm', step: 10 },
    { key: 'flowMin', label: 'Minimum acceptable flow', type: 'number', unit: 'L/min', step: 1 },
    { key: 'lightMin', label: 'Minimum lighting level', type: 'number', unit: 'lux', step: 10 },
  ]},
];

const NUMERIC_KEYS = PARAM_FIELDS.flatMap(g => g.fields).filter(f => f.type === 'number').map(f => f.key);

export function normaliseParams(raw) {
  const merged = { ...DEFAULT_PARAMS, ...(raw || {}) };
  for (const key of NUMERIC_KEYS) {
    const n = Number(merged[key]);
    merged[key] = Number.isFinite(n) ? n : DEFAULT_PARAMS[key];
  }
  return merged;
}

/** Loads the facility parameters from Aegis Cloud, with local defaults as fallback. */
export function useFacilityParams() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('facility_settings')
      .select('params')
      .eq('id', 'default')
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.params) setParams(normaliseParams(data.params));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async (next) => {
    const clean = normaliseParams(next);
    setSaving(true);
    setParams(clean);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setSaving(false);
      return { message: 'Sign in to change facility settings.' };
    }
    const { error } = await supabase
      .from('facility_settings')
      .upsert({ id: 'default', params: clean, updated_at: new Date().toISOString() });
    setSaving(false);
    return error;
  }, []);

  return { params, setParams, save, loading, saving };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Physics-flavoured degradation model for a rotating asset.
 * Wear index w (0 = new bearing, 1 = seized) drives every predicted signal.
 */
export function simulateState(params, { load = 0.85, ambientC = 30, wear = 0 }) {
  const w = clamp(wear, 0, 1);
  const l = clamp(load, 0.2, 1.25);

  const vibration = 1.25 * (0.55 + 0.45 * l) * (1 + 4.2 * Math.pow(w, 1.35));
  const current = params.ratedCurrentA * (0.5 + 0.5 * l) * (1 + 0.42 * Math.pow(w, 1.2));
  const temperature = ambientC + 16 * l + 30 * Math.pow(w, 1.1);
  const flow = params.ratedFlowLpm * (0.55 + 0.45 * l) * (1 - 0.5 * w);
  const acoustic = 1 + 22 * Math.pow(w, 1.4) * l;
  const powerKw = (Math.sqrt(3) * 415 * current * 0.94) / 1000;
  const baselineKw = (Math.sqrt(3) * 415 * params.ratedCurrentA * (0.5 + 0.5 * l) * 0.94) / 1000;

  const strain = Math.max(
    vibration / Math.max(params.vibrationCritical, 0.1),
    current / Math.max(params.currentCritical, 0.1),
    temperature / Math.max(params.tempCritical, 1),
  );
  const health = clamp(Math.round(100 - 78 * Math.pow(w, 0.9) - 12 * Math.max(0, strain - 1)), 2, 100);

  return {
    wear: w,
    vibration: +vibration.toFixed(2),
    current: +current.toFixed(2),
    temperature: +temperature.toFixed(1),
    flow: +flow.toFixed(1),
    acoustic: +acoustic.toFixed(1),
    powerKw: +powerKw.toFixed(2),
    excessKw: +Math.max(0, powerKw - baselineKw).toFixed(2),
    health,
    strain: +strain.toFixed(2),
  };
}

/** Daily wear growth: duty cycle, load and thermal stress all accelerate it. */
export function wearRate(params, { load, ambientC, wear, severity }) {
  const duty = clamp((params.operatingHoursPerDay || 16) / 24, 0.05, 1);
  const thermal = 1 + Math.max(0, ambientC - 30) / 45;
  const loadFactor = Math.pow(clamp(load, 0.2, 1.25), 2.1);
  const base = 0.0011 + 0.0075 * clamp(severity, 0, 1);
  return base * duty * thermal * loadFactor * (1 + 1.6 * wear);
}

/**
 * Runs the model forward day by day and returns the projection, remaining
 * useful life and failure probability against the facility's own thresholds.
 */
export function runForecast(params, controls) {
  const { load = 0.85, ambientC = 30, severity = 0.35, horizonDays = 90 } = controls || {};
  let wear = clamp(controls?.wear ?? 0.08, 0, 1);

  const series = [];
  let rulDays = null;
  let warnDays = null;

  for (let day = 0; day <= horizonDays; day += 1) {
    const state = simulateState(params, { load, ambientC, wear });
    series.push({ day, ...state });
    if (warnDays === null && state.vibration >= params.vibrationWarn) warnDays = day;
    if (rulDays === null && (state.vibration >= params.vibrationCritical || state.temperature >= params.tempCritical)) rulDays = day;
    wear = clamp(wear + wearRate(params, { load, ambientC, wear, severity }), 0, 1);
  }

  const now = series[0];
  const horizonState = series[series.length - 1];
  const margin = now.vibration / Math.max(params.vibrationCritical, 0.1);
  const failureProbability = clamp(Math.round(100 / (1 + Math.exp(-7.5 * (margin - 0.82)))), 1, 99);

  const hoursPerDay = params.operatingHoursPerDay || 16;
  const wastedKwh = +(now.excessKw * hoursPerDay * 30).toFixed(0);

  return {
    series,
    now,
    horizonState,
    rulDays,
    warnDays,
    failureProbability,
    wastedKwh,
    status: now.vibration >= params.vibrationCritical || now.temperature >= params.tempCritical
      ? 'critical'
      : now.vibration >= params.vibrationWarn || now.temperature >= params.tempWarn
        ? 'warning'
        : 'nominal',
  };
}

/** Back-solves the wear index that explains the readings currently on the bus. */
export function inferWear(params, reading) {
  if (!reading) return 0.08;
  const v = Number(reading.vib);
  if (!Number.isFinite(v)) return 0.08;
  const baseline = 1.25 * (0.55 + 0.45 * 0.85);
  const ratio = Math.max(0, v / baseline - 1) / 4.2;
  return clamp(Math.pow(ratio, 1 / 1.35), 0, 1);
}

export function metricStatus(params, metric, value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 'nominal';
  switch (metric) {
    case 'vibration': return v >= params.vibrationCritical ? 'critical' : v >= params.vibrationWarn ? 'warning' : 'nominal';
    case 'current': return v >= params.currentCritical ? 'critical' : v >= params.currentWarn ? 'warning' : 'nominal';
    case 'temperature': return v >= params.tempCritical ? 'critical' : v >= params.tempWarn ? 'warning' : 'nominal';
    case 'humidity': return v >= params.humidityWarn ? 'warning' : 'nominal';
    case 'gas': return v >= params.gasWarn ? 'critical' : 'nominal';
    case 'flow': return v <= params.flowMin ? 'warning' : 'nominal';
    case 'light': return v <= params.lightMin ? 'advisory' : 'nominal';
    default: return 'nominal';
  }
}
