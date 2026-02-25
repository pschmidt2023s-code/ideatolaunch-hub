
CREATE TABLE public.unboxing_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  packaging_type TEXT NOT NULL DEFAULT 'kraft_box',
  tissue_paper BOOLEAN NOT NULL DEFAULT false,
  sticker_seal BOOLEAN NOT NULL DEFAULT false,
  thank_you_card BOOLEAN NOT NULL DEFAULT false,
  insert_samples BOOLEAN NOT NULL DEFAULT false,
  custom_labeling BOOLEAN NOT NULL DEFAULT false,
  return_friendly BOOLEAN NOT NULL DEFAULT false,
  packaging_budget NUMERIC,
  target_positioning TEXT NOT NULL DEFAULT 'mid',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id)
);

ALTER TABLE public.unboxing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own unboxing_profiles"
  ON public.unboxing_profiles
  FOR ALL
  USING (owns_brand(brand_id))
  WITH CHECK (owns_brand(brand_id));

CREATE TRIGGER update_unboxing_profiles_updated_at
  BEFORE UPDATE ON public.unboxing_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
