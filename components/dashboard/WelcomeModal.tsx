'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Mail, Star, FileText, RefreshCw, BarChart2 } from 'lucide-react'

const PLAN_META: Record<string, { name: string; price: string; agentCount: number }> = {
  starter: { name: 'Starter', price: '$149/mo', agentCount: 1 },
  growth:  { name: 'Growth',  price: '$299/mo', agentCount: 5 },
  pro:     { name: 'Pro',     price: '$599/mo', agentCount: 5 },
}

const AGENTS = [
  {
    icon:        Mail,
    name:        'Lead Recovery Autopilot',
    tagline:     'Follows up on every new lead within 15 minutes.',
    recommended: true,
  },
  {
    icon:        Star,
    name:        'Review Growth System',
    tagline:     'Gets more 5-star reviews. Filters out unhappy customers.',
    recommended: false,
  },
  {
    icon:        FileText,
    name:        'Estimate Recovery Autopilot',
    tagline:     'Follows up on sent quotes so they don\'t go cold.',
    recommended: false,
  },
  {
    icon:        RefreshCw,
    name:        'Customer Reactivation Autopilot',
    tagline:     'Wins back customers who haven\'t booked in 60+ days.',
    recommended: false,
  },
  {
    icon:        BarChart2,
    name:        'Weekly Revenue Briefing',
    tagline:     'Monday email showing what each agent did that week.',
    recommended: false,
  },
]

const STEPS = [
  { label: 'Account created',              sub: null,                                        done: true,  current: false },
  { label: 'Plan activated',               sub: null,                                        done: true,  current: false },
  { label: 'Activate your first agent',    sub: 'Takes 90 seconds. Works immediately.',      done: false, current: true  },
  { label: 'Embed your lead form',         sub: 'Paste one line of code on your website.',   done: false, current: false },
]

export default function WelcomeModal({ plan }: { plan: string }) {
  const router  = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const meta = PLAN_META[plan]
    if (!meta) return
    if (localStorage.getItem('operon_welcomed')) return
    setVisible(true)
  }, [plan])

  const dismiss = (goToAgents: boolean) => {
    localStorage.setItem('operon_welcomed', '1')
    setVisible(false)
    if (goToAgents) {
      router.push('/dashboard/agents')
    } else {
      router.replace('/dashboard')
    }
  }

  if (!visible) return null

  const meta       = PLAN_META[plan] ?? PLAN_META.growth
  const isStarter  = plan === 'starter'
  const subheading = isStarter
    ? 'You have 1 agent slot. Lead Recovery Autopilot is the highest-impact place to start — it pays for the plan fastest.'
    : `All ${meta.agentCount} agents are unlocked. Lead Recovery Autopilot is the highest-impact place to start.`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden">

        {/* Navy header */}
        <div className="bg-[#0f2744] px-6 pt-6 pb-5 text-center">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
            <CheckCircle2 size={12} />
            {meta.name} Plan Active &nbsp;·&nbsp; {meta.price}
          </div>
          <h2 className="text-[1.6rem] font-bold text-white font-manrope leading-snug">
            You&apos;re in. Let&apos;s get your<br />first agent running.
          </h2>
          <p className="text-white/55 text-sm mt-2 leading-relaxed">{subheading}</p>
        </div>

        {/* Steps */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex flex-col gap-1.5 mb-5">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 ${
                  step.current ? 'bg-[#0f2744]/[0.05] border border-[#0f2744]/15' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {step.done ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : step.current ? (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-[#0f2744] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#0f2744]" />
                    </div>
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-tight ${
                    step.done    ? 'text-slate-400 line-through' :
                    step.current ? 'text-[#0f2744]' :
                    'text-slate-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.sub && (
                    <p className="text-xs text-slate-500 mt-0.5">{step.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended agent highlight */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f2744] flex items-center justify-center shrink-0">
                <Mail size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-[#0f2744]">Lead Recovery Autopilot</p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Recommended first
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  When a lead comes in, it reads their message, gauges urgency, and sends a personalized follow-up within 15 minutes — then follows up again on Day 2 and Day 5.
                </p>
              </div>
            </div>
            {isStarter && AGENTS.filter(a => !a.recommended).length > 0 && (
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-200">
                Other options: {AGENTS.filter(a => !a.recommended).map(a => a.name).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={() => dismiss(true)}
            className="w-full py-3.5 bg-[#0f2744] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1a3a5c] transition-colors"
          >
            Set Up Lead Recovery Autopilot <ArrowRight size={15} />
          </button>
          <button
            onClick={() => dismiss(false)}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
          >
            I&apos;ll explore the dashboard first
          </button>
        </div>
      </div>
    </div>
  )
}
