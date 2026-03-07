
-- Community Posts (all types: launch, supplier_experience, growth, lesson, feedback, market_signal, case_study, match_request)
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community Replies
CREATE TABLE public.community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community Upvotes
CREATE TABLE public.community_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.community_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id)
);

-- Supplier Reviews
CREATE TABLE public.community_supplier_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  supplier_name TEXT NOT NULL,
  country TEXT,
  product_type TEXT,
  moq TEXT,
  quality_rating INTEGER NOT NULL DEFAULT 3,
  communication_rating INTEGER NOT NULL DEFAULT 3,
  delivery_rating INTEGER NOT NULL DEFAULT 3,
  notes TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Founder Levels (computed reputation)
CREATE TABLE public.community_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'starter',
  post_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  case_study_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Private Founder Circles
CREATE TABLE public.community_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  invite_only BOOLEAN NOT NULL DEFAULT true,
  max_members INTEGER DEFAULT 50,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.community_circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.community_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Indexes
CREATE INDEX idx_community_posts_type ON public.community_posts(post_type);
CREATE INDEX idx_community_posts_user ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_category ON public.community_posts(category);
CREATE INDEX idx_community_replies_post ON public.community_replies(post_id);
CREATE INDEX idx_community_upvotes_post ON public.community_upvotes(post_id);
CREATE INDEX idx_community_supplier_reviews_country ON public.community_supplier_reviews(country);
CREATE INDEX idx_community_supplier_reviews_type ON public.community_supplier_reviews(product_type);
CREATE INDEX idx_community_reputation_user ON public.community_reputation(user_id);
CREATE INDEX idx_community_reputation_level ON public.community_reputation(level);

-- RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_supplier_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_circle_members ENABLE ROW LEVEL SECURITY;

-- Posts: authenticated can read all, insert/update/delete own
CREATE POLICY "Anyone can read posts" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Replies
CREATE POLICY "Anyone can read replies" ON public.community_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own replies" ON public.community_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.community_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Upvotes
CREATE POLICY "Anyone can read upvotes" ON public.community_upvotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own upvotes" ON public.community_upvotes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own upvotes" ON public.community_upvotes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Supplier Reviews
CREATE POLICY "Anyone can read supplier reviews" ON public.community_supplier_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own reviews" ON public.community_supplier_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.community_supplier_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Reputation: readable by all, only system/user can update own
CREATE POLICY "Anyone can read reputation" ON public.community_reputation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own reputation" ON public.community_reputation FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reputation" ON public.community_reputation FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Circles: readable by members
CREATE POLICY "Anyone can read circles" ON public.community_circles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create circles" ON public.community_circles FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Circle Members
CREATE POLICY "Members can read circle members" ON public.community_circle_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join circles" ON public.community_circle_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave circles" ON public.community_circle_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;

-- Trigger for updated_at
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_supplier_reviews_updated_at BEFORE UPDATE ON public.community_supplier_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_reputation_updated_at BEFORE UPDATE ON public.community_reputation FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
