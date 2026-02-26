
-- ════════════════════════════════════════════
-- REFERRALS TABLE
-- ════════════════════════════════════════════
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referral_count INTEGER NOT NULL DEFAULT 0,
  reward_builder_months INTEGER NOT NULL DEFAULT 0,
  reward_pro_trial BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral"
ON public.referrals FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral"
ON public.referrals FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all referrals"
ON public.referrals FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════
-- AFFILIATES TABLE
-- ════════════════════════════════════════════
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC NOT NULL DEFAULT 25,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  active_referrals INTEGER NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own affiliate"
ON public.affiliates FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate"
ON public.affiliates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate"
ON public.affiliates FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all affiliates"
ON public.affiliates FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all affiliates"
ON public.affiliates FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════
-- COMMUNITY WAITLIST TABLE
-- ════════════════════════════════════════════
CREATE TABLE public.community_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  current_plan TEXT DEFAULT 'free',
  niche TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
ON public.community_waitlist FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read waitlist"
ON public.community_waitlist FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
