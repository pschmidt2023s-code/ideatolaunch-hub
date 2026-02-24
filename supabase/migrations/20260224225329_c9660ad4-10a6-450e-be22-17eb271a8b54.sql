
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Brands table (central entity)
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Meine Marke',
  current_step INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own brands" ON public.brands FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function for brand ownership
CREATE OR REPLACE FUNCTION public.owns_brand(_brand_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.brands WHERE id = _brand_id AND user_id = auth.uid())
$$;

-- Brand Profiles (Step 1 - Idea Foundation)
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL UNIQUE,
  product_description TEXT,
  target_audience TEXT,
  price_level TEXT,
  country TEXT,
  budget TEXT,
  timeline TEXT,
  positioning_statement TEXT,
  brand_values TEXT,
  market_angle TEXT,
  differentiation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own brand_profiles" ON public.brand_profiles FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Brand Identities (Step 2)
CREATE TABLE public.brand_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL UNIQUE,
  brand_name TEXT,
  tone TEXT,
  visual_direction TEXT,
  tagline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own brand_identities" ON public.brand_identities FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));
CREATE TRIGGER update_brand_identities_updated_at BEFORE UPDATE ON public.brand_identities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Financial Models (Step 3)
CREATE TABLE public.financial_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL UNIQUE,
  production_cost NUMERIC,
  packaging_cost NUMERIC,
  shipping_cost NUMERIC,
  marketing_budget NUMERIC,
  recommended_price NUMERIC,
  margin NUMERIC,
  break_even_units INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own financial_models" ON public.financial_models FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));
CREATE TRIGGER update_financial_models_updated_at BEFORE UPDATE ON public.financial_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Production Plans (Step 4)
CREATE TABLE public.production_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL UNIQUE,
  production_region TEXT,
  moq_expectation TEXT,
  product_category TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  supplier_questions JSONB DEFAULT '[]'::jsonb,
  risk_warnings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.production_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own production_plans" ON public.production_plans FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));
CREATE TRIGGER update_production_plans_updated_at BEFORE UPDATE ON public.production_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Compliance Plans (Step 5)
CREATE TABLE public.compliance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL UNIQUE,
  label_checklist JSONB DEFAULT '[]'::jsonb,
  legal_summary TEXT,
  packaging_info JSONB DEFAULT '[]'::jsonb,
  barcode_guide TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own compliance_plans" ON public.compliance_plans FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));
CREATE TRIGGER update_compliance_plans_updated_at BEFORE UPDATE ON public.compliance_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Launch Plans (Step 6 + 7)
CREATE TABLE public.launch_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL UNIQUE,
  sales_channel TEXT,
  launch_quantity INTEGER,
  fulfillment_model TEXT,
  operational_checklist JSONB DEFAULT '[]'::jsonb,
  logistics_steps JSONB DEFAULT '[]'::jsonb,
  launch_readiness_score INTEGER,
  roadmap JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own launch_plans" ON public.launch_plans FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));
CREATE TRIGGER update_launch_plans_updated_at BEFORE UPDATE ON public.launch_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Brand Tasks
CREATE TABLE public.brand_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  step_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own brand_tasks" ON public.brand_tasks FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));
CREATE TRIGGER update_brand_tasks_updated_at BEFORE UPDATE ON public.brand_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT,
  document_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own documents" ON public.documents FOR ALL USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

-- Subscriptions (managed by Stripe webhooks)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'free',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
