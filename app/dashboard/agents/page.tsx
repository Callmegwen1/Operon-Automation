'use client'

import { useState, useEffect } from 'react'
import { Mail, Star, BarChart2, Loader2, CheckCircle2, FileText, DollarSign, RefreshCw, Send, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AgentType = 'lead_followup' | 'review_request' | 'weekly_report'

interface AgentConfig {
  fromName?: string
  replyToEmail?: string
  phone?: string
  reviewLink?: string
  reportEmail?: string
}

interface AgentRow {
  type: AgentType
  enabled: boolean
  config: AgentConfig
}

interface ActivityEntry {
  id: string
  type: string
  recipient_email: string | null
  subject: string | null
  created_at: string
}

const AGENT_META = [
  {
    type: 'lead_followup' as AgentType,
    icon: Mail,
    name: 'Lead Follow-Up Agent',
    description:
      'When you add a new lead, this agent automatically sends a follow-up email sequence at 15 minutes, 2 days, and 5 days — so no lead goes cold.',
    timing: 'Sends at 15 min, 2 days, and 5 days after a lead is added.',
    requiredFields: ['fromName', 'replyToEmail'],
    fields: [
      { key: 'fromName',     label: 'Your Name',             placeholder: 'John Smith'           },
      { key: 'replyToEmail', label: 'Your Email (reply-to)', placeholder: 'you@yourbusiness.com' },
      { key: 'phone',        label: 'Business Phone',         placeholder: '(555) 000-0000'       },
    ],
  },
  {
    type: 'review_request' as AgentType,
    icon: Star,
    name: 'Review Request Agent',
    description:
      "Sends a personalized review request to any customer you select from your contacts. Drives more Google reviews without manual effort.",
    timing: 'Sends immediately when you click "Review Request" on a contact.',
    requiredFields: ['reviewLink', 'fromName', 'replyToEmail'],
    fields: [
      { key: 'reviewLink',   label: 'Google Review Link',    placeholder: 'https://g.page/r/...' },
      { key: 'fromName',     label: 'Your Name',             placeholder: 'John Smith'           },
      { key: 'replyToEmail', label: 'Your Email (reply-to)', placeholder: 'you@yourbusiness.com' },
    ],
  },
  {
    type: 'weekly_report' as AgentType,
    icon: BarChart2,
    name: 'Weekly Owner Report',
    description:
      'Every Monday morning, receive a summary of your Revenue Leak Score, open leaks, and agent activity directly in your inbox.',
    timing: 'Sends every Monday at 8:00 AM.',
    requiredFields: ['reportEmail'],
    fields: [
      { key: 'reportEmail', label: 'Send report to', placeholder: 'you@yourbusiness.com' },
    ],
  },
]

const COMING_SOON = [
  {
    icon: FileText,
    name: 'Estimate Follow-Up Agent',
    description: 'Automatically follows up on unanswered estimates after 24 hours and 3 days — turning cold quotes into booked jobs.',
  },
  {
    icon: DollarSign,
    name: 'Invoice Reminder Agent',
    description: 'Sends friendly payment reminders for overdue invoices at 3, 7, and 14 days — reducing collections calls.',
  },
  {
    icon: RefreshCw,
    name: 'Customer Reactivation Agent',
    description: 'Re-engages customers who haven\'t booked in 60+ days with a personalized win-back message.',
  },
]

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-op-navy' : 'bg-gray-200'}`}
      aria-label={enabled ? 'Disable agent' : 'Enable agent'}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

function AgentCard({ meta, row, activity, onUpdate }: {
  meta: typeof AGENT_META[number]
  row: AgentRow
  activity: ActivityEntry[]
  onUpdate: (type: AgentType, updates: Partial<AgentRow>) => void
}) {
  const Icon = meta.icon
  const [config, setConfig] = useState<AgentConfig>(row.config ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')

  const missingRequired = meta.requiredFields.filter(
    (k) => !(config as Record<string, string>)[k]?.trim()
  )

  const handleToggle = async () => {
    const next = !row.enabled
    if (next && missingRequired.length > 0) {
      setValidationError(`Fill in required fields before enabling: ${missingRequired.map((k) => {
        const f = meta.fields.find((f) => f.key === k)
        return f?.label ?? k
      }).join(', ')}`)
      return
    }
    setValidationError('')
    setToggling(true)
    await fetch('/api/agents/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: meta.type, enabled: next }),
    })
    onUpdate(meta.type, { enabled: next })
    setToggling(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/agents/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: meta.type, config }),
    })
    onUpdate(meta.type, { config })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestMsg('')
    const res = await fetch('/api/agents/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: meta.type }),
    })
    const data = await res.json()
    setTesting(false)
    setTestMsg(res.ok ? 'Test sent — check your inbox.' : (data.error ?? 'Failed to send test'))
    setTimeout(() => setTestMsg(''), 5000)
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-2.5 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

  return (
    <div className={`card border-2 transition-colors ${row.enabled ? 'border-op-navy/20' : 'border-op-border'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${row.enabled ? 'bg-op-navy' : 'bg-op-bg'}`}>
            <Icon size={18} className={row.enabled ? 'text-white' : 'text-op-muted'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-op-navy font-manrope">{meta.name}</h3>
              {row.enabled && (
                <span className="text-xs font-bold text-op-green bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-op-muted mt-0.5 leading-relaxed">{meta.description}</p>
            <p className="text-xs text-op-muted mt-1 italic">{meta.timing}</p>
          </div>
        </div>
        {toggling ? (
          <Loader2 size={20} className="animate-spin text-op-muted shrink-0 mt-1" />
        ) : (
          <Toggle enabled={row.enabled} onToggle={handleToggle} />
        )}
      </div>

      {validationError && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          <AlertCircle size={14} className="text-op-amber shrink-0 mt-0.5" />
          <p className="text-xs text-op-amber">{validationError}</p>
        </div>
      )}

      {/* Config fields */}
      <div className="border-t border-op-border pt-4 mt-4">
        <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-3">Configuration</p>
        <div className="grid gap-3">
          {meta.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-op-navy mb-1">
                {field.label}
                {meta.requiredFields.includes(field.key) && (
                  <span className="text-op-red ml-0.5">*</span>
                )}
              </label>
              <input
                className={inputClass}
                value={(config as Record<string, string>)[field.key] ?? ''}
                onChange={(e) => {
                  setConfig((c) => ({ ...c, [field.key]: e.target.value }))
                  setValidationError('')
                }}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary text-sm px-4 py-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Config'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || missingRequired.length > 0}
            className="btn-secondary text-sm px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
            title={missingRequired.length > 0 ? 'Fill required fields first' : 'Send a test to yourself'}
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
            Send Test
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-op-green font-semibold">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
          {testMsg && (
            <span className={`text-xs font-semibold ${testMsg.includes('sent') ? 'text-op-green' : 'text-op-red'}`}>
              {testMsg}
            </span>
          )}
        </div>
      </div>

      {/* Delivery log */}
      {activity.length > 0 && (
        <div className="border-t border-op-border pt-4 mt-4">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">Recent Deliveries</p>
          <div className="flex flex-col gap-1.5">
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <span className="text-op-navy font-medium truncate block">
                    {entry.subject ?? 'Email sent'}
                  </span>
                  {entry.recipient_email && (
                    <span className="text-op-muted truncate block">{entry.recipient_email}</span>
                  )}
                </div>
                <span className="text-op-muted shrink-0 whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
            <span className="text-xs font-bold text-op-muted bg-op-bg border border-op-border px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-op-muted mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Record<AgentType, AgentRow>>({
    lead_followup:  { type: 'lead_followup',  enabled: false, config: {} },
    review_request: { type: 'review_request', enabled: false, config: {} },
    weekly_report:  { type: 'weekly_report',  enabled: false, config: {} },
  })
  const [activityByType, setActivityByType] = useState<Record<string, ActivityEntry[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: agentData }, { data: activityData }] = await Promise.all([
        supabase.from('agents').select('*'),
        supabase
          .from('agent_activity')
          .select('id, type, recipient_email, subject, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
      ])
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
          if (!grouped[entry.type]) grouped[entry.type] = []
          if (grouped[entry.type].length < 5) grouped[entry.type].push(entry)
        })
        setActivityByType(grouped)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdate = (type: AgentType, updates: Partial<AgentRow>) => {
    setAgents((prev) => ({ ...prev, [type]: { ...prev[type], ...updates } }))
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
        <h1 className="text-2xl font-bold font-manrope text-op-navy mb-1">Autopilot Agents</h1>
        <p className="text-sm text-op-muted mb-8">
          Fill in the configuration, then enable each agent. Required fields are marked with <span className="text-op-red">*</span>.
        </p>

        <div className="flex flex-col gap-5">
          {AGENT_META.map((meta) => (
            <AgentCard
              key={meta.type}
              meta={meta}
              row={agents[meta.type]}
              activity={activityByType[meta.type] ?? []}
              onUpdate={handleUpdate}
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
