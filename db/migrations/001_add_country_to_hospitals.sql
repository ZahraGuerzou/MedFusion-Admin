-- Migration: Add country column to hospitals table
-- Run this in the Supabase SQL editor or via psql

ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS country text;

-- Optional: if your table uses a different column name (address, location, country_name),
-- you can backfill country from those columns. Examples:
-- UPDATE public.hospitals SET country = country_name WHERE country IS NULL AND country_name IS NOT NULL;
-- UPDATE public.hospitals SET country = location WHERE country IS NULL AND location IS NOT NULL;

-- If you want to add a foreign key to subscription_plans instead of a text plan,
-- ensure subscription_plans table exists and then:
-- ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS subscription_plan_id uuid;
-- ALTER TABLE public.hospitals ADD CONSTRAINT fk_subscription_plan FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id);

-- After running this migration, re-run the app to verify the Hospitals page loads without the missing column error.
