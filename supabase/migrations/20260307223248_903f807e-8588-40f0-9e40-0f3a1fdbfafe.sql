
-- Tighten audit log INSERT to admin-only (triggers use SECURITY DEFINER and bypass RLS)
DROP POLICY "System can insert data audit" ON public.data_audit_log;
CREATE POLICY "Only admins can insert data audit directly" ON public.data_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
