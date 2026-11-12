-- ========================================================================
-- Nepal Civil Servants Digital Hub (NCSDH)
-- Migration 002: Row Level Security (RLS) Policies
-- Enforces data protection, privacy, and Role-Based Access Control (RBAC)
-- ========================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user has an admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------
-- 1. ROLES POLICIES (Public read-only for active roles)
-- ------------------------------------------------------------------------
CREATE POLICY "Allow public read roles"
  ON public.roles FOR SELECT
  USING (true);

-- ------------------------------------------------------------------------
-- 2. USERS POLICIES
-- ------------------------------------------------------------------------
CREATE POLICY "Users can view own profile or admins view all"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own account"
  ON public.users FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert or delete users"
  ON public.users FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------
-- 3. USER PROFILES POLICIES
-- ------------------------------------------------------------------------
CREATE POLICY "Users can view own employee profile or admins view all"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own employee profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own employee profile"
  ON public.user_profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------
-- 4. EMPLOYEE VERIFICATIONS POLICIES
-- ------------------------------------------------------------------------
CREATE POLICY "Users view own verification request or admins view all"
  ON public.employee_verifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users submit own verification request"
  ON public.employee_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only admins can review or update verification status"
  ON public.employee_verifications FOR UPDATE
  USING (public.is_admin());

-- ------------------------------------------------------------------------
-- 5. LEGAL DOCUMENTS & SECTIONS (Public read, admin write)
-- ------------------------------------------------------------------------
CREATE POLICY "Anyone can read legal documents"
  ON public.legal_documents FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify legal documents"
  ON public.legal_documents FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can read legal sections"
  ON public.legal_sections FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify legal sections"
  ON public.legal_sections FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------
-- 6. SALARY SCALES & CIRCULARS (Public read, admin manage)
-- ------------------------------------------------------------------------
CREATE POLICY "Anyone can read salary scales"
  ON public.salary_scales FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify salary scales"
  ON public.salary_scales FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can read active circulars"
  ON public.government_circulars FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can manage circulars"
  ON public.government_circulars FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------
-- 7. TASKS POLICIES (Strict user isolation)
-- ------------------------------------------------------------------------
CREATE POLICY "Users manage their own tasks only"
  ON public.tasks FOR ALL
  USING (user_id = auth.uid());

-- ------------------------------------------------------------------------
-- 8. NOTIFICATIONS POLICIES (Strict user isolation)
-- ------------------------------------------------------------------------
CREATE POLICY "Users view and update their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notification read state"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ------------------------------------------------------------------------
-- 9. AUDIT LOGS POLICIES (Admins read-only, system inserts)
-- ------------------------------------------------------------------------
CREATE POLICY "Only admins can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Allow authenticated insert of audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
