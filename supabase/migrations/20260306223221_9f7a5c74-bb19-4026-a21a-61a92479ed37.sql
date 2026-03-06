
-- Performance indexes for frequently queried columns
-- brands: user_id lookups (every dashboard load)
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);

-- subscriptions: user_id lookups (every page load for plan check)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- profiles: user_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- brand-related tables: brand_id foreign key lookups
CREATE INDEX IF NOT EXISTS idx_brand_profiles_brand_id ON public.brand_profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_identities_brand_id ON public.brand_identities(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_tasks_brand_id ON public.brand_tasks(brand_id);
CREATE INDEX IF NOT EXISTS idx_financial_models_brand_id ON public.financial_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_compliance_plans_brand_id ON public.compliance_plans(brand_id);
CREATE INDEX IF NOT EXISTS idx_compliance_scores_brand_id ON public.compliance_scores(brand_id);
CREATE INDEX IF NOT EXISTS idx_production_plans_brand_id ON public.production_plans(brand_id);
CREATE INDEX IF NOT EXISTS idx_launch_plans_brand_id ON public.launch_plans(brand_id);
CREATE INDEX IF NOT EXISTS idx_strategic_scores_brand_id ON public.strategic_scores(brand_id);
CREATE INDEX IF NOT EXISTS idx_unboxing_profiles_brand_id ON public.unboxing_profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_documents_brand_id ON public.documents(brand_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_brand_id ON public.weekly_reviews(brand_id);
CREATE INDEX IF NOT EXISTS idx_founder_decisions_brand_id ON public.founder_decisions(brand_id);

-- analytics: time-based queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_analytics_created ON public.founder_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_founder_analytics_user ON public.founder_analytics_events(user_id);

-- error_logs: time-based admin queries
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON public.error_logs(error_type);

-- security_events: time-based admin queries
CREATE INDEX IF NOT EXISTS idx_security_events_created ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);

-- supplier_clicks: analytics
CREATE INDEX IF NOT EXISTS idx_supplier_clicks_supplier ON public.supplier_clicks(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_clicks_created ON public.supplier_clicks(created_at DESC);

-- login_attempts: security monitoring
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON public.login_attempts(created_at DESC);

-- referrals: code lookups
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON public.referrals(user_id);

-- referral_validations: referral_id
CREATE INDEX IF NOT EXISTS idx_referral_validations_referral ON public.referral_validations(referral_id);

-- leads: admin queries
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);

-- weekly_reviews: composite for user+brand+week lookups
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON public.weekly_reviews(user_id, year DESC, week_number DESC);

-- brand_tasks: filter by completion status
CREATE INDEX IF NOT EXISTS idx_brand_tasks_completed ON public.brand_tasks(brand_id, completed);
