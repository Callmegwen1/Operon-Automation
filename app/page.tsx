import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Home,
  Wrench,
  Car,
  Dumbbell,
  Smile,
  Stethoscope,
  Sparkles,
  Building2,
  TrendingUp,
  Users,
  Zap,
  Star,
  BarChart3,
} from 'lucide-react'
import DashboardMockup from '@/components/dashboard/DashboardMockup'
import LeakScoreCard from '@/components/dashboard/LeakScoreCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { AnimateIn, FadeIn, StaggerChildren, ScaleIn } from '@/components/ui/Motion'

export const metadata: Metadata = {
  title: 'Operon Automation | Revenue Recovery for Small Businesses',
  description:
    'Find and fix the leaks costing your business customers. Operon helps small businesses recover missed leads, grow reviews, and automate follow-up.',
}

const problemStatements = [
  {
    value: 78,
    suffix: '%',
    statement: 'of businesses never follow up on a missed call.',
    detail: 'Every unanswered call is a lead that calls your competitor next. The first to follow up wins the job.',
  },
  {
    value: 21,
    suffix: '×',
    statement: 'more likely to convert if you respond within 5 minutes.',
    detail: 'Speed matters more than most owners realize. After an hour, that lead has already moved on.',
  },
  {
    value: 5,
    suffix: '×',
    statement: 'cheaper to reactivate a past client than find a new one.',
    detail: "Past clients who've gone quiet can come back. Most businesses just never reach back out.",
  },
]

const autopilotFeatures = [
  'Revenue Leak Dashboard with clear visibility',
  'Automated lead follow-up and call recovery',
  'Review request and reputation system',
  'Estimate follow-up and customer reactivation agents',
  'Weekly Owner Report — what ran, what recovered',
]

const howSteps = [
  { num: '01', title: 'Scan your business',           desc: 'Answer a few questions about your leads, follow-up, reviews, and marketing.' },
  { num: '02', title: 'See your revenue leaks',       desc: 'Get a Revenue Leak Score and a clear view of where customers may be slipping away.' },
  { num: '03', title: 'Activate recommended fixes',   desc: 'Revenue Autopilot recommends the exact systems to activate for your business.' },
  { num: '04', title: 'Recover missed opportunities', desc: 'Automated follow-up, review requests, and reactivation campaigns run on your behalf.' },
  { num: '05', title: 'Get a weekly owner report',    desc: 'See what is running, what recovered, and what needs attention — every week.' },
]

const industries = [
  { icon: Home,        label: 'Home Services'     },
  { icon: Sparkles,    label: 'Med Spas'          },
  { icon: Car,         label: 'Auto Shops'        },
  { icon: Dumbbell,    label: 'Fitness Studios'   },
  { icon: Smile,       label: 'Dental Offices'    },
  { icon: Stethoscope, label: 'Clinics'           },
  { icon: Wrench,      label: 'Cleaning Companies'},
  { icon: Building2,   label: 'Contractors'       },
  { icon: TrendingUp,  label: 'Real Estate'       },
  { icon: Users,       label: 'Local Services'    },
]

const scenarios = [
  {
    situation: 'A lead fills out your form on a Saturday evening.',
    without:   'You see it Monday. They\'ve already hired someone else.',
    with:      'Operon sends a follow-up in 15 minutes — while you\'re off the clock.',
    icon: Zap,
  },
  {
    situation: 'A customer is happy with the job. They just didn\'t leave a review.',
    without:   'You forget to ask. The moment passes. Your rating stays flat.',
    with:      'One click sends a personalized review request. They post it that same day.',
    icon: Star,
  },
  {
    situation: 'You\'re not sure which leads are converting or where they\'re from.',
    without:   'You guess. You spend money on ads that may not be working.',
    with:      'Your weekly report shows what ran, what recovered, and what needs attention.',
    icon: BarChart3,
  },
]

const testimonials = [
  {
    quote: 'I had no idea how many leads were falling through the cracks on weekends. Within the first week, the system followed up on 6 inquiries I would have missed. Two of them booked.',
    name: 'Marcus T.',
    business: 'Home Services · Phoenix, AZ',
    initial: 'M',
  },
  {
    quote: 'The review system alone paid for itself. We went from 14 Google reviews to 38 in about six weeks. I just mark jobs done and the emails go out automatically.',
    name: 'Sarah K.',
    business: 'Cleaning Company · Austin, TX',
    initial: 'S',
  },
  {
    quote: "I was skeptical — I've tried automation tools before. This one actually works without me having to babysit it. The weekly report tells me everything in two minutes.",
    name: 'David R.',
    business: 'HVAC Contractor · Nashville, TN',
    initial: 'D',
  },
]

// Terracotta waterdrops
function DripDrop() {
  return (
    <svg
      className="absolute left-0 w-full pointer-events-none overflow-visible"
      style={{ top: 'calc(100% - 2px)' }}
      viewBox="0 0 154 42"
      fill="none"
      aria-hidden="true"
    >
      <path d="M18,0 C19.2,3.6 24,6 24,12 A6,6 0 0 1 12,12 C12,6 16.8,3.6 18,0 Z"
        fill="#D4622A" fillOpacity="0.50" />
      <ellipse cx="15" cy="4.5" rx="1.5" ry="2" fill="white" fillOpacity="0.40"
        transform="rotate(-20 15 4.5)" />

      <path d="M68,0 C69.8,5.1 77,8.5 77,17 A9,9 0 0 1 59,17 C59,8.5 66.2,5.1 68,0 Z"
        fill="#D4622A" fillOpacity="0.75" />
      <ellipse cx="64" cy="6.5" rx="2.5" ry="3.5" fill="white" fillOpacity="0.36"
        transform="rotate(-20 64 6.5)" />

      <path d="M128,0 C130.4,7.2 140,12 140,24 A12,12 0 0 1 116,24 C116,12 125.6,7.2 128,0 Z"
        fill="#D4622A" fillOpacity="0.90" />
      <ellipse cx="124" cy="9.5" rx="3.5" ry="5" fill="white" fillOpacity="0.33"
        transform="rotate(-20 124 9.5)" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-op-bg pt-16 md:pt-24 pb-6 overflow-hidden relative">
        {/* Subtle warm radial glow behind hero */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(212,98,42,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="container-wide relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — copy */}
            <div className="flex-none w-full lg:w-[500px] text-center lg:text-left">

              <AnimateIn delay={0}>
                <div className="inline-flex items-center gap-2 bg-op-accent/8 border border-op-accent/20
                                text-op-accent text-[11px] font-semibold font-jakarta tracking-[0.14em]
                                uppercase px-3.5 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-op-accent animate-pulse-dot" />
                  Something&apos;s leaking
                </div>
              </AnimateIn>

              <AnimateIn delay={0.08}>
                <h1 className="text-5xl sm:text-6xl lg:text-[70px] font-fraunces font-black text-op-ink
                               leading-[1.03] tracking-tight mb-8">
                  Find and fix the{' '}
                  <span className="relative inline-block text-op-accent">
                    leaks
                    <DripDrop />
                  </span>{' '}
                  costing you customers.
                </h1>
              </AnimateIn>

              <AnimateIn delay={0.16}>
                <p className="text-base text-op-muted leading-relaxed mb-8 max-w-[420px] mx-auto lg:mx-0">
                  Operon scans your business and shows exactly where leads, reviews,
                  and revenue are slipping away — then fixes it automatically.
                </p>
              </AnimateIn>

              <AnimateIn delay={0.22}>
                <div className="flex flex-col sm:flex-row items-center lg:items-start
                                justify-center lg:justify-start gap-3">
                  <Link href="/scanner" className="btn-primary px-7 py-3.5 text-sm">
                    Scan My Business Free
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="btn-ghost text-sm"
                  >
                    See how it works
                  </Link>
                </div>
                <p className="text-xs text-op-subtle mt-4 text-center lg:text-left font-jakarta">
                  No credit card · Results in 2 minutes · Free for any local service business
                </p>
              </AnimateIn>
            </div>

            {/* Right — mockup */}
            <AnimateIn delay={0.12} className="flex-1 w-full lg:rotate-1 max-w-2xl mx-auto lg:mx-0">
              <DashboardMockup />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF STRIP ───────────────────────────────────── */}
      <FadeIn className="bg-op-dark border-y border-white/[0.06]">
        <div className="container-wide py-5 flex flex-wrap items-center justify-center
                        gap-x-10 gap-y-3">
          {[
            { val: '6+',     label: 'Revenue systems'    },
            { val: '< 10min',label: 'To first automation'},
            { val: '100%',   label: 'Done for you'       },
          ].map(({ val, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-center">
              <span className="text-lg font-fraunces font-bold text-op-accent">{val}</span>
              <span className="text-xs text-white/40 font-jakarta">{label}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ─── PROBLEM — dark section ────────────────────────────────── */}
      <section className="bg-op-dark section-pad">
        <div className="container-wide">
          <AnimateIn>
            <p className="eyebrow mb-4 text-op-accent/80">The Problem</p>
            <h2 className="text-3xl md:text-[2.6rem] font-fraunces font-bold text-white
                           leading-tight mb-16 max-w-xl">
              The numbers most owners don&apos;t want to think about.
            </h2>
          </AnimateIn>

          <div className="flex flex-col gap-14 max-w-2xl">
            {problemStatements.map(({ value, suffix, statement, detail }, i) => (
              <AnimateIn key={value} delay={i * 0.1}>
                <div className="flex items-start gap-6 group">
                  {/* Line */}
                  <div className="w-px self-stretch bg-op-accent/25 shrink-0 mt-2" />
                  <div>
                    <AnimatedCounter
                      value={value}
                      suffix={suffix}
                      className="text-[56px] font-fraunces font-black text-op-accent leading-none mb-3 block"
                    />
                    <p className="text-lg font-fraunces font-semibold text-white leading-snug mb-2">
                      {statement}
                    </p>
                    <p className="text-sm text-white/40 leading-relaxed font-jakarta">{detail}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCENARIOS ────────────────────────────────────────────── */}
      <section className="bg-op-bg section-pad section-divider">
        <div className="container-wide">
          <AnimateIn>
            <p className="eyebrow mb-4">What It Fixes</p>
            <h2 className="text-3xl md:text-[2.6rem] font-fraunces font-bold text-op-ink
                           leading-tight mb-14 max-w-xl">
              Real situations. Real solutions.
            </h2>
          </AnimateIn>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5" stagger={0.1}>
            {scenarios.map(({ situation, without, with: withText, icon: Icon }) => (
              <div key={situation}
                   className="card flex flex-col gap-5 hover:shadow-card-hover hover:-translate-y-0.5
                              transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-op-surface-2 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-op-muted" />
                </div>
                <p className="text-sm font-semibold font-fraunces text-op-ink leading-snug">
                  {situation}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2.5 bg-red-50 rounded-xl px-3 py-2.5">
                    <span className="text-op-red font-bold text-[11px] font-jakarta shrink-0 mt-0.5 uppercase tracking-wide">
                      Without
                    </span>
                    <p className="text-xs text-op-muted leading-relaxed font-jakarta">{without}</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-emerald-50 rounded-xl px-3 py-2.5">
                    <span className="text-op-forest font-bold text-[11px] font-jakarta shrink-0 mt-0.5 uppercase tracking-wide">
                      With
                    </span>
                    <p className="text-xs text-op-muted leading-relaxed font-jakarta">{withText}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>

          <AnimateIn delay={0.2} className="mt-10">
            <Link href="/scanner" className="btn-primary text-sm inline-flex">
              See Where Your Business Leaks <ArrowRight size={15} />
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ─── FOUNDER QUOTE ────────────────────────────────────────── */}
      <section className="bg-op-surface-2 border-y border-op-border py-16">
        <AnimateIn className="container-wide max-w-2xl">
          <div className="flex items-start gap-6">
            <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden border border-op-border shadow-card">
              <Image
                src="/images/founder.jpg"
                alt="Leonardo Diaz, Founder of Operon Automation"
                width={64}
                height={64}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="relative flex-1">
              <span
                className="absolute -top-6 -left-1 text-[96px] font-fraunces leading-none
                           text-op-accent/10 select-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="text-lg font-fraunces text-op-ink leading-relaxed mb-3 relative">
                &ldquo;Built this because I watched good businesses lose revenue to problems
                they didn&apos;t know they had.&rdquo;
              </p>
              <p className="text-sm font-semibold text-op-ink font-jakarta">Leonardo Diaz</p>
              <p className="text-xs text-op-muted font-jakarta">Founder, Operon Automation</p>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="bg-op-bg section-pad section-divider">
        <div className="container-wide">
          <AnimateIn>
            <p className="eyebrow mb-4">Early Results</p>
            <h2 className="text-3xl md:text-[2.6rem] font-fraunces font-bold text-op-ink
                           leading-tight mb-14">
              What business owners say.
            </h2>
          </AnimateIn>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5" stagger={0.1}>
            {testimonials.map(({ quote, name, business, initial }) => (
              <div key={name} className="card flex flex-col gap-5 hover:shadow-card-hover
                                        hover:-translate-y-0.5 transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-op-amber text-op-amber" />
                  ))}
                </div>
                <div className="relative flex-1">
                  <span
                    className="absolute -top-3 -left-1 text-[52px] font-fraunces leading-none
                               text-op-accent/12 select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p className="text-sm text-op-body leading-relaxed pt-3 relative font-jakarta">
                    {quote}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-op-border">
                  <div className="w-9 h-9 rounded-xl bg-op-dark text-white flex items-center
                                  justify-center text-sm font-bold font-fraunces shrink-0">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-op-ink leading-tight font-jakarta">{name}</p>
                    <p className="text-xs text-op-muted font-jakarta">{business}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── REVENUE AUTOPILOT ────────────────────────────────────── */}
      <section className="bg-op-surface-2 section-pad section-divider">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">

            <div className="flex-none w-full lg:w-[440px]">
              <AnimateIn>
                <p className="eyebrow mb-4">Revenue Autopilot</p>
                <h2 className="text-3xl md:text-[2.6rem] font-fraunces font-bold text-op-ink
                               leading-tight mb-4">
                  Scan, identify, and fix leaks automatically.
                </h2>
                <p className="text-sm text-op-muted leading-relaxed mb-6 font-jakarta">
                  Revenue Autopilot shows your Revenue Leak Score and recommends the exact
                  systems to activate. Agents run in the background so you can focus on your business.
                </p>
                <ul className="flex flex-col gap-2.5 mb-8">
                  {autopilotFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-op-body font-jakarta">
                      <CheckCircle2 size={15} className="text-op-forest shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <Link href="/revenue-autopilot" className="btn-primary text-sm">
                    Learn More <ChevronRight size={15} />
                  </Link>
                  <Link href="/scanner" className="btn-secondary text-sm">
                    Scan Free
                  </Link>
                </div>
              </AnimateIn>
            </div>

            <ScaleIn className="flex-1 w-full max-w-lg mx-auto lg:mx-0 pb-6">
              <LeakScoreCard />
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-op-bg section-pad section-divider">
        <div className="container-wide">
          <AnimateIn>
            <p className="eyebrow mb-4">How It Works</p>
            <h2 className="text-3xl md:text-[2.6rem] font-fraunces font-bold text-op-ink
                           leading-tight mb-16">
              Scan once. Autopilot handles the rest.
            </h2>
          </AnimateIn>

          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6"
            stagger={0.09}
          >
            {howSteps.map(({ num, title, desc }, i) => (
              <div key={num} className="flex flex-col group">
                <span className="text-[80px] font-fraunces font-black leading-none mb-4
                                 select-none inline-block transition-transform duration-300
                                 group-hover:-translate-y-1">
                  <span className="text-op-border">{num[0]}</span>
                  <span className="text-op-accent">{num[1]}</span>
                </span>
                <h3 className="text-sm font-semibold text-op-ink mb-2 font-jakarta">{title}</h3>
                <p className="text-xs text-op-muted leading-relaxed font-jakarta">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── AFTER SIGNUP ─────────────────────────────────────────── */}
      <section className="bg-op-surface-2 section-pad section-divider">
        <div className="container-wide max-w-2xl mx-auto">
          <AnimateIn>
            <p className="eyebrow mb-4">After You Sign Up</p>
            <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-op-ink
                           leading-tight mb-10">
              Your first automation is live within 10 minutes.
            </h2>
          </AnimateIn>

          <StaggerChildren className="flex flex-col gap-6" stagger={0.1}>
            {[
              { step: '1', title: 'Import or add your first contact', desc: 'Paste in a contact, upload a CSV, or connect your existing form. No special tech required.' },
              { step: '2', title: 'Activate your top agent', desc: 'Based on your scan results, Revenue Autopilot recommends which system to turn on first. One click.' },
              { step: '3', title: 'Your automation runs', desc: 'The agent handles follow-up, review requests, or reactivation on your behalf — while you get on with your day.' },
              { step: '4', title: 'Get your first weekly report', desc: 'Every Monday you receive a plain-language summary: what ran, what recovered, what needs attention.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-5">
                <div className="w-9 h-9 rounded-xl bg-op-dark text-white flex items-center
                                justify-center text-sm font-bold font-fraunces shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-op-ink mb-1 font-jakarta">{title}</p>
                  <p className="text-xs text-op-muted leading-relaxed font-jakarta">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>

          <AnimateIn delay={0.2} className="mt-10">
            <Link href="/scanner" className="btn-primary text-sm inline-flex">
              Get Started Free <ArrowRight size={15} />
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────────── */}
      <section className="bg-op-bg section-pad section-divider">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">

            <div className="flex-none w-full lg:w-[440px]">
              <AnimateIn>
                <p className="eyebrow mb-4">Two Ways to Work Together</p>
                <h2 className="text-3xl md:text-[2.6rem] font-fraunces font-bold text-op-ink
                               leading-tight mb-4">
                  Self-serve software or done-for-you systems.
                </h2>
                <p className="text-sm text-op-muted leading-relaxed mb-8 font-jakarta">
                  Start free with Revenue Autopilot and activate agents yourself, or work directly
                  with Operon to build a custom system around your business.
                </p>
                <Link href="/services" className="btn-primary text-sm inline-flex">
                  Request Setup Help <ArrowRight size={15} />
                </Link>
              </AnimateIn>
            </div>

            <StaggerChildren className="flex-1 grid sm:grid-cols-2 gap-4" stagger={0.1}>
              <div className="card flex flex-col hover:shadow-card-hover hover:-translate-y-0.5
                              transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-op-subtle
                                 font-jakarta mb-4 block">
                  Software
                </span>
                <h3 className="font-bold font-fraunces text-op-ink text-base mb-2">
                  Revenue Autopilot
                </h3>
                <p className="text-xs text-op-muted leading-relaxed mb-5 flex-1 font-jakarta">
                  Scan your business, get a Revenue Leak Score, and activate pre-built agents that
                  run follow-up, reviews, and reactivation automatically.
                </p>
                <Link href="/revenue-autopilot"
                      className="text-xs font-semibold text-op-accent hover:text-op-accent-dk
                                 inline-flex items-center gap-1 transition-colors font-jakarta">
                  See how it works <ArrowRight size={11} />
                </Link>
              </div>
              <div className="card flex flex-col hover:shadow-card-hover hover:-translate-y-0.5
                              transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-op-subtle
                                 font-jakarta mb-4 block">
                  Agency
                </span>
                <h3 className="font-bold font-fraunces text-op-ink text-base mb-2">
                  Operon Services
                </h3>
                <p className="text-xs text-op-muted leading-relaxed mb-5 flex-1 font-jakarta">
                  Custom CRM setup, multi-step automation, and done-for-you implementation
                  built around your specific workflows and goals.
                </p>
                <Link href="/services"
                      className="text-xs font-semibold text-op-accent hover:text-op-accent-dk
                                 inline-flex items-center gap-1 transition-colors font-jakarta">
                  See services <ArrowRight size={11} />
                </Link>
              </div>
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ─── INDUSTRIES ───────────────────────────────────────────── */}
      <section className="bg-op-surface-2 section-pad section-divider">
        <div className="container-wide">
          <AnimateIn>
            <p className="eyebrow mb-4">Who We Serve</p>
            <h2 className="text-3xl md:text-[2.6rem] font-fraunces font-bold text-op-ink
                           leading-tight mb-12">
              Built for local service businesses.
            </h2>
          </AnimateIn>

          <StaggerChildren
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
            stagger={0.05}
          >
            {industries.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                href="/industries"
                className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border border-op-border
                           bg-op-surface hover:border-op-accent hover:shadow-card transition-all
                           duration-200 group"
              >
                <Icon size={14} className="text-op-muted group-hover:text-op-accent transition-colors shrink-0" />
                <span className="text-sm text-op-muted group-hover:text-op-ink transition-colors
                                 font-medium leading-tight flex-1 font-jakarta">
                  {label}
                </span>
                <ArrowRight
                  size={11}
                  className="shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100
                             group-hover:translate-x-0 group-hover:text-op-accent transition-all duration-200"
                />
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── FINAL CTA — dark editorial ───────────────────────────── */}
      <section className="bg-op-dark section-pad relative overflow-hidden">
        {/* Warm glow */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(212,98,42,0.12) 0%, transparent 70%)',
          }}
        />

        <AnimateIn className="container-wide max-w-2xl relative">
          <p className="eyebrow mb-6 text-op-accent/70">Ready?</p>
          <h2 className="text-3xl md:text-[2.8rem] font-fraunces font-bold text-white
                         leading-tight mb-6">
            Your leaks are costing you{' '}
            <span className="text-op-accent">right now.</span>{' '}
            Find them free.
          </h2>
          <p className="text-white/50 mb-10 text-base font-jakarta">
            Your free Revenue Leak Score shows exactly where customers may be slipping away.
          </p>
          <Link
            href="/scanner"
            className="btn-primary-dark px-8 py-4 text-sm inline-flex"
          >
            Scan My Business Free <ArrowRight size={15} />
          </Link>
          <p className="mt-5 text-xs text-white/25 font-jakarta">
            No cost. No commitment. Results in under 2 minutes.
          </p>
        </AnimateIn>
      </section>
    </>
  )
}
