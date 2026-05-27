// Plan-based usage limits — enforced at API layer

export const PLAN_LIMITS = {
  free:    { contacts: 0,     emailsPerMonth: 0,     agentActionsPerMonth: 0    },
  starter: { contacts: 500,   emailsPerMonth: 500,   agentActionsPerMonth: 100  },
  growth:  { contacts: 2500,  emailsPerMonth: 2500,  agentActionsPerMonth: 500  },
  pro:     { contacts: 10000, emailsPerMonth: 10000, agentActionsPerMonth: 2000 },
} as const

export type PlanId = keyof typeof PLAN_LIMITS

export interface LimitStatus {
  allowed:  boolean
  current:  number
  limit:    number
  plan:     PlanId
  remaining: number
}

// Works with both the server Supabase client and the admin client —
// both expose .from() with the same query interface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = { from: (table: string) => any }

export async function getUserPlan(supabase: AnySupabase, userId: string): Promise<PlanId> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single()

  if (!data) return 'free'
  // past_due keeps plan — still a paying customer in a grace period
  if (data.status === 'active' || data.status === 'trialing' || data.status === 'past_due') {
    return (data.plan ?? 'free') as PlanId
  }
  return 'free'
}

function monthStart(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function checkContactLimit(
  supabase: AnySupabase,
  userId: string
): Promise<LimitStatus> {
  const [plan, { count }] = await Promise.all([
    getUserPlan(supabase, userId),
    supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])
  const limit     = PLAN_LIMITS[plan].contacts
  const current   = count ?? 0
  const remaining = Math.max(0, limit - current)
  return { allowed: current < limit, current, limit, plan, remaining }
}

export async function checkEmailLimit(
  supabase: AnySupabase,
  userId: string
): Promise<LimitStatus> {
  const [plan, { count }] = await Promise.all([
    getUserPlan(supabase, userId),
    supabase
      .from('agent_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart()),
  ])
  const limit     = PLAN_LIMITS[plan].emailsPerMonth
  const current   = count ?? 0
  const remaining = Math.max(0, limit - current)
  return { allowed: current < limit, current, limit, plan, remaining }
}

export async function checkAgentActionLimit(
  supabase: AnySupabase,
  userId: string
): Promise<LimitStatus> {
  const [plan, { count }] = await Promise.all([
    getUserPlan(supabase, userId),
    supabase
      .from('agent_activity')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart()),
  ])
  const limit     = PLAN_LIMITS[plan].agentActionsPerMonth
  const current   = count ?? 0
  const remaining = Math.max(0, limit - current)
  return { allowed: current < limit, current, limit, plan, remaining }
}

export function limitErrorResponse(type: 'contacts' | 'emails' | 'agent_actions', status: LimitStatus) {
  const labels: Record<typeof type, string> = {
    contacts:      'Contact limit reached',
    emails:        'Monthly email limit reached',
    agent_actions: 'Monthly agent action limit reached',
  }
  return {
    error:       labels[type],
    limitReached: type,
    current:     status.current,
    limit:       status.limit,
    plan:        status.plan,
    upgradeUrl:  '/pricing',
  }
}
