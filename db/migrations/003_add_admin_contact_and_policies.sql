-- Migration: Add admin/contact fields to hospitals and create RLS policies
-- Run this in the Supabase SQL editor (or psql). Review policies before applying to production.

BEGIN;

-- Add missing columns (non-destructive)
ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS admin_name text,
  ADD COLUMN IF NOT EXISTS admin_email text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS subscription_plan_id uuid,
  ADD COLUMN IF NOT EXISTS number_of_doctors integer,
  ADD COLUMN IF NOT EXISTS number_of_ai_team integer,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace a trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.hospitals;
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON public.hospitals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security and add permissive policies to allow the client (anon key)
-- IMPORTANT: These policies are intentionally permissive to match the frontend's use of the publishable key.
-- Review and restrict these policies for production (e.g., require authenticated users, check owner, or use function checks).

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'hospitals_public_select'
  ) THEN
    EXECUTE 'CREATE POLICY hospitals_public_select ON public.hospitals FOR SELECT USING (true);';
  END IF;
END$$;

-- Allow anyone to INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'hospitals_public_insert'
  ) THEN
    EXECUTE 'CREATE POLICY hospitals_public_insert ON public.hospitals FOR INSERT WITH CHECK (true);';
  END IF;
END$$;

-- Allow anyone to UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'hospitals_public_update'
  ) THEN
    EXECUTE 'CREATE POLICY hospitals_public_update ON public.hospitals FOR UPDATE USING (true) WITH CHECK (true);';
  END IF;
END$$;

-- Allow anyone to DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'hospitals_public_delete'
  ) THEN
    EXECUTE 'CREATE POLICY hospitals_public_delete ON public.hospitals FOR DELETE USING (true);';
  END IF;
END$$;

COMMIT;

-- NOTES:
-- 1) These policies permit the anon/public key to read/write/delete rows; restrict them after verifying your auth flow.
-- 2) If you use `subscription_plan_id` as a foreign key, create the FK separately once `subscription_plans` exists.
-- 3) Backfill examples:
--    UPDATE public.hospitals SET contact_email = email WHERE contact_email IS NULL AND email IS NOT NULL;
--    UPDATE public.hospitals SET full_address = address WHERE full_address IS NULL AND address IS NOT NULL;
