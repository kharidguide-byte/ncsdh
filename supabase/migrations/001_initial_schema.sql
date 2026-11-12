-- ========================================================================
-- Nepal Civil Servants Digital Hub (NCSDH)
-- नेपाल निजामती कर्मचारी डिजिटल प्लेटफर्म
-- Migration 001: Initial Database Schema
-- Compatible with PostgreSQL 15+ and Supabase
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. ROLES & PERMISSIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    nepali_label VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 2. USERS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified_employee BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 3. USER PROFILES (EMPLOYEE DETAILS)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    citizenship_no VARCHAR(50),
    dob_bs VARCHAR(20),
    dob_ad DATE,
    service_tier VARCHAR(50) DEFAULT 'सङ्घीय' CHECK (service_tier IN ('सङ्घीय', 'प्रदेश', 'स्थानीय तह')),
    service_name VARCHAR(100) DEFAULT 'नेपाल प्रशासन सेवा',
    group_name VARCHAR(100) DEFAULT 'सामान्य प्रशासन',
    subgroup_name VARCHAR(100),
    current_level VARCHAR(100) DEFAULT 'शाखा अधिकृत (अधिकृत सातौं/आठौं)',
    rank_type VARCHAR(50) DEFAULT 'राजपत्राङ्कित',
    current_office VARCHAR(200) DEFAULT 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    district VARCHAR(100) DEFAULT 'काठमाडौँ',
    province VARCHAR(100) DEFAULT 'बागमती प्रदेश',
    appointment_date_bs VARCHAR(20),
    avatar_url TEXT,
    is_official_synced BOOLEAN NOT NULL DEFAULT FALSE,
    data_source_disclaimer VARCHAR(255) DEFAULT 'User Provided Information - सरकारी प्रणालीसँग प्रमाणीकरण हुन बाँकी',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 4. EMPLOYEE VERIFICATION WORKFLOW
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sanket_no VARCHAR(50) NOT NULL, -- कर्मचारी सङ्केत नम्बर (PIS/Personnel ID)
    psc_roll_no VARCHAR(50),
    appointment_date_bs VARCHAR(20) NOT NULL,
    office_id_card_url TEXT,
    citizenship_front_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 5. LEGAL DOCUMENTS & SECTIONS (Knowledge Base)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_ne VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL DEFAULT 'ACT' CHECK (doc_type IN ('ACT', 'RULE', 'DIRECTIVE', 'PROCEDURE', 'ORDER')),
    category VARCHAR(100) NOT NULL,
    enactment_date_bs VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'AMENDED', 'REPEALED')),
    description TEXT,
    official_source_url TEXT,
    version_no VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legal_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
    chapter_no VARCHAR(20),
    chapter_title_ne VARCHAR(255),
    section_no VARCHAR(30) NOT NULL,
    title_ne VARCHAR(255) NOT NULL,
    content_ne TEXT NOT NULL,
    simple_explanation_ne TEXT,
    amendment_note TEXT,
    keywords TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 6. SALARY SCALES & ALLOWANCES (2081/82 Official Scale)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salary_scales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year VARCHAR(20) NOT NULL DEFAULT '2081/82',
    level_code VARCHAR(30) NOT NULL,
    level_name_ne VARCHAR(150) NOT NULL,
    rank_category VARCHAR(50) NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    grade_amount NUMERIC(10, 2) NOT NULL,
    max_grades INT NOT NULL DEFAULT 8,
    dearness_allowance NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
    source_reference VARCHAR(255) DEFAULT 'नेपाल राजपत्र तथा अर्थ मन्त्रालय सूचना २०८१',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 7. GOVERNMENT CIRCULARS & NOTICES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.government_circulars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ne VARCHAR(300) NOT NULL,
    issuing_authority VARCHAR(200) NOT NULL,
    circular_no VARCHAR(100),
    issued_date_bs VARCHAR(20) NOT NULL,
    subject_category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT', 'VERY_URGENT')),
    summary_ne TEXT NOT NULL,
    official_link TEXT,
    attachment_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 8. TASKS & PLANNER (Personal Work)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE')),
    due_date_bs VARCHAR(20),
    category VARCHAR(50) DEFAULT 'General',
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 9. NOTIFICATIONS & AUDIT LOGS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'INFO' CHECK (type IN ('INFO', 'ALERT', 'VERIFICATION', 'UPDATE', 'LEGAL')),
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_sections_doc_id ON public.legal_sections(document_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
