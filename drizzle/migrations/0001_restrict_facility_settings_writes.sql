DROP POLICY IF EXISTS "settings updatable" ON public.facility_settings;
DROP POLICY IF EXISTS "settings insertable" ON public.facility_settings;

REVOKE INSERT, UPDATE, DELETE ON public.facility_settings FROM anon;
GRANT SELECT ON public.facility_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.facility_settings TO authenticated;

CREATE POLICY "settings insertable by authenticated"
ON public.facility_settings
FOR INSERT
TO authenticated
WITH CHECK (id = 'default'::text);

CREATE POLICY "settings updatable by authenticated"
ON public.facility_settings
FOR UPDATE
TO authenticated
USING (id = 'default'::text)
WITH CHECK (id = 'default'::text);