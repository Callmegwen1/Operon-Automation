import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now          = new Date()
  const todayStart   = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const next24h      = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const [
    { data: agents },
    { data: openTasks },
    { data: newLeads },
    { data: scheduledMessages },
    { data: recentActivity },
    { data: staleContacts },
    { data: estimateSent },
    { data: reviewOpps },
    { data: monthlyRuns },
    { data: failedMessages },
  ] = await Promise.all([
    // All agents
    supabase
      .from('agents')
      .select('type, enabled, updated_at')
      .eq('user_id', user.id),

    // Open tasks (needs attention)
    supabase
      .from('agent_tasks')
      .select('id, title, description, priority, due_at, contact_id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('due_at', { ascending: true })
      .limit(20),

    // New/uncontacted leads in last 7 days
    supabase
      .from('contacts')
      .select('id, name, email, phone, source, status, created_at')
      .eq('user_id', user.id)
      .eq('type', 'lead')
      .in('status', ['new', 'contacted'])
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10),

    // Scheduled messages in next 24h
    supabase
      .from('agent_messages')
      .select('id, template_id, subject, scheduled_for, channel, contact_id')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', next24h.toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(20),

    // Today's agent activity
    supabase
      .from('agent_activity')
      .select('id, agent_type, action, details, created_at')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(30),

    // Stale customers (completed/won, no contact in 90+ days)
    supabase
      .from('contacts')
      .select('id, name, email, phone, updated_at, status')
      .eq('user_id', user.id)
      .in('status', ['completed', 'won'])
      .lte('updated_at', ninetyDaysAgo.toISOString())
      .order('updated_at', { ascending: true })
      .limit(10),

    // Open estimates (sent in last 30 days)
    supabase
      .from('contacts')
      .select('id, name, email, phone, status, updated_at')
      .eq('user_id', user.id)
      .in('status', ['estimate_sent'])
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(10),

    // Review opportunities: completed/won contacts with email, no review request yet
    supabase
      .from('contacts')
      .select('id, name, email, status, updated_at')
      .eq('user_id', user.id)
      .in('status', ['completed', 'won'])
      .not('email', 'is', null)
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(10),

    // Agent runs this month (for health)
    supabase
      .from('agent_runs')
      .select('agent_type, status, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString()),

    // Failed/bounced messages in last 7 days
    supabase
      .from('agent_messages')
      .select('id, template_id, subject, status, contact_id, updated_at')
      .eq('user_id', user.id)
      .in('status', ['bounced', 'failed'])
      .gte('updated_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  // Agent health: runs per type this month
  type AgentHealth = {
    type: string
    enabled: boolean
    runsThisMonth: number
    lastRun: string | null
    successRate: number
  }
  const healthMap: Record<string, AgentHealth> = {}
  for (const a of agents ?? []) {
    healthMap[a.type] = {
      type:          a.type,
      enabled:       a.enabled,
      runsThisMonth: 0,
      lastRun:       null,
      successRate:   1,
    }
  }
  for (const run of monthlyRuns ?? []) {
    if (!healthMap[run.agent_type]) {
      healthMap[run.agent_type] = { type: run.agent_type, enabled: false, runsThisMonth: 0, lastRun: null, successRate: 1 }
    }
    healthMap[run.agent_type].runsThisMonth++
    if (!healthMap[run.agent_type].lastRun || run.created_at > healthMap[run.agent_type].lastRun!) {
      healthMap[run.agent_type].lastRun = run.created_at
    }
  }
  // Compute success rates
  const runsByType: Record<string, { total: number; ok: number }> = {}
  for (const run of monthlyRuns ?? []) {
    if (!runsByType[run.agent_type]) runsByType[run.agent_type] = { total: 0, ok: 0 }
    runsByType[run.agent_type].total++
    if (run.status === 'completed') runsByType[run.agent_type].ok++
  }
  for (const [type, counts] of Object.entries(runsByType)) {
    if (healthMap[type] && counts.total > 0) {
      healthMap[type].successRate = counts.ok / counts.total
    }
  }

  // Filter review opps: exclude contacts already review_requested/review_completed
  const reviewExcludeStatuses = new Set(['review_requested', 'review_completed'])
  const filteredReviewOpps = (reviewOpps ?? []).filter(
    (c) => !reviewExcludeStatuses.has(c.status)
  )

  return NextResponse.json({
    attention:        openTasks ?? [],
    recentLeads:      newLeads ?? [],
    scheduledNext24h: scheduledMessages ?? [],
    todayActivity:    recentActivity ?? [],
    staleCustomers:   staleContacts ?? [],
    openEstimates:    estimateSent ?? [],
    reviewOpps:       filteredReviewOpps,
    failedMessages:   failedMessages ?? [],
    agentHealth:      Object.values(healthMap),
  })
}
