-- ============================================================
-- Operon Automation — Phase 2 Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- Run AFTER schema.sql (Phase 1)
-- ============================================================

-- Agent configurations (one row per agent type per user)
create table public.agents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null check (type in ('lead_followup', 'review_request', 'weekly_report')),
  enabled    boolean default false,
  config     jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, type)
);

-- Contacts: leads and customers
create table public.contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  email      text,
  phone      text,
  type       text default 'lead' check (type in ('lead', 'customer')),
  source     text,
  status     text default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  notes      text,
  created_at timestamptz default now()
);

-- Agent activity log
create table public.agent_activity (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  agent_type text not null,
  action     text not null,
  details    jsonb default '{}',
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.agents         enable row level security;
alter table public.contacts       enable row level security;
alter table public.agent_activity enable row level security;

create policy "users_own_agents" on public.agents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_contacts" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_agent_activity" on public.agent_activity
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
