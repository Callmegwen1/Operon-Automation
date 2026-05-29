import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Phone,
  Star,
  FileText,
  DollarSign,
  Users,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  Zap,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import DashboardMockup from '@/components/dashboard/DashboardMockup'
import SectionHeader from '@/components/ui/SectionHeader'
import { AnimateIn, StaggerChildren, ScaleIn } from '@/components/ui/Motion'

export const metadata: Metadata = {
  title: 'Revenue Autopilot | Operon Automation',
  description:
    'Revenue Autopilot finds where your business is losing customers and helps recover them automatically. Get your Revenue Leak Score and activate simple recovery systems.',
}

const agents = [
  {
    icon: Phone,
    title: 'Lead Follow-Up Agent',
    desc: 'Automatically follows up with new leads via email so no opportunity slips through the cracks.',
    badge: 'Active',
    badgeClass: 'badge-green',
  },
  {
    icon: Star,
    title: 'Review Request Agent',
    desc: 'Sends timely review requests to happy customers, building your reputation on autopilot.',
    badge: 'Active',
    badgeClass: 'badge-green',
  },
  {
    icon: FileText,
    title: 'Estimate Follow-Up Agent',
    desc: 'Follows up on open estimates before they go cold, giving you a second chance to close.',
    badge: 'Active',
    badgeClass: 'badge-accent',
  },
  {
    icon: DollarSign,
    title: 'Invoice Reminder Agent',
    desc: 'Sends friendly payment reminders so you collect faster without awkward conversations.',
    badge: 'Coming Soon',
    badgeClass: 'badge-amber',
  },
  {
    icon: Users,
    title: 'Customer Reactivation Agent',
    desc: 'Identifies past customers who have gone quiet and sends re-engagement campaigns to bring them back.',
    badge: 'Active',
    badgeClass: 'badge-green',
  },
  {
    icon: BarChart2,
    title: 'Weekly Owner Report Agent',
    desc: 'Delivers a clear weekly summary: what ran, what recovered, what needs your attention.',
    badge: 'Every Monday',
    badgeClass: 'badge-blue',
  },
]

const leakScoreItems = [
  { label: 'Lead Follow-Up Speed',  score: 42, color: 'bg-op-red'    },
  { label: 'Review System',         score: 61, color: 'bg-op-amber'  },
  { label: 'Estimate Recovery',     score: 35, color: 'bg-op-red'    },
  { label: 'Customer Reactivation', score: 28, color: 'bg-op-red'    },
  { label: 'Invoice Collection',    score: 74, color: 'bg-op-amber'  },
  { label: 'Ad Source Tracking',    score: 55, color: 'bg-op-amber'  },
]

const howSteps = [
  { num: '01', title: 'Connect your business',     desc: 'Answer the scanner questions so Autopilot understands your business and current systems.' },
  { num: '02', title: 'Review your Leak Score',    desc: 'See a detailed breakdown of every area where revenue may be slipping away.' },
  { num: '03', title: 'Activate recommended agents', desc: 'Turn on the Autopilot Agents that match your top leaks — one click to activate.' },
  { num: '04', title: 'Recover missed opportunities', desc: 'Agents run automatically, following up on leads, requesting reviews, and reactivating past customers.' },
  { num: '05', title: 'Track recovery every week', desc: 'The Weekly Owner Report shows what is running and what has been recovered.' },
]

export default function RevenueAutopilotPage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-op-bg section-pad relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 100% 0%, rgba(212,98,42,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="container-wide relative">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 max-w-xl">
              <AnimateIn>
                <span className="badge-accent mb-5 inline-flex">
                  <Zap size={12} /> Revenue Autopilot by Operon
                </span>
                <h1 className="text-4xl md:text-5xl font-fraunces font-bold text-op-ink
                               leading-tight mb-5">
                  Find where your business is losing customers. Fix it automatically.
                </h1>
                <p className="text-lg text-op-muted leading-relaxed mb-8 font-jakarta">
                  Get clear visibility into missed leads, weak follow-up, review gaps, and lost
                  opportunities. Then activate simple systems that fix them.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/scanner" className="btn-primary px-7 py-3.5 text-sm">
                    Scan My Business Free <ArrowRight size={16} />
                  </Link>
                  <Link href="/pricing" className="btn-secondary px-7 py-3.5 text-sm">
                    See Pricing
                  </Link>
                </div>
              </AnimateIn>
            </div>
            <ScaleIn className="flex-1 w-full max-w-md">
              <DashboardMockup />
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ─── WHAT IT DOES ─────────────────────────────────────────── */}
      <section className="section-pad bg-op-surface section-divider">
        <div className="container-wide">
          <AnimateIn className="text-center mb-14">
            <SectionHeader
              eyebrow="What It Does"
              title="Everything you need to stop losing"
              titleHighlight="revenue quietly."
              center
            />
          </AnimateIn>
          <StaggerChildren
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            stagger={0.08}
          >
            {[
              { icon: AlertTriangle, iconColor: 'text-op-amber',  bg: 'bg-amber-50',     title: 'Revenue Leak Detection',  desc: 'Operon scans your business for common revenue leaks — missed calls, cold leads, missing reviews, and more.' },
              { icon: TrendingUp,    iconColor: 'text-op-ink',    bg: 'bg-op-surface-2', title: 'Revenue Leak Score',      desc: 'Get a single score out of 100 showing how much potential revenue may be at risk, with a breakdown by category.' },
              { icon: Zap,           iconColor: 'text-op-forest', bg: 'bg-emerald-50',   title: 'Autopilot Agents',        desc: 'Activate intelligent agents that handle follow-up, review requests, and customer reactivation automatically.' },
              { icon: BarChart2,     iconColor: 'text-op-teal',   bg: 'bg-sky-50',       title: 'Revenue Trend Tracking',  desc: 'Watch recovered revenue grow over time as your Autopilot Agents work in the background.' },
              { icon: Users,         iconColor: 'text-op-accent', bg: 'bg-orange-50',    title: 'Customer Reactivation',   desc: 'Identify past customers who have gone quiet and bring them back with targeted re-engagement sequences.' },
              { icon: FileText,      iconColor: 'text-op-muted',  bg: 'bg-op-surface-2', title: 'Weekly Owner Report',     desc: 'A plain-language weekly summary of what ran, what recovered, and what needs your attention — delivered every Monday.' },
            ].map(({ icon: Icon, iconColor, bg, title, desc }) => (
              <div key={title} className="card-hover">
                <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <h3 className="font-bold font-fraunces text-op-ink mb-2">{title}</h3>
                <p className="text-sm text-op-muted leading-relaxed font-jakarta">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── REVENUE LEAK SCORE ───────────────────────────────────── */}
      <section className="section-pad bg-op-bg section-divider">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <AnimateIn className="flex-1 max-w-md">
              <SectionHeader
                eyebrow="Revenue Leak Score"
                title="One number. Clear visibility. Instant priorities."
                description="Your Revenue Leak Score shows how much potential revenue may be at risk across your business. The breakdown shows exactly where to focus first."
              />
              <Link href="/scanner" className="btn-primary mt-8 inline-flex text-sm">
                Get Your Score Free <ArrowRight size={16} />
              </Link>
            </AnimateIn>

            <ScaleIn className="flex-1 w-full max-w-md">
              <div className="card p-7">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] text-op-muted font-jakarta uppercase tracking-[0.18em] mb-1">
                      Revenue Leak Score
                    </p>
                    <p className="text-5xl font-fraunces font-black text-op-ink">
                      68{' '}
                      <span className="text-xl text-op-muted font-normal font-jakarta">/100</span>
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-op-amber flex items-center justify-center">
                    <AlertTriangle size={28} className="text-op-amber" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {leakScoreItems.map(({ label, score, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-op-body font-medium font-jakarta">{label}</span>
                        <span className="text-op-muted font-jakarta">{score}/100</span>
                      </div>
                      <div className="w-full bg-op-border rounded-full h-1.5">
                        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-op-subtle mt-5 italic font-jakarta">
                  Sample score for illustration. Your actual score is based on your business answers.
                </p>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ─── AUTOPILOT AGENTS ─────────────────────────────────────── */}
      <section className="section-pad bg-op-surface-2 section-divider">
        <div className="container-wide">
          <AnimateIn className="text-center mb-14">
            <SectionHeader
              eyebrow="Autopilot Agents"
              title="Six agents working so"
              titleHighlight="you don't have to."
              center
            />
          </AnimateIn>
          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            stagger={0.08}
          >
            {agents.map(({ icon: Icon, title, desc, badge, badgeClass }) => (
              <div key={title} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-op-bg flex items-center justify-center">
                    <Icon size={20} className="text-op-ink" />
                  </div>
                  <span className={badgeClass}>{badge}</span>
                </div>
                <h3 className="font-bold font-fraunces text-op-ink mb-2">{title}</h3>
                <p className="text-sm text-op-muted leading-relaxed font-jakarta">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── WHY IT'S DIFFERENT ───────────────────────────────────── */}
      <section className="section-pad bg-op-dark text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/4 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(212,98,42,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="container-wide relative">
          <AnimateIn className="max-w-3xl mx-auto text-center mb-12">
            <SectionHeader
              eyebrow="Why It's Different"
              title="More than a CRM. A system that shows what is"
              titleHighlight="slipping away."
              center
              light
            />
          </AnimateIn>
          <StaggerChildren
            className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto"
            stagger={0.12}
          >
            <div className="rounded-2xl border border-white/8 bg-white/4 p-7">
              <h3 className="font-bold font-jakarta text-white/40 text-xs uppercase tracking-[0.18em] mb-5">
                A Normal CRM
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Stores contacts and deals',
                  'Shows pipeline stages',
                  'Requires manual updates',
                  'You build automation yourself',
                  'No revenue leak visibility',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/40 font-jakarta">
                    <span className="w-4 h-4 rounded-full border border-white/15 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-op-accent/30 bg-op-accent/6 p-7">
              <h3 className="font-bold font-jakarta text-op-accent text-xs uppercase tracking-[0.18em] mb-5">
                Revenue Autopilot
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Highlights revenue leaks automatically',
                  'Shows a scored breakdown of risks',
                  'Agents run recovery on autopilot',
                  'Pre-built systems — activate in one click',
                  'Weekly report tracks actual recovery',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white font-jakarta">
                    <CheckCircle2 size={16} className="text-op-forest shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="section-pad bg-op-bg section-divider">
        <div className="container-wide">
          <AnimateIn className="text-center mb-14">
            <SectionHeader
              eyebrow="How It Works"
              title="Five steps to a business running on"
              titleHighlight="autopilot."
              center
            />
          </AnimateIn>
          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
            stagger={0.08}
          >
            {howSteps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative flex flex-col items-center text-center">
                {i < howSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+28px)] w-full h-px bg-op-border" />
                )}
                <div className="w-11 h-11 rounded-2xl bg-op-ink text-white flex items-center
                                justify-center font-bold font-fraunces text-sm mb-4 z-10 shadow-card">
                  {num}
                </div>
                <h3 className="font-bold font-fraunces text-op-ink text-sm mb-2">{title}</h3>
                <p className="text-xs text-op-muted leading-relaxed font-jakarta">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────── */}
      <section className="section-pad bg-op-dark text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(212,98,42,0.14) 0%, transparent 70%)',
          }}
        />
        <AnimateIn className="container-wide text-center max-w-xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl font-fraunces font-bold mb-5">
            Start with a free Revenue Leak Score.
          </h2>
          <p className="text-lg text-white/50 mb-10 font-jakarta">
            No credit card. No commitment. See your top leaks in under 2 minutes.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 bg-white text-op-ink font-bold font-jakarta
                       px-8 py-4 rounded-xl hover:bg-op-bg transition-colors"
          >
            Scan My Business Free <ArrowRight size={18} />
          </Link>
        </AnimateIn>
      </section>
    </>
  )
}
