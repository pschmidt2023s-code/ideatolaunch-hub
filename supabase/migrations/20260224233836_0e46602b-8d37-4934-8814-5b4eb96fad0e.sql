
-- Auto-create a FREE subscription for every new user
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status)
  VALUES (NEW.id, 'free')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Backfill existing users who don't have a subscription row
INSERT INTO public.subscriptions (user_id, status)
SELECT id, 'free' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT DO NOTHING;
