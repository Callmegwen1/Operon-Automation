import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, MessageSquare, ChevronDown } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import CheckoutButton from '@/components/ui/CheckoutButton'
import PageTracker from '@/components/analytics/PageTracker'

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
    badge: null,
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
    badge: null,
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
    badge: 'Most Popular',
    popular: true,
    description: 'All four core recovery systems running at once — the fastest path to measurable revenue recovery.',
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    primary: true,
    setupNote: { label: 'Optional assisted setup', price: '$499 one-time' },
    features: [
      '14-day free trial — no credit card required',
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
    badge: null,
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
    a: 'An agent action is any automated step your system takes on your behalf — sending a follow-up email, scheduling a reminder, requesting a review, or firing a reactivation message. We use this term instead of technical jargon like API calls. Most businesses on the Starter plan use well under 100 actions per month. Growth covers the majority of active small businesses.',
  },
  {
    q: 'Is the setup fee required?',
    a: 'No — setup fees are completely optional. Every plan is designed to be self-service. The optional done-for-you setup means one of our team members configures everything for you: connects your form, imports your contacts, personalizes your email copy, and tests every sequence end-to-end. Most owners are up in 20 minutes on their own; setup takes the guesswork out entirely.',
  },
  {
    q: 'What happens if I hit my usage limits?',
    a: "We'll notify you before you hit a limit — you won't get cut off mid-sequence without warning. If you're consistently over your plan's limits, we'll recommend an upgrade. We'd rather have a conversation than quietly pause your automation.",
  },
  {
    q: 'Does Operon require a CRM or any special software?',
    a: "No. Operon is the system — it comes with a built-in contact manager, activity log, and dashboard. You don't need to connect anything to get started. If you already use a CRM or job management tool, we can integrate with it (see below), but it's never required.",
  },
  {
    q: 'Can Operon integrate with my existing tools?',
    a: 'Growth and Pro plans include webhook support so you can connect Operon to Zapier, Typeform, and most lead-capture tools out of the box. Deep CRM integrations (ServiceTitan, Jobber, HubSpot, etc.) and custom workflows are available on the Custom plan or as a one-time setup project.',
  },
]

export default function PricingPage() {
  return (
    <>
      <PageTracker event="pricing_viewed" />
      {/* Hero */}
      <section className="bg-op-bg pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <p className="eyebrow mb-4">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-extrabold font-manrope text-op-navy leading-tight mb-5">
            Start with a free scan.{' '}
            <span className="text-op-amber">Activate the system</span>{' '}
            that fixes your biggest leak.
          </h1>
          <p className="text-base md:text-lg text-op-muted leading-relaxed">
            Every plan starts from your Revenue Leak Score. No long-term contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing grid */}
      <section className="pb-24 bg-op-bg">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-card
                  ${plan.popular
                    ? 'border-2 border-op-navy ring-4 ring-op-navy/8 xl:-mt-5 xl:pb-[52px]'
                    : 'border-op-border'
                  }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-op-navy text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      <Zap size={11} /> Most Popular
                    </span>
                  </div>
                )}

                {/* Plan name + badge */}
                <div className="mb-1">
                  {plan.badge && !plan.popular && (
                    <span className="text-[10px] font-bold text-op-amber bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold font-manrope text-op-navy text-lg leading-tight mb-1">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold font-manrope text-op-navy">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-op-muted font-medium">{plan.period}</span>
                  )}
                </div>

                <p className="text-sm text-op-muted leading-relaxed mb-6">{plan.description}</p>

                {/* CTA */}
                {plan.id === 'free' ? (
                  <Link
                    href={plan.ctaHref}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold bg-white text-op-navy border border-op-border hover:border-op-navy active:scale-95 transition-all mb-6"
                  >
                    {plan.cta} <ArrowRight size={14} />
                  </Link>
                ) : plan.id === 'pro' ? (
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold bg-white text-op-navy border border-op-border hover:border-op-navy active:scale-95 transition-all mb-6"
                  >
                    Talk to Us <ArrowRight size={14} />
                  </Link>
                ) : (
                  <div className="mb-6">
                    <CheckoutButton
                      plan={plan.id as 'starter' | 'growth'}
                      label={plan.cta}
                      primary={plan.primary}
                    />
                  </div>
                )}

                {/* Feature list */}
                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-op-body leading-relaxed">
                      <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${plan.popular ? 'text-op-navy' : 'text-op-green'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Setup note */}
                {plan.setupNote && (
                  <div className="mt-6 pt-4 border-t border-op-border/70">
                    <p className="text-[11px] text-op-muted leading-relaxed">
                      <span className="font-semibold text-op-body">{plan.setupNote.label}:</span>{' '}
                      {plan.setupNote.price}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom plan — full width strip */}
          <div className="mt-5 rounded-2xl border border-op-border bg-white p-7 md:p-9">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold font-manrope text-op-navy text-lg">Custom</h3>
                  <span className="text-[10px] font-bold text-op-muted bg-op-bg border border-op-border px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Starting at $999 / month
                  </span>
                </div>
                <p className="text-sm text-op-muted leading-relaxed mb-4 max-w-2xl">
                  For businesses with complex workflows, multi-location setups, CRM or job software integrations, or dedicated support requirements.
                </p>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {[
                    'Multi-location support',
                    'CRM & job software integrations',
                    'Custom workflow design',
                    'High-volume contacts & email',
                    'Dedicated account support',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-op-body">
                      <CheckCircle2 size={12} className="text-op-green shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-op-bg text-op-navy border border-op-border font-semibold px-6 py-3 rounded-lg text-sm hover:border-op-navy transition-all whitespace-nowrap"
                >
                  <MessageSquare size={14} /> Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's included comparison note */}
      <section className="bg-white border-t border-op-border py-16">
        <div className="container-wide max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeader
              eyebrow="What's Included"
              title="One plan. All the systems"
              titleHighlight="turned on."
              description="Growth Autopilot is the plan most owners end up on. Here's why it covers the full revenue recovery loop."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Lead Recovery Autopilot',
                desc: 'Reads every new lead, gauges urgency and intent, and sends a personalized follow-up sequence — within minutes.',
                color: 'border-op-navy',
                dot: 'bg-op-navy',
              },
              {
                title: 'Review Growth System',
                desc: 'One click after a job marks a customer done. A 3-email review sequence goes out automatically — industry-specific copy included.',
                color: 'border-op-amber',
                dot: 'bg-op-amber',
              },
              {
                title: 'Estimate Recovery Autopilot',
                desc: 'Send an estimate from the contact page and a 3-day follow-up sequence starts immediately. No cold quotes.',
                color: 'border-op-green',
                dot: 'bg-op-green',
              },
              {
                title: 'Customer Reactivation',
                desc: "Every Sunday, dormant customers who haven't booked in 60+ days get a personalized win-back email — automatically.",
                color: 'border-purple-400',
                dot: 'bg-purple-400',
              },
            ].map(({ title, desc, color, dot }) => (
              <div key={title} className={`rounded-xl border-l-4 ${color} bg-op-bg p-5`}>
                <div className={`w-2 h-2 rounded-full ${dot} mb-3`} />
                <p className="text-sm font-bold text-op-navy font-manrope mb-1.5">{title}</p>
                <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI scenarios */}
      <section className="section-pad bg-op-bg border-t border-op-border">
        <div className="container-wide max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeader
              eyebrow="What Recovery Looks Like"
              title="Illustrative scenarios by"
              titleHighlight="plan."
              description="These examples are based on industry averages and common outcomes — not guaranteed results. Your numbers depend on your business, lead volume, and how actively you use the platform."
              center
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                plan: 'Starter',
                color: 'border-op-border',
                dot: 'bg-op-muted',
                business: 'Cleaning company, 15 leads/month',
                scenario: 'Activates Lead Recovery Autopilot. Catches 4 leads per month that previously went unanswered over the weekend.',
                outcome: '4 extra jobs per month at $180 average → ~$720/month recovered',
                note: 'Based on 25% conversion on recovered leads at industry average job value.',
              },
              {
                plan: 'Growth',
                color: 'border-op-navy',
                dot: 'bg-op-navy',
                business: 'HVAC contractor, 30 leads/month',
                scenario: 'All four systems active. Recovers cold leads, closes 3 stale estimates, and gets 8 new Google reviews in the first month.',
                outcome: '~$1,800–$2,600/month in recovered revenue + review momentum',
                note: 'Combination of lead recovery, estimate close rate improvement, and review-driven organic growth.',
              },
              {
                plan: 'Pro',
                color: 'border-op-border',
                dot: 'bg-op-muted',
                business: 'Med spa, 80 leads/month',
                scenario: 'High-volume lead follow-up, reactivation of dormant members, and weekly briefing for the team.',
                outcome: '~$4,000–$7,000/month in estimated recovery across all systems',
                note: 'Higher job values and lead volume amplify recovery — even a 5% improvement moves significantly.',
              },
            ].map(({ plan, color, dot, business, scenario, outcome, note }) => (
              <div key={plan} className={`rounded-2xl border ${color} bg-white p-6`}>
                <div className={`w-2 h-2 rounded-full ${dot} mb-3`} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-op-muted mb-1">{plan} Plan</p>
                <p className="text-sm font-semibold text-op-navy mb-3 leading-snug">{business}</p>
                <p className="text-xs text-op-muted leading-relaxed mb-3">{scenario}</p>
                <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 mb-3">
                  <p className="text-xs font-semibold text-op-green leading-relaxed">{outcome}</p>
                </div>
                <p className="text-[10px] text-op-muted/70 leading-relaxed italic">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-op-bg border-t border-op-border">
        <div className="container-wide max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="FAQ"
              title="Questions about"
              titleHighlight="pricing."
              center
            />
          </div>
          <div className="flex flex-col divide-y divide-op-border">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold font-manrope text-op-navy text-sm pr-4">{q}</h4>
                  <ChevronDown
                    size={16}
                    className="text-op-muted shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm text-op-muted leading-relaxed pr-8">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-pad bg-op-navy text-white">
        <div className="container-wide text-center max-w-xl mx-auto">
          <p className="eyebrow text-white/50 mb-4">Get Started</p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-manrope mb-4 leading-tight">
            See your leaks first.{' '}
            <span className="text-op-amber">Then decide.</span>
          </h2>
          <p className="text-white/70 text-base mb-8 leading-relaxed">
            The scanner is free and takes under 2 minutes. You will see your Revenue Leak Score and exactly which systems would have the fastest impact.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 bg-white text-op-navy font-bold px-8 py-4 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              Scan My Business Free <ArrowRight size={16} />
            </Link>
            <CheckoutButton
              plan="growth"
              label="Start 14-Day Free Trial"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-semibold border border-white/30 px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-sm"
            />
          </div>
          <p className="mt-6 text-white/40 text-xs">14-day free trial on Growth. No contracts. Cancel anytime.</p>
        </div>
      </section>
    </>
  )
}
