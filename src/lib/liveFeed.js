import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Metrics the ESP32 node reports, mapped to the console's short names. */
export const METRIC_MAP = {
  vibration: 'vib',
  current: 'cur',
  temperature: 'temp',
  humidity: 'humidity',
  flow: 'flow',
  light: 'light',
  gas: 'gas',
  acoustic: 'acoustic',
};

const STALE_MS = 90_000;

/**
 * Streams the newest reading per metric from Aegis Telemetry Cloud.
 * Falls back to the built-in demonstration feed until real hardware reports in.
 */
export function useLiveFeed(feedMode, params) {
  const [readings, setReadings] = useState({});
  const [lastSeen, setLastSeen] = useState(null);
  const [demo, setDemo] = useState({ vib: 6.8, cur: 17.6, temp: 71.8, acoustic: 12 });
  const [, forceTick] = useState(0);
  const seenRef = useRef(null);

  // Initial load of the latest value for each metric.
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('sensor_readings')
      .select('metric, value, unit, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (cancelled || !data?.length) return;
        const next = {};
        for (const row of data) {
          if (!next[row.metric]) next[row.metric] = row;
        }
        setReadings(next);
        setLastSeen(data[0].recorded_at);
        seenRef.current = data[0].recorded_at;
      });
    return () => { cancelled = true; };
  }, []);

  // Poll local Flask backend if available (http://localhost:5000/api/latest)
  useEffect(() => {
    let active = true;
    const checkFlask = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/latest', { 
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(1200) 
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !data || data.message || data.error) return;

        const next = {};
        if (data.vibration != null) next.vibration = { metric: 'vibration', value: data.vibration, unit: 'mm/s' };
        if (data.current != null) next.current = { metric: 'current', value: data.current, unit: 'A' };
        if (data.temperature != null) next.temperature = { metric: 'temperature', value: data.temperature, unit: '°C' };
        if (data.humidity != null) next.humidity = { metric: 'humidity', value: data.humidity, unit: '%' };
        if (data.flow != null) next.flow = { metric: 'flow', value: data.flow, unit: 'L/min' };
        if (data.light != null) next.light = { metric: 'light', value: data.light, unit: 'lux' };
        if (data.gas != null) next.gas = { metric: 'gas', value: data.gas, unit: 'ppm' };

        setReadings(prev => ({ ...prev, ...next }));
        const ts = data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();
        setLastSeen(ts);
        seenRef.current = ts;
      } catch {
        // Flask is offline or unreachable; silently rely on fallback demo
      }
    };

    checkFlask();
    const interval = setInterval(checkFlask, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Live stream of new readings.
  useEffect(() => {
    const channel = supabase
      .channel('sensor-readings-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        const row = payload.new;
        setReadings(prev => ({ ...prev, [row.metric]: row }));
        setLastSeen(row.recorded_at);
        seenRef.current = row.recorded_at;
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Demonstration feed, used while no hardware is reporting.
  useEffect(() => {
    const iv = setInterval(() => {
      forceTick(t => t + 1);
      setDemo(() => (feedMode === 'fault'
        ? {
            vib: +(6.5 + Math.random() * 0.7).toFixed(1),
            cur: +(17.2 + Math.random() * 0.9).toFixed(1),
            temp: +(70 + Math.random() * 4).toFixed(1),
            acoustic: Math.floor(10 + Math.random() * 5),
          }
        : {
            vib: +(2.0 + Math.random() * 0.4).toFixed(1),
            cur: +(14.0 + Math.random() * 0.4).toFixed(1),
            temp: +(53 + Math.random() * 2.5).toFixed(1),
            acoustic: Math.floor(Math.random() * 3),
          }));
    }, 1800);
    return () => clearInterval(iv);
  }, [feedMode]);

  const isLive = !!lastSeen && Date.now() - new Date(lastSeen).getTime() < STALE_MS;

  const values = useMemo(() => {
    if (!isLive) return demo;
    const pick = (metric, fallback) => {
      const row = readings[metric];
      return row ? +Number(row.value).toFixed(1) : fallback;
    };
    return {
      vib: pick('vibration', demo.vib),
      cur: pick('current', demo.cur),
      temp: pick('temperature', demo.temp),
      acoustic: pick('acoustic', demo.acoustic),
      humidity: pick('humidity', null),
      flow: pick('flow', null),
      light: pick('light', null),
      gas: pick('gas', null),
    };
  }, [isLive, readings, demo]);

  return { values, isLive, lastSeen, readings, source: isLive ? 'hardware' : 'demonstration' };
}
