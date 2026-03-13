-- Migration: Add plan column to subscriptions table
-- BrandOS 4.0 requires explicit plan field for tier management

-- Add plan column with default 'free'
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

-- Update existing active subscriptions to 'builder' plan
UPDATE public.subscriptions 
SET plan = 'builder' 
WHERE status = 'active' AND plan = 'free';

-- Create index for faster plan queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);