'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { Briefcase, CheckCheck, BarChart2, Zap } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Activate one recovery system and start winning back leads or growing your reviews automatically.',
    price: 149,
    yearlyPrice: 1490,   // ~2 months free
    ctaText: 'Get Started',
    ctaHref: '/signup?plan=starter',
    popular: false,
    features: [
      { text: 'One active revenue system',        icon: <Briefcase size={18} /> },
      { text: '500 contacts · 500 emails/month',  icon: <BarChart2 size={18} /> },
      { text: '100 monthly agent actions',         icon: <Zap size={18} /> },
    ],
    includes: [
      'What\'s included:',
      'Lead Recovery OR Review Growth System',
      'Weekly Revenue Briefing',
      'Basic dashboard',
      'CSV import + embedded form',
      'Basic webhook support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'All four core recovery systems running at once — the fastest path to measurable revenue recovery.',
    price: 299,
    yearlyPrice: 2990,
    ctaText: 'Start Free Trial',
    ctaHref: '/signup?plan=growth',
    popular: true,
    features: [
      { text: 'All 4 recovery systems active',    icon: <Briefcase size={18} /> },
      { text: '2,500 contacts · 2,500 emails/mo', icon: <BarChart2 size={18} /> },
      { text: '500 monthly agent actions',         icon: <Zap size={18} /> },
    ],
    includes: [
      'Everything in Starter, plus:',
      'Lead Recovery Autopilot',
      'Review Growth System',
      'Estimate Recovery Autopilot',
      'Customer Reactivation Autopilot',
      '14-day free trial included',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Everything in Growth plus every available system, higher limits, and priority support.',
    price: 599,
    yearlyPrice: 5990,
    ctaText: 'Talk to Us',
    ctaHref: '/contact',
    popular: false,
    features: [
      { text: 'All available revenue systems',     icon: <Briefcase size={18} /> },
      { text: '10,000 contacts · 10k emails/mo',   icon: <BarChart2 size={18} /> },
      { text: '2,000 monthly agent actions',        icon: <Zap size={18} /> },
    ],
    includes: [
      'Everything in Growth, plus:',
      'Advanced Weekly Revenue Briefing',
      'Expanded reporting',
      'Priority support',
      'Custom integrations available',
      'Multi-location support',
    ],
  },
]

/* ── Billing toggle ─────────────────────────────────────────────── */
const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void
  className?: string
}) => {
  const [selected, setSelected] = useState('0')

  const handleSwitch = (value: string) => {
    setSelected(value)
    onSwitch(value)
  }

  return (
    <div className={cn('flex justify-center', className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-op-surface-2
                      border border-op-border p-1">
        {[
          { value: '0', label: 'Monthly Billing' },
          { value: '1', label: 'Yearly Billing', badge: 'Save ~17%' },
        ].map(({ value, label, badge }) => (
          <button
            key={value}
            onClick={() => handleSwitch(value)}
            className={cn(
              'relative z-10 h-11 cursor-pointer rounded-xl px-5 font-medium font-jakarta',
              'text-sm transition-colors',
              selected === value ? 'text-white' : 'text-op-muted hover:text-op-ink',
            )}
          >
            {selected === value && (
              <motion.span
                layoutId="pricing-switch"
                className="absolute inset-0 rounded-xl bg-op-accent shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {label}
              {badge && (
                <span className="rounded-full bg-op-accent/10 px-2 py-0.5 text-xs
                                 font-semibold text-op-accent">
                  {badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const pricingRef = useRef<HTMLDivElement>(null)

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { delay: i * 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    }),
    hidden: { filter: 'blur(8px)', y: -18, opacity: 0 },
  }

  const togglePeriod = (value: string) => setIsYearly(Number(value) === 1)

  return (
    <div
      className="px-4 pt-20 pb-24 max-w-7xl mx-auto relative"
      ref={pricingRef}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <article className="text-left mb-10 space-y-5 max-w-2xl">
        <h2 className="md:text-5xl text-4xl font-fraunces font-bold text-op-ink mb-4">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.12}
            staggerFrom="first"
            containerClassName="justify-start flex-wrap"
            transition={{ type: 'spring', stiffness: 250, damping: 40, delay: 0 }}
          >
            A plan that fits where you are right now.
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-sm md:text-base text-op-muted font-jakarta max-w-lg"
        >
          Every plan starts from your Revenue Leak Score. No long-term contracts. Cancel anytime.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePeriod} className="w-fit justify-start" />
        </TimelineContent>
      </article>

      {/* ── Plan cards ──────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4 py-4">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.id}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                'relative border',
                plan.popular
                  ? 'ring-2 ring-op-accent bg-orange-50/40 border-op-accent/30'
                  : 'bg-white border-op-border',
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-2xl font-fraunces font-bold text-op-ink">
                    {plan.name} Plan
                  </h3>
                  {plan.popular && (
                    <span className="bg-op-accent text-white px-3 py-1 rounded-full
                                     text-xs font-bold font-jakarta shrink-0">
                      Most Popular
                    </span>
                  )}
                </div>

                <p className="text-xs text-op-muted font-jakarta mb-3 leading-relaxed">
                  {plan.description}
                </p>

                {/* Animated price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-fraunces font-black text-op-ink">
                    $<NumberFlow
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl font-fraunces font-black"
                    />
                  </span>
                  <span className="text-op-muted text-sm font-jakarta ml-1">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Primary CTA */}
                <Link
                  href={plan.ctaHref}
                  className={cn(
                    'flex w-full items-center justify-center mb-3 px-4 py-3.5',
                    'rounded-xl text-sm font-bold font-jakarta transition-all duration-200',
                    'active:scale-95',
                    plan.popular
                      ? 'bg-op-accent hover:bg-op-accent-dk text-white shadow-[0_4px_20px_rgba(212,98,42,0.35)]'
                      : 'bg-op-dark hover:bg-op-dark-2 text-white shadow-card',
                  )}
                >
                  {plan.ctaText}
                </Link>

                {/* Features list */}
                <div className="space-y-3 pt-5 border-t border-op-border/60">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]
                                text-op-subtle font-jakarta">
                    What&apos;s included
                  </p>
                  <p className="text-xs font-semibold text-op-ink font-jakarta">
                    {plan.includes[0]}
                  </p>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5">
                        <span className="h-5 w-5 bg-white border border-op-accent/40
                                         rounded-full grid place-content-center shrink-0">
                          <CheckCheck className="h-3 w-3 text-op-accent" />
                        </span>
                        <span className="text-xs text-op-muted font-jakarta">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>

      {/* ── Free scanner note ────────────────────────────────────── */}
      <TimelineContent
        as="div"
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="mt-6 text-center"
      >
        <p className="text-sm text-op-muted font-jakarta">
          Not sure which plan?{' '}
          <Link href="/scanner" className="text-op-accent font-semibold hover:underline">
            Run a free Revenue Leak Scan first
          </Link>{' '}
          — it takes 2 minutes and shows you exactly what to fix.
        </p>
      </TimelineContent>
    </div>
  )
}
