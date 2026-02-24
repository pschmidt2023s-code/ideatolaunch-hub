
-- Phase 2: Extend error_logs with error_type, metadata, session_id
ALTER TABLE public.error_logs
  ADD COLUMN IF NOT EXISTS error_type TEXT NOT NULL DEFAULT 'frontend',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Phase 4: Add session_id to analytics_events
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Phase 3 DB Guardrails: Prevent negative financial values via trigger
CREATE OR REPLACE FUNCTION public.validate_financial_model()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.production_cost IS NOT NULL AND NEW.production_cost < 0 THEN
    RAISE EXCEPTION 'production_cost cannot be negative';
  END IF;
  IF NEW.packaging_cost IS NOT NULL AND NEW.packaging_cost < 0 THEN
    RAISE EXCEPTION 'packaging_cost cannot be negative';
  END IF;
  IF NEW.shipping_cost IS NOT NULL AND NEW.shipping_cost < 0 THEN
    RAISE EXCEPTION 'shipping_cost cannot be negative';
  END IF;
  IF NEW.marketing_budget IS NOT NULL AND NEW.marketing_budget < 0 THEN
    RAISE EXCEPTION 'marketing_budget cannot be negative';
  END IF;
  IF NEW.margin IS NOT NULL AND (NEW.margin < 0 OR NEW.margin > 100) THEN
    RAISE EXCEPTION 'margin must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_financial_model_trigger
  BEFORE INSERT OR UPDATE ON public.financial_models
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_financial_model();

-- Guardrail: Prevent duplicate brands for free users via trigger
CREATE OR REPLACE FUNCTION public.enforce_free_brand_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_plan TEXT;
  brand_count INT;
BEGIN
  SELECT status INTO user_plan FROM public.subscriptions WHERE user_id = NEW.user_id LIMIT 1;
  
  IF user_plan IS NULL OR user_plan = 'free' THEN
    SELECT COUNT(*) INTO brand_count FROM public.brands WHERE user_id = NEW.user_id;
    IF brand_count >= 1 THEN
      RAISE EXCEPTION 'Free plan allows only 1 brand';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_free_brand_limit_trigger
  BEFORE INSERT ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_brand_limit();

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON public.error_logs (error_type);
