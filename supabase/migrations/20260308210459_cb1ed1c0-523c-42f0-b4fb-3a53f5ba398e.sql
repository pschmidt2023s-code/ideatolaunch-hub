-- Fix views: they're SECURITY INVOKER so underlying RLS applies, but scanner wants explicit protection
-- Drop and recreate as plain tables won't work - views can't have RLS directly in PG
-- Instead, ensure the underlying tables have proper RLS (they do) and the views use security_invoker (they do)

-- Fix community_reputation: remove direct INSERT/UPDATE, use SECURITY DEFINER function
DROP POLICY IF EXISTS "Users can insert own reputation" ON public.community_reputation;
DROP POLICY IF EXISTS "Users can update own reputation" ON public.community_reputation;

-- Create a safe function to increment reputation
CREATE OR REPLACE FUNCTION public.increment_reputation(
  p_user_id UUID,
  p_points INT DEFAULT 1,
  p_field TEXT DEFAULT 'post_count'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO community_reputation (user_id, points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id) DO UPDATE SET
    points = community_reputation.points + p_points,
    post_count = CASE WHEN p_field = 'post_count' THEN community_reputation.post_count + 1 ELSE community_reputation.post_count END,
    reply_count = CASE WHEN p_field = 'reply_count' THEN community_reputation.reply_count + 1 ELSE community_reputation.reply_count END,
    review_count = CASE WHEN p_field = 'review_count' THEN community_reputation.review_count + 1 ELSE community_reputation.review_count END,
    case_study_count = CASE WHEN p_field = 'case_study_count' THEN community_reputation.case_study_count + 1 ELSE community_reputation.case_study_count END,
    level = CASE
      WHEN community_reputation.points + p_points >= 500 THEN 'Legend'
      WHEN community_reputation.points + p_points >= 200 THEN 'Strategist'
      WHEN community_reputation.points + p_points >= 100 THEN 'Operator'
      WHEN community_reputation.points + p_points >= 30 THEN 'Builder'
      ELSE 'Starter'
    END,
    updated_at = now();
END;
$$;