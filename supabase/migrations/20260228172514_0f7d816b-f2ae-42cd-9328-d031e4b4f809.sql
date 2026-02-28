
-- Table for tracking major founder decisions
CREATE TABLE public.founder_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  decision_type TEXT NOT NULL, -- 'price_change', 'moq_change', 'supplier_selection', 'launch_decision', 'other'
  title TEXT NOT NULL,
  description TEXT,
  old_value TEXT,
  new_value TEXT,
  impact_label TEXT, -- e.g. 'profit +12%'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own founder_decisions"
  ON public.founder_decisions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table for weekly CEO reviews
CREATE TABLE public.weekly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  margin_trend NUMERIC,
  runway_trend NUMERIC,
  inventory_exposure NUMERIC,
  launch_score_change INTEGER,
  key_risk TEXT,
  key_opportunity TEXT,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  streak_count INTEGER NOT NULL DEFAULT 0,
  momentum_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id, week_number, year)
);

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own weekly_reviews"
  ON public.weekly_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_founder_decisions_brand ON public.founder_decisions(brand_id);
CREATE INDEX idx_founder_decisions_user ON public.founder_decisions(user_id);
CREATE INDEX idx_weekly_reviews_brand ON public.weekly_reviews(brand_id);
CREATE INDEX idx_weekly_reviews_user_week ON public.weekly_reviews(user_id, year, week_number);
