import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, MessageSquare, ChevronDown, Star } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import CheckoutButton from '@/components/ui/CheckoutButton'
import PageTracker from '@/components/analytics/PageTracker'
import { AnimateIn, StaggerChildren, FadeIn } from '@/components/ui/Motion'

export const metadata: Metadata = {
  title: 'Pricing | Operon Automation',
  description:
    'Start with a free scan. Activate the revenue recovery system that fixes your biggest leak. Plans from $149/month.',
}

const PLANS = [
  {
    id: 'free',
    name: 'Free Scanner',
    price: '$0',
    period: null,
    popular: false,
    description: 'Run a full Revenue Leak Scan and see exactly where your business is losing customers and revenue.',
    cta: 'Scan My Business Free',
    ctaHref: '/scanner',
    primary: false,
    setupNote: null,
    features: [
      'Revenue Leak Scanner',
      'Revenue Leak Score (0–100)',
      'Top 3 leaks identified',
      'Estimated revenue opportunity',
      'Email delivery of your report',
      'Recommended recovery system',
      'Limited rescans',
    ],
  },
  {
    id: 'starter',
    name: 'Starter Recovery',
    price: '$149',
    period: '/month',
    popular: false,
    description: 'Activate one recovery system and start winning back leads or growing your reviews — automatically.',
    cta: 'Get Started',
    ctaHref: '/signup',
    primary: false,
    setupNote: { label: 'Optional done-for-you setup', price: '$299 one-time' },
    features: [
      'One active revenue system (your choice)',
      'Lead Recovery Autopilot OR Review Growth System',
      'Weekly Revenue Briefing',
      'Basic dashboard',
      'Email-only automation',
      'Manual entry, CSV import, embedded form',
      'Basic webhook support',
      '500 contacts',
      '500 emails / month',
      '100 monthly agent actions',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Autopilot',
    price: '$299',
    period: '/month',
    popular: true,
    description: 'All four core recovery systems running at once — the fastest path to measurable revenue recovery.',
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    primary: true,
    setupNote: { label: 'Optional assisted setup', price: '$499 one-time' },
    features: [
      '14-day free trial included',
      'Lead Recovery Autopilot',
      'Review Growth System',
      'Estimate Recovery Autopilot',
      'Customer Reactivation Autopilot',
      'Weekly Revenue Briefing',
      'Scanner history & trend tracking',
      'Owner tasks + outcome tracking',
      'Integration health monitoring',
      '2,500 contacts',
      '2,500 emails / month',
      '500 monthly agent actions',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Revenue System',
    price: '$599',
    period: '/month',
    popular: false,
    description: 'Everything in Growth plus every available system, higher limits, and priority support.',
    cta: 'Talk to Us',
    ctaHref: '/contact',
    primary: false,
    setupNote: { label: 'Custom integrations may require', price: 'setup fee' },
    features: [
      'Everything in Growth Autopilot',
      'All available revenue systems',
      'Advanced Weekly Revenue Briefing',
      'Expanded reporting',
      'Priority support',
      '10,000 contacts',
      '10,000 emails / month',
      '2,000 monthly agent actions',
    ],
  },
]

const FAQ = [
  {
    q: 'What are "monthly agent actions"?',
    a: 'An agent action is any automated step your system takes on your behalf — sending a follow-up email, scheduling a reminder, requesting a review, or firing a reactivation message. Most businesses on the Starter plan use well under 100 actions per month.',
  },
  {
    q: 'Is the setup fee required?',
    a: "No — setup fees are completely optional. Every plan is designed to be self-service. The optional done-for-you setup means one of our team members configures everything for you: connects your form, imports your contacts, personalizes your email copy, and tests every sequence end-to-end.",
  },
  {
    q: 'What happens if I hit my usage limits?',
    a: "We'll notify you before you hit a limit — you won't get cut off mid-sequence without warning. If you're consistently over your plan's limits, we'll recommend an upgrade.",
  },
  {
    q: 'Does Operon require a CRM or any special software?',
    a: "No. Operon is the system — it comes with a built-in contact manager, activity log, and dashboard. You don't need to connect anything to get started.",
  },
  {
    q: 'Can Operon integrate with my existing tools?',
    a: 'Growth and Pro plans include webhook support so you can connect Operon to Zapier, Typeform, and most lead-capture tools out of the box. Deep CRM integrations are available on the Custom plan.',
  },
]

export default function PricingPage() {
  return (
    <>
      <PageTracker event="pricing_viewed" />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-op-bg pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <AnimateIn>
            <p className="eyebrow mb-4">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-fraunces font-bold text-op-ink leading-tight mb-5">
              Start with a free scan.{' '}
              <span className="text-op-accent">Activate the system</span>{' '}
              that fixes your biggest leak.
            </h1>
            <p className="text-base md:text-lg text-op-muted leading-relaxed font-jakarta">
              Every plan starts from your Revenue Leak Score. No long-term contracts. Cancel anytime.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ─── PRICING GRID ─────────────────────────────────────────── */}
      <section className="pb-24 bg-op-bg">
        <div className="container-wide">
          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start"
            stagger={0.09}
          >
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl bg-op-surface p-7 shadow-card
                  ${plan.popular
                    ? 'border-2 border-op-ink ring-4 ring-op-ink/6 xl:-mt-5 xl:pb-[52px]'
                    : 'border border-op-border'
                  }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-op-ink text-white
                                     text-xs font-bold font-jakarta px-4 py-1.5 rounded-full
                                     shadow-card whitespace-nowrap">
                      <Zap size={11} /> Most Popular
                    </span>
                  </div>
                )}

                <h3 className="font-bold font-fraunces text-op-ink text-lg leading-tight mb-1">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4 mt-2">
                  <span className="text-4xl font-fraunces font-black text-op-ink">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-op-muted font-medium font-jakarta">{plan.period}</span>
                  )}
                </div>

                <p className="text-sm text-op-muted leading-relaxed mb-6 font-jakarta">{plan.description}</p>

                {/* CTA */}
                {plan.id === 'free' ? (
                  <Link
                    href={plan.ctaHref}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl
                               text-sm font-semibold font-jakarta bg-op-surface text-op-ink
                               border border-op-border hover:border-op-ink hover:shadow-card
                               active:scale-95 transition-all mb-6"
                  >
                    {plan.cta} <ArrowRight size={14} />
                  </Link>
                ) : plan.id === 'pro' ? (
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl
                               text-sm font-semibold font-jakarta bg-op-surface text-op-ink
                               border border-op-border hover:border-op-ink hover:shadow-card
                               active:scale-95 transition-all mb-6"
                  >
                    Talk to Us <ArrowRight size={14} />
                  </Link>
                ) : (
                  <div className="mb-6">
                    <CheckoutButton
                      plan={plan.id as 'starter' | 'growth'}
                      label={plan.cta}
                      primary={plan.popular}
                    />
                  </div>
                )}

                {/* Feature list */}
                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-op-body leading-relaxed font-jakarta">
                      <CheckCircle2
                        size={13}
                        className={`shrink-0 mt-0.5 ${plan.popular ? 'text-op-forest' : 'text-op-forest'}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.setupNote && (
                  <div className="mt-6 pt-4 border-t border-op-border">
                    <p className="text-[11px] text-op-muted leading-relaxed font-jakarta">
                      <span className="font-semibold text-op-body">{plan.setupNote.label}:</span>{' '}
                      {plan.setupNote.price}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </StaggerChildren>

          {/* Custom plan strip */}
          <AnimateIn delay={0.15} className="mt-5">
            <div className="rounded-2xl border border-op-border bg-op-surface p-7 md:p-9">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold font-fraunces text-op-ink text-lg">Custom</h3>
                    <span className="text-[10px] font-bold text-op-muted font-jakarta bg-op-bg
                                     border border-op-border px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Starting at $999 / month
                    </span>
                  </div>
                  <p className="text-sm text-op-muted leading-relaxed mb-4 max-w-2xl font-jakarta">
                    For businesses with complex workflows, multi-location setups, CRM or job software
                    integrations, or dedicated support requirements.
                  </p>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {[
                      'Multi-location support',
                      'CRM & job software integrations',
                      'Custom workflow design',
                      'High-volume contacts & email',
                      'Dedicated account support',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-op-body font-jakarta">
                        <CheckCircle2 size={12} className="text-op-forest shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0">
                  <Link
                    href="/contact"
                    className="btn-secondary text-sm inline-flex whitespace-nowrap"
                  >
                    <MessageSquare size={14} /> Talk to Us
                  </Link>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED ──────────────────────────────────────── */}
      <section className="bg-op-surface-2 section-divider py-20">
        <div className="container-wide max-w-4xl mx-auto">
          <AnimateIn className="text-center mb-12">
            <SectionHeader
              eyebrow="What's Included"
              title="One plan. All the systems"
              titleHighlight="turned on."
              description="Growth Autopilot is the plan most owners end up on. Here's why it covers the full revenue recovery loop."
              center
            />
          </AnimateIn>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.09}>
            {[
              {
                title: 'Lead Recovery Autopilot',
                desc: 'Reads every new lead, gauges urgency and intent, and sends a personalized follow-up sequence — within minutes.',
                accent: 'bg-op-accent',
              },
              {
                title: 'Review Growth System',
                desc: 'One click after a job marks a customer done. A 3-email review sequence goes out automatically.',
                accent: 'bg-op-amber',
              },
              {
                title: 'Estimate Recovery Autopilot',
                desc: 'Send an estimate from the contact page and a 3-day follow-up sequence starts immediately.',
                accent: 'bg-op-forest',
              },
              {
                title: 'Customer Reactivation',
                desc: "Every Sunday, dormant customers who haven't booked in 60+ days get a personalized win-back email.",
                accent: 'bg-op-teal',
              },
            ].map(({ title, desc, accent }) => (
              <div key={title} className="card flex flex-col gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${accent}`} />
                <p className="text-sm font-bold text-op-ink font-fraunces leading-snug">{title}</p>
                <p className="text-xs text-op-muted leading-relaxed font-jakarta">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── ROI SCENARIOS ────────────────────────────────────────── */}
      <section className="section-pad bg-op-bg section-divider">
        <div className="container-wide max-w-4xl mx-auto">
          <AnimateIn className="text-center mb-12">
            <SectionHeader
              eyebrow="What Recovery Looks Like"
              title="Illustrative scenarios by"
              titleHighlight="plan."
              description="These examples are based on industry averages and common outcomes — not guaranteed results. Your numbers depend on your business, lead volume, and how actively you use the platform."
              center
            />
          </AnimateIn>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5" stagger={0.1}>
            {[
              {
                plan: 'Starter',
                business: 'Cleaning company, 15 leads/month',
                scenario: 'Activates Lead Recovery Autopilot. Catches 4 leads per month that previously went unanswered over the weekend.',
                outcome: '4 extra jobs per month at $180 average → ~$720/month recovered',
                note: 'Based on 25% conversion on recovered leads at industry average job value.',
              },
              {
                plan: 'Growth',
                business: 'HVAC contractor, 30 leads/month',
                scenario: 'All four systems active. Recovers cold leads, closes 3 stale estimates, and gets 8 new Google reviews in the first month.',
                outcome: '~$1,800–$2,600/month in recovered revenue + review momentum',
                note: 'Combination of lead recovery, estimate close rate improvement, and review-driven organic growth.',
              },
              {
                plan: 'Pro',
                business: 'Med spa, 80 leads/month',
                scenario: 'High-volume lead follow-up, reactivation of dormant members, and weekly briefing for the team.',
                outcome: '~$4,000–$7,000/month in estimated recovery across all systems',
                note: 'Higher job values and lead volume amplify recovery — even a 5% improvement moves significantly.',
              },
            ].map(({ plan, business, scenario, outcome, note }) => (
              <div key={plan} className="card flex flex-col gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-op-subtle font-jakarta mb-1">
                    {plan} Plan
                  </p>
                  <p className="text-sm font-semibold text-op-ink font-fraunces leading-snug">{business}</p>
                </div>
                <p className="text-xs text-op-muted leading-relaxed font-jakarta">{scenario}</p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-3">
                  <p className="text-xs font-semibold text-op-forest leading-relaxed font-jakarta">{outcome}</p>
                </div>
                <p className="text-[10px] text-op-subtle leading-relaxed italic font-jakarta">{note}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="section-pad bg-op-surface-2 section-divider">
        <div className="container-wide max-w-2xl mx-auto">
          <AnimateIn className="text-center mb-12">
            <SectionHeader
              eyebrow="FAQ"
              title="Questions about"
              titleHighlight="pricing."
              center
            />
          </AnimateIn>
          <div className="flex flex-col divide-y divide-op-border">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold font-fraunces text-op-ink text-sm pr-4">{q}</h4>
                  <ChevronDown
                    size={16}
                    className="text-op-muted shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm text-op-muted leading-relaxed pr-8 font-jakarta">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────────── */}
      <section className="section-pad bg-op-dark text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(212,98,42,0.14) 0%, transparent 70%)',
          }}
        />
        <AnimateIn className="container-wide text-center max-w-xl mx-auto relative">
          <p className="eyebrow text-op-accent/70 mb-4">Get Started</p>
          <h2 className="text-3xl md:text-4xl font-fraunces font-bold mb-5 leading-tight">
            See your leaks first.{' '}
            <span className="text-op-accent">Then decide.</span>
          </h2>
          <p className="text-white/50 text-base mb-10 leading-relaxed font-jakarta">
            The scanner is free and takes under 2 minutes. You will see your Revenue Leak Score
            and exactly which systems would have the fastest impact.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 bg-white text-op-ink font-bold font-jakarta
                         px-8 py-4 rounded-xl hover:bg-op-bg transition-colors text-sm"
            >
              Scan My Business Free <ArrowRight size={16} />
            </Link>
            <CheckoutButton
              plan="growth"
              label="Start 14-Day Free Trial"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white
                         font-semibold font-jakarta border border-white/25 px-8 py-4 rounded-xl
                         hover:bg-white/8 transition-colors text-sm"
            />
          </div>
          <p className="mt-6 text-white/25 text-xs font-jakarta">
            14-day free trial on Growth. Card required, not charged until day 15. Cancel anytime.
          </p>
        </AnimateIn>
      </section>
    </>
  )
}
