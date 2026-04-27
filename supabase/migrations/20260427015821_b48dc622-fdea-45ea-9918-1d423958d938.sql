
-- Fix-Historie für Auto-Fix Engine
CREATE TABLE IF NOT EXISTS public.seo_audit_fixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid REFERENCES public.seo_audit_findings(id) ON DELETE CASCADE,
  run_id uuid REFERENCES public.seo_audit_runs(id) ON DELETE CASCADE,
  fix_type text NOT NULL, -- 'ai_patch' | 'auto_apply' | 'manual_guide'
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'applied' | 'failed' | 'skipped'
  target_file text,
  patch_content text,
  ai_explanation text,
  applied_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz
);

ALTER TABLE public.seo_audit_fixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all fixes"
  ON public.seo_audit_fixes FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert fixes"
  ON public.seo_audit_fixes FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update fixes"
  ON public.seo_audit_fixes FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_seo_fixes_finding ON public.seo_audit_fixes(finding_id);
CREATE INDEX IF NOT EXISTS idx_seo_fixes_run ON public.seo_audit_fixes(run_id);
