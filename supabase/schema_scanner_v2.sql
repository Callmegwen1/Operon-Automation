-- ============================================================
-- Operon Automation — Scanner V2 Migration
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Run AFTER schema.sql and schema_phase2.sql
-- ============================================================

-- Extend scans table with full scan payload storage
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS business_name      text,
  ADD COLUMN IF NOT EXISTS industry           text,
  ADD COLUMN IF NOT EXISTS city_state         text,
  ADD COLUMN IF NOT EXISTS website_url        text,
  ADD COLUMN IF NOT EXISTS phone              text,
  ADD COLUMN IF NOT EXISTS main_service       text,
  ADD COLUMN IF NOT EXISTS avg_job_value      integer,
  ADD COLUMN IF NOT EXISTS response_time      text,
  ADD COLUMN IF NOT EXISTS monthly_leads      text,
  ADD COLUMN IF NOT EXISTS has_google_profile text,
  ADD COLUMN IF NOT EXISTS sends_reminders    text,
  ADD COLUMN IF NOT EXISTS has_repeat_system  text,
  ADD COLUMN IF NOT EXISTS website_analysis   jsonb,
  ADD COLUMN IF NOT EXISTS breakdown          jsonb,
  ADD COLUMN IF NOT EXISTS sub_scores         jsonb;

-- Fast lookup for "most recent scan by this user" (used for re-scan delta)
CREATE INDEX IF NOT EXISTS scans_user_created_idx
  ON public.scans (user_id, created_at DESC);
