
-- Create founder_analytics_events table
CREATE TABLE public.founder_analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  step integer,
  risk_level text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founder_analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own founder analytics"
  ON public.founder_analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own events (admin reads all via service role)
CREATE POLICY "Users can read own founder analytics"
  ON public.founder_analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX idx_founder_analytics_event_name ON public.founder_analytics_events (event_name);
CREATE INDEX idx_founder_analytics_user_id ON public.founder_analytics_events (user_id);
CREATE INDEX idx_founder_analytics_created_at ON public.founder_analytics_events (created_at DESC);

-- Admin table: store admin user IDs separately (security best practice)
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only the user themselves can check if they're admin
CREATE POLICY "Users can check own admin status"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = _user_id
  )
$$;

-- Admin can read ALL founder analytics
CREATE POLICY "Admins can read all founder analytics"
  ON public.founder_analytics_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
