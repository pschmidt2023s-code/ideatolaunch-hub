
-- Supplier click tracking for affiliate monetization
CREATE TABLE public.supplier_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  supplier_id text NOT NULL,
  supplier_name text NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  category text,
  affiliate boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplier_clicks ENABLE ROW LEVEL SECURITY;

-- Users can insert their own clicks
CREATE POLICY "Users can insert own supplier clicks"
ON public.supplier_clicks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can read own clicks
CREATE POLICY "Users can read own supplier clicks"
ON public.supplier_clicks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all clicks
CREATE POLICY "Admins can read all supplier clicks"
ON public.supplier_clicks
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Index for admin analytics
CREATE INDEX idx_supplier_clicks_supplier ON public.supplier_clicks(supplier_id);
CREATE INDEX idx_supplier_clicks_created ON public.supplier_clicks(created_at DESC);
