-- Analytics events table — internal source of truth for the product funnel.
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

create table if not exists public.analytics_events (
  id              uuid primary key default gen_random_uuid(),
  anonymous_id    text,
  user_id         uuid references auth.users(id) on delete set null,
  session_id      text,
  event_name      text not null,
  page_path       text,
  referrer        text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  utm_term        text,
  scan_id         uuid,
  business_id     uuid,
  industry        text,
  website_domain  text,
  score           integer,
  score_range     text,
  top_leak_ids    jsonb,
  plan_clicked    text,
  agent_type      text,
  source          text,
  properties      jsonb,
  created_at      timestamptz default now()
);

-- Index on common query patterns
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_created_at_idx  on public.analytics_events (created_at desc);
create index if not exists analytics_events_anon_id_idx     on public.analytics_events (anonymous_id);
create index if not exists analytics_events_user_id_idx     on public.analytics_events (user_id);
create index if not exists analytics_events_utm_source_idx  on public.analytics_events (utm_source);

-- RLS: only service role can read/write (we use admin client for all writes)
alter table public.analytics_events enable row level security;

-- Deny all access by default — service_role bypasses RLS automatically
-- No additional policies needed.

-- Grant select to authenticated users so the admin analytics page works
-- with the server-side Supabase client (which uses the user's session)
create policy "admin_read_analytics"
  on public.analytics_events
  for select
  using (true);
