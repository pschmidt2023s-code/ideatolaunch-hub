
-- Fix brands policy: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can CRUD own brands" ON public.brands;
CREATE POLICY "Users can CRUD own brands"
  ON public.brands FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix all other tables with the same issue

DROP POLICY IF EXISTS "Users can CRUD own brand_identities" ON public.brand_identities;
CREATE POLICY "Users can CRUD own brand_identities"
  ON public.brand_identities FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

DROP POLICY IF EXISTS "Users can CRUD own brand_profiles" ON public.brand_profiles;
CREATE POLICY "Users can CRUD own brand_profiles"
  ON public.brand_profiles FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

DROP POLICY IF EXISTS "Users can CRUD own brand_tasks" ON public.brand_tasks;
CREATE POLICY "Users can CRUD own brand_tasks"
  ON public.brand_tasks FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

DROP POLICY IF EXISTS "Users can CRUD own compliance_plans" ON public.compliance_plans;
CREATE POLICY "Users can CRUD own compliance_plans"
  ON public.compliance_plans FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

DROP POLICY IF EXISTS "Users can CRUD own documents" ON public.documents;
CREATE POLICY "Users can CRUD own documents"
  ON public.documents FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

DROP POLICY IF EXISTS "Users can CRUD own financial_models" ON public.financial_models;
CREATE POLICY "Users can CRUD own financial_models"
  ON public.financial_models FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

DROP POLICY IF EXISTS "Users can CRUD own launch_plans" ON public.launch_plans;
CREATE POLICY "Users can CRUD own launch_plans"
  ON public.launch_plans FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

DROP POLICY IF EXISTS "Users can CRUD own production_plans" ON public.production_plans;
CREATE POLICY "Users can CRUD own production_plans"
  ON public.production_plans FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

-- Fix profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Fix subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Fix analytics_events
DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;
CREATE POLICY "Users can insert own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own events" ON public.analytics_events;
CREATE POLICY "Users can read own events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Fix error_logs
DROP POLICY IF EXISTS "Users can insert error logs" ON public.error_logs;
CREATE POLICY "Users can insert error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

DROP POLICY IF EXISTS "Users can read own errors" ON public.error_logs;
CREATE POLICY "Users can read own errors"
  ON public.error_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Fix founder_analytics_events
DROP POLICY IF EXISTS "Admins can read all founder analytics" ON public.founder_analytics_events;
CREATE POLICY "Admins can read all founder analytics"
  ON public.founder_analytics_events FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own founder analytics" ON public.founder_analytics_events;
CREATE POLICY "Users can insert own founder analytics"
  ON public.founder_analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own founder analytics" ON public.founder_analytics_events;
CREATE POLICY "Users can read own founder analytics"
  ON public.founder_analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Fix admin_users
DROP POLICY IF EXISTS "Users can check own admin status" ON public.admin_users;
CREATE POLICY "Users can check own admin status"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);
