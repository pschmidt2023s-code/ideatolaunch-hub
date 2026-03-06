
-- Fix remaining RLS policies: restrict all SELECT policies to authenticated users

-- profiles: Admins read
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- subscriptions: Admins read & update
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can read all subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

-- referral_validations: fix all policies to authenticated
DROP POLICY IF EXISTS "Admins can read all referral validations" ON public.referral_validations;
CREATE POLICY "Admins can read all referral validations" ON public.referral_validations
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update referral validations" ON public.referral_validations;
CREATE POLICY "Admins can update referral validations" ON public.referral_validations
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own referral validations" ON public.referral_validations;
CREATE POLICY "Users can read own referral validations" ON public.referral_validations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM referrals r WHERE r.id = referral_validations.referral_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role can insert validations" ON public.referral_validations;
CREATE POLICY "Service can insert validations" ON public.referral_validations
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- error_logs: fix read policies
DROP POLICY IF EXISTS "Admins can read all errors" ON public.error_logs;
CREATE POLICY "Admins can read all errors" ON public.error_logs
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own errors" ON public.error_logs;
CREATE POLICY "Users can read own errors" ON public.error_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- analytics_events: fix read policy
DROP POLICY IF EXISTS "Users can read own events" ON public.analytics_events;
CREATE POLICY "Users can read own events" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- founder_analytics_events: fix read policies
DROP POLICY IF EXISTS "Admins can read all founder analytics" ON public.founder_analytics_events;
CREATE POLICY "Admins can read all founder analytics" ON public.founder_analytics_events
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own founder analytics" ON public.founder_analytics_events;
CREATE POLICY "Users can read own founder analytics" ON public.founder_analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- admin_audit_log: fix policies
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.admin_audit_log;
CREATE POLICY "Admins can insert audit log" ON public.admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read audit log" ON public.admin_audit_log;
CREATE POLICY "Admins can read audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- feature_flag_overrides: fix
DROP POLICY IF EXISTS "Admins can CRUD feature_flag_overrides" ON public.feature_flag_overrides;
CREATE POLICY "Admins can CRUD feature_flag_overrides" ON public.feature_flag_overrides
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- security_events: fix read
DROP POLICY IF EXISTS "Admins can read security events" ON public.security_events;
CREATE POLICY "Admins can read security events" ON public.security_events
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- discount_codes: fix
DROP POLICY IF EXISTS "Admins can CRUD discount_codes" ON public.discount_codes;
CREATE POLICY "Admins can CRUD discount_codes" ON public.discount_codes
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- supplier_clicks: fix
DROP POLICY IF EXISTS "Admins can read all supplier clicks" ON public.supplier_clicks;
CREATE POLICY "Admins can read all supplier clicks" ON public.supplier_clicks
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own supplier clicks" ON public.supplier_clicks;
CREATE POLICY "Users can insert own supplier clicks" ON public.supplier_clicks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own supplier clicks" ON public.supplier_clicks;
CREATE POLICY "Users can read own supplier clicks" ON public.supplier_clicks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- affiliates: fix
DROP POLICY IF EXISTS "Admins can read all affiliates" ON public.affiliates;
CREATE POLICY "Admins can read all affiliates" ON public.affiliates
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all affiliates" ON public.affiliates;
CREATE POLICY "Admins can update all affiliates" ON public.affiliates
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own affiliate" ON public.affiliates;
CREATE POLICY "Users can insert own affiliate" ON public.affiliates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own affiliate" ON public.affiliates;
CREATE POLICY "Users can read own affiliate" ON public.affiliates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own affiliate" ON public.affiliates;
CREATE POLICY "Users can update own affiliate" ON public.affiliates
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- referrals: fix
DROP POLICY IF EXISTS "Admins can read all referrals" ON public.referrals;
CREATE POLICY "Admins can read all referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own referral" ON public.referrals;
CREATE POLICY "Users can insert own referral" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own referral" ON public.referrals;
CREATE POLICY "Users can read own referral" ON public.referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own referral" ON public.referrals;
CREATE POLICY "Users can update own referral" ON public.referrals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- leads: fix
DROP POLICY IF EXISTS "Admins can read all leads" ON public.leads;
CREATE POLICY "Admins can read all leads" ON public.leads
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

-- community_waitlist: fix read
DROP POLICY IF EXISTS "Admins can read waitlist" ON public.community_waitlist;
CREATE POLICY "Admins can read waitlist" ON public.community_waitlist
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));
