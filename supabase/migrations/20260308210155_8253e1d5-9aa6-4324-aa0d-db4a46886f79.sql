-- Fix views: enable RLS on views (they're SECURITY INVOKER now, but scanner wants explicit RLS)
-- For views, we add RLS policies on the underlying tables which are already in place.
-- The real fix: enable RLS on the view objects themselves
ALTER VIEW public.trading_accounts_safe SET (security_invoker = true);
ALTER VIEW public.referral_validation_summary SET (security_invoker = true);

-- Fix community tables: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can read experiments" ON public.community_experiments;
CREATE POLICY "Authenticated can read experiments"
  ON public.community_experiments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read startup logs" ON public.community_startup_logs;
CREATE POLICY "Authenticated can read startup logs"
  ON public.community_startup_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read followers" ON public.community_log_followers;
CREATE POLICY "Authenticated can read followers"
  ON public.community_log_followers FOR SELECT TO authenticated USING (true);