-- Migration: Add city and full_address columns to hospitals table
-- Run this in the Supabase SQL editor or via psql

ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS full_address text;

-- Backfill examples (only run if corresponding columns exist):
-- UPDATE public.hospitals SET city = city_name WHERE city IS NULL AND city_name IS NOT NULL;
-- UPDATE public.hospitals SET full_address = address WHERE full_address IS NULL AND address IS NOT NULL;

-- After running this migration, the application will be able to persist city and full address when creating/updating hospitals.
