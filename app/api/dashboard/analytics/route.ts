import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const FUNNEL_EVENTS = [
  'scanner_viewed',
  'scanner_started',
  'scanner_submitted',
  'scanner_completed',
  'results_viewed',
  'email_report_requested',
  'pricing_viewed',
  'plan_clicked',
  'signup_started',
  'signup_completed',
  'checkout_started',
  'purchase_completed',
  'agent_activated',
]

export async function GET(req: NextRequest) {
  const supabaseAuth = createServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 90)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const supabase = getAdminClient()

  const [
    { data: allEvents },
    { data: scannerEvents },
    { data: planEvents },
    { data: agentEvents },
    { data: industryEvents },
    { data: sourceEvents },
  ] = await Promise.all([
    // All funnel events in window
    supabase
      .from('analytics_events')
      .select('event_name, anonymous_id, created_at')
      .in('event_name', FUNNEL_EVENTS)
      .gte('created_at', since),

    // Scanner-specific data
    supabase
      .from('analytics_events')
      .select('event_name, score, score_range, industry, website_domain, properties')
      .in('event_name', ['scanner_completed', 'scanner_failed'])
      .gte('created_at', since),

    // Plan clicks
    supabase
      .from('analytics_events')
      .select('plan_clicked, anonymous_id')
      .eq('event_name', 'plan_clicked')
      .not('plan_clicked', 'is', null)
      .gte('created_at', since),

    // Agent activations by type
    supabase
      .from('analytics_events')
      .select('agent_type, anonymous_id')
      .eq('event_name', 'agent_activated')
      .not('agent_type', 'is', null)
      .gte('created_at', since),

    // Industry breakdown for completed scans
    supabase
      .from('analytics_events')
      .select('industry, anonymous_id')
      .eq('event_name', 'scanner_completed')
      .not('industry', 'is', null)
      .gte('created_at', since),

    // Source/UTM breakdown for key events
    supabase
      .from('analytics_events')
      .select('utm_source, utm_campaign, utm_medium, event_name')
      .in('event_name', ['scanner_completed', 'signup_completed', 'purchase_completed'])
      .gte('created_at', since),
  ])

  // ── Funnel counts ────────────────────────────────────────────
  const funnelCounts: Record<string, number> = {}
  const funnelUnique: Record<string, Set<string>> = {}
  for (const evt of allEvents ?? []) {
    funnelCounts[evt.event_name] = (funnelCounts[evt.event_name] ?? 0) + 1
    if (!funnelUnique[evt.event_name]) funnelUnique[evt.event_name] = new Set()
    if (evt.anonymous_id) funnelUnique[evt.event_name].add(evt.anonymous_id)
  }
  const funnel = FUNNEL_EVENTS.map((e) => ({
    event:       e,
    total:       funnelCounts[e] ?? 0,
    unique:      funnelUnique[e]?.size ?? 0,
  }))

  // ── Scanner stats ────────────────────────────────────────────
  const completions = (scannerEvents ?? []).filter(e => e.event_name === 'scanner_completed')
  const scores = completions.map(e => e.score).filter((s): s is number => typeof s === 'number')
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  const scoreRanges: Record<string, number> = {}
  for (const e of completions) {
    if (e.score_range) scoreRanges[e.score_range] = (scoreRanges[e.score_range] ?? 0) + 1
  }

  const scanDurations = completions
    .map(e => (e.properties as Record<string, unknown>)?.scan_duration_ms)
    .filter((d): d is number => typeof d === 'number')
  const avgDuration = scanDurations.length
    ? Math.round(scanDurations.reduce((a, b) => a + b, 0) / scanDurations.length)
    : null

  // ── Plan breakdown ───────────────────────────────────────────
  const planBreakdown: Record<string, number> = {}
  for (const e of planEvents ?? []) {
    if (e.plan_clicked) planBreakdown[e.plan_clicked] = (planBreakdown[e.plan_clicked] ?? 0) + 1
  }

  // ── Agent breakdown ──────────────────────────────────────────
  const agentBreakdown: Record<string, number> = {}
  for (const e of agentEvents ?? []) {
    if (e.agent_type) agentBreakdown[e.agent_type] = (agentBreakdown[e.agent_type] ?? 0) + 1
  }

  // ── Industry breakdown ───────────────────────────────────────
  const industryBreakdown: Record<string, number> = {}
  for (const e of industryEvents ?? []) {
    if (e.industry) industryBreakdown[e.industry] = (industryBreakdown[e.industry] ?? 0) + 1
  }

  // ── Source breakdown ─────────────────────────────────────────
  const sourceBreakdown: Record<string, number> = {}
  const campaignBreakdown: Record<string, number> = {}
  for (const e of sourceEvents ?? []) {
    const src = e.utm_source ?? 'direct'
    sourceBreakdown[src] = (sourceBreakdown[src] ?? 0) + 1
    if (e.utm_campaign) campaignBreakdown[e.utm_campaign] = (campaignBreakdown[e.utm_campaign] ?? 0) + 1
  }

  // ── Conversion rates ─────────────────────────────────────────
  const scanViews    = funnelCounts['scanner_viewed']    ?? 0
  const scanStarts   = funnelCounts['scanner_started']   ?? 0
  const scanComplete = funnelCounts['scanner_completed'] ?? 0
  const emailReqs    = funnelCounts['email_report_requested'] ?? 0
  const pricingViews = funnelCounts['pricing_viewed']    ?? 0
  const planClicks   = funnelCounts['plan_clicked']      ?? 0
  const signups      = funnelCounts['signup_completed']  ?? 0
  const purchases    = funnelCounts['purchase_completed'] ?? 0
  const activations  = funnelCounts['agent_activated']   ?? 0

  const conversionRates = {
    scanView_to_start:   scanViews   > 0 ? Math.round((scanStarts / scanViews) * 100)    : null,
    start_to_complete:   scanStarts  > 0 ? Math.round((scanComplete / scanStarts) * 100)  : null,
    complete_to_email:   scanComplete > 0 ? Math.round((emailReqs / scanComplete) * 100)  : null,
    complete_to_pricing: scanComplete > 0 ? Math.round((pricingViews / scanComplete) * 100) : null,
    pricing_to_plan:     pricingViews > 0 ? Math.round((planClicks / pricingViews) * 100)  : null,
    plan_to_signup:      planClicks  > 0 ? Math.round((signups / planClicks) * 100)       : null,
    signup_to_purchase:  signups     > 0 ? Math.round((purchases / signups) * 100)        : null,
    purchase_to_agent:   purchases   > 0 ? Math.round((activations / purchases) * 100)   : null,
  }

  return NextResponse.json({
    days,
    funnel,
    scannerStats: {
      totalCompletions: completions.length,
      avgScore,
      avgDurationMs: avgDuration,
      scoreRanges,
    },
    planBreakdown,
    agentBreakdown,
    industryBreakdown,
    sourceBreakdown,
    campaignBreakdown,
    conversionRates,
  })
}
