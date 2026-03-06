
-- Add license_key column to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS license_key text UNIQUE;

-- Function to generate a license key like "BOS-XXXX-XXXX-XXXX"
CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_key text;
  key_exists boolean;
BEGIN
  IF NEW.license_key IS NULL AND NEW.status IS DISTINCT FROM 'free' THEN
    LOOP
      new_key := 'BOS-' ||
        upper(substr(md5(random()::text), 1, 4)) || '-' ||
        upper(substr(md5(random()::text), 1, 4)) || '-' ||
        upper(substr(md5(random()::text), 1, 4));
      SELECT EXISTS (SELECT 1 FROM public.subscriptions WHERE license_key = new_key) INTO key_exists;
      EXIT WHEN NOT key_exists;
    END LOOP;
    NEW.license_key := new_key;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on insert and update
CREATE TRIGGER trg_generate_license_key
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_license_key();
