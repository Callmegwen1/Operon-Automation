-- ─────────────────────────────────────────────────────────────────
-- Operon Automation — Row Level Security policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Safe to run multiple times — each block drops then recreates.
-- The service role key used in server-side routes bypasses RLS
-- automatically, so public-facing endpoints (embed form, cron) are
-- not affected.
-- ─────────────────────────────────────────────────────────────────

-- ── contacts ────────────────────────────────────────────────────
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select" ON contacts;
DROP POLICY IF EXISTS "contacts_insert" ON contacts;
DROP POLICY IF EXISTS "contacts_update" ON contacts;
DROP POLICY IF EXISTS "contacts_delete" ON contacts;

CREATE POLICY "contacts_select" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update" ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contacts_delete" ON contacts FOR DELETE USING (auth.uid() = user_id);

-- ── businesses ──────────────────────────────────────────────────
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "businesses_select" ON businesses;
DROP POLICY IF EXISTS "businesses_insert" ON businesses;
DROP POLICY IF EXISTS "businesses_update" ON businesses;

CREATE POLICY "businesses_select" ON businesses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "businesses_insert" ON businesses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "businesses_update" ON businesses FOR UPDATE USING (auth.uid() = user_id);

-- ── agents ──────────────────────────────────────────────────────
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agents_select" ON agents;
DROP POLICY IF EXISTS "agents_insert" ON agents;
DROP POLICY IF EXISTS "agents_update" ON agents;

CREATE POLICY "agents_select" ON agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "agents_insert" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agents_update" ON agents FOR UPDATE USING (auth.uid() = user_id);

-- ── agent_activity ──────────────────────────────────────────────
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_activity_select" ON agent_activity;
DROP POLICY IF EXISTS "agent_activity_insert" ON agent_activity;

CREATE POLICY "agent_activity_select" ON agent_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "agent_activity_insert" ON agent_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── leaks ───────────────────────────────────────────────────────
ALTER TABLE leaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaks_select" ON leaks;
DROP POLICY IF EXISTS "leaks_insert" ON leaks;
DROP POLICY IF EXISTS "leaks_update" ON leaks;
DROP POLICY IF EXISTS "leaks_delete" ON leaks;

CREATE POLICY "leaks_select" ON leaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leaks_insert" ON leaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leaks_update" ON leaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leaks_delete" ON leaks FOR DELETE USING (auth.uid() = user_id);

-- ── scans ───────────────────────────────────────────────────────
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scans_select" ON scans;
DROP POLICY IF EXISTS "scans_insert" ON scans;

CREATE POLICY "scans_select" ON scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scans_insert" ON scans FOR INSERT WITH CHECK (auth.uid() = user_id);
