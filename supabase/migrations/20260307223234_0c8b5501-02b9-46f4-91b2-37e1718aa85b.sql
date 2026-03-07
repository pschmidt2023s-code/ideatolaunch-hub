
-- Audit trail table for tracking all data changes on critical tables
CREATE TABLE public.data_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read data audit log" ON public.data_audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert data audit" ON public.data_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_data_audit_log_table ON public.data_audit_log (table_name, created_at DESC);
CREATE INDEX idx_data_audit_log_user ON public.data_audit_log (user_id, created_at DESC);
CREATE INDEX idx_data_audit_log_record ON public.data_audit_log (record_id);

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.data_audit_log (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.data_audit_log (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.data_audit_log (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_profiles AFTER UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_admin_users AFTER INSERT OR UPDATE OR DELETE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_trading_accounts AFTER INSERT OR UPDATE OR DELETE ON public.trading_accounts FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_license_invitations AFTER UPDATE ON public.license_invitations FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_discount_codes AFTER INSERT OR UPDATE OR DELETE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_security_events AFTER INSERT ON public.security_events FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Server-side rate limit tracking table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE(key)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) can access
CREATE POLICY "Service role only" ON public.rate_limits
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_rate_limits_key ON public.rate_limits (key);
CREATE INDEX idx_rate_limits_window ON public.rate_limits (window_start);
