-- ============================================================
-- Operon Automation — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Businesses (one per user)
create table public.businesses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null unique,
  name         text not null,
  website_url  text,
  industry     text,
  phone        text,
  city_state   text,
  main_service text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Revenue Leak Scans
create table public.scans (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  score              integer not null,
  runs_ads           text,
  uses_crm           text,
  manual_follow_up   text,
  asks_reviews       text,
  tracks_lead_source text,
  biggest_problem    text,
  created_at         timestamptz default now()
);

-- Revenue Leaks
create table public.leaks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  scan_id          uuid references public.scans(id) on delete cascade,
  title            text not null,
  description      text,
  impact           text check (impact in ('low', 'medium', 'high')),
  recommended_fix  text,
  status           text default 'open' check (status in ('open', 'in_progress', 'fixed')),
  created_at       timestamptz default now()
);

-- ============================================================
-- Row Level Security (users can only see their own data)
-- ============================================================
alter table public.businesses enable row level security;
alter table public.scans      enable row level security;
alter table public.leaks      enable row level security;

create policy "users_own_business" on public.businesses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_scans" on public.scans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_leaks" on public.leaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
