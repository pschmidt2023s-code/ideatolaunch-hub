
-- Founder Experiments table
CREATE TABLE public.community_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  experiment_type text NOT NULL DEFAULT 'marketing',
  platform text,
  budget text,
  goal text,
  result text,
  key_insight text,
  title text NOT NULL,
  description text,
  upvote_count integer NOT NULL DEFAULT 0,
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read experiments" ON public.community_experiments FOR SELECT USING (true);
CREATE POLICY "Users can insert own experiments" ON public.community_experiments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experiments" ON public.community_experiments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experiments" ON public.community_experiments FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_experiments_user ON public.community_experiments(user_id);
CREATE INDEX idx_experiments_created ON public.community_experiments(created_at DESC);
CREATE INDEX idx_experiments_upvotes ON public.community_experiments(upvote_count DESC);

-- Startup Logs table
CREATE TABLE public.community_startup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  industry text,
  day_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  content text NOT NULL,
  milestone_type text DEFAULT 'update',
  tags text[] DEFAULT '{}'::text[],
  upvote_count integer NOT NULL DEFAULT 0,
  follower_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_startup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read startup logs" ON public.community_startup_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own logs" ON public.community_startup_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.community_startup_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON public.community_startup_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_logs_user ON public.community_startup_logs(user_id);
CREATE INDEX idx_logs_brand ON public.community_startup_logs(user_id, brand_name);
CREATE INDEX idx_logs_created ON public.community_startup_logs(created_at DESC);

-- Startup Log followers
CREATE TABLE public.community_log_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followed_user_id uuid NOT NULL,
  brand_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, followed_user_id, brand_name)
);

ALTER TABLE public.community_log_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read followers" ON public.community_log_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.community_log_followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.community_log_followers FOR DELETE USING (auth.uid() = follower_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_experiments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_startup_logs;
