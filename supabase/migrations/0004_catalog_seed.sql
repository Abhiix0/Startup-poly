-- Migration 0004: Official Rulebook Business Catalog Seed
-- STARTUPOLY Live Scoreboard & Game Management System

INSERT INTO public.business_catalog (
  key,
  name,
  cost,
  initial_cv,
  u1_cost,
  u2_cost,
  u1_cv,
  u2_cv,
  is_provisional,
  sort_order
) VALUES
  ('edtech', 'EdTech', 200, 150, 150, 200, 300, 400, false, 1),
  ('saas', 'SaaS', 300, 180, 200, 250, 300, 400, false, 2),
  ('ecommerce', 'E-Commerce', 300, 180, 200, 250, 300, 400, false, 3),
  ('fintech', 'FinTech', 400, 200, 250, 300, 300, 400, false, 4),
  ('healthtech', 'HealthTech', 400, 200, 250, 300, 300, 400, false, 5),
  ('ai_deeptech', 'AI / DeepTech', 500, 250, 300, 350, 300, 400, false, 6),
  ('devtools', 'DevTools / Infrastructure', 300, 190, 200, 250, 300, 400, true, 7),
  ('cybersecurity', 'Cybersecurity', 400, 220, 250, 300, 300, 400, true, 8),
  ('cleantech', 'CleanTech / Energy', 500, 240, 300, 350, 300, 400, true, 9),
  ('robotics', 'Robotics & IoT', 500, 250, 300, 350, 300, 400, true, 10)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  cost = EXCLUDED.cost,
  initial_cv = EXCLUDED.initial_cv,
  u1_cost = EXCLUDED.u1_cost,
  u2_cost = EXCLUDED.u2_cost,
  u1_cv = EXCLUDED.u1_cv,
  u2_cv = EXCLUDED.u2_cv,
  is_provisional = EXCLUDED.is_provisional,
  sort_order = EXCLUDED.sort_order;
