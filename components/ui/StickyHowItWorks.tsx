'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, AnimatePresence, useMotionValueEvent } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const steps = [
  {
    num: '01',
    title: 'Scan your business',
    desc: 'Answer a few questions about your leads, follow-up, reviews, and marketing. It takes under 2 minutes and requires no technical setup.',
    items: [
      'Business type and service area',
      'Current follow-up and CRM systems',
      'Review and reputation status',
      'Ad tracking and lead source visibility',
    ],
  },
  {
    num: '02',
    title: 'See your revenue leaks',
    desc: 'You receive a Revenue Leak Score out of 100, a breakdown of your top leaks by category, an impact rating for each, and specific recommended fixes.',
    items: [
      'Revenue Leak Score (0–100)',
      'Top leaks ranked by estimated impact',
      'Impact level per leak: High / Medium / Low',
      'Recommended fix for each leak',
    ],
  },
  {
    num: '03',
    title: 'Activate recommended fixes',
    desc: 'Revenue Autopilot recommends the exact agents to activate for your specific leaks. Each agent is pre-built — no complex setup, no code, no learning curve.',
    items: [
      'Lead Follow-Up Agent',
      'Review Request Agent',
      'Estimate Follow-Up Agent',
      'Customer Reactivation Agent',
    ],
  },
  {
    num: '04',
    title: 'Recovery runs automatically',
    desc: 'Once activated, agents run in the background. Leads get followed up, reviews get requested, and past customers get reactivated — without you lifting a finger.',
    items: [
      'Instant lead response — no more cold leads',
      'Review growth month over month',
      'Estimate-to-job close rate improvement',
      'Past customers coming back',
    ],
  },
  {
    num: '05',
    title: 'Get a weekly owner report',
    desc: 'Every week you receive a plain-language report: what ran, what was recovered, what is active, and what needs your attention. No dashboards to check.',
    items: [
      'Recovered revenue summary',
      'Agent activity breakdown',
      'New reviews received',
      'Open items needing attention',
    ],
  },
]

const EASE = [0.22, 1, 0.36, 1] as const

export default function StickyHowItWorks() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(Math.floor(v * steps.length), steps.length - 1)
    setActive(next)
  })

  const step = steps[active]

  return (
    <>
      {/* ── DESKTOP: sticky scroll ──────────────────────────────── */}
      <div
        ref={containerRef}
        className="hidden md:block"
        style={{ height: `${steps.length * 80}vh` }}
      >
        <div className="sticky top-0 h-screen bg-op-dark overflow-hidden flex">

          {/* Left panel — step counter */}
          <div className="w-[38%] flex flex-col items-start justify-center
                          border-r border-white/[0.07] px-16 shrink-0">

            <p className="text-[11px] font-bold tracking-[0.18em] uppercase
                          text-op-accent/60 font-jakarta mb-8">
              How It Works
            </p>

            {/* Big animated number */}
            <div className="relative overflow-hidden h-[120px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{    y: -60, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="font-fraunces font-black text-op-accent leading-none absolute"
                  style={{ fontSize: 'clamp(80px, 9vw, 120px)' }}
                >
                  {step.num}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* of 5 */}
            <p className="text-white/20 font-jakarta text-sm mt-1 mb-10">
              of {steps.length}
            </p>

            {/* Progress segments */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-[3px] rounded-full"
                  animate={{
                    width:           i <= active ? 28 : 12,
                    backgroundColor: i <= active ? '#D4622A' : 'rgba(255,255,255,0.12)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              ))}
            </div>
          </div>

          {/* Right panel — step content */}
          <div className="flex-1 flex items-center px-16 xl:px-24 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{    opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="max-w-xl"
              >
                <h2
                  className="font-fraunces font-bold text-white leading-tight mb-5"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 46px)' }}
                >
                  {step.title}
                </h2>

                <p className="text-base text-white/45 leading-relaxed mb-8 font-jakarta">
                  {step.desc}
                </p>

                <ul className="flex flex-col gap-3">
                  {step.items.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0   }}
                      transition={{ duration: 0.35, delay: i * 0.07, ease: EASE }}
                      className="flex items-center gap-3 text-sm text-white/60 font-jakarta"
                    >
                      <CheckCircle2 size={14} className="text-op-accent shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Subtle step number watermark */}
            <span
              aria-hidden="true"
              className="absolute right-8 bottom-8 font-fraunces font-black
                         text-white/[0.04] select-none pointer-events-none leading-none"
              style={{ fontSize: 'clamp(120px, 18vw, 220px)' }}
            >
              {step.num}
            </span>
          </div>
        </div>
      </div>

      {/* ── MOBILE: regular stacked layout ─────────────────────── */}
      <div className="md:hidden bg-op-dark py-20 px-5">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase
                      text-op-accent/60 font-jakarta mb-4">
          How It Works
        </p>
        <h2 className="font-fraunces font-bold text-white text-3xl leading-tight mb-12">
          Scan once. Autopilot handles the rest.
        </h2>
        <div className="flex flex-col gap-10">
          {steps.map(({ num, title, desc, items }) => (
            <div key={num} className="flex gap-5">
              <span className="font-fraunces font-black text-op-accent text-4xl leading-none
                               shrink-0 mt-1 w-12">
                {num}
              </span>
              <div>
                <h3 className="font-fraunces font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-sm text-white/40 font-jakarta leading-relaxed mb-3">{desc}</p>
                <ul className="flex flex-col gap-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/50 font-jakarta">
                      <CheckCircle2 size={12} className="text-op-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
