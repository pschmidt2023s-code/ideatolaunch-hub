
-- Add product classification columns to brand_profiles
ALTER TABLE public.brand_profiles
  ADD COLUMN IF NOT EXISTS product_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_category text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS risk_flags text[] DEFAULT '{}';
