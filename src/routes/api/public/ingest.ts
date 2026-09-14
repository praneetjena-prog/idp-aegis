import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const readingSchema = z.object({
  metric: z.string().min(1).max(40),
  value: z.number().finite(),
  unit: z.string().max(16).optional(),
  asset: z.string().max(40).optional(),
});

const payloadSchema = z.object({
  device_id: z.string().min(1).max(64),
  key: z.string().min(16).max(128),
  asset: z.string().max(40).optional(),
  readings: z.array(readingSchema).min(1).max(32),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const Route = createFileRoute('/api/public/ingest')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = payloadSchema.parse(await request.json());
        } catch {
          return json({ error: 'Invalid payload' }, 400);
        }

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

        const { data: device } = await supabaseAdmin
          .from('devices')
          .select('id, ingest_key')
          .eq('id', parsed.device_id)
          .maybeSingle();

        if (!device || device.ingest_key !== parsed.key) {
          return json({ error: 'Unauthorized device' }, 401);
        }

        const recordedAt = new Date().toISOString();
        const rows = parsed.readings.map((r) => ({
          device_id: device.id,
          asset: r.asset ?? parsed.asset ?? 'AHU-03',
          metric: r.metric,
          value: r.value,
          unit: r.unit ?? null,
          recorded_at: recordedAt,
        }));

        const { error } = await supabaseAdmin.from('sensor_readings').insert(rows);
        if (error) return json({ error: error.message }, 500);

        await supabaseAdmin.from('devices').update({ last_seen_at: recordedAt }).eq('id', device.id);

        return json({ ok: true, accepted: rows.length, recorded_at: recordedAt });
      },
    },
  },
});
