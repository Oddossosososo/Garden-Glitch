-- GardenGlitch database baseline.
-- Keep authorization in RLS policies and never store service-role keys in client code.

create table if not exists public.garden_glitch_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
