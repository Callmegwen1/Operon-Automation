-- ============================================================
-- Operon Automation — Agents V2 Schema
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Run AFTER schema.sql and schema_phase2.sql
-- ============================================================

-- 1. Expand contacts status to full lifecycle
alter table public.contacts drop constraint if exists contacts_status_check;
alter table public.contacts add constraint contacts_status_check check (
  status in (
    'new', 'contacted', 'replied', 'booked', 'completed',
    'won', 'lost', 'no_response', 'needs_owner_attention',
    'inactive', 'review_requested', 'review_completed', 'do_not_contact'
  )
);

-- 2. Agent runs — every agent action logged
create table public.agent_runs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  agent_type       text not null,
  trigger_type     text,
  trigger_source   text,
  contact_id       uuid references public.contacts(id) on delete set null,
  status           text default 'started' check (status in ('started', 'completed', 'failed', 'skipped', 'waiting')),
  ai_summary       text,
  ai_decision      jsonb default '{}',
  actions_taken    jsonb default '[]',
  confidence       numeric,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- 3. Agent tasks — owner action items created by agents
create table public.agent_tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  contact_id  uuid references public.contacts(id) on delete set null,
  agent_type  text not null,
  title       text not null,
  description text,
  priority    text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status      text default 'open' check (status in ('open', 'done', 'dismissed')),
  due_at      timestamptz,
  created_at  timestamptz default now()
);

-- 4. Agent messages — outbound message tracking (enables cancellation)
create table public.agent_messages (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete cascade not null,
  contact_id           uuid references public.contacts(id) on delete cascade,
  agent_run_id         uuid references public.agent_runs(id) on delete set null,
  agent_type           text not null,
  channel              text default 'email' check (channel in ('email', 'sms', 'owner_notification', 'dashboard_task')),
  template_id          text,
  subject              text,
  status               text default 'scheduled' check (status in ('scheduled', 'sent', 'failed', 'canceled')),
  scheduled_for        timestamptz,
  sent_at              timestamptz,
  external_provider_id text,
  created_at           timestamptz default now()
);

-- 5. Row Level Security
alter table public.agent_runs     enable row level security;
alter table public.agent_tasks    enable row level security;
alter table public.agent_messages enable row level security;

create policy "users_own_agent_runs" on public.agent_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_agent_tasks" on public.agent_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_agent_messages" on public.agent_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Service role bypass policies (for cron + public lead route)
create policy "service_role_agent_runs" on public.agent_runs
  for all using (true) with check (true);

create policy "service_role_agent_tasks" on public.agent_tasks
  for all using (true) with check (true);

create policy "service_role_agent_messages" on public.agent_messages
  for all using (true) with check (true);

-- 6. Indexes
create index idx_agent_runs_user_id    on public.agent_runs(user_id);
create index idx_agent_tasks_user_id   on public.agent_tasks(user_id, status);
create index idx_agent_messages_contact on public.agent_messages(contact_id, status);
