
-- Create leads table for email capture
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'blueprint', -- blueprint, scroll, exit, tool
  trigger_type TEXT, -- scroll, exit, tool
  page TEXT, -- which page captured
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Admins can read all leads
CREATE POLICY "Admins can read all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Anyone authenticated can insert leads (for capture forms)
CREATE POLICY "Authenticated users can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anonymous lead capture (public forms)
CREATE POLICY "Anonymous can insert leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Admins can update leads (mark converted)
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));
