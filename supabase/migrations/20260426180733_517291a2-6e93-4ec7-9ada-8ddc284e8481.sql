CREATE TABLE public.seo_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  scan_type text NOT NULL DEFAULT 'full',
  target_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  urls_scanned integer NOT NULL DEFAULT 0,
  findings_count integer NOT NULL DEFAULT 0,
  critical_count integer NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  info_count integer NOT NULL DEFAULT 0,
  overall_score integer,
  duration_ms integer,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.seo_audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.seo_audit_runs(id) ON DELETE CASCADE,
  url text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  recommendation text,
  current_value text,
  expected_value text,
  auto_fixable boolean NOT NULL DEFAULT false,
  fix_status text NOT NULL DEFAULT 'open',
  fix_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_findings_run ON public.seo_audit_findings(run_id);
CREATE INDEX idx_seo_findings_severity ON public.seo_audit_findings(severity);
CREATE INDEX idx_seo_runs_status ON public.seo_audit_runs(status, created_at DESC);

ALTER TABLE public.seo_audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage audit runs" ON public.seo_audit_runs FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins manage audit findings" ON public.seo_audit_findings FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER trg_seo_findings_updated BEFORE UPDATE ON public.seo_audit_findings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();