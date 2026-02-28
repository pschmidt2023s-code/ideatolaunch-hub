
-- ═══════════════════════════════════════════════════
-- PART 1: Referral Fraud Detection System
-- ═══════════════════════════════════════════════════

-- Fraud validation records for each referral
CREATE TABLE public.referral_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL,
  fraud_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  ip_hash TEXT,
  device_fingerprint TEXT,
  email_similarity_score NUMERIC DEFAULT 0,
  signup_velocity_flag BOOLEAN DEFAULT false,
  behavioral_similarity NUMERIC DEFAULT 0,
  shared_payment_flag BOOLEAN DEFAULT false,
  stripe_card_fingerprint TEXT,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  admin_override BOOLEAN DEFAULT false,
  admin_override_by UUID,
  admin_override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_validations ENABLE ROW LEVEL SECURITY;

-- Admins can read all
CREATE POLICY "Admins can read all referral validations"
  ON public.referral_validations FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can update (override)
CREATE POLICY "Admins can update referral validations"
  ON public.referral_validations FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Users can see own referral validations
CREATE POLICY "Users can read own referral validations"
  ON public.referral_validations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.referrals r WHERE r.id = referral_id AND r.user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_referral_validations_updated_at
  BEFORE UPDATE ON public.referral_validations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_referral_validations_score ON public.referral_validations(fraud_score DESC);
CREATE INDEX idx_referral_validations_status ON public.referral_validations(status);

-- ═══════════════════════════════════════════════════
-- PART 2: Compliance Scores
-- ═══════════════════════════════════════════════════

CREATE TABLE public.compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  gewerbeanmeldung BOOLEAN DEFAULT false,
  dsgvo_assessment BOOLEAN DEFAULT false,
  impressum_ready BOOLEAN DEFAULT false,
  datenschutz_ready BOOLEAN DEFAULT false,
  widerruf_ready BOOLEAN DEFAULT false,
  verpackg_registered BOOLEAN DEFAULT false,
  ce_marking_checked BOOLEAN DEFAULT false,
  product_labeling_done BOOLEAN DEFAULT false,
  agb_ready BOOLEAN DEFAULT false,
  risk_flags JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(brand_id)
);

ALTER TABLE public.compliance_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own compliance_scores"
  ON public.compliance_scores FOR ALL
  USING (public.owns_brand(brand_id))
  WITH CHECK (public.owns_brand(brand_id));

CREATE TRIGGER update_compliance_scores_updated_at
  BEFORE UPDATE ON public.compliance_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════
-- PART 3: Pro Plan Strategic Scores
-- ═══════════════════════════════════════════════════

CREATE TABLE public.strategic_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  launch_probability INTEGER DEFAULT 0,
  execution_score INTEGER DEFAULT 0,
  capital_burn_monthly NUMERIC DEFAULT 0,
  cash_runway_months NUMERIC DEFAULT 0,
  supplier_risk_score INTEGER DEFAULT 0,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  scenario_snapshots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(brand_id)
);

ALTER TABLE public.strategic_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own strategic_scores"
  ON public.strategic_scores FOR ALL
  USING (public.owns_brand(brand_id))
  WITH CHECK (public.owns_brand(brand_id));

CREATE TRIGGER update_strategic_scores_updated_at
  BEFORE UPDATE ON public.strategic_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
