
-- Add short_code column to license_invitations
ALTER TABLE public.license_invitations 
ADD COLUMN IF NOT EXISTS short_code text UNIQUE;

-- Create function to generate short invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_short_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
  code_exists boolean;
  prefixes text[] := ARRAY['BOS', 'VIP', 'PRO', 'MAX', 'TOP'];
  prefix text;
BEGIN
  IF NEW.short_code IS NULL THEN
    LOOP
      prefix := prefixes[1 + floor(random() * array_length(prefixes, 1))::int];
      new_code := prefix || '-' || upper(substr(md5(random()::text), 1, 4));
      SELECT EXISTS (SELECT 1 FROM public.license_invitations WHERE short_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS generate_invite_short_code_trigger ON public.license_invitations;
CREATE TRIGGER generate_invite_short_code_trigger
  BEFORE INSERT ON public.license_invitations
  FOR EACH ROW EXECUTE FUNCTION public.generate_invite_short_code();

-- Generate short codes for existing invitations that don't have one
UPDATE public.license_invitations 
SET short_code = 'BOS-' || upper(substr(md5(random()::text || id::text), 1, 4))
WHERE short_code IS NULL;
