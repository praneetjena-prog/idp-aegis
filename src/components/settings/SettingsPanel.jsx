import React, { useEffect, useMemo, useState } from 'react';
import { X, Save, RotateCcw, Cpu, Sliders, Copy, Check, Radio } from 'lucide-react';
import { Button } from '../ui/Button';
import { PARAM_FIELDS, DEFAULT_PARAMS } from '@/lib/facility';
import { getDeviceCredentials } from '@/lib/devices.functions';

const Field = ({ field, value, onChange }) => (
  <label className="block">
    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#8A8175]">
      {field.label}{field.unit ? ` (${field.unit})` : ''}
    </span>
    <input
      type={field.type}
      step={field.step}
      value={value ?? ''}
      onChange={(e) => onChange(field.type === 'number' ? e.target.value.replace(/[^0-9.\-]/g, '') : e.target.value)}
      className="mt-1 w-full bg-[#FAF8F4] border border-[#E6E0D6] rounded-md px-2.5 py-1.5 font-mono text-[12px] text-[#1F2933] focus:outline-none focus:border-[#2C6E9B] focus:ring-1 focus:ring-[#2C6E9B]/30"
    />
  </label>
);

const CopyRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#8A8175]">{label}</div>
        <div className="font-mono text-[11px] text-[#1F2933] truncate">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="shrink-0 p-1.5 rounded-md border border-[#E6E0D6] text-[#6E6558] hover:bg-[#F1EDE6]"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={12} className="text-[#2E7D5B]" /> : <Copy size={12} />}
      </button>
    </div>
  );
};

export const SettingsPanel = ({ open, onClose, params, onSave, saving, isLive, lastSeen }) => {
  const [draft, setDraft] = useState(params);
  const [view, setView] = useState('parameters');
  const [device, setDevice] = useState(null);

  useEffect(() => { if (open) setDraft(params); }, [open, params]);

  useEffect(() => {
    if (!open || device) return;
    getDeviceCredentials().then(setDevice).catch(() => setDevice(null));
  }, [open, device]);

  const endpoint = useMemo(
    () => (typeof window === 'undefined' ? '' : `${window.location.origin}/api/public/ingest`),
    [],
  );

  if (!open) return null;

  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-[#1F2933]/25 backdrop-blur-[2px]">
      <button type="button" aria-label="Close settings" className="flex-1" onClick={onClose} />
      <div className="w-full max-w-[520px] h-full bg-[#FFFFFF] border-l border-[#D2C9BA] shadow-2xl flex flex-col">
        <div className="px-4 py-3 border-b border-[#E6E0D6] flex items-center justify-between">
          <div>
            <div className="font-mono text-[12px] font-bold tracking-[0.08em] uppercase text-[#1F2933]">Facility Configuration</div>
            <div className="font-mono text-[10px] text-[#8A8175] mt-0.5">Drives the Live Console, thresholds and forecasts</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-[#6E6558] hover:bg-[#F1EDE6]" aria-label="Close"><X size={16} /></button>
        </div>

        <div className="px-4 pt-3 flex items-center gap-1">
          {[
            { id: 'parameters', label: 'Parameters', icon: Sliders },
            { id: 'hardware', label: 'Sensor Node', icon: Cpu },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${view === v.id ? 'bg-[#2C6E9B] text-[#FFFFFF]' : 'text-[#6E6558] hover:bg-[#F1EDE6]'}`}
            >
              <v.icon size={11} /> {v.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {view === 'parameters' && PARAM_FIELDS.map(group => (
            <div key={group.group}>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6E6558] pb-2 mb-3 border-b border-[#F1EDE6]">{group.group}</div>
              <div className="grid grid-cols-2 gap-3">
                {group.fields.map(f => (
                  <Field key={f.key} field={f} value={draft[f.key]} onChange={(v) => set(f.key, v)} />
                ))}
              </div>
            </div>
          ))}

          {view === 'hardware' && (
            <div className="space-y-4">
              <div className={`rounded-lg border p-3 flex items-center gap-2.5 ${isLive ? 'bg-[#2E7D5B]/5 border-[#2E7D5B]/25' : 'bg-[#F1EDE6] border-[#E6E0D6]'}`}>
                <Radio size={14} className={isLive ? 'text-[#2E7D5B]' : 'text-[#8A8175]'} />
                <div className="font-mono text-[11px] text-[#3E4650]">
                  {isLive
                    ? `Hardware reporting • last reading ${new Date(lastSeen).toLocaleTimeString('en-GB')}`
                    : 'No hardware reporting yet — the console is showing the demonstration feed.'}
                </div>
              </div>

              <div className="rounded-lg border border-[#E6E0D6] bg-[#FAF8F4] p-3 space-y-3">
                <CopyRow label="Endpoint" value={endpoint} />
                <CopyRow label="Device ID" value={device?.deviceId ?? 'loading…'} />
                <CopyRow label="Ingest key" value={device?.ingestKey ?? 'loading…'} />
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6E6558] pb-2 mb-2 border-b border-[#F1EDE6]">What your node should send</div>
                <pre className="bg-[#FAF8F4] border border-[#E6E0D6] rounded-lg p-3 font-mono text-[10px] leading-relaxed text-[#3E4650] overflow-x-auto">{`POST ${endpoint || '/api/public/ingest'}
Content-Type: application/json

{
  "device_id": "${device?.deviceId ?? 'aegis-node-01'}",
  "key": "<ingest key>",
  "asset": "${draft.assetTag}",
  "readings": [
    { "metric": "vibration",    "value": 2.14, "unit": "mm/s" },
    { "metric": "current",      "value": 13.8, "unit": "A" },
    { "metric": "temperature",  "value": 41.2, "unit": "C" },
    { "metric": "humidity",     "value": 54.0, "unit": "%" },
    { "metric": "flow",         "value": 96.0, "unit": "L/min" },
    { "metric": "light",        "value": 310,  "unit": "lux" },
    { "metric": "gas",          "value": 120,  "unit": "ppm" }
  ]
}`}</pre>
                <div className="font-mono text-[10px] text-[#8A8175] mt-2 leading-relaxed">
                  A ready-to-flash ESP32 sketch for your DHT22 / MPU6050 / ACS712 / flow / LDR / MQ-2 kit is in <span className="text-[#3E4650]">docs/esp32/aegis_node.ino</span>. As soon as readings arrive the console switches from the demonstration feed to your hardware.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-[#E6E0D6] flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => setDraft(DEFAULT_PARAMS)}>
            <RotateCcw size={11} className="mr-1.5" /> Reset
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={saving} onClick={async () => { await onSave(draft); onClose(); }}>
              <Save size={11} className="mr-1.5" /> {saving ? 'Saving…' : 'Save parameters'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
