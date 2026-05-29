import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search, AlertTriangle, Zap, TrendingUp, BarChart2, ArrowRight, CheckCircle2,
} from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import { AnimateIn, StaggerChildren } from '@/components/ui/Motion'

export const metadata: Metadata = {
  title: 'How It Works | Operon Automation',
  description:
    'Learn how Operon finds revenue leaks in your business, activates recovery systems, and delivers a weekly owner report.',
}

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Scan your business',
    detail: 'The free Revenue Leak Scanner asks about your leads, follow-up process, review system, ads, and marketing. It takes under 2 minutes and requires no technical setup.',
    what: ['Business type and service area', 'Current follow-up and CRM systems', 'Review and reputation status', 'Ad tracking and lead source visibility'],
    accentClass: 'text-op-ink',
    iconBg: 'bg-op-ink',
    tagBg: 'bg-op-surface-2 border-op-border',
  },
  {
    num: '02',
    icon: AlertTriangle,
    title: 'See your revenue leaks',
    detail: 'You receive a Revenue Leak Score out of 100, a breakdown of your top leaks by category, an impact rating for each, and specific recommended fixes.',
    what: ['Revenue Leak Score (0–100)', 'Top 5 leaks ranked by estimated impact', 'Impact level per leak: High / Medium / Low', 'Recommended fix for each leak'],
    accentClass: 'text-op-amber',
    iconBg: 'bg-op-amber',
    tagBg: 'bg-amber-50 border-amber-200/60',
  },
  {
    num: '03',
    icon: Zap,
    title: 'Activate recommended fixes',
    detail: 'Revenue Autopilot recommends the exact agents to activate for your specific leaks. Each agent is pre-built — no complex setup, no code, no learning curve.',
    what: ['Lead Follow-Up Agent', 'Review Request Agent', 'Estimate Follow-Up Agent', 'Customer Reactivation Agent', 'Weekly Owner Report Agent'],
    accentClass: 'text-op-forest',
    iconBg: 'bg-op-forest',
    tagBg: 'bg-emerald-50 border-emerald-200/60',
  },
  {
    num: '04',
    icon: TrendingUp,
    title: 'Recover missed opportunities',
    detail: 'Once activated, agents run automatically in the background. Leads get followed up, reviews get requested, and past customers get reactivated.',
    what: ['Instant lead response — no more cold leads', 'Review growth month over month', 'Estimate-to-job close rate improvement', 'Past customers coming back'],
    accentClass: 'text-op-accent',
    iconBg: 'bg-op-accent',
    tagBg: 'bg-orange-50 border-orange-200/60',
  },
  {
    num: '05',
    icon: BarChart2,
    title: 'Get a weekly owner report',
    detail: 'Every week you receive a plain-language report: what ran, what was recovered, what is active, and what needs your attention. No dashboards to check — it comes to you.',
    what: ['Recovered revenue summary', 'Agent activity breakdown', 'New reviews received', 'Open items needing attention', 'Revenue trend over time'],
    accentClass: 'text-op-teal',
    iconBg: 'bg-op-teal',
    tagBg: 'bg-sky-50 border-sky-200/60',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-op-bg section-pad">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <AnimateIn>
            <SectionHeader
              eyebrow="How It Works"
              title="How Operon helps your business stop"
              titleHighlight="leaking revenue."
              description="Five simple steps. No technical setup. No learning curve. Start with a free scan and activate the systems that fix your specific leaks."
              center
            />
            <Link href="/scanner" className="btn-primary px-8 py-4 text-base mt-10 inline-flex">
              Start with a Free Scan <ArrowRight size={17} />
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ─── STEP BY STEP ─────────────────────────────────────────── */}
      <section className="section-pad bg-op-surface section-divider">
        <div className="container-wide max-w-3xl mx-auto">
          <div className="flex flex-col gap-16">
            {steps.map(({ num, icon: Icon, title, detail, what, accentClass, iconBg, tagBg }, i) => (
              <AnimateIn key={num} delay={0.05}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Step indicator */}
                  <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-3 shrink-0">
                    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-card`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className="text-3xl font-fraunces font-black text-op-border">{num}</span>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block w-px h-12 bg-op-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold font-fraunces text-op-ink mb-3">{title}</h2>
                    <p className="text-base text-op-muted leading-relaxed mb-6 font-jakarta">{detail}</p>
                    <div className={`border rounded-2xl p-5 ${tagBg}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-op-muted
                                   font-jakarta mb-3">
                        What this includes
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {what.map((w) => (
                          <li key={w} className="flex items-center gap-2 text-sm font-jakarta text-op-body">
                            <CheckCircle2 size={13} className={`shrink-0 ${accentClass}`} />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHORT VERSION ────────────────────────────────────────── */}
      <section className="section-pad bg-op-bg section-divider">
        <div className="container-wide">
          <AnimateIn className="text-center mb-12">
            <SectionHeader
              eyebrow="The Short Version"
              title="Simple systems. Real results."
              center
            />
          </AnimateIn>
          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            stagger={0.1}
          >
            {[
              { label: 'Scan',    desc: 'Find your leaks in under 2 minutes.',                icon: Search,     bg: 'bg-op-ink'     },
              { label: 'Activate',desc: 'Turn on pre-built systems with one click.',           icon: Zap,        bg: 'bg-op-accent'  },
              { label: 'Recover', desc: 'Watch agents recover missed opportunities weekly.',   icon: TrendingUp, bg: 'bg-op-forest'  },
            ].map(({ label, desc, icon: Icon, bg }) => (
              <div key={label} className="card text-center hover:shadow-card-hover hover:-translate-y-0.5
                                         transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold font-fraunces text-op-ink mb-2">{label}</h3>
                <p className="text-sm text-op-muted font-jakarta">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="section-pad bg-op-dark text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(212,98,42,0.14) 0%, transparent 70%)',
          }}
        />
        <AnimateIn className="container-wide text-center max-w-xl mx-auto relative">
          <h2 className="text-3xl font-fraunces font-bold mb-5">
            Ready to see step one in action?
          </h2>
          <p className="text-lg text-white/50 mb-10 font-jakarta">
            Scan your business free. No credit card. Results in under 2 minutes.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 bg-white text-op-ink font-bold font-jakarta
                       px-8 py-4 rounded-xl hover:bg-op-bg transition-colors"
          >
            Scan My Business Free <ArrowRight size={17} />
          </Link>
        </AnimateIn>
      </section>
    </>
  )
}
