-- Migration: 0003_secure_oauth_role_assignment.sql
-- Description: Self-contained, resilient migration creating/updating public.profiles,
--              enforcing secure Google OAuth role assignment, feature_user default,
--              facility_id binding, and strict Row Level Security (RLS).

-- 1. Create table public.profiles if it does not exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'feature_user',
  facility_id text,
  last_sign_in_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Ensure facility_id column exists and default role is feature_user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facility_id text;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'feature_user';

-- 3. Sanitize existing profiles: preserve valid roles, normalize null/unknown to feature_user
UPDATE public.profiles
SET role = 'feature_user'
WHERE role IS NULL OR role NOT IN ('technician', 'manager', 'auditor', 'feature_user');

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop any existing broad or permissive policies
DROP POLICY IF EXISTS "Profiles readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 6. Restrict SELECT: authenticated users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 7. Revoke client mutation privileges (profiles are managed via trigger or administrative processes)
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 8. Enable Realtime on profiles (safe add)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 9. Secure automatic profile creation trigger for Google OAuth and Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    facility_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'feature_user',
    NULL,
    now(),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    last_sign_in_at = now(),
    full_name = COALESCE(excluded.full_name, profiles.full_name),
    avatar_url = COALESCE(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
    -- Crucial: role and facility_id are preserved, never overwritten from Google metadata
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 10. Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
