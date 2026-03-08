
-- Fix 1: Remove user-facing UPDATE policy on referrals to prevent self-granting rewards
DROP POLICY IF EXISTS "Users can update own referral" ON public.referrals;

-- Fix 2: Enable RLS on trading_accounts_safe if it's a table (not a view)
-- First check and enable RLS, then add policy
DO $$
BEGIN
  -- Only proceed if trading_accounts_safe is a table
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'trading_accounts_safe' AND table_type = 'BASE TABLE'
  ) THEN
    EXECUTE 'ALTER TABLE public.trading_accounts_safe ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own trading accounts safe" ON public.trading_accounts_safe';
    EXECUTE 'CREATE POLICY "Users can view own trading accounts safe" ON public.trading_accounts_safe FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Fix 3: Enable RLS on referral_validation_summary if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'referral_validation_summary' AND table_type = 'BASE TABLE'
  ) THEN
    EXECUTE 'ALTER TABLE public.referral_validation_summary ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Only admins can view fraud data" ON public.referral_validation_summary';
    EXECUTE 'CREATE POLICY "Only admins can view fraud data" ON public.referral_validation_summary FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))';
  END IF;
END $$;
