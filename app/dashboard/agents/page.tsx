'use client'

import { useState, useEffect } from 'react'
import {
  Mail, Star, BarChart2, Loader2, CheckCircle2,
  FileText, DollarSign, RefreshCw, Send, ChevronDown, ChevronUp,
  Zap, Copy, ExternalLink, AlertTriangle, Clock, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AgentSetupWizard from '@/components/dashboard/AgentSetupWizard'

type AgentType = 'lead_followup' | 'review_request' | 'weekly_report'

interface AgentConfig {
  fromName?: string
  replyToEmail?: string
  phone?: string
  reviewLink?: string
  reportEmail?: string
  personalNote?: string
}

interface AgentRow {
  type: AgentType
  enabled: boolean
  config: AgentConfig
}

interface ActivityEntry {
  id: string
  agent_type: string
  recipient_email: string | null
  subject: string | null
  created_at: string
}

interface ReviewMetrics {
  requestsSent: number
  remindersScheduled: number
  waitingForReview: number
  privateFeedbackSent: number
}

interface AgentTask {
  id: string
  agent_type: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'done' | 'dismissed'
  due_at: string | null
  created_at: string
  contact_id: string | null
  contacts: { name: string; email: string | null; phone: string | null } | null
}

const SYSTEM_META = [
  {
    type:        'lead_followup' as AgentType,
    icon:        Mail,
    color:       'text-op-navy',
    activeBg:    'bg-op-navy',
    name:        'Lead Recovery Autopilot',
    tagline:     'Recover every lead, automatically.',
    description: 'When a new lead comes in, AI classifies urgency and intent, chooses the right follow-up playbook, personalizes the first message, and alerts you immediately if action is needed. Follow-ups run at 15 min, Day 2, and Day 5.',
    timing:      'Fires within seconds of every new lead',
    badge:       'AI-Powered',
  },
  {
    type:        'review_request' as AgentType,
    icon:        Star,
    color:       'text-op-amber',
    activeBg:    'bg-op-amber',
    name:        'Review Growth System',
    tagline:     'Turn happy customers into 5-star reviews.',
    description: 'One click sends a personalized review request to any customer. They get a direct link to leave a review on Google, Yelp, or Facebook — no awkward asks, no manual emails.',
    timing:      'Fires instantly when you click Review on a contact',
    badge:       null,
  },
  {
    type:        'weekly_report' as AgentType,
    icon:        BarChart2,
    color:       'text-op-green',
    activeBg:    'bg-op-green',
    name:        'Weekly Revenue Briefing',
    tagline:     'Your business health, every Monday.',
    description: 'A clear summary lands in your inbox every Monday at 8:00 AM — Revenue Leak Score, open leaks, what\'s been fixed, and agent activity. No dashboard check-in required.',
    timing:      'Every Monday at 8:00 AM',
    badge:       null,
  },
]

const COMING_SOON = [
  { icon: FileText,   name: 'Estimate Recovery Autopilot',  description: 'Automatically follows up on unanswered estimates at 24h and 3 days — turning cold quotes into booked jobs.' },
  { icon: DollarSign, name: 'Payment Reminder System',      description: 'Sends friendly, graduated payment reminders for overdue invoices — reducing collections calls.' },
  { icon: RefreshCw,  name: 'Customer Reactivation Autopilot', description: "Re-engages customers who haven't booked in 60+ days with a personalized, industry-specific win-back message." },
]

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'text-op-red bg-red-50 border-red-200',
  high:   'text-op-amber bg-amber-50 border-amber-200',
  medium: 'text-op-navy bg-op-navy/5 border-op-navy/20',
  low:    'text-op-muted bg-op-bg border-op-border',
}

const inputClass =
  'w-full border border-op-border rounded-lg px-4 py-2.5 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

// ── Task Panel ────────────────────────────────────────────────
function TasksPanel({ tasks, onDismiss }: { tasks: AgentTask[]; onDismiss: (id: string) => void }) {
  if (tasks.length === 0) return null
  return (
    <div className="card border-2 border-op-amber/30 bg-amber-50/30 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-op-amber" />
        <h3 className="font-bold text-op-navy font-manrope text-sm">
          {tasks.length} Action{tasks.length !== 1 ? 's' : ''} Needed
        </h3>
        <span className="text-xs text-op-muted">Created by your revenue systems</span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl border border-op-border p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${PRIORITY_COLOR[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.due_at && (
                    <span className="text-[10px] text-op-muted flex items-center gap-1">
                      <Clock size={10} /> Due {new Date(task.due_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-op-navy">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-op-muted mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                )}
                {task.contacts && (
                  <p className="text-xs text-op-muted mt-1.5">
                    {task.contacts.name}
                    {task.contacts.phone && <> · {task.contacts.phone}</>}
                    {task.contacts.email && <> · {task.contacts.email}</>}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDismiss(task.id)}
                className="shrink-0 text-op-muted hover:text-op-red transition-colors mt-0.5"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Agent Card ────────────────────────────────────────────────
function AgentCard({ meta, row, activity, userId, onUpdate, reviewMetrics }: {
  meta: typeof SYSTEM_META[number]
  row: AgentRow
  activity: ActivityEntry[]
  userId: string
  onUpdate: (type: AgentType, updates: Partial<AgentRow>) => void
  reviewMetrics?: ReviewMetrics | null
}) {
  const Icon = meta.icon
  const [showWizard, setShowWizard] = useState(false)
  const [showEdit, setShowEdit]     = useState(false)
  const [showEmbed, setShowEmbed]   = useState(false)
  const [editConfig, setEditConfig] = useState<AgentConfig>(row.config ?? {})
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [disabling, setDisabling]   = useState(false)
  const [testMsg, setTestMsg]       = useState('')
  const [testing, setTesting]       = useState(false)
  const [copiedKey, setCopiedKey]   = useState<string | null>(null)

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleWizardComplete = (config: AgentConfig) => {
    onUpdate(meta.type, { enabled: true, config })
    setEditConfig(config)
    setShowWizard(false)
  }

  const handleDisable = async () => {
    setDisabling(true)
    await fetch('/api/agents/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: meta.type, enabled: false }),
    })
    onUpdate(meta.type, { enabled: false })
    setDisabling(false)
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    await fetch('/api/agents/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: meta.type, config: editConfig }),
    })
    onUpdate(meta.type, { config: editConfig })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTest = async () => {
    setTesting(true)
    const res = await fetch('/api/agents/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: meta.type }),
    })
    const data = await res.json()
    setTesting(false)
    setTestMsg(res.ok ? 'Test sent — check your inbox.' : (data.error ?? 'Failed'))
    setTimeout(() => setTestMsg(''), 5000)
  }

  const editFields = (() => {
    if (meta.type === 'lead_followup') return [
      { key: 'fromName',     label: 'Your Name',       placeholder: 'John Smith',                                 multiline: false },
      { key: 'replyToEmail', label: 'Reply-to Email',  placeholder: 'you@yourbusiness.com',                       multiline: false },
      { key: 'phone',        label: 'Business Phone',  placeholder: '(555) 000-0000',                             multiline: false },
      { key: 'personalNote', label: 'Personal Note',   placeholder: 'e.g. We do same-day quotes — just call us!', multiline: true  },
    ]
    if (meta.type === 'review_request') return [
      { key: 'reviewLink',   label: 'Review Link',     placeholder: 'https://g.page/r/...',                       multiline: false },
      { key: 'fromName',     label: 'Your Name',       placeholder: 'John Smith',                                 multiline: false },
      { key: 'replyToEmail', label: 'Reply-to Email',  placeholder: 'you@yourbusiness.com',                       multiline: false },
    ]
    return [
      { key: 'reportEmail',  label: 'Send Report To',  placeholder: 'you@yourbusiness.com',                       multiline: false },
    ]
  })()

  return (
    <>
      <div className={`card border-2 transition-all ${row.enabled ? 'border-op-navy/20' : 'border-op-border'}`}>
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${row.enabled ? meta.activeBg : 'bg-op-bg'}`}>
            <Icon size={20} className={row.enabled ? 'text-white' : 'text-op-muted'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-op-navy font-manrope">{meta.name}</h3>
              {row.enabled && (
                <span className="text-[11px] font-bold text-op-green bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              {meta.badge && (
                <span className="text-[11px] font-bold text-op-navy bg-op-navy/8 border border-op-navy/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap size={10} /> {meta.badge}
                </span>
              )}
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${meta.color}`}>{meta.tagline}</p>
            <p className="text-sm text-op-muted mt-1 leading-relaxed">{meta.description}</p>
            <p className="text-xs text-op-muted/70 mt-1.5 italic">⏱ {meta.timing}</p>
          </div>
        </div>

        {/* Not enabled */}
        {!row.enabled && (
          <button
            onClick={() => setShowWizard(true)}
            className="btn-primary w-full mt-5 justify-center text-sm"
          >
            <Zap size={15} /> Set Up &amp; Activate
          </button>
        )}

        {/* Enabled — controls */}
        {row.enabled && (
          <div className="mt-4 border-t border-op-border pt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowEdit((v) => !v)}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                {showEdit ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                Edit Settings
              </button>
              <button
                onClick={handleTest}
                disabled={testing}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                {testing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Send Test
              </button>
              {meta.type === 'lead_followup' && (
                <button
                  onClick={() => setShowEmbed((v) => !v)}
                  className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
                >
                  {showEmbed ? <ChevronUp size={13} /> : <ExternalLink size={13} />}
                  Embed Form
                </button>
              )}
              {testMsg && (
                <span className={`text-xs font-semibold ${testMsg.includes('sent') ? 'text-op-green' : 'text-op-red'}`}>
                  {testMsg}
                </span>
              )}
              <button
                onClick={handleDisable}
                disabled={disabling}
                className="ml-auto text-xs text-op-muted hover:text-op-red transition-colors"
              >
                {disabling ? <Loader2 size={13} className="animate-spin" /> : 'Disable'}
              </button>
            </div>

            {/* Editable config */}
            {showEdit && (
              <div className="mt-4 flex flex-col gap-3">
                {editFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-op-navy mb-1">{field.label}</label>
                    {field.multiline ? (
                      <textarea
                        className={`${inputClass} resize-none`}
                        rows={2}
                        placeholder={field.placeholder}
                        value={(editConfig as Record<string, string>)[field.key] ?? ''}
                        onChange={(e) => setEditConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                      />
                    ) : (
                      <input
                        className={inputClass}
                        placeholder={field.placeholder}
                        value={(editConfig as Record<string, string>)[field.key] ?? ''}
                        onChange={(e) => setEditConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveEdit} disabled={saving} className="btn-secondary text-xs px-4 py-2">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : 'Save Changes'}
                  </button>
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-op-green font-semibold">
                      <CheckCircle2 size={13} /> Saved
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Embed code panel — lead_followup only */}
            {meta.type === 'lead_followup' && showEmbed && (() => {
              const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
              const businessParam = row.config?.fromName ? `&business=${encodeURIComponent(row.config.fromName)}` : ''
              const formUrl = `${appUrl}/form/${userId}${businessParam}`
              const iframeSnippet = `<iframe src="${formUrl}" width="100%" height="520" style="border:none;border-radius:12px;" title="Contact Form"></iframe>`
              return (
                <div className="mt-4 border-t border-op-border pt-4">
                  <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-3">Embed Your Lead Form</p>
                  <p className="text-xs text-op-muted mb-3">Paste the iframe snippet into any page of your website to start capturing leads automatically.</p>
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-op-navy mb-1">Form URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-op-bg border border-op-border rounded-lg px-3 py-2 text-xs text-op-body font-mono truncate">{formUrl}</code>
                      <button onClick={() => copyText(formUrl, 'url')} className="shrink-0 btn-secondary text-xs px-2 py-2 flex items-center gap-1">
                        {copiedKey === 'url' ? <CheckCircle2 size={13} className="text-op-green" /> : <Copy size={13} />}
                        {copiedKey === 'url' ? 'Copied' : 'Copy'}
                      </button>
                      <a href={formUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 btn-secondary text-xs px-2 py-2 flex items-center gap-1">
                        <ExternalLink size={13} /> Preview
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-op-navy mb-1">Embed Snippet (iframe)</p>
                    <div className="flex items-start gap-2">
                      <code className="flex-1 bg-op-bg border border-op-border rounded-lg px-3 py-2 text-xs text-op-body font-mono break-all leading-relaxed">{iframeSnippet}</code>
                      <button onClick={() => copyText(iframeSnippet, 'iframe')} className="shrink-0 btn-secondary text-xs px-2 py-2 flex items-center gap-1 mt-0.5">
                        {copiedKey === 'iframe' ? <CheckCircle2 size={13} className="text-op-green" /> : <Copy size={13} />}
                        {copiedKey === 'iframe' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Review Growth System metrics */}
            {meta.type === 'review_request' && reviewMetrics && (
              <div className="mt-4 border-t border-op-border pt-4">
                <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-3">Performance</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-op-bg rounded-xl p-3">
                    <p className="text-2xl font-bold text-op-navy">{reviewMetrics.requestsSent}</p>
                    <p className="text-xs text-op-muted mt-0.5">Requests sent</p>
                  </div>
                  <div className="bg-op-bg rounded-xl p-3">
                    <p className="text-2xl font-bold text-op-amber">{reviewMetrics.waitingForReview}</p>
                    <p className="text-xs text-op-muted mt-0.5">Waiting for review</p>
                  </div>
                  <div className="bg-op-bg rounded-xl p-3">
                    <p className="text-2xl font-bold text-op-navy">{reviewMetrics.remindersScheduled}</p>
                    <p className="text-xs text-op-muted mt-0.5">Reminders scheduled</p>
                  </div>
                  <div className="bg-op-bg rounded-xl p-3">
                    <p className="text-2xl font-bold text-op-muted">{reviewMetrics.privateFeedbackSent}</p>
                    <p className="text-xs text-op-muted mt-0.5">Private feedback sent</p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery log */}
            {activity.length > 0 && (
              <div className="mt-4 border-t border-op-border pt-4">
                <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">Recent Activity</p>
                <div className="flex flex-col gap-1.5">
                  {activity.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="text-op-navy font-medium truncate block">{entry.subject ?? 'Email sent'}</span>
                        {entry.recipient_email && (
                          <span className="text-op-muted truncate block">{entry.recipient_email}</span>
                        )}
                      </div>
                      <span className="text-op-muted shrink-0">
                        {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showWizard && (
        <AgentSetupWizard
          type={meta.type}
          userId={userId}
          initialConfig={row.config ?? {}}
          onComplete={handleWizardComplete}
          onClose={() => setShowWizard(false)}
        />
      )}
    </>
  )
}

function ComingSoonCard({ icon: Icon, name, description }: {
  icon: React.ElementType
  name: string
  description: string
}) {
  return (
    <div className="card border-2 border-op-border opacity-60">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-op-bg">
          <Icon size={18} className="text-op-muted" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-op-navy font-manrope">{name}</h3>
            <span className="text-xs font-bold text-op-muted bg-op-bg border border-op-border px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <p className="text-sm text-op-muted mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AgentsPage() {
  const [agents, setAgents] = useState<Record<AgentType, AgentRow>>({
    lead_followup:  { type: 'lead_followup',  enabled: false, config: {} },
    review_request: { type: 'review_request', enabled: false, config: {} },
    weekly_report:  { type: 'weekly_report',  enabled: false, config: {} },
  })
  const [activityByType, setActivityByType] = useState<Record<string, ActivityEntry[]>>({})
  const [tasks, setTasks]         = useState<AgentTask[]>([])
  const [reviewMetrics, setReviewMetrics] = useState<ReviewMetrics | null>(null)
  const [userId, setUserId]       = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const [
        { data: agentData },
        { data: activityData },
        tasksRes,
        { count: requestsSent },
        { count: remindersScheduled },
        { count: waitingForReview },
        { count: privateFeedbackSent },
      ] = await Promise.all([
        supabase.from('agents').select('*'),
        supabase
          .from('agent_activity')
          .select('id, agent_type, recipient_email, subject, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
        fetch('/api/agents/tasks'),
        supabase.from('agent_messages').select('*', { count: 'exact', head: true })
          .eq('agent_type', 'review_request').eq('template_id', 'review_day0'),
        supabase.from('agent_messages').select('*', { count: 'exact', head: true })
          .eq('agent_type', 'review_request').eq('status', 'scheduled')
          .in('template_id', ['review_day3', 'review_day7']),
        supabase.from('contacts').select('*', { count: 'exact', head: true })
          .eq('status', 'review_requested'),
        supabase.from('agent_messages').select('*', { count: 'exact', head: true })
          .eq('agent_type', 'review_request').eq('template_id', 'private_feedback'),
      ])

      setReviewMetrics({
        requestsSent:       requestsSent ?? 0,
        remindersScheduled: remindersScheduled ?? 0,
        waitingForReview:   waitingForReview ?? 0,
        privateFeedbackSent: privateFeedbackSent ?? 0,
      })

      if (agentData) {
        const map = { ...agents }
        agentData.forEach((row: AgentRow) => {
          map[row.type] = { type: row.type, enabled: row.enabled, config: row.config ?? {} }
        })
        setAgents(map)
      }
      if (activityData) {
        const grouped: Record<string, ActivityEntry[]> = {}
        activityData.forEach((entry: ActivityEntry) => {
          if (!grouped[entry.agent_type]) grouped[entry.agent_type] = []
          if (grouped[entry.agent_type].length < 5) grouped[entry.agent_type].push(entry)
        })
        setActivityByType(grouped)
      }
      if (tasksRes.ok) {
        const { tasks: t } = await tasksRes.json()
        setTasks(t ?? [])
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdate = (type: AgentType, updates: Partial<AgentRow>) => {
    setAgents((prev) => ({ ...prev, [type]: { ...prev[type], ...updates } }))
  }

  const handleDismissTask = async (id: string) => {
    setTasks((t) => t.filter((task) => task.id !== id))
    await fetch('/api/agents/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'dismissed' }),
    })
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-op-muted" size={24} />
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold font-manrope text-op-navy mb-1">Revenue Systems</h1>
        <p className="text-sm text-op-muted mb-8">
          Pre-built revenue recovery systems powered by AI. Activate one and it runs itself.
        </p>

        {/* Tasks panel */}
        <TasksPanel tasks={tasks} onDismiss={handleDismissTask} />

        <div className="flex flex-col gap-5">
          {SYSTEM_META.map((meta) => (
            <AgentCard
              key={meta.type}
              meta={meta}
              row={agents[meta.type]}
              activity={activityByType[meta.type] ?? []}
              userId={userId}
              onUpdate={handleUpdate}
              reviewMetrics={meta.type === 'review_request' ? reviewMetrics : null}
            />
          ))}

          <div className="mt-4">
            <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-4">Coming Soon</p>
            <div className="flex flex-col gap-4">
              {COMING_SOON.map((cs) => (
                <ComingSoonCard key={cs.name} icon={cs.icon} name={cs.name} description={cs.description} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
