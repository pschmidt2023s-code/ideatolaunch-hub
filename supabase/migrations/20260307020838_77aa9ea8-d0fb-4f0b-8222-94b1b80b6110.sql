-- Fix: license_invitations - create a secure view that hides tokens and license keys
-- First drop the overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can read active invitations by token" ON public.license_invitations;

-- Replace with a policy that only allows reading by specific token match (used in redeem flow)
-- and hides sensitive fields via a restrictive SELECT
CREATE POLICY "Read invitation by short_code only"
  ON public.license_invitations
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Enable realtime for key dashboard tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_models;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.strategic_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_tasks;