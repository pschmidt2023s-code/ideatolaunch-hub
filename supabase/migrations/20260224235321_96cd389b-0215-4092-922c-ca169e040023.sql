
-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own events
CREATE POLICY "Users can insert own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read own events
CREATE POLICY "Users can read own events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_analytics_events_user ON public.analytics_events (user_id);
CREATE INDEX idx_analytics_events_name ON public.analytics_events (event_name);
CREATE INDEX idx_analytics_events_created ON public.analytics_events (created_at DESC);

-- Error logs table
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  message TEXT NOT NULL,
  stack TEXT,
  route TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert errors
CREATE POLICY "Users can insert error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to read own errors
CREATE POLICY "Users can read own errors"
  ON public.error_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_error_logs_created ON public.error_logs (created_at DESC);
