
-- 1. Add INSERT policy for referral_validations (service_role only)
CREATE POLICY "Service role can insert validations"
  ON public.referral_validations
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2. Create missing increment_referral_count RPC function
CREATE OR REPLACE FUNCTION public.increment_referral_count(_referral_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referrals 
  SET referral_count = referral_count + 1,
      updated_at = now()
  WHERE id = _referral_id;
END;
$$;

-- 3. Add admin SELECT policy for error_logs
CREATE POLICY "Admins can read all errors"
  ON public.error_logs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 4. Tighten leads INSERT with email format validation
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (
    email IS NOT NULL 
    AND email ~ '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND converted = false
  );
