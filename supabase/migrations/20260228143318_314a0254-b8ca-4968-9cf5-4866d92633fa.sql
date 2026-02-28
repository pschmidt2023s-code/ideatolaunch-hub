-- Add archetype and risk_tolerance columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS archetype text,
ADD COLUMN IF NOT EXISTS risk_tolerance text;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.archetype IS 'Founder archetype: conservative_planner, aggressive_scaler, brand_perfectionist, recovery_founder';
COMMENT ON COLUMN public.profiles.risk_tolerance IS 'Risk tolerance level: low, medium, high';