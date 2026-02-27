
-- Just update the function (trigger already exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, completed_starter_mode)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill: create profile rows for any existing users without one
INSERT INTO public.profiles (user_id, completed_starter_mode)
SELECT id, false FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;
