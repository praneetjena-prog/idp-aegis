-- Devices (ESP32 nodes). Ingest keys are never exposed to anon.
CREATE TABLE public.devices (
  id text PRIMARY KEY,
  label text NOT NULL,
  ingest_key text NOT NULL UNIQUE,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages devices"
  ON public.devices FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Sensor readings streamed from the hardware.
CREATE TABLE public.sensor_readings (
  id bigserial PRIMARY KEY,
  device_id text NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  asset text NOT NULL DEFAULT 'AHU-03',
  metric text NOT NULL,
  value double precision NOT NULL,
  unit text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sensor_readings_recent_idx
  ON public.sensor_readings (metric, recorded_at DESC);
CREATE INDEX sensor_readings_device_idx
  ON public.sensor_readings (device_id, recorded_at DESC);

GRANT SELECT ON public.sensor_readings TO anon;
GRANT SELECT ON public.sensor_readings TO authenticated;
GRANT ALL ON public.sensor_readings TO service_role;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "readings are publicly readable"
  ON public.sensor_readings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "service role writes readings"
  ON public.sensor_readings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Facility parameters that drive the console and the forecast model.
CREATE TABLE public.facility_settings (
  id text PRIMARY KEY DEFAULT 'default',
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.facility_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.facility_settings TO authenticated;
GRANT ALL ON public.facility_settings TO service_role;
ALTER TABLE public.facility_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings readable"
  ON public.facility_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings insertable"
  ON public.facility_settings FOR INSERT TO anon, authenticated WITH CHECK (id = 'default');
CREATE POLICY "settings updatable"
  ON public.facility_settings FOR UPDATE TO anon, authenticated USING (id = 'default') WITH CHECK (id = 'default');
CREATE POLICY "service role manages settings"
  ON public.facility_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;

INSERT INTO public.devices (id, label, ingest_key)
VALUES ('aegis-node-01', 'Aegis Node 01 (ESP32 DevKit)', encode(gen_random_bytes(24), 'hex'));

INSERT INTO public.facility_settings (id, params) VALUES ('default', jsonb_build_object(
  'facilityName', 'Aegis Demonstration Facility',
  'assetTag', 'AHU-03',
  'assetType', 'Air Handling Unit',
  'ratedCurrentA', 14.2,
  'ratedFlowLpm', 120,
  'vibrationWarn', 1.8,
  'vibrationCritical', 2.5,
  'currentWarn', 12.5,
  'currentCritical', 14.2,
  'tempWarn', 45,
  'tempCritical', 52,
  'humidityWarn', 70,
  'gasWarn', 300,
  'flowMin', 60,
  'lightMin', 120,
  'operatingHoursPerDay', 16,
  'lastServiceDate', '2026-06-01'
));