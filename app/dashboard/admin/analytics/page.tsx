'use client'

import { useEffect, useState, useCallback } from 'react'
import { BarChart2, Radar, Users, RefreshCw, TrendingUp, Zap, Bot, Star, ChevronRight, Activity } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────

type FunnelStep = { event: string; total: number; unique: number }

type AnalyticsData = {
  days: number
  funnel: FunnelStep[]
  scannerStats: {
    totalCompletions: number
    avgScore: number | null
    avgDurationMs: number | null
    scoreRanges: Record<string, number>
  }
  planBreakdown:     Record<string, number>
  agentBreakdown:    Record<string, number>
  industryBreakdown: Record<string, number>
  sourceBreakdown:   Record<string, number>
  campaignBreakdown: Record<string, number>
  conversionRates: Record<string, number | null>
}

// ── Helpers ────────────────────────────────────────────────────

const EVENT_LABELS: Record<string, string> = {
  scanner_viewed:          'Scanner Viewed',
  scanner_started:         'Scanner Started',
  scanner_submitted:       'Scanner Submitted',
  scanner_completed:       'Scanner Completed',
  results_viewed:          'Results Viewed',
  email_report_requested:  'Email Report Requested',
  pricing_viewed:          'Pricing Viewed',
  plan_clicked:            'Plan Clicked',
  signup_started:          'Signup Started',
  signup_completed:        'Signup Completed',
  checkout_started:        'Checkout Started',
  purchase_completed:      'Purchase Completed',
  agent_activated:         'Agent Activated',
}

const AGENT_LABELS: Record<string, string> = {
  lead_followup:   'Lead Recovery',
  review_request:  'Review Growth',
  weekly_report:   'Weekly Briefing',
  estimate_followup: 'Estimate Recovery',
  reactivation:    'Reactivation',
}

function pct(rate: number | null): string {
  return rate === null ? '—' : `${rate}%`
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function durationLabel(ms: number | null): string {
  if (!ms) return '—'
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  return `${Math.round(ms / 60000)}m`
}

// ── Sub-components ─────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'text-op-navy' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-op-border shadow-card p-4">
      <p className="text-xs text-op-muted font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold font-manrope ${color}`}>{value}</p>
      {sub && <p className="text-xs text-op-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function BreakdownTable({ title, data, maxRows = 8 }: {
  title: string; data: Record<string, number>; maxRows?: number
}) {
  const rows = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxRows)
  const total = rows.reduce((s, [, v]) => s + v, 0)
  if (rows.length === 0) return null
  return (
    <div>
      <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-1.5">
        {rows.map(([key, count]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-op-body truncate capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-xs font-semibold text-op-navy ml-2 shrink-0">{count}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-op-navy rounded-full h-1.5 transition-all"
                  style={{ width: `${total > 0 ? Math.round((count / total) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays]       = useState(30)

  const load = useCallback(async (d: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/analytics?days=${d}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(days) }, [load, days])

  const f = (event: string) => data?.funnel.find(s => s.event === event)

  const scanViews    = f('scanner_viewed')?.unique ?? 0
  const scanStarts   = f('scanner_started')?.unique ?? 0
  const scanComplete = f('scanner_completed')?.unique ?? 0
  const emailReqs    = f('email_report_requested')?.unique ?? 0
  const pricingViews = f('pricing_viewed')?.unique ?? 0
  const planClicks   = f('plan_clicked')?.unique ?? 0
  const signups      = f('signup_completed')?.unique ?? 0
  const purchases    = f('purchase_completed')?.unique ?? 0
  const activations  = f('agent_activated')?.unique ?? 0

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Radar size={22} className="text-op-navy" />
          <div>
            <h1 className="text-xl font-bold text-op-navy">Launch Analytics</h1>
            <p className="text-xs text-op-muted mt-0.5">Internal funnel tracking — source of truth for all conversion data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                days === d ? 'bg-op-navy text-white' : 'bg-slate-100 text-op-body hover:bg-slate-200'
              }`}
            >
              {d}d
            </button>
          ))}
          <button onClick={() => load(days)} disabled={loading} className="ml-2 text-op-muted hover:text-op-navy">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="py-20 text-center text-op-muted text-sm">Loading analytics…</div>
      )}

      {data && (
        <>
          {/* ── Top Metrics Grid ───────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="Scanner Views"       value={fmt(scanViews)}    sub={`${days}d`} />
            <StatCard label="Scanner Starts"      value={fmt(scanStarts)}   sub={`${scanViews > 0 ? Math.round(scanStarts/scanViews*100) : 0}% of views`} />
            <StatCard label="Completions"         value={fmt(scanComplete)} sub={`${scanStarts > 0 ? Math.round(scanComplete/scanStarts*100) : 0}% completion`} color="text-op-green" />
            <StatCard label="Email Reports"       value={fmt(emailReqs)}    sub={`${scanComplete > 0 ? Math.round(emailReqs/scanComplete*100) : 0}% of scans`} />
            <StatCard label="Pricing Views"       value={fmt(pricingViews)} />
            <StatCard label="Plan Clicks"         value={fmt(planClicks)}   sub={`${pricingViews > 0 ? Math.round(planClicks/pricingViews*100) : 0}% of pricing`} />
            <StatCard label="Signups"             value={fmt(signups)}      sub={`${planClicks > 0 ? Math.round(signups/planClicks*100) : 0}% of plan clicks`} color="text-op-blue" />
            <StatCard label="Paid Customers"      value={fmt(purchases)}    sub={`${signups > 0 ? Math.round(purchases/signups*100) : 0}% of signups`} color="text-op-green" />
            <StatCard label="Agent Activations"   value={fmt(activations)}  sub={`${purchases > 0 ? Math.round(activations/purchases*100) : 0}% of paid`} />
            <StatCard label="Avg Scan Score"      value={data.scannerStats.avgScore ?? '—'} sub="out of 100" />
          </div>

          {/* ── Full Funnel ────────────────────────────────────── */}
          <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-op-navy" />
              <h2 className="text-sm font-semibold text-op-navy">Full Conversion Funnel</h2>
              <span className="text-xs text-op-muted ml-auto">unique visitors</span>
            </div>
            <div className="space-y-2">
              {data.funnel.map((step, i) => {
                const prev = i > 0 ? data.funnel[i - 1].unique : null
                const dropPct = prev && prev > 0 ? Math.round((1 - step.unique / prev) * 100) : null
                const barWidth = data.funnel[0].unique > 0
                  ? Math.round((step.unique / data.funnel[0].unique) * 100)
                  : 0
                return (
                  <div key={step.event} className="flex items-center gap-3">
                    <div className="w-40 shrink-0">
                      <p className="text-xs text-op-body">{EVENT_LABELS[step.event] ?? step.event}</p>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full bg-op-navy/20 rounded-full transition-all absolute left-0 top-0"
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="absolute left-3 top-0 h-full flex items-center text-xs font-semibold text-op-navy">
                        {fmt(step.unique)}
                      </span>
                    </div>
                    {dropPct !== null && dropPct > 0 && (
                      <span className="text-xs text-op-red shrink-0 w-14 text-right">↓{dropPct}% drop</span>
                    )}
                    {(dropPct === null || dropPct <= 0) && (
                      <span className="w-14 shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Conversion Rates ──────────────────────────────── */}
          <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-op-green" />
              <h2 className="text-sm font-semibold text-op-navy">Conversion Rates</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'View → Start',      key: 'scanView_to_start'   },
                { label: 'Start → Complete',  key: 'start_to_complete'   },
                { label: 'Complete → Email',  key: 'complete_to_email'   },
                { label: 'Complete → Pricing',key: 'complete_to_pricing' },
                { label: 'Pricing → Plan',    key: 'pricing_to_plan'     },
                { label: 'Plan → Signup',     key: 'plan_to_signup'      },
                { label: 'Signup → Purchase', key: 'signup_to_purchase'  },
                { label: 'Purchase → Agent',  key: 'purchase_to_agent'   },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-op-body">{label}</span>
                  <span className={`text-sm font-bold ${
                    (data.conversionRates[key] ?? 0) >= 50 ? 'text-op-green' :
                    (data.conversionRates[key] ?? 0) >= 20 ? 'text-op-amber' :
                    'text-op-red'
                  }`}>
                    {pct(data.conversionRates[key])}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Breakdowns Row ─────────────────────────────────── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <div className="bg-white rounded-xl border border-op-border shadow-card p-5 space-y-5">
              <BreakdownTable title="Plans Clicked" data={data.planBreakdown} />
              <BreakdownTable title="Agent Activations" data={
                Object.fromEntries(
                  Object.entries(data.agentBreakdown).map(([k, v]) => [AGENT_LABELS[k] ?? k, v])
                )
              } />
            </div>

            <div className="bg-white rounded-xl border border-op-border shadow-card p-5 space-y-5">
              <BreakdownTable title="Industries Scanning" data={data.industryBreakdown} />
            </div>

            <div className="bg-white rounded-xl border border-op-border shadow-card p-5 space-y-5">
              <BreakdownTable title="Traffic Sources" data={data.sourceBreakdown} />
              <BreakdownTable title="Campaigns" data={data.campaignBreakdown} />
            </div>

          </div>

          {/* ── Scanner Insights ───────────────────────────────── */}
          <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={15} className="text-op-navy" />
              <h2 className="text-sm font-semibold text-op-navy">Scanner Insights</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard label="Total Completions"  value={fmt(data.scannerStats.totalCompletions)} />
              <StatCard label="Average Score"       value={data.scannerStats.avgScore ?? '—'} sub="out of 100" />
              <StatCard label="Avg Scan Duration"   value={durationLabel(data.scannerStats.avgDurationMs)} />
            </div>
            {Object.keys(data.scannerStats.scoreRanges).length > 0 && (
              <div className="mt-5">
                <BreakdownTable title="Score Ranges" data={data.scannerStats.scoreRanges} />
              </div>
            )}
          </section>

        </>
      )}
    </div>
  )
}
