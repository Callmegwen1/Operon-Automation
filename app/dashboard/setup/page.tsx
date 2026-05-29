'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, ArrowRight, Loader2,
  Mail, Star, BarChart2, FileText, RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AgentSetupWizard from '@/components/dashboard/AgentSetupWizard'

type AgentType = 'lead_followup' | 'review_request' | 'weekly_report' | 'estimate_followup' | 'reactivation'

interface AgentConfig {
  fromName?: string
  replyToEmail?: string
  phone?: string
  reviewLink?: string
  reportEmail?: string
  personalNote?: string
  estimateOpener?: string
  estimateBody?: string
  reactivationOpener?: string
  reactivationBody?: string
}

interface AgentRow {
  type: AgentType
  enabled: boolean
  config: AgentConfig
}

const SETUP_ORDER: { type: AgentType; icon: React.ElementType; name: string; tagline: string }[] = [
  { type: 'lead_followup',    icon: Mail,      name: 'Lead Recovery Autopilot',         tagline: 'Respond to every new lead within minutes.' },
  { type: 'review_request',   icon: Star,      name: 'Review Growth System',            tagline: 'Turn happy customers into 5-star reviews.' },
  { type: 'estimate_followup',icon: FileText,  name: 'Estimate Recovery Autopilot',     tagline: 'Turn cold quotes into booked jobs.' },
  { type: 'reactivation',     icon: RefreshCw, name: 'Customer Reactivation Autopilot', tagline: "Win back customers who've gone quiet." },
  { type: 'weekly_report',    icon: BarChart2, name: 'Weekly Revenue Briefing',         tagline: 'Your business health, every Monday.' },
]

export default function SetupPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [agents, setAgents] = useState<Record<AgentType, AgentRow> | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUserId(user.id)

      const { data: rows } = await supabase
        .from('agents')
        .select('type, enabled, config')
        .eq('user_id', user.id)

      const map: Record<AgentType, AgentRow> = {} as Record<AgentType, AgentRow>
      for (const meta of SETUP_ORDER) {
        const row = rows?.find((r) => r.type === meta.type)
        map[meta.type] = row
          ? { type: meta.type, enabled: row.enabled, config: (row.config ?? {}) as AgentConfig }
          : { type: meta.type, enabled: false, config: {} }
      }
      setAgents(map)
      setLoaded(true)
    }
    load()
  }, [router])

  const queue = SETUP_ORDER.filter((m) => agents && !agents[m.type].enabled)

  const handleComplete = async (config: AgentConfig) => {
    if (!agents || !userId) return
    const current = queue[currentIndex]
    if (!current) return

    setSaving(true)
    const supabase = createClient()
    await supabase.from('agents').upsert(
      { user_id: userId, type: current.type, enabled: true, config },
      { onConflict: 'user_id,type' }
    )

    setAgents((prev) => {
      if (!prev) return prev
      return { ...prev, [current.type]: { ...prev[current.type], enabled: true, config } }
    })
    setSaving(false)

    if (currentIndex + 1 >= queue.length) {
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-op-navy" />
      </div>
    )
  }

  if (done || queue.length === 0) {
    const activatedCount = SETUP_ORDER.filter((m) => agents && agents[m.type].enabled).length
    const activatedTypes = SETUP_ORDER.filter((m) => agents && agents[m.type].enabled)

    const NEXT_ACTION: Partial<Record<AgentType, string>> = {
      lead_followup:    'The next new contact you add will receive an automated follow-up within minutes.',
      review_request:   'Mark any contact as done and a review request sequence will go out automatically.',
      estimate_followup:'Send an estimate from any contact page — a 3-touch follow-up starts immediately.',
      reactivation:     'This Sunday, dormant contacts will receive a personalized win-back message.',
      weekly_report:    'You\'ll receive your first Weekly Revenue Briefing this coming Monday.',
    }

    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-op-green" />
          </div>
          <h1 className="text-2xl font-extrabold text-op-navy mb-2">
            {activatedCount === SETUP_ORDER.length ? 'All systems live.' : 'Your automation is live.'}
          </h1>
          <p className="text-op-muted text-sm leading-relaxed">
            {activatedCount} revenue system{activatedCount !== 1 ? 's' : ''} now running in the background.{' '}
            {activatedCount < SETUP_ORDER.length && 'Activate the rest any time from Agents.'}
          </p>
        </div>

        {/* What happens next */}
        {activatedTypes.length > 0 && (
          <div className="card border border-op-navy/15 bg-op-navy/[0.02] mb-6">
            <p className="text-xs font-bold text-op-muted uppercase tracking-wide mb-4">What happens next</p>
            <div className="flex flex-col gap-4">
              {activatedTypes.map((m) => {
                const Icon = m.icon
                const next = NEXT_ACTION[m.type]
                if (!next) return null
                return (
                  <div key={m.type} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-op-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} className="text-op-navy" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-op-navy mb-0.5">{m.name}</p>
                      <p className="text-xs text-op-muted leading-relaxed">{next}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/dashboard')} className="btn-primary flex-1">
            Go to Dashboard <ArrowRight size={16} />
          </button>
          <button onClick={() => router.push('/dashboard/agents')} className="btn-secondary flex-1">
            View All Agents
          </button>
        </div>
      </div>
    )
  }

  const current = queue[currentIndex]
  const totalSteps = queue.length
  const stepNumber = currentIndex + 1

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-op-muted font-semibold uppercase tracking-wider mb-1">
          Revenue Systems Setup
        </p>
        <h1 className="text-xl font-extrabold text-op-navy mb-3">
          {stepNumber === 1 ? 'Let\'s get your systems live.' : `Next up: ${current.name}`}
        </h1>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-1">
          <div className="flex-1 bg-op-border rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-op-navy rounded-full transition-all duration-500"
              style={{ width: `${(currentIndex / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-xs text-op-muted shrink-0">
            {stepNumber} of {totalSteps}
          </span>
        </div>

        {/* Upcoming */}
        {totalSteps > 1 && (
          <div className="flex items-center gap-2 mt-2">
            {queue.map((m, i) => {
              const Icon = m.icon
              const done = i < currentIndex
              const active = i === currentIndex
              return (
                <div
                  key={m.type}
                  title={m.name}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    active  ? 'bg-op-navy text-white' :
                    done    ? 'bg-green-50 text-op-green border border-green-200' :
                              'bg-op-bg text-op-muted border border-op-border'
                  }`}
                >
                  <Icon size={9} />
                  <span className="hidden sm:inline">{m.name.split(' ')[0]}</span>
                  {done && <CheckCircle2 size={9} />}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Wizard */}
      <div className="relative">
        {saving && (
          <div className="absolute inset-0 bg-white/70 rounded-2xl z-10 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-op-navy" />
          </div>
        )}
        <AgentSetupWizard
          inline
          type={current.type}
          userId={userId}
          initialConfig={agents![current.type].config}
          onComplete={handleComplete}
          onClose={() => {}}
        />
      </div>

      {/* Skip */}
      {totalSteps > 1 && (
        <div className="text-center mt-4">
          <button
            onClick={() => {
              if (currentIndex + 1 >= queue.length) setDone(true)
              else setCurrentIndex((i) => i + 1)
            }}
            className="text-xs text-op-muted hover:text-op-navy transition-colors"
          >
            Skip this one for now →
          </button>
        </div>
      )}
    </div>
  )
}
