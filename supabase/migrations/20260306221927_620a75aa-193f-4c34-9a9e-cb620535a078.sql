
-- Fix overly permissive login_attempts INSERT policy
DROP POLICY IF EXISTS "Service can insert login attempts" ON public.login_attempts;
CREATE POLICY "Authenticated can insert login attempts" ON public.login_attempts
  FOR INSERT TO authenticated
  WITH CHECK (true);
