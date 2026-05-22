'use client'

import { useState, useEffect } from 'react'
import { Mail, Star, BarChart2, Loader2, CheckCircle2 } from 'lucide-react'
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

const AGENT_META = [
  {
    type: 'lead_followup' as AgentType,
    icon: Mail,
    name: 'Lead Follow-Up Agent',
    description:
      'When you add a new lead, this agent automatically sends a follow-up email sequence at 15 minutes, 2 days, and 5 days — so no lead goes cold.',
    fields: [
      { key: 'fromName',      label: 'Your Name',              placeholder: 'John Smith'              },
      { key: 'replyToEmail',  label: 'Your Email (reply-to)',  placeholder: 'you@yourbusiness.com'    },
      { key: 'phone',         label: 'Business Phone',         placeholder: '(555) 000-0000'          },
    ],
  },
  {
    type: 'review_request' as AgentType,
    icon: Star,
    name: 'Review Request Agent',
    description:
      "Sends a personalized review request to any customer you select from your contacts. Drives more Google reviews without manual effort.",
    fields: [
      { key: 'reviewLink',    label: 'Google Review Link',     placeholder: 'https://g.page/r/...'    },
      { key: 'fromName',      label: 'Your Name',              placeholder: 'John Smith'              },
      { key: 'replyToEmail',  label: 'Your Email (reply-to)',  placeholder: 'you@yourbusiness.com'    },
    ],
  },
  {
    type: 'weekly_report' as AgentType,
    icon: BarChart2,
    name: 'Weekly Owner Report',
    description:
      'Every Monday morning, receive a summary of your Revenue Leak Score, open leaks, and agent activity directly in your inbox.',
    fields: [
      { key: 'reportEmail',   label: 'Send report to',         placeholder: 'you@yourbusiness.com'    },
    ],
  },
]

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-op-blue' : 'bg-gray-200'}`}
      aria-label={enabled ? 'Disable agent' : 'Enable agent'}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

function AgentCard({ meta, row, onUpdate }: {
  meta: typeof AGENT_META[number]
  row: AgentRow
  onUpdate: (type: AgentType, updates: Partial<AgentRow>) => void
}) {
  const Icon = meta.icon
  const [config, setConfig] = useState<AgentConfig>(row.config ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    const next = !row.enabled
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

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-2.5 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white'

  return (
    <div className={`card border-2 transition-colors ${row.enabled ? 'border-op-blue/30' : 'border-op-border'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${row.enabled ? 'bg-op-blue' : 'bg-op-bg'}`}>
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
          </div>
        </div>
        {toggling ? (
          <Loader2 size={20} className="animate-spin text-op-muted shrink-0 mt-1" />
        ) : (
          <Toggle enabled={row.enabled} onToggle={handleToggle} />
        )}
      </div>

      {/* Config fields — always visible so user can set up before enabling */}
      <div className="border-t border-op-border pt-4 mt-4">
        <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-3">Configuration</p>
        <div className="grid gap-3">
          {meta.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-op-navy mb-1">{field.label}</label>
              <input
                className={inputClass}
                value={(config as Record<string, string>)[field.key] ?? ''}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, [field.key]: e.target.value }))
                }
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary text-sm px-4 py-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Config'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-op-green font-semibold">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('agents').select('*')
      if (data) {
        const map = { ...agents }
        data.forEach((row: AgentRow) => {
          map[row.type] = { type: row.type, enabled: row.enabled, config: row.config ?? {} }
        })
        setAgents(map)
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
          Enable agents to automatically follow up with leads, request reviews, and send weekly reports. Configure each agent before enabling.
        </p>

        <div className="flex flex-col gap-5">
          {AGENT_META.map((meta) => (
            <AgentCard
              key={meta.type}
              meta={meta}
              row={agents[meta.type]}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
