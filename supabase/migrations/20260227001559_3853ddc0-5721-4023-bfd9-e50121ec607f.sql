
-- Discount Codes table
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  applicable_plans TEXT[] NOT NULL DEFAULT '{}',
  expiration_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  current_usage INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  internal_notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can CRUD discount_codes"
ON public.discount_codes FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Admin Audit Log table
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  affected_user_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
ON public.admin_audit_log FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert audit log"
ON public.admin_audit_log FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Feature Flag Overrides table
CREATE TABLE public.feature_flag_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL,
  override_type TEXT NOT NULL CHECK (override_type IN ('global', 'plan', 'user')),
  target_value TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  modified_by UUID,
  modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feature_key, override_type, target_value)
);

ALTER TABLE public.feature_flag_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can CRUD feature_flag_overrides"
ON public.feature_flag_overrides FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Admin policies for subscriptions (allow admin update)
CREATE POLICY "Admins can read all subscriptions"
ON public.subscriptions FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all subscriptions"
ON public.subscriptions FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Admin can read all profiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at on discount_codes
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
