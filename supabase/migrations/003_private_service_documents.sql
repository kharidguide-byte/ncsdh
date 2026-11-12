-- Private service-document vault.
-- Run this migration in Supabase SQL Editor after migrations 001 and 002.

CREATE TABLE IF NOT EXISTS public.user_service_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  object_path TEXT NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg')),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 15728640),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_service_documents_owner_created
  ON public.user_service_documents(owner_id, created_at DESC);

ALTER TABLE public.user_service_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own service documents" ON public.user_service_documents;
DROP POLICY IF EXISTS "Users upload own service documents" ON public.user_service_documents;
DROP POLICY IF EXISTS "Users delete own service documents" ON public.user_service_documents;

CREATE POLICY "Users read own service documents"
  ON public.user_service_documents FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users upload own service documents"
  ON public.user_service_documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users delete own service documents"
  ON public.user_service_documents FOR DELETE
  USING (owner_id = auth.uid());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-documents-private',
  'service-documents-private',
  FALSE,
  15728640,
  ARRAY['application/pdf', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users read own private service files" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own private service files" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own private service files" ON storage.objects;

CREATE POLICY "Users read own private service files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'service-documents-private'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users upload own private service files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'service-documents-private'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users delete own private service files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'service-documents-private'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
