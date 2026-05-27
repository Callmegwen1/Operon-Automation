-- Fix: drop overly-permissive service_role policies on agent tables.
-- The service role key bypasses RLS automatically — these policies are
-- unnecessary and allow any authenticated user to read/write all rows.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

DROP POLICY IF EXISTS "service_role_agent_runs"     ON public.agent_runs;
DROP POLICY IF EXISTS "service_role_agent_tasks"    ON public.agent_tasks;
DROP POLICY IF EXISTS "service_role_agent_messages" ON public.agent_messages;
