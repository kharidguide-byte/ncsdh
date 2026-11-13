-- Record Supabase Auth signups for the admin dashboard.
-- Run after migrations 001, 002, and 003 in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.signup_requests (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  mobile TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_signup_requests_status_created
  ON public.signup_requests(status, created_at DESC);

ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own signup request" ON public.signup_requests;
DROP POLICY IF EXISTS "Admins read signup requests" ON public.signup_requests;
DROP POLICY IF EXISTS "Admins review signup requests" ON public.signup_requests;

CREATE POLICY "Users read own signup request"
  ON public.signup_requests FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins read signup requests"
  ON public.signup_requests FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'ncsdh_role') IN ('admin', 'super_admin'));

CREATE POLICY "Admins review signup requests"
  ON public.signup_requests FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'ncsdh_role') IN ('admin', 'super_admin'))
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'ncsdh_role') IN ('admin', 'super_admin'));

REVOKE ALL ON public.signup_requests FROM anon;
REVOKE INSERT, DELETE ON public.signup_requests FROM authenticated;
GRANT SELECT, UPDATE ON public.signup_requests TO authenticated;

CREATE OR REPLACE FUNCTION public.record_ncsdh_signup_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.signup_requests (id, email, full_name, mobile)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data ->> 'mobile', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ncsdh_auth_user_created ON auth.users;
CREATE TRIGGER on_ncsdh_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.record_ncsdh_signup_request();

-- Include accounts that were created before this migration was installed.
INSERT INTO public.signup_requests (id, email, full_name, mobile, created_at)
SELECT
  id,
  email,
  COALESCE(NULLIF(raw_user_meta_data ->> 'full_name', ''), split_part(email, '@', 1)),
  NULLIF(raw_user_meta_data ->> 'mobile', ''),
  created_at
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Admins must be explicitly assigned in Supabase Auth app_metadata (never user_metadata):
-- { "ncsdh_role": "admin" }
-- Then sign out and back in so the JWT includes the admin claim.
