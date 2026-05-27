'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Radar, CheckCircle2, AlertCircle, Clock, Users, Star,
  FileText, RefreshCw, Mail, MessageSquare, Zap, BarChart2,
  ChevronRight, X, Activity, Bot,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type Contact = { id: string; name: string; email?: string; phone?: string; status: string; source?: string; created_at?: string; updated_at?: string }
type Task    = { id: string; title: string; description?: string; priority: string; due_at?: string; contact_id?: string; created_at: string }
type Message = { id: string; template_id: string; subject?: string; scheduled_for?: string; channel: string; contact_id?: string; updated_at?: string; status?: string }
type ActivityItem = { id: string; agent_type: string; action: string; details: Record<string, string>; created_at: string }
type AgentHealth = { type: string; enabled: boolean; runsThisMonth: number; lastRun: string | null; successRate: number }

type CommandData = {
  attention:        Task[]
  recentLeads:      Contact[]
  scheduledNext24h: Message[]
  todayActivity:    ActivityItem[]
  staleCustomers:   Contact[]
  openEstimates:    Contact[]
  reviewOpps:       Contact[]
  failedMessages:   Message[]
  agentHealth:      AgentHealth[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function activityLabel(a: ActivityItem): string {
  const d = a.details ?? {}
  if (a.action === 'follow_up_sequence_started') return `Follow-up sequence started for ${d.lead_name ?? 'a lead'}`
  if (a.action === 'review_request_sent')         return `Review request sent to ${d.customer_name ?? 'a customer'}`
  if (a.action === 'private_feedback_sent')       return `Private feedback request sent to ${d.customer_name ?? 'a customer'}`
  if (a.action === 'review_blocked_unhappy_customer') return `Review blocked — ${d.customer_name ?? 'customer'} flagged as unhappy`
  if (a.action === 'weekly_report_sent')          return 'Weekly revenue briefing sent'
  if (a.action === 'reactivation_sent')           return `Reactivation email sent to ${d.customer_name ?? 'a customer'}`
  if (a.action.startsWith('quick_action_'))       return `Owner quick action: ${a.action.replace('quick_action_', '').replace(/_/g, ' ')}`
  return a.action.replace(/_/g, ' ')
}

function agentLabel(type: string): string {
  if (type === 'lead_followup')  return 'Lead Recovery'
  if (type === 'review_request') return 'Review Growth'
  if (type === 'weekly_report')  return 'Weekly Briefing'
  if (type === 'estimate')       return 'Estimate Recovery'
  if (type === 'reactivation')   return 'Reactivation'
  return type.replace(/_/g, ' ')
}

function templateLabel(id: string): string {
  const map: Record<string, string> = {
    lead_followup_1: 'Lead Follow-up #1',
    lead_followup_2: 'Lead Follow-up #2',
    lead_followup_3: 'Lead Follow-up #3',
    review_day0:     'Review Request',
    review_day3:     'Review Reminder (Day 3)',
    review_day7:     'Review Reminder (Day 7)',
    reactivation:    'Reactivation Email',
    estimate_followup: 'Estimate Follow-up',
  }
  return map[id] ?? id.replace(/_/g, ' ')
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, count, color = 'text-op-navy' }: {
  icon: React.ElementType; title: string; count?: number; color?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className={color} />
      <h2 className="text-sm font-semibold text-op-navy">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="ml-auto text-xs font-medium text-op-muted bg-slate-100 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-op-muted text-center py-4">{text}</p>
  )
}

function ActionButton({ label, onClick, variant = 'default' }: {
  label: string; onClick: () => void; variant?: 'default' | 'danger' | 'success'
}) {
  const colors = {
    default: 'bg-slate-100 hover:bg-slate-200 text-op-body',
    danger:  'bg-red-50 hover:bg-red-100 text-op-red',
    success: 'bg-green-50 hover:bg-green-100 text-op-green',
  }
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${colors[variant]}`}
    >
      {label}
    </button>
  )
}

function useQuickAction(onDone: () => void) {
  const [loading, setLoading] = useState<string | null>(null)

  const perform = useCallback(async (contactId: string, action: string) => {
    const key = `${contactId}:${action}`
    setLoading(key)
    try {
      await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      onDone()
    } finally {
      setLoading(null)
    }
  }, [onDone])

  return { loading, perform }
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const [data, setData]       = useState<CommandData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/dashboard/command')
      if (!res.ok) throw new Error()
      setData(await res.json())
      setLastRefresh(Date.now())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const { loading: actionLoading, perform } = useQuickAction(load)

  const totalAttention = (data?.attention.length ?? 0) + (data?.failedMessages.length ?? 0)

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-op-muted text-sm">Loading command center…</div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-op-red mb-3">Failed to load command center.</p>
        <button onClick={load} className="text-sm text-op-navy underline">Try again</button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radar size={22} className="text-op-navy" />
          <div>
            <h1 className="text-xl font-bold text-op-navy">Command Center</h1>
            <p className="text-xs text-op-muted mt-0.5">Real-time view of everything Operon is doing for you</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-op-muted hover:text-op-navy transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing…' : `Updated ${timeAgo(new Date(lastRefresh).toISOString())}`}
        </button>
      </div>

      {/* ── Needs Attention ─────────────────────────────────────────── */}
      {totalAttention > 0 && (
        <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
          <SectionHeader icon={AlertCircle} title="Needs Your Attention" count={totalAttention} color="text-op-red" />

          {(data?.attention ?? []).length > 0 && (
            <div className="space-y-3 mb-4">
              {data!.attention.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle size={15} className="text-op-red mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-op-navy leading-snug">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-op-muted mt-0.5 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs font-medium ${task.priority === 'urgent' ? 'text-op-red' : 'text-op-amber'}`}>
                        {task.priority}
                      </span>
                      {task.due_at && (
                        <span className="text-xs text-op-muted">{timeAgo(task.due_at)}</span>
                      )}
                    </div>
                  </div>
                  {task.contact_id && (
                    <Link href={`/dashboard/contacts/${task.contact_id}`} className="shrink-0">
                      <ChevronRight size={15} className="text-op-muted hover:text-op-navy transition-colors" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {(data?.failedMessages ?? []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-op-muted uppercase tracking-wide mb-2">Failed / Bounced Emails</p>
              {data!.failedMessages.map((msg) => (
                <div key={msg.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <Mail size={14} className="text-op-amber shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-op-navy truncate">{msg.subject ?? templateLabel(msg.template_id)}</p>
                    <p className="text-xs text-op-muted capitalize">{msg.status} · {msg.updated_at ? timeAgo(msg.updated_at) : ''}</p>
                  </div>
                  {msg.contact_id && (
                    <Link href={`/dashboard/contacts/${msg.contact_id}`} className="shrink-0">
                      <ChevronRight size={15} className="text-op-muted hover:text-op-navy transition-colors" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Revenue Opportunities ───────────────────────────────────── */}
      {((data?.reviewOpps.length ?? 0) + (data?.staleCustomers.length ?? 0) + (data?.openEstimates.length ?? 0)) > 0 && (
        <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
          <SectionHeader icon={Zap} title="Revenue Opportunities" color="text-op-green" />

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Review opportunities */}
            {(data?.reviewOpps.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Star size={11} /> Review Opportunities
                </p>
                <div className="space-y-2">
                  {data!.reviewOpps.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 group">
                      <Link href={`/dashboard/contacts/${c.id}`} className="text-sm text-op-body hover:text-op-navy truncate flex-1">
                        {c.name}
                      </Link>
                      <Link
                        href={`/dashboard/contacts/${c.id}?action=review`}
                        className="text-xs text-op-green hover:underline shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Send
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open estimates */}
            {(data?.openEstimates.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                  <FileText size={11} /> Open Estimates
                </p>
                <div className="space-y-2">
                  {data!.openEstimates.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 group">
                      <Link href={`/dashboard/contacts/${c.id}`} className="text-sm text-op-body hover:text-op-navy truncate flex-1">
                        {c.name}
                      </Link>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton
                          label="Won"
                          onClick={() => perform(c.id, 'won')}
                          variant="success"
                        />
                        <ActionButton
                          label="Lost"
                          onClick={() => perform(c.id, 'lost')}
                          variant="danger"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stale customers */}
            {(data?.staleCustomers.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                  <RefreshCw size={11} /> Re-engage Customers
                </p>
                <div className="space-y-2">
                  {data!.staleCustomers.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 group">
                      <Link href={`/dashboard/contacts/${c.id}`} className="text-sm text-op-body hover:text-op-navy truncate flex-1">
                        {c.name}
                      </Link>
                      {c.updated_at && (
                        <span className="text-xs text-op-muted shrink-0">{timeAgo(c.updated_at)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Recent Leads ────────────────────────────────────────────── */}
      {(data?.recentLeads.length ?? 0) > 0 && (
        <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
          <SectionHeader icon={Users} title="Recent Leads" count={data!.recentLeads.length} />
          <div className="space-y-2">
            {data!.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/contacts/${lead.id}`} className="text-sm font-medium text-op-navy hover:underline truncate">
                      {lead.name}
                    </Link>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      lead.status === 'new' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-op-green'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-op-muted truncate">
                    {lead.source} · {lead.created_at ? timeAgo(lead.created_at) : ''}
                  </p>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionButton label="Booked" onClick={() => perform(lead.id, 'booked')} variant="success" />
                  <ActionButton label="Lost"   onClick={() => perform(lead.id, 'lost')}   variant="danger"  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── What Operon Did Today ───────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
        <SectionHeader icon={Activity} title="What Operon Did Today" count={data?.todayActivity.length} />
        {(data?.todayActivity.length ?? 0) === 0 ? (
          <EmptyState text="No activity yet today. Agents are watching." />
        ) : (
          <div className="space-y-2.5">
            {data!.todayActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {item.agent_type === 'review_request' && <Star size={10} className="text-op-amber" />}
                  {item.agent_type === 'lead_followup'  && <Mail size={10} className="text-op-navy" />}
                  {item.agent_type === 'weekly_report'  && <BarChart2 size={10} className="text-op-green" />}
                  {!['review_request','lead_followup','weekly_report'].includes(item.agent_type) && <Bot size={10} className="text-op-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-op-body">{activityLabel(item)}</p>
                </div>
                <span className="text-xs text-op-muted shrink-0">{timeAgo(item.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Scheduled Next 24h ─────────────────────────────────────── */}
      {(data?.scheduledNext24h.length ?? 0) > 0 && (
        <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
          <SectionHeader icon={Clock} title="Sending in Next 24 Hours" count={data!.scheduledNext24h.length} />
          <div className="space-y-2">
            {data!.scheduledNext24h.map((msg) => (
              <div key={msg.id} className="flex items-center gap-3">
                <Mail size={13} className="text-op-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-op-body truncate">{msg.subject ?? templateLabel(msg.template_id)}</p>
                </div>
                {msg.scheduled_for && (
                  <span className="text-xs text-op-muted shrink-0">{formatTime(msg.scheduled_for)}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Agent Health ────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-op-border shadow-card p-5">
        <SectionHeader icon={Bot} title="Agent Health" />
        {(data?.agentHealth.length ?? 0) === 0 ? (
          <EmptyState text="No agents configured yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data!.agentHealth.map((agent) => {
              const isHealthy = agent.enabled && agent.successRate >= 0.9
              const hasIssue  = agent.enabled && agent.successRate < 0.9
              return (
                <div
                  key={agent.type}
                  className={`p-3 rounded-lg border ${
                    !agent.enabled ? 'border-slate-100 bg-slate-50' :
                    hasIssue       ? 'border-amber-200 bg-amber-50' :
                                     'border-green-100 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-op-navy">{agentLabel(agent.type)}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      !agent.enabled ? 'bg-slate-300' :
                      hasIssue       ? 'bg-op-amber'  :
                                       'bg-op-green'
                    }`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-op-muted">
                      {agent.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-xs text-op-muted">
                      {agent.runsThisMonth} runs this month
                    </p>
                    {agent.lastRun && (
                      <p className="text-xs text-op-muted">
                        Last run: {timeAgo(agent.lastRun)}
                      </p>
                    )}
                    {hasIssue && (
                      <p className="text-xs text-op-amber font-medium">
                        {Math.round(agent.successRate * 100)}% success rate
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-op-border">
          <Link href="/dashboard/agents" className="text-xs text-op-navy hover:underline flex items-center gap-1">
            Manage agents <ChevronRight size={12} />
          </Link>
        </div>
      </section>

    </div>
  )
}
