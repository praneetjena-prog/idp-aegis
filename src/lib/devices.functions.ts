import { createServerFn } from '@tanstack/react-start';

export type DeviceCredentials = {
  deviceId: string;
  label: string;
  ingestKey: string;
  lastSeenAt: string | null;
};

/** Returns the ESP32 node's identity and ingest key for the settings panel. */
export const getDeviceCredentials = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DeviceCredentials | null> => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data } = await supabaseAdmin
      .from('devices')
      .select('id, label, ingest_key, last_seen_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    return {
      deviceId: data.id,
      label: data.label,
      ingestKey: data.ingest_key,
      lastSeenAt: data.last_seen_at,
    };
  },
);
