-- Keep the application user/profile tables synchronized with Supabase Auth.
-- Run after migrations 001-004 and seed.sql.

-- Supabase Auth owns passwords; never copy password hashes into public.users.
ALTER TABLE public.users
  ALTER COLUMN password_hash DROP NOT NULL;

INSERT INTO public.roles (name, nepali_label, description, hierarchy_level) VALUES
  ('registered_user', 'दर्ता प्रयोगकर्ता', 'साधारण दर्ता भएका प्रयोगकर्ता', 2),
  ('verified_employee', 'प्रमाणित निजामती कर्मचारी', 'प्रमाणित निजामती कर्मचारी', 3),
  ('content_contributor', 'सामग्री योगदानकर्ता', 'सामग्री तथा मस्यौदा थप गर्न पाउने कर्मचारी', 4),
  ('content_editor', 'सामग्री सम्पादक', 'कानुन तथा परिपत्र सम्पादन गर्न पाउने अधिकृत', 5),
  ('admin', 'प्रणाली प्रशासक', 'प्रणाली प्रशासक', 6),
  ('super_admin', 'मुख्य प्रशासक', 'सम्पूर्ण प्रणाली नियन्त्रण गर्ने सुपर एडमिन', 7)
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_ncsdh_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role_name TEXT;
  v_role_id UUID;
  v_full_name TEXT;
  v_mobile TEXT;
  v_service_tier TEXT;
BEGIN
  v_role_name := CASE
    WHEN NEW.raw_app_meta_data ->> 'ncsdh_role' IN (
      'registered_user', 'verified_employee', 'content_contributor',
      'content_editor', 'admin', 'super_admin'
    ) THEN NEW.raw_app_meta_data ->> 'ncsdh_role'
    ELSE 'registered_user'
  END;

  SELECT r.id INTO v_role_id
  FROM public.roles AS r
  WHERE r.name = v_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Required NCSDH role % is missing from public.roles', v_role_name;
  END IF;

  v_full_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'प्रयोगकर्ता'
  );
  v_mobile := NULLIF(NEW.raw_user_meta_data ->> 'mobile', '');
  v_service_tier := CASE
    WHEN NEW.raw_user_meta_data ->> 'service_tier' IN ('सङ्घीय', 'प्रदेश', 'स्थानीय तह')
      THEN NEW.raw_user_meta_data ->> 'service_tier'
    ELSE 'सङ्घीय'
  END;

  INSERT INTO public.users (
    id, email, password_hash, full_name, mobile, role_id, is_verified_employee
  )
  VALUES (
    NEW.id, NEW.email, NULL, v_full_name, v_mobile, v_role_id,
    v_role_name = 'verified_employee'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    mobile = EXCLUDED.mobile,
    role_id = EXCLUDED.role_id,
    is_verified_employee = EXCLUDED.is_verified_employee,
    updated_at = NOW();

  INSERT INTO public.user_profiles (
    user_id, service_tier, service_name, group_name, current_level, current_office
  )
  VALUES (
    NEW.id,
    v_service_tier,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'service_name', ''), 'नेपाल प्रशासन सेवा'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'group_name', ''), 'सामान्य प्रशासन'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'current_level', ''), 'सहायक स्तर / अधिकृत स्तर'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'current_office', ''), 'नेपाल सरकार कार्यालय')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    service_tier = EXCLUDED.service_tier,
    service_name = EXCLUDED.service_name,
    group_name = EXCLUDED.group_name,
    current_level = EXCLUDED.current_level,
    current_office = EXCLUDED.current_office,
    updated_at = NOW();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      NEW.id,
      'USER_REGISTER',
      'AUTH_USER',
      NEW.id::TEXT,
      jsonb_build_object('email', NEW.email, 'full_name', v_full_name)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ncsdh_auth_user_synced ON auth.users;
CREATE TRIGGER on_ncsdh_auth_user_synced
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_ncsdh_auth_user();

-- Backfill Auth accounts that existed before this migration.
INSERT INTO public.users (
  id, email, password_hash, full_name, mobile, role_id, is_verified_employee, created_at
)
SELECT
  u.id,
  u.email,
  NULL,
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)),
  NULLIF(u.raw_user_meta_data ->> 'mobile', ''),
  r.id,
  u.raw_app_meta_data ->> 'ncsdh_role' = 'verified_employee',
  u.created_at
FROM auth.users AS u
JOIN public.roles AS r
  ON r.name = CASE
    WHEN u.raw_app_meta_data ->> 'ncsdh_role' IN (
      'registered_user', 'verified_employee', 'content_contributor',
      'content_editor', 'admin', 'super_admin'
    ) THEN u.raw_app_meta_data ->> 'ncsdh_role'
    ELSE 'registered_user'
  END
WHERE u.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  mobile = EXCLUDED.mobile,
  role_id = EXCLUDED.role_id,
  is_verified_employee = EXCLUDED.is_verified_employee,
  updated_at = NOW();

INSERT INTO public.user_profiles (
  user_id, service_tier, service_name, group_name, current_level, current_office
)
SELECT
  u.id,
  CASE
    WHEN u.raw_user_meta_data ->> 'service_tier' IN ('सङ्घीय', 'प्रदेश', 'स्थानीय तह')
      THEN u.raw_user_meta_data ->> 'service_tier'
    ELSE 'सङ्घीय'
  END,
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'service_name', ''), 'नेपाल प्रशासन सेवा'),
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'group_name', ''), 'सामान्य प्रशासन'),
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'current_level', ''), 'सहायक स्तर / अधिकृत स्तर'),
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'current_office', ''), 'नेपाल सरकार कार्यालय')
FROM auth.users AS u
WHERE u.email IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details, created_at)
SELECT
  u.id,
  'USER_REGISTER',
  'AUTH_USER',
  u.id::TEXT,
  jsonb_build_object(
    'email', u.email,
    'full_name', COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)),
    'source', 'existing_auth_user_backfill'
  ),
  u.created_at
FROM auth.users AS u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.audit_logs AS a
    WHERE a.action = 'USER_REGISTER'
      AND a.entity_type = 'AUTH_USER'
      AND a.entity_id = u.id::TEXT
  );

-- Keep the profile tables readable through their existing RLS policies.
REVOKE INSERT, UPDATE, DELETE ON public.users FROM anon, authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
REVOKE INSERT, DELETE ON public.audit_logs FROM anon, authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
