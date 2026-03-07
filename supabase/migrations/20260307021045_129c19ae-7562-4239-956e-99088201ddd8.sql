-- Fix license_invitations: only allow reading by admins (redeem flow uses edge function with service role)
DROP POLICY IF EXISTS "Read invitation by short_code only" ON public.license_invitations;

-- Unauthenticated redeem is handled via edge function with service role key
-- Authenticated users should not browse invitations
-- Only admins need direct table access (already have CRUD policy)

-- Fix referral_validations: remove user read access to fraud data, keep admin access
DROP POLICY IF EXISTS "Users can read own referral validations" ON public.referral_validations;

-- Create a safe summary view for referral owners instead
CREATE OR REPLACE VIEW public.referral_validation_summary
WITH (security_invoker = on) AS
  SELECT
    rv.referral_id,
    rv.status,
    rv.fraud_score,
    rv.created_at
  FROM public.referral_validations rv
  JOIN public.referrals r ON r.id = rv.referral_id
  WHERE r.user_id = auth.uid();

-- Fix trading_accounts: create a view that hides encrypted secrets
CREATE OR REPLACE VIEW public.trading_accounts_safe
WITH (security_invoker = on) AS
  SELECT
    id, user_id, exchange, label, status, read_only,
    balances, positions, risk_metrics, trade_history, account_data,
    last_synced_at, created_at, updated_at
  FROM public.trading_accounts
  WHERE user_id = auth.uid();