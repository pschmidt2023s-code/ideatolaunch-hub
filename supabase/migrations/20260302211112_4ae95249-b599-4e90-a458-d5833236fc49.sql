
-- Migrate brands.current_step from 7-step to 5-step system
-- Old mapping:
--   Step 1,2 (Idea + Brand) → New Step 1 (Validation & Brand)
--   Step 3 (Calculator) → New Step 2 (Financial Clarity)
--   Step 4 (Production) → New Step 3 (Production & Sourcing)
--   Step 5,6 (Compliance + Sales) → New Step 4 (Compliance & Sales)
--   Step 7 (Launch) → New Step 5 (Launch & Optimize)
--   Step 8+ (completed) → New Step 6 (completed)

UPDATE public.brands SET current_step = CASE
  WHEN current_step <= 2 THEN 1
  WHEN current_step = 3 THEN 2
  WHEN current_step = 4 THEN 3
  WHEN current_step IN (5, 6) THEN 4
  WHEN current_step = 7 THEN 5
  ELSE 6
END;
