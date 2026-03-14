
-- Website projects table
CREATE TABLE public.website_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Meine Website',
  status text NOT NULL DEFAULT 'draft',
  website_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  color_scheme text DEFAULT 'modern-dark',
  selected_pages text[] DEFAULT '{home}'::text[],
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_projects ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD own projects
CREATE POLICY "Users can CRUD own website_projects"
  ON public.website_projects FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI change requests / wishes
CREATE TABLE public.website_wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.website_projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  wish_text text NOT NULL,
  target_page text,
  target_section text,
  status text NOT NULL DEFAULT 'pending',
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.website_wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own website_wishes"
  ON public.website_wishes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_website_projects_user ON public.website_projects(user_id);
CREATE INDEX idx_website_projects_brand ON public.website_projects(brand_id);
CREATE INDEX idx_website_wishes_project ON public.website_wishes(project_id);

-- Updated_at trigger
CREATE TRIGGER update_website_projects_updated_at
  BEFORE UPDATE ON public.website_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
