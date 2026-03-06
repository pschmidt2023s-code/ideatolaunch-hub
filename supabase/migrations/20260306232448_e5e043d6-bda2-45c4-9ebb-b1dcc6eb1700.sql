
-- Invitation links table for license distribution without pre-registration
CREATE TABLE public.license_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  plan text NOT NULL DEFAULT 'builder',
  license_key text,
  status text NOT NULL DEFAULT 'active',
  label text,
  created_by uuid NOT NULL,
  used_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  expires_at timestamptz
);

-- Generate license key for invitation
CREATE OR REPLACE FUNCTION public.generate_invitation_license_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_key text;
  key_exists boolean;
BEGIN
  IF NEW.license_key IS NULL THEN
    LOOP
      new_key := 'BOS-' ||
        upper(substr(md5(random()::text), 1, 4)) || '-' ||
        upper(substr(md5(random()::text), 1, 4)) || '-' ||
        upper(substr(md5(random()::text), 1, 4));
      SELECT EXISTS (
        SELECT 1 FROM public.subscriptions WHERE license_key = new_key
        UNION ALL
        SELECT 1 FROM public.license_invitations WHERE license_key = new_key
      ) INTO key_exists;
      EXIT WHEN NOT key_exists;
    END LOOP;
    NEW.license_key := new_key;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_invitation_license_key
  BEFORE INSERT ON public.license_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invitation_license_key();

-- RLS
ALTER TABLE public.license_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can CRUD license_invitations"
  ON public.license_invitations FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can read active invitations by token"
  ON public.license_invitations FOR SELECT
  USING (status = 'active');

CREATE INDEX idx_license_invitations_token ON public.license_invitations(token);
CREATE INDEX idx_license_invitations_status ON public.license_invitations(status);
