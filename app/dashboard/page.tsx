import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Zap, CheckCircle2, Circle, Bot, User, BarChart2, Star, Mail, TrendingDown, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { generateLeaks } from '@/lib/leaks'
import { calculateSubScores } from '@/lib/scanner/subscores'
import MarkFixedButton from '@/components/dashboard/MarkFixedButton'
import WelcomeModal from '@/components/dashboard/WelcomeModal'

type Impact = 'low' | 'medium' | 'high'

const impactConfig: Record<Impact, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: 'High Impact',   color: 'text-op-red',   bg: 'bg-red-50',    border: 'border-red-200'   },
  medium: { label: 'Medium Impact', color: 'text-op-amber', bg: 'bg-amber-50',  border: 'border-amber-200' },
  low:    { label: 'Low Impact',    color: 'text-op-navy',  bg: 'bg-slate-50',  border: 'border-slate-200' },
}

type Activity = {
  id: string
  agent_type: string
  action: string
  details: Record<string, string>
  created_at: string
}

function activityLabel(a: Activity): string {
  const d = a.details ?? {}
  if (a.action === 'review_request_sent')     return `Review request sent to ${d.customer_name ?? 'a customer'}`
  if (a.action === 'lead_followup_scheduled') return `Follow-up sequence started for ${d.contact_name ?? 'a lead'}`
  if (a.action === 'weekly_report_sent')      return 'Weekly report sent'
  return a.action.replace(/_/g, ' ')
}

function AgentIcon({ type }: { type: string }) {
  if (type === 'review_request') return <Star size={13} className="text-op-amber shrink-0" />
  if (type === 'lead_followup')  return <Mail size={13} className="text-op-navy shrink-0" />
  if (type === 'weekly_report')  return <BarChart2 size={13} className="text-op-green shrink-0" />
  return <Bot size={13} className="text-op-muted shrink-0" />
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { subscribed?: string }
}) {
  const subscribedPlan = searchParams?.subscribed ?? null
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const threeDaysAgo       = new Date(Date.now() - 3  * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: scans },
    { data: business },
    { data: dbLeaks },
    { data: agents },
    { data: recentActivity },
    { count: leadsThisWeek },
    { count: followupsActive },
    { count: reviewsSent },
    { data: newStaleLeads },
    { data: coldContacts },
  ] = await Promise.all([
    supabase.from('scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2),
    supabase.from('businesses').select('*').eq('user_id', user.id).single(),
    supabase.from('leaks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('agents').select('type, enabled').eq('user_id', user.id).eq('enabled', true),
    supabase.from('agent_activity').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(7),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'lead').gt('created_at', sevenDaysAgo),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'contacted'),
    supabase.from('agent_activity').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('agent_type', 'review_request').gt('created_at', thirtyDaysAgo),
    // New leads that came in over 24h ago with no follow-up yet
    supabase.from('contacts').select('id, name, email, created_at').eq('user_id', user.id).eq('type', 'lead').eq('status', 'new').lt('created_at', twentyFourHoursAgo).order('created_at', { ascending: false }).limit(5),
    // Leads still 'contacted' but no update in 3+ days
    supabase.from('contacts').select('id, name, email, updated_at').eq('user_id', user.id).eq('status', 'contacted').lt('updated_at', threeDaysAgo).order('updated_at', { ascending: false }).limit(5),
  ])

  const scan     = scans?.[0] ?? null
  const prevScan = scans?.[1] ?? null

  // First-run: send new users to onboarding if they haven't set up their business yet
  if (!business?.name) redirect('/onboarding')

  const businessName = business?.name ?? user.user_metadata?.business_name ?? 'your business'
  const leaks = (dbLeaks && dbLeaks.length > 0) ? dbLeaks : (scan ? generateLeaks(scan) : [])
  const openLeaks  = leaks.filter((l: { status?: string }) => l.status !== 'fixed')
  const fixedLeaks = leaks.length - openLeaks.length

  const avgJobValue = business?.avg_job_value ?? 0
  const dollarOpportunity = openLeaks.length * avgJobValue

  // Score delta
  const scoreDelta = (scan && prevScan) ? scan.score - prevScan.score : null

  // Sub-score comparison (deterministic from scan answers)
  const toAnswers = (s: Record<string, string>) => ({
    runsAds:         s.runs_ads          ?? '',
    usesCrm:         s.uses_crm          ?? '',
    manualFollowUp:  s.manual_follow_up  ?? '',
    asksReviews:     s.asks_reviews      ?? '',
    tracksLeadSource:s.tracks_lead_source ?? '',
    industry:        business?.industry  ?? '',
  })
  const currentSubScores = calculateSubScores(toAnswers(scan as unknown as Record<string, string>))
  const prevSubScores = prevScan
    ? calculateSubScores(toAnswers(prevScan as unknown as Record<string, string>))
    : null

  // Onboarding steps
  const hasProfile     = !!(business?.name)
  const hasScan        = !!scan
  const hasAgent       = !!(agents && agents.length > 0)
  const onboardingDone = hasProfile && hasScan && hasAgent

  // Re-scan reminder: show if last scan is more than 30 days old
  const scanAge = scan ? Math.floor((Date.now() - new Date(scan.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
  const showRescanBanner = scan && scanAge >= 30

  // scoreColor — higher score = more leaks = worse
  const scoreColor = scan
    ? scan.score >= 75 ? 'text-op-red' : scan.score >= 55 ? 'text-op-amber' : 'text-op-green'
    : 'text-op-muted'
  const scoreLabel = scan
    ? scan.score >= 75 ? 'Critical Risk' : scan.score >= 55 ? 'High Risk' : 'Moderate Risk'
    : ''

  // No scan yet — empty state
  if (!scan) {
    return (
      <main className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center">
        {subscribedPlan && <WelcomeModal plan={subscribedPlan} />}
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Zap size={28} className="text-op-navy" />
          </div>
          <h1 className="text-2xl font-bold font-manrope text-op-navy mb-2">
            Welcome to Revenue Autopilot
          </h1>
          <p className="text-op-muted mb-6">
            Run your first Revenue Leak Scan to see exactly where your business may be losing
            customers — and what to do about it.
          </p>
          <Link href="/scanner" className="btn-primary">
            Scan My Business Free <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      {subscribedPlan && <WelcomeModal plan={subscribedPlan} />}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-manrope text-op-navy">Revenue Dashboard</h1>
          <p className="text-sm text-op-muted mt-0.5">
            {businessName} · Last scanned{' '}
            {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Link href="/scanner" className="btn-secondary text-sm self-start md:self-auto">
          <Zap size={14} /> Re-scan Business
        </Link>
      </div>

      {/* Live pulse — only shown once agents have done real work */}
      {((leadsThisWeek ?? 0) > 0 || (followupsActive ?? 0) > 0 || (reviewsSent ?? 0) > 0) && (
        <div className="bg-op-navy rounded-xl px-6 py-4 mb-6 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 mr-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-op-green animate-pulse" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-wide">Operon is running</span>
          </div>
          <div className="flex items-center gap-8 flex-wrap flex-1">
            <div>
              <p className="text-2xl font-bold font-manrope text-white">{leadsThisWeek ?? 0}</p>
              <p className="text-xs text-white/50">leads this week</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-manrope text-white">{followupsActive ?? 0}</p>
              <p className="text-xs text-white/50">follow-ups active</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-manrope text-white">{reviewsSent ?? 0}</p>
              <p className="text-xs text-white/50">reviews sent (30d)</p>
            </div>
          </div>
        </div>
      )}

      {/* Needs attention today */}
      {((newStaleLeads && newStaleLeads.length > 0) || (coldContacts && coldContacts.length > 0)) && (
        <div className="card border-2 border-op-amber/30 bg-amber-50/20 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-op-amber animate-pulse" />
            <h2 className="text-sm font-bold text-op-navy">Needs your attention</h2>
          </div>
          <div className="flex flex-col gap-2">
            {(newStaleLeads ?? []).map((c: { id: string; name: string; email: string | null; created_at: string }) => (
              <Link
                key={c.id}
                href={`/dashboard/contacts/${c.id}`}
                className="flex items-center justify-between gap-3 bg-white rounded-xl border border-op-border px-4 py-3 hover:border-op-navy/40 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-op-navy truncate">{c.name}</p>
                  <p className="text-xs text-op-amber font-medium">New lead — no follow-up yet</p>
                </div>
                <ArrowRight size={14} className="text-op-muted shrink-0" />
              </Link>
            ))}
            {(coldContacts ?? []).map((c: { id: string; name: string; email: string | null; updated_at: string }) => {
              const days = Math.floor((Date.now() - new Date(c.updated_at).getTime()) / 86400000)
              return (
                <Link
                  key={c.id}
                  href={`/dashboard/contacts/${c.id}`}
                  className="flex items-center justify-between gap-3 bg-white rounded-xl border border-op-border px-4 py-3 hover:border-op-navy/40 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-op-navy truncate">{c.name}</p>
                    <p className="text-xs text-op-muted">Contacted {days}d ago — no update</p>
                  </div>
                  <ArrowRight size={14} className="text-op-muted shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Re-scan reminder */}
      {showRescanBanner && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex-wrap">
          <RefreshCw size={16} className="text-op-amber shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-op-amber">Your scan is {scanAge} days old</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your score may have changed. A fresh scan takes 60 seconds and gives you an updated picture of your revenue health.
            </p>
          </div>
          <Link href="/scanner" className="btn-primary text-xs px-4 py-2 shrink-0">
            Re-scan Now
          </Link>
        </div>
      )}

      {/* Onboarding checklist */}
      {!onboardingDone && (
        <div className="card border border-op-navy/20 bg-op-navy/[0.03] mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} className="text-op-navy" />
            <h2 className="text-sm font-bold text-op-navy">Get the most out of Operon</h2>
          </div>
          <div className="flex flex-col gap-2">
            {([
              { done: hasProfile, label: 'Complete your business profile', href: '/dashboard/profile', icon: User },
              { done: hasScan,    label: 'Run your Revenue Leak Scan',     href: '/scanner',           icon: Zap  },
              { done: hasAgent,   label: 'Activate an autopilot agent',    href: '/dashboard/setup',   icon: Bot  },
            ] as { done: boolean; label: string; href: string; icon: React.ElementType }[]).map(({ done, label, href, icon: Icon }) => (
              <Link
                key={label}
                href={done ? '#' : href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  done ? 'text-op-muted pointer-events-none' : 'text-op-navy hover:bg-op-navy/10'
                }`}
              >
                {done
                  ? <CheckCircle2 size={16} className="text-op-green shrink-0" />
                  : <Circle size={16} className="text-op-navy/40 shrink-0" />
                }
                <Icon size={14} className="shrink-0 text-op-muted" />
                <span className={done ? 'line-through' : ''}>{label}</span>
                {!done && <ArrowRight size={13} className="ml-auto text-op-navy/50" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">Leak Score</p>
          <p className={`text-4xl font-bold font-manrope ${scoreColor}`}>
            {scan.score}<span className="text-lg text-op-muted font-normal">/100</span>
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <p className={`text-xs font-bold ${scoreColor}`}>{scoreLabel}</p>
            {scoreDelta !== null && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ml-1 ${scoreDelta > 0 ? 'text-op-red' : 'text-op-green'}`}>
                {scoreDelta > 0
                  ? <TrendingUp size={10} />
                  : <TrendingDown size={10} />
                }
                {Math.abs(scoreDelta)}
              </span>
            )}
          </div>
        </div>

        <div className="card text-center">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">Open Leaks</p>
          <p className="text-4xl font-bold font-manrope text-op-navy">{openLeaks.length}</p>
          <p className="text-xs font-semibold mt-2 text-op-muted">Need attention</p>
        </div>

        <div className="card text-center">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">Resolved</p>
          <p className="text-4xl font-bold font-manrope text-op-green">{fixedLeaks}</p>
          <p className="text-xs font-semibold mt-2 text-op-green">Leaks fixed</p>
        </div>

        <div className="card text-center">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">At Risk</p>
          {avgJobValue > 0 ? (
            <>
              <p className="text-4xl font-bold font-manrope text-op-amber">
                ${dollarOpportunity >= 1000
                  ? `${(dollarOpportunity / 1000).toFixed(0)}k`
                  : dollarOpportunity.toLocaleString()
                }
              </p>
              <p className="text-xs font-semibold mt-2 text-op-amber">Est. revenue exposure</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mt-1 mb-1">
                <DollarSign size={28} className="text-op-muted" />
              </div>
              <Link href="/dashboard/profile" className="text-xs text-op-navy hover:underline">
                Add job value →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Sub-score health breakdown */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold font-manrope text-op-navy">Health by Category</h2>
            <p className="text-xs text-op-muted mt-0.5">Higher = more revenue leaking in that area.</p>
          </div>
          {prevSubScores && (
            <span className="text-xs text-op-muted border border-op-border rounded-full px-2.5 py-1">vs previous scan</span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {currentSubScores.map(({ name, score, color, label }, i) => {
            const prev = prevSubScores?.[i]
            const delta = prev ? score - prev.score : null
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-op-navy">{name}</span>
                  <div className="flex items-center gap-2">
                    {delta !== null && delta !== 0 && (
                      <span className={`text-xs font-semibold flex items-center gap-0.5 ${delta > 0 ? 'text-op-red' : 'text-op-green'}`}>
                        {delta > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(delta)}
                      </span>
                    )}
                    <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                  </div>
                </div>
                <div className="relative w-full bg-op-border rounded-full h-2">
                  {prev && (
                    <div
                      className="absolute inset-y-0 left-0 h-2 rounded-full opacity-30"
                      style={{ width: `${prev.score}%`, backgroundColor: color }}
                    />
                  )}
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue leaks */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold font-manrope text-op-navy mb-4">Your Revenue Leaks</h2>
          <div className="flex flex-col gap-3">
            {leaks.map((leak: {
              id?: string
              title: string
              description: string
              impact: Impact
              recommended_fix: string
              status?: string
            }, i: number) => {
              const cfg = impactConfig[leak.impact] ?? impactConfig.medium
              const isFixed = leak.status === 'fixed'
              return (
                <div key={leak.id ?? i} className={`card border ${cfg.border} ${isFixed ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {isFixed && (
                          <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-50 text-op-green">Fixed</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-op-navy mb-1">{leak.title}</h3>
                      <p className="text-sm text-op-muted leading-relaxed">{leak.description}</p>
                      {leak.recommended_fix && (
                        <p className="text-sm text-op-body mt-2">
                          <span className="font-semibold text-op-navy">Fix: </span>
                          {leak.recommended_fix}
                        </p>
                      )}
                    </div>
                    {!isFixed && (
                      <div className="flex gap-2 shrink-0">
                        {leak.id
                          ? <MarkFixedButton leakId={leak.id} initialFixed={false} />
                          : (
                            <Link href="/dashboard/agents" className="btn-primary text-sm px-4 py-2 whitespace-nowrap">
                              Activate Fix <ArrowRight size={14} />
                            </Link>
                          )
                        }
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Agent activity feed */}
        <div>
          <h2 className="text-lg font-bold font-manrope text-op-navy mb-4">Agent Activity</h2>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="flex flex-col gap-2">
              {(recentActivity as Activity[]).map((a) => (
                <div key={a.id} className="card py-3 px-4 flex items-start gap-3">
                  <span className="mt-0.5"><AgentIcon type={a.agent_type} /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-op-body leading-snug">{activityLabel(a)}</p>
                    <p className="text-xs text-op-muted mt-0.5">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/agents" className="text-xs text-op-navy hover:text-op-navy/70 mt-1 pl-1 transition-colors">
                View all agents →
              </Link>
            </div>
          ) : (
            <div className="card text-center py-8">
              <Bot size={24} className="text-op-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-op-navy mb-1">No activity yet</p>
              <p className="text-xs text-op-muted mb-3">Activate an agent to start automating.</p>
              <Link href="/dashboard/setup" className="btn-primary text-xs px-4 py-2 mx-auto">
                Set Up Agents
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
