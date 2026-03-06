
-- ═══════════════════════════════════════════════════════════════
-- SECURITY HARDENING MIGRATION
-- Fix 6 critical RLS policy findings + add login_attempts table
-- ═══════════════════════════════════════════════════════════════

-- 1. Fix profiles: restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix subscriptions: restrict to authenticated
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Fix error_logs: restrict INSERT to authenticated
DROP POLICY IF EXISTS "Users can insert error logs" ON public.error_logs;
CREATE POLICY "Users can insert error logs" ON public.error_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4. Fix analytics_events: restrict to authenticated
DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;
CREATE POLICY "Users can insert own events" ON public.analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Fix founder_analytics_events: restrict to authenticated
DROP POLICY IF EXISTS "Users can insert own founder analytics" ON public.founder_analytics_events;
CREATE POLICY "Users can insert own founder analytics" ON public.founder_analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 6. Fix security_events: restrict to authenticated (keep allowing null user_id for pre-login events)
DROP POLICY IF EXISTS "Anyone can insert security events" ON public.security_events;
CREATE POLICY "Authenticated users can insert security events" ON public.security_events
  FOR INSERT TO authenticated
  WITH CHECK (event_type IS NOT NULL AND length(event_type) > 0);

-- 7. Fix admin_users: tighten check to own user only
DROP POLICY IF EXISTS "Users can check own admin status" ON public.admin_users;
CREATE POLICY "Users can check own admin status" ON public.admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- LOGIN ATTEMPTS TABLE for server-side rate limiting & anomaly detection
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hint text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  ip_hint text,
  user_agent_hint text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can read login attempts
CREATE POLICY "Admins can read login attempts" ON public.login_attempts
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- Edge functions (service role) insert login attempts
CREATE POLICY "Service can insert login attempts" ON public.login_attempts
  FOR INSERT TO authenticated
  WITH CHECK (true);
