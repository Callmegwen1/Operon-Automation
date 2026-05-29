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

export const metadata: Metadata = {
  title: 'Revenue Autopilot | Operon Automation',
  description:
    'Revenue Autopilot finds where your business is losing customers and helps recover them automatically. Get your Revenue Leak Score and activate simple recovery systems.',
}

const agents = [
  {
    icon: Phone,
    title: 'Lead Follow-Up Agent',
    desc: 'Automatically follows up with new leads via text and email so no opportunity slips through the cracks.',
    badge: 'Active',
    badgeColor: 'badge-green',
  },
  {
    icon: Star,
    title: 'Review Request Agent',
    desc: 'Sends timely review requests to happy customers, building your reputation on autopilot.',
    badge: 'Active',
    badgeColor: 'badge-green',
  },
  {
    icon: FileText,
    title: 'Estimate Follow-Up Agent',
    desc: 'Follows up on open estimates before they go cold, giving you a second chance to close.',
    badge: 'Active',
    badgeColor: 'badge-blue',
  },
  {
    icon: DollarSign,
    title: 'Invoice Reminder Agent',
    desc: 'Sends friendly payment reminders so you collect faster without awkward conversations.',
    badge: 'Coming Soon',
    badgeColor: 'badge-amber',
  },
  {
    icon: Users,
    title: 'Customer Reactivation Agent',
    desc: 'Identifies past customers who have gone quiet and sends re-engagement campaigns to bring them back.',
    badge: 'Active',
    badgeColor: 'badge-green',
  },
  {
    icon: BarChart2,
    title: 'Weekly Owner Report Agent',
    desc: 'Delivers a clear weekly summary: what ran, what recovered, what needs your attention.',
    badge: 'Every Monday',
    badgeColor: 'badge-blue',
  },
]

const leakScoreItems = [
  { label: 'Lead Follow-Up Speed',   score: 42, color: 'bg-op-red'   },
  { label: 'Review System',          score: 61, color: 'bg-op-amber' },
  { label: 'Estimate Recovery',      score: 35, color: 'bg-op-red'   },
  { label: 'Customer Reactivation',  score: 28, color: 'bg-op-red'   },
  { label: 'Invoice Collection',     score: 74, color: 'bg-op-amber' },
  { label: 'Ad Source Tracking',     score: 55, color: 'bg-op-amber' },
]

const howSteps = [
  { num: '01', title: 'Connect your business', desc: 'Answer the scanner questions so Autopilot understands your business and current systems.' },
  { num: '02', title: 'Review your Leak Score', desc: 'See a detailed breakdown of every area where revenue may be slipping away.' },
  { num: '03', title: 'Activate recommended agents', desc: 'Turn on the Autopilot Agents that match your top leaks — one click to activate.' },
  { num: '04', title: 'Recover missed opportunities', desc: 'Agents run automatically, following up on leads, requesting reviews, and reactivating past customers.' },
  { num: '05', title: 'Track recovery every week', desc: 'The Weekly Owner Report shows what is running and what has been recovered.' },
]

export default function RevenueAutopilotPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-op-bg section-pad">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 max-w-xl">
              <span className="badge-blue mb-5 inline-flex">
                <Zap size={12} /> Revenue Autopilot by Operon
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold font-manrope text-op-navy leading-tight mb-5">
                Revenue Autopilot finds where your business is losing customers and helps recover them automatically.
              </h1>
              <p className="text-lg text-op-muted leading-relaxed mb-8">
                Get clear visibility into missed leads, weak follow-up, review gaps, unpaid invoices, and lost opportunities. Then activate simple systems that help fix them.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/scanner" className="btn-primary px-7 py-3.5 text-base">
                  Scan My Business Free <ArrowRight size={17} />
                </Link>
                <Link href="/pricing" className="btn-secondary px-7 py-3.5 text-base">
                  See Pricing
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-14">
            <SectionHeader
              eyebrow="What It Does"
              title="Everything you need to stop losing"
              titleHighlight="revenue quietly."
              center
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, color: 'text-op-amber', bg: 'bg-amber-50', title: 'Revenue Leak Detection', desc: 'Operon scans your business for common revenue leaks — missed calls, cold leads, missing reviews, uncollected invoices, and more.' },
              { icon: TrendingUp,    color: 'text-op-navy',  bg: 'bg-slate-50',  title: 'Revenue Leak Score', desc: 'Get a single score out of 100 showing how much revenue may be at risk, with a breakdown by category.' },
              { icon: Zap,           color: 'text-op-green', bg: 'bg-green-50', title: 'Autopilot Agents', desc: 'Activate intelligent agents that handle follow-up, review requests, and customer reactivation automatically.' },
              { icon: BarChart2,     color: 'text-op-navy',  bg: 'bg-slate-50',  title: 'Revenue Trend Tracking', desc: 'Watch recovered revenue grow over time as your Autopilot Agents work in the background.' },
              { icon: Users,         color: 'text-op-green', bg: 'bg-green-50', title: 'Customer Reactivation', desc: 'Identify past customers who have gone quiet and bring them back with targeted re-engagement sequences.' },
              { icon: FileText,      color: 'text-op-muted', bg: 'bg-slate-50', title: 'Weekly Owner Report', desc: 'A plain-language weekly summary of what ran, what recovered, and what needs your attention — delivered every Monday.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="card-hover">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-semibold font-manrope text-op-navy mb-2">{title}</h3>
                <p className="text-sm text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Leak Score */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 max-w-md">
              <SectionHeader
                eyebrow="Revenue Leak Score"
                title="One number. Clear visibility. Instant priorities."
                description="Your Revenue Leak Score shows how much potential revenue may be at risk across your business. Higher score = more leaks. The breakdown shows exactly where to focus first."
              />
              <Link href="/scanner" className="btn-primary mt-8 inline-flex">
                Get Your Score Free <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-op-muted font-inter uppercase tracking-wide mb-1">Revenue Leak Score</p>
                    <p className="text-5xl font-extrabold font-manrope text-op-navy">68 <span className="text-xl text-op-muted font-normal">/100</span></p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-op-amber flex items-center justify-center">
                    <AlertTriangle size={28} className="text-op-amber" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {leakScoreItems.map(({ label, score, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-op-body font-medium">{label}</span>
                        <span className="text-op-muted">{score}/100</span>
                      </div>
                      <div className="w-full bg-op-border rounded-full h-1.5">
                        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-op-muted mt-4 italic">
                  Sample score for illustration. Your actual score is based on your business answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autopilot Agents */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-14">
            <SectionHeader
              eyebrow="Autopilot Agents"
              title="Six agents working so"
              titleHighlight="you don't have to."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map(({ icon: Icon, title, desc, badge, badgeColor }) => (
              <div key={title} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-op-bg flex items-center justify-center">
                    <Icon size={20} className="text-op-navy" />
                  </div>
                  <span className={`${badgeColor}`}>{badge}</span>
                </div>
                <h3 className="font-semibold font-manrope text-op-navy mb-2">{title}</h3>
                <p className="text-sm text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Difference */}
      <section className="section-pad bg-op-navy text-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <SectionHeader
              eyebrow="Why It's Different"
              title="More than a CRM. A system that shows what is"
              titleHighlight="slipping away."
              center
              light
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold font-manrope text-white/60 text-sm mb-4 uppercase tracking-wide">A Normal CRM</h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Stores contacts and deals',
                  'Shows pipeline stages',
                  'Requires manual updates',
                  'You have to build automation yourself',
                  'No revenue leak visibility',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/50">
                    <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
              <h3 className="font-semibold font-manrope text-op-amber text-sm mb-4 uppercase tracking-wide">Revenue Autopilot</h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Highlights revenue leaks automatically',
                  'Shows a scored breakdown of risks',
                  'Agents run recovery on autopilot',
                  'Pre-built systems — activate in one click',
                  'Weekly report tracks actual recovery',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 size={16} className="text-op-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="text-center mb-14">
            <SectionHeader
              eyebrow="How It Works"
              title="Five steps to a business running on"
              titleHighlight="autopilot."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {howSteps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative flex flex-col items-center text-center">
                {i < howSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+24px)] w-full h-px bg-op-border" />
                )}
                <div className="w-10 h-10 rounded-full bg-op-navy text-white flex items-center justify-center font-bold font-manrope text-sm mb-4 z-10">
                  {num}
                </div>
                <h3 className="font-semibold font-manrope text-op-navy text-sm mb-2">{title}</h3>
                <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-pad bg-op-navy text-white">
        <div className="container-wide text-center max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold font-manrope mb-5">
            Start with a free Revenue Leak Score.
          </h2>
          <p className="text-lg text-white/80 mb-8">
            No credit card. No commitment. See your top leaks in under 2 minutes.
          </p>
          <Link href="/scanner" className="inline-flex items-center gap-2 bg-white text-op-navy font-bold font-inter px-8 py-4 rounded-lg text-base hover:bg-slate-50 transition-colors">
            Scan My Business Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
