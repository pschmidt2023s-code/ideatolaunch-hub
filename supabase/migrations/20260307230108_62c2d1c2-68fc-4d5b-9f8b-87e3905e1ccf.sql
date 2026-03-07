
-- Add new fields to supplier reviews
ALTER TABLE public.community_supplier_reviews
  ADD COLUMN IF NOT EXISTS platform TEXT,
  ADD COLUMN IF NOT EXISTS avg_unit_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS production_time TEXT;

-- Create index for sorting by rating
CREATE INDEX IF NOT EXISTS idx_supplier_reviews_quality ON public.community_supplier_reviews(quality_rating DESC);
