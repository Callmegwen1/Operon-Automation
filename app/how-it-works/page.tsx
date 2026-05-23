import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search, AlertTriangle, Zap, TrendingUp, BarChart2, ArrowRight, CheckCircle2,
} from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

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
    color: 'bg-slate-50 border-slate-200 text-op-navy',
    iconBg: 'bg-op-navy',
  },
  {
    num: '02',
    icon: AlertTriangle,
    title: 'See your revenue leaks',
    detail: 'You receive a Revenue Leak Score out of 100, a breakdown of your top leaks by category, an impact rating for each, and specific recommended fixes.',
    what: ['Revenue Leak Score (0–100)', 'Top 5 leaks ranked by estimated impact', 'Impact level per leak: High / Medium / Low', 'Recommended fix for each leak'],
    color: 'bg-amber-50 border-amber-200 text-op-amber',
    iconBg: 'bg-op-amber',
  },
  {
    num: '03',
    icon: Zap,
    title: 'Activate recommended fixes',
    detail: 'Revenue Autopilot recommends the exact agents to activate for your specific leaks. Each agent is pre-built — no complex setup, no code, no learning curve.',
    what: ['Lead Follow-Up Agent', 'Review Request Agent', 'Estimate Follow-Up Agent', 'Invoice Reminder Agent', 'Customer Reactivation Agent'],
    color: 'bg-green-50 border-green-200 text-op-green',
    iconBg: 'bg-op-green',
  },
  {
    num: '04',
    icon: TrendingUp,
    title: 'Recover missed opportunities',
    detail: 'Once activated, agents run automatically in the background. Leads get followed up, reviews get requested, invoices get reminders, and past customers get reactivated.',
    what: ['Instant lead response — no more cold leads', 'Review growth month over month', 'Estimate-to-job close rate improvement', 'Faster invoice collection', 'Past customers coming back'],
    color: 'bg-slate-50 border-slate-200 text-op-navy',
    iconBg: 'bg-op-navy',
  },
  {
    num: '05',
    icon: BarChart2,
    title: 'Get a weekly owner report',
    detail: 'Every week you receive a plain-language report: what ran, what was recovered, what is active, and what needs your attention. No dashboards to check — it comes to you.',
    what: ['Recovered revenue summary', 'Agent activity breakdown', 'New reviews received', 'Open items needing attention', 'Revenue trend over time'],
    color: 'bg-green-50 border-green-200 text-op-green',
    iconBg: 'bg-op-green',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-op-bg section-pad">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <SectionHeader
            eyebrow="How It Works"
            title="How Operon helps your business stop"
            titleHighlight="leaking revenue."
            description="Five simple steps. No technical setup. No learning curve. Start with a free scan and activate the systems that fix your specific leaks."
            center
          />
          <Link href="/scanner" className="btn-primary px-8 py-4 text-base mt-8 inline-flex">
            Start with a Free Scan <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Step by step */}
      <section className="section-pad bg-white">
        <div className="container-wide max-w-3xl mx-auto">
          <div className="flex flex-col gap-12">
            {steps.map(({ num, icon: Icon, title, detail, what, color, iconBg }, i) => (
              <div key={num} className="flex flex-col md:flex-row gap-8 items-start">
                {/* Step indicator */}
                <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-2 shrink-0">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-2xl font-extrabold font-manrope text-op-border">{num}</span>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block w-px h-16 bg-op-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold font-manrope text-op-navy mb-3">{title}</h2>
                  <p className="text-base text-op-muted leading-relaxed mb-5">{detail}</p>
                  <div className={`border rounded-xl p-4 ${color}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3">What this includes</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {what.map((w) => (
                        <li key={w} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 size={13} className="shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple summary */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="The Short Version"
              title="Simple systems. Real results."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Scan',    desc: 'Find your leaks in under 2 minutes.',                icon: Search     },
              { label: 'Activate', desc: 'Turn on pre-built systems with one click.',         icon: Zap        },
              { label: 'Recover',  desc: 'Watch agents recover missed opportunities weekly.', icon: TrendingUp },
            ].map(({ label, desc, icon: Icon }) => (
              <div key={label} className="card text-center">
                <div className="w-12 h-12 rounded-xl bg-op-navy/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-op-navy" />
                </div>
                <h3 className="font-bold font-manrope text-op-navy mb-2">{label}</h3>
                <p className="text-sm text-op-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-op-navy text-white">
        <div className="container-wide text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold font-manrope mb-5">Ready to see step one in action?</h2>
          <p className="text-lg text-white/70 mb-8">Scan your business free. No credit card. Results in under 2 minutes.</p>
          <Link href="/scanner" className="inline-flex items-center gap-2 bg-white text-op-navy font-bold px-8 py-4 rounded-lg hover:bg-slate-50 transition-colors">
            Scan My Business Free <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}
