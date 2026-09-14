export type DeviceCredentials = {
  deviceId: string;
  label: string;
  ingestKey: string;
  lastSeenAt: string | null;
};

/** Returns the ESP32 node's identity and ingest key for the settings panel. */
export async function getDeviceCredentials(): Promise<DeviceCredentials | null> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase
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
  } catch {
    return null;
  }
}
