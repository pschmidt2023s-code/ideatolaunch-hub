
-- Fix overly permissive INSERT policies

-- 1. community_waitlist: "Anyone can join waitlist" - restrict to non-empty email
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.community_waitlist;
CREATE POLICY "Anyone can join waitlist"
  ON public.community_waitlist
  FOR INSERT
  WITH CHECK (email IS NOT NULL AND length(trim(email)) > 0);

-- 2. leads: merge two duplicate INSERT policies into one with basic validation
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Anonymous can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (email IS NOT NULL AND converted = false);

-- 3. security_events: merge two duplicate INSERT policies into one with validation
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Anon can insert security events" ON public.security_events;
CREATE POLICY "Anyone can insert security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (event_type IS NOT NULL AND length(event_type) > 0);
