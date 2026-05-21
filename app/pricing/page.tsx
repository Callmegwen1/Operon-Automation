import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, Star } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

export const metadata: Metadata = {
  title: 'Pricing | Operon Automation',
  description:
    'Simple, transparent pricing for Revenue Autopilot and Operon Services. Start free with the Revenue Leak Scanner.',
}

const plans = [
  {
    name: 'Free',
    badge: null,
    price: '$0',
    period: 'forever',
    description: 'Get your Revenue Leak Score and see exactly where your business may be losing customers.',
    cta: 'Scan My Business Free',
    ctaHref: '/scanner',
    ctaStyle: 'btn-secondary w-full justify-center',
    features: [
      'Revenue Leak Scanner',
      'Revenue Leak Score (out of 100)',
      'Top 5 revenue leaks identified',
      'Recommended fixes per leak',
      'Email delivery of results',
    ],
    highlight: false,
  },
  {
    name: 'Starter',
    badge: 'Early Access',
    price: 'Coming Soon',
    period: null,
    description: 'Activate the core Autopilot Agents and start recovering missed leads and growing reviews.',
    cta: 'Join Early Access',
    ctaHref: '/contact',
    ctaStyle: 'btn-primary w-full justify-center',
    features: [
      'Everything in Free',
      'Revenue Leak Dashboard',
      'Lead Follow-Up Agent',
      'Review Request Agent',
      'Weekly Owner Report',
      'Basic revenue trend tracking',
    ],
    highlight: true,
  },
  {
    name: 'Growth',
    badge: 'Early Access',
    price: 'Coming Soon',
    period: null,
    description: 'Full Autopilot suite — every agent active, more reports, and deeper recovery tools.',
    cta: 'Join Early Access',
    ctaHref: '/contact',
    ctaStyle: 'btn-primary w-full justify-center',
    features: [
      'Everything in Starter',
      'Estimate Follow-Up Agent',
      'Invoice Reminder Agent',
      'Customer Reactivation Agent',
      'Lead source tracking',
      'Advanced revenue reports',
      'Priority support',
    ],
    highlight: false,
  },
  {
    name: 'Custom Services',
    badge: 'Agency',
    price: 'Request Pricing',
    period: null,
    description: 'Done-for-you automation and marketing systems built around your specific business needs.',
    cta: 'Request Setup Help',
    ctaHref: '/contact',
    ctaStyle: 'btn-secondary w-full justify-center',
    features: [
      'Custom workflow design',
      'CRM setup & configuration',
      'Done-for-you implementation',
      'Advanced integrations',
      'Multi-location support',
      'Custom dashboards & reporting',
      'Dedicated setup support',
    ],
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-op-bg section-pad">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple. Transparent."
            titleHighlight="No surprises."
            description="Start free with the Revenue Leak Scanner. Upgrade when you're ready to activate the systems that fix your leaks."
            center
          />
          <p className="mt-4 text-sm text-op-amber font-semibold">
            Revenue Autopilot is in early access. Join the list to get first access and launch pricing.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-24 bg-op-bg">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map(({ name, badge, price, period, description, cta, ctaHref, ctaStyle, features, highlight }) => (
              <div
                key={name}
                className={`card flex flex-col ${highlight ? 'border-2 border-op-blue ring-1 ring-op-blue/20' : 'border border-op-border'}`}
              >
                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold font-manrope text-op-navy">{name}</h3>
                    {badge && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${highlight ? 'bg-op-blue text-white' : 'badge-blue'}`}>
                        {badge}
                      </span>
                    )}
                    {highlight && !badge && <Star size={14} className="text-op-blue" />}
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-extrabold font-manrope text-op-navy">{price}</span>
                    {period && <span className="text-sm text-op-muted ml-1">/{period}</span>}
                  </div>
                  <p className="text-xs text-op-muted leading-relaxed">{description}</p>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-op-body">
                      <CheckCircle2 size={13} className={`${highlight ? 'text-op-blue' : 'text-op-green'} mt-0.5 shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={ctaHref} className={`${ctaStyle} text-sm py-3`}>
                  {cta} {cta !== 'Scan My Business Free' && <ArrowRight size={14} />}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-white border-t border-op-border">
        <div className="container-wide max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeader
              eyebrow="FAQ"
              title="Common questions about"
              titleHighlight="pricing."
              center
            />
          </div>
          <div className="flex flex-col gap-5">
            {[
              { q: 'Is the Revenue Leak Scanner really free?', a: 'Yes — the scanner, your Revenue Leak Score, and the full results report are completely free. No credit card required.' },
              { q: 'When will Revenue Autopilot be available?', a: 'Revenue Autopilot is in early access. Join the list at the link above to get notified first and receive launch pricing.' },
              { q: 'What does "early access pricing" mean?', a: 'Early access members lock in a discounted rate before the product launches publicly. Pricing will increase at general availability.' },
              { q: 'What is included in Custom Services?', a: 'Custom Services are scoped per business. We design, build, and implement the exact systems your business needs. Request a call to discuss your situation.' },
              { q: 'Is there a setup fee?', a: 'For Revenue Autopilot plans, no. For Custom Services, setup is included in the project scope. We\'ll be transparent about everything before you commit.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-op-border pb-5">
                <h4 className="font-semibold font-manrope text-op-navy mb-2 text-sm">{q}</h4>
                <p className="text-sm text-op-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-op-blue text-white">
        <div className="container-wide text-center max-w-xl mx-auto">
          <Zap size={32} className="mx-auto mb-4 text-white/60" />
          <h2 className="text-3xl font-extrabold font-manrope mb-4">Start free. See your leaks today.</h2>
          <p className="text-white/70 mb-8">
            The scanner takes under 2 minutes and costs nothing. You will see exactly what is leaking — and what to fix first.
          </p>
          <Link href="/scanner" className="inline-flex items-center gap-2 bg-white text-op-blue font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors">
            Scan My Business Free <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}
