-- ═══════════════════════════════════════════════════════════
-- SECURITY HARDENING: Fix critical RLS vulnerabilities
-- ═══════════════════════════════════════════════════════════

-- 1. FIX: referral_validations INSERT - restrict to service_role only
DROP POLICY IF EXISTS "Service can insert validations" ON public.referral_validations;
CREATE POLICY "Only service role can insert validations"
  ON public.referral_validations
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2. FIX: login_attempts INSERT - scope to authenticated with minimal fields
DROP POLICY IF EXISTS "Authenticated can insert login attempts" ON public.login_attempts;
CREATE POLICY "Authenticated can insert own login attempts"
  ON public.login_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- login_attempts has no user_id column, keeping insert open for auth'd users is acceptable

-- Actually let's restrict login_attempts to service_role too since it's used by backend
DROP POLICY IF EXISTS "Authenticated can insert own login attempts" ON public.login_attempts;
CREATE POLICY "Service role can insert login attempts"
  ON public.login_attempts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. FIX: Secure views with SECURITY INVOKER (Postgres 15+)
-- Recreate views as SECURITY INVOKER so underlying table RLS is enforced
DROP VIEW IF EXISTS public.trading_accounts_safe;
CREATE VIEW public.trading_accounts_safe
  WITH (security_invoker = true)
AS
  SELECT id, user_id, exchange, label, status, read_only,
         balances, positions, risk_metrics, trade_history, account_data,
         last_synced_at, created_at, updated_at
  FROM public.trading_accounts
  WHERE user_id = auth.uid();

DROP VIEW IF EXISTS public.referral_validation_summary;
CREATE VIEW public.referral_validation_summary
  WITH (security_invoker = true)
AS
  SELECT rv.referral_id, rv.status, rv.fraud_score, rv.created_at
  FROM public.referral_validations rv
  JOIN public.referrals r ON r.id = rv.referral_id
  WHERE r.user_id = auth.uid();