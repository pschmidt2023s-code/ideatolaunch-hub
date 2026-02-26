
-- Security events table for logging auth failures, suspicious activity, admin access
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'failed_login', 'admin_access', 'rate_limited', 'suspicious_activity'
  user_id UUID,
  ip_hint TEXT, -- partial/hashed IP for pattern detection, not full IP
  metadata JSONB DEFAULT '{}'::jsonb,
  route TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read security events
CREATE POLICY "Admins can read security events"
ON public.security_events FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Anyone can insert security events (needed for failed login tracking)
CREATE POLICY "System can insert security events"
ON public.security_events FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Anon can insert security events"
ON public.security_events FOR INSERT TO anon
WITH CHECK (true);
