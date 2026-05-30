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
  ArrowUpRight,
} from 'lucide-react'
import DashboardMockup from '@/components/dashboard/DashboardMockup'
import LeakScoreCard from '@/components/dashboard/LeakScoreCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { AnimateIn, FadeIn, StaggerChildren, ScaleIn } from '@/components/ui/Motion'
import MagneticButton from '@/components/ui/MagneticButton'
import Marquee from '@/components/ui/Marquee'
import DripDrop from '@/components/ui/DripDrop'
import CyclingText from '@/components/ui/CyclingText'
import RadarFeatures from '@/components/ui/RadarFeatures'
import { GLSLHills } from '@/components/ui/glsl-hills'
import DashboardShowcase from '@/components/ui/DashboardShowcase'

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
  { icon: Home,        label: 'Home Services'      },
  { icon: Sparkles,    label: 'Med Spas'           },
  { icon: Car,         label: 'Auto Shops'         },
  { icon: Dumbbell,    label: 'Fitness Studios'    },
  { icon: Smile,       label: 'Dental Offices'     },
  { icon: Stethoscope, label: 'Clinics'            },
  { icon: Wrench,      label: 'Cleaning Companies' },
  { icon: Building2,   label: 'Contractors'        },
  { icon: TrendingUp,  label: 'Real Estate'        },
  { icon: Users,       label: 'Local Services'     },
]

const scenarios = [
  {
    situation: 'A lead fills out your form on a Saturday evening.',
    without:   "You see it Monday. They've already hired someone else.",
    with:      "Operon sends a follow-up in 15 minutes — while you're off the clock.",
    icon: Zap,
  },
  {
    situation: "A customer is happy with the job. They just didn't leave a review.",
    without:   'You forget to ask. The moment passes. Your rating stays flat.',
    with:      'One click sends a personalized review request. They post it that same day.',
    icon: Star,
  },
  {
    situation: "You're not sure which leads are converting or where they're from.",
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

export default function HomePage() {
  return (
    <>
      {/* ─── HERO — full viewport, cinematic ──────────────────────── */}
      <section className="relative min-h-dvh bg-op-dark flex items-center overflow-hidden">

        {/* Noise grain overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.035] z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        {/* Radial glow — top left warm */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(212,98,42,0.12) 0%, transparent 65%)',
          }}
        />

        {/* Content grid */}
        <div className="container-wide relative z-20 w-full py-24 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 min-h-dvh lg:min-h-0 lg:py-28">

            {/* ── LEFT — copy ──────────────────────────────────────── */}
            <div className="flex-none w-full lg:w-[520px] xl:w-[560px] text-center lg:text-left">

              <AnimateIn delay={0}>
                <div className="inline-flex items-center gap-2 border border-op-accent/25
                                bg-op-accent/8 text-op-accent text-[11px] font-semibold font-jakarta
                                tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-op-accent animate-pulse-dot" />
                  Revenue Recovery Platform
                </div>
              </AnimateIn>

              <AnimateIn delay={0.07}>
                <h1
                  className="font-fraunces font-black text-white leading-[1.02] tracking-tight mb-8"
                  style={{ fontSize: 'clamp(48px, 6.5vw, 84px)' }}
                >
                  Find and fix the{' '}
                  <span className="relative inline-block text-op-accent italic">
                    leaks
                    <DripDrop />
                  </span>{' '}
                  costing you customers.
                </h1>
              </AnimateIn>

              <AnimateIn delay={0.14}>
                {/* Cycling statement — own line, proper height reservation */}
                <div className="flex items-center gap-2.5 mb-5 justify-center lg:justify-start">
                  <span className="text-sm text-white/35 font-jakarta">Your revenue is</span>
                  <span className="relative inline-flex items-center overflow-hidden h-7">
                    <CyclingText
                      words={['leaking', 'at risk', 'being missed', 'recoverable', 'fixable']}
                      className="h-7"
                      wordClassName="text-sm font-bold font-jakarta text-op-accent whitespace-nowrap"
                    />
                  </span>
                </div>

                <p className="text-base lg:text-lg text-white/50 leading-relaxed mb-10
                               max-w-[440px] mx-auto lg:mx-0 font-jakarta">
                  Operon scans your business for revenue leaks — missed leads, cold
                  follow-up, weak reviews — then fixes them automatically.
                </p>
              </AnimateIn>

              <AnimateIn delay={0.2}>
                <div className="flex flex-col sm:flex-row items-center lg:items-start
                                justify-center lg:justify-start gap-3 mb-6">
                  <MagneticButton>
                    <Link href="/scanner" className="btn-primary-dark px-7 py-4 text-sm gap-2">
                      Scan My Business Free
                      <ArrowRight size={15} />
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link href="#how-it-works"
                          className="inline-flex items-center gap-2 text-sm font-medium
                                     text-white/50 hover:text-white px-5 py-4 transition-colors
                                     font-jakarta">
                      How it works
                      <ArrowRight size={13} className="opacity-50" />
                    </Link>
                  </MagneticButton>
                </div>

                {/* Trust strip */}
                <div className="flex items-center justify-center lg:justify-start gap-5 flex-wrap">
                  {['No credit card', 'Results in 2 min', 'Free forever'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-xs text-white/25 font-jakarta">
                      <CheckCircle2 size={11} className="text-op-forest/60" />
                      {t}
                    </span>
                  ))}
                </div>
              </AnimateIn>
            </div>

            {/* ── RIGHT — hero image ────────────────────────────────── */}
            <AnimateIn
              delay={0.1}
              className="flex-1 w-full max-w-[640px] lg:max-w-none relative"
            >
              {/* Image frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]
                              border border-white/8">
                {/* Warm color grade overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,98,42,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                  }}
                />
                <Image
                  src="/images/hero-hvac.png"
                  alt="HVAC contractor reviewing revenue dashboard on Operon"
                  width={1280}
                  height={853}
                  className="w-full h-auto block"
                  priority
                  quality={92}
                />
              </div>

              {/* Floating badge — leads recovered */}
              <div className="absolute -bottom-4 -left-4 lg:-left-8 bg-op-dark border border-white/12
                              rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)]
                              flex items-center gap-3 backdrop-blur-sm z-20">
                <div className="w-8 h-8 rounded-xl bg-op-forest/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="text-op-forest" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold font-fraunces leading-none mb-0.5">
                    6 leads recovered
                  </p>
                  <p className="text-white/40 text-[11px] font-jakarta">this week · automated</p>
                </div>
              </div>

              {/* Floating badge — reviews */}
              <div className="absolute -top-4 -right-4 lg:-right-6 bg-op-dark border border-white/12
                              rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)]
                              flex items-center gap-3 backdrop-blur-sm z-20">
                <div className="flex gap-0.5">
                  {[0,1,2,3,4].map(i => (
                    <Star key={i} size={12} className="fill-op-amber text-op-amber" />
                  ))}
                </div>
                <div>
                  <p className="text-white text-sm font-bold font-fraunces leading-none mb-0.5">
                    4.9 rating
                  </p>
                  <p className="text-white/40 text-[11px] font-jakarta">+24 new reviews</p>
                </div>
              </div>
            </AnimateIn>

          </div>
        </div>

        {/* Bottom fade to next section */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #F9F7F4)' }}
        />
      </section>

      {/* ─── MARQUEE — industries ─────────────────────────────────── */}
      <section className="bg-op-bg py-6 section-divider overflow-hidden">
        <Marquee speed="normal" className="py-2">
          {industries.map(({ icon: Icon, label }) => (
            <Link
              key={label}
              href="/industries"
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-op-border
                         bg-op-surface text-op-muted hover:text-op-ink hover:border-op-accent/40
                         transition-all duration-200 group whitespace-nowrap"
            >
              <Icon size={14} className="text-op-subtle group-hover:text-op-accent transition-colors" />
              <span className="text-sm font-medium font-jakarta">{label}</span>
            </Link>
          ))}
        </Marquee>
      </section>

      {/* ─── RADAR — automation systems visualised ────────────────── */}
      <section className="bg-op-dark section-divider">
        <div className="container-wide py-20 md:py-28 flex flex-col lg:flex-row
                        items-center gap-12 lg:gap-20">

          {/* Left copy */}
          <AnimateIn className="flex-none w-full lg:w-[400px] text-center lg:text-left">
            <p className="eyebrow mb-4 text-op-accent/70">Automation Systems</p>
            <h2 className="font-fraunces font-bold text-white leading-tight mb-4"
                style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
              Six agents working in the background — around the clock.
            </h2>
            <p className="text-sm text-white/40 leading-relaxed font-jakarta">
              Activate the systems that match your revenue leaks. Each agent runs
              automatically so you never miss a follow-up, review, or reactivation.
            </p>
          </AnimateIn>

          {/* Radar visual */}
          <FadeIn delay={0.2} className="flex-1 flex items-center justify-center">
            <RadarFeatures />
          </FadeIn>

        </div>
      </section>

      {/* ─── PROBLEM — poster-scale typography ────────────────────── */}
      <section className="bg-op-dark overflow-hidden">
        <div className="container-wide py-28 md:py-40">

          <AnimateIn>
            <p className="eyebrow mb-6 text-op-accent/70">The Problem</p>
          </AnimateIn>

          {/* Oversized editorial heading */}
          <AnimateIn delay={0.06}>
            <h2
              className="font-fraunces font-black text-white leading-[0.95] tracking-tight
                         mb-20 max-w-4xl"
              style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
            >
              The numbers most owners<br />
              don&apos;t want to{' '}
              <span className="text-op-accent italic">think about.</span>
            </h2>
          </AnimateIn>

          {/* Stats — one per row, massive number */}
          <div className="flex flex-col divide-y divide-white/[0.06]">
            {problemStatements.map(({ value, suffix, statement, detail }, i) => (
              <AnimateIn key={value} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16 py-12 group">

                  {/* Number — poster-scale */}
                  <div className="shrink-0 w-full md:w-56">
                    <AnimatedCounter
                      value={value}
                      suffix={suffix}
                      className="font-fraunces font-black text-op-accent leading-none block
                                 group-hover:scale-105 transition-transform duration-300 origin-left"
                      style={{ fontSize: 'clamp(72px, 10vw, 120px)' }}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 max-w-xl">
                    <p className="text-xl md:text-2xl font-fraunces font-semibold text-white
                                  leading-snug mb-3">
                      {statement}
                    </p>
                    <p className="text-sm text-white/35 leading-relaxed font-jakarta">{detail}</p>
                  </div>

                  {/* Counter tag */}
                  <div className="shrink-0 hidden lg:flex items-center justify-center w-10 h-10
                                  rounded-full border border-white/10 text-white/20 font-jakarta
                                  text-xs font-bold">
                    0{i + 1}
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
            <h2 className="font-fraunces font-bold text-op-ink leading-tight mb-14"
                style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
              Real situations. Real solutions.
            </h2>
          </AnimateIn>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5" stagger={0.1}>
            {scenarios.map(({ situation, without, with: withText, icon: Icon }) => (
              <div key={situation}
                   className="card flex flex-col gap-5 hover:shadow-card-hover
                              hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-op-surface-2 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-op-muted" />
                </div>
                <p className="text-sm font-semibold font-fraunces text-op-ink leading-snug">
                  {situation}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2.5 bg-red-50 rounded-xl px-3 py-2.5">
                    <span className="text-op-red font-bold text-[11px] font-jakarta
                                     shrink-0 mt-0.5 uppercase tracking-wide">Without</span>
                    <p className="text-xs text-op-muted leading-relaxed font-jakarta">{without}</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-emerald-50 rounded-xl px-3 py-2.5">
                    <span className="text-op-forest font-bold text-[11px] font-jakarta
                                     shrink-0 mt-0.5 uppercase tracking-wide">With</span>
                    <p className="text-xs text-op-muted leading-relaxed font-jakarta">{withText}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>

          <AnimateIn delay={0.2} className="mt-10">
            <MagneticButton>
              <Link href="/scanner" className="btn-primary text-sm inline-flex">
                See Where Your Business Leaks <ArrowRight size={15} />
              </Link>
            </MagneticButton>
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
              <span aria-hidden="true"
                    className="absolute -top-6 -left-1 text-[96px] font-fraunces leading-none
                               text-op-accent/10 select-none pointer-events-none">
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
            <h2 className="font-fraunces font-bold text-op-ink leading-tight mb-14"
                style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
              What business owners say.
            </h2>
          </AnimateIn>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5" stagger={0.1}>
            {testimonials.map(({ quote, name, business, initial }) => (
              <div key={name} className="card flex flex-col gap-5 hover:shadow-card-hover
                                        hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-op-amber text-op-amber" />
                  ))}
                </div>
                <div className="relative flex-1">
                  <span aria-hidden="true"
                        className="absolute -top-3 -left-1 text-[52px] font-fraunces leading-none
                                   text-op-accent/12 select-none pointer-events-none">
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
                <h2 className="font-fraunces font-bold text-op-ink leading-tight mb-4"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 46px)' }}>
                  Scan, identify, and fix leaks automatically.
                </h2>
                <p className="text-sm text-op-muted leading-relaxed mb-6 font-jakarta">
                  Revenue Autopilot shows your Revenue Leak Score and recommends the exact
                  systems to activate. Agents run in the background so you focus on your business.
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
                  <MagneticButton>
                    <Link href="/revenue-autopilot" className="btn-primary text-sm">
                      Learn More <ChevronRight size={15} />
                    </Link>
                  </MagneticButton>
                  <Link href="/scanner" className="btn-secondary text-sm">Scan Free</Link>
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
            <h2 className="font-fraunces font-bold text-op-ink leading-tight mb-16"
                style={{ fontSize: 'clamp(28px, 3.5vw, 46px)' }}>
              Scan once. Autopilot handles the rest.
            </h2>
          </AnimateIn>
          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6"
            stagger={0.09}
          >
            {howSteps.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col group">
                <span className="font-fraunces font-black leading-none mb-4 select-none
                                 inline-block transition-transform duration-300
                                 group-hover:-translate-y-1"
                      style={{ fontSize: 'clamp(64px, 6vw, 80px)' }}>
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

      {/* ─── PRODUCT SCREENSHOTS ──────────────────────────────────── */}
      <section className="bg-op-surface-2 section-pad section-divider">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-start gap-14 lg:gap-20">

            {/* Left — copy */}
            <AnimateIn className="flex-none w-full lg:w-[340px]">
              <p className="eyebrow mb-4">Inside the Dashboard</p>
              <h2 className="font-fraunces font-bold text-op-ink leading-tight mb-4"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 42px)' }}>
                See exactly what your business is doing — and what it isn&apos;t.
              </h2>
              <p className="text-sm text-op-muted leading-relaxed font-jakarta">
                The Revenue Dashboard, Command Center, and Email Health tools give you
                a complete picture in under two minutes. No spreadsheets. No guesswork.
              </p>
            </AnimateIn>

            {/* Right — tabbed screenshot showcase */}
            <ScaleIn className="flex-1 w-full min-w-0">
              <DashboardShowcase />
            </ScaleIn>

          </div>
        </div>
      </section>

      {/* ─── AFTER SIGNUP ─────────────────────────────────────────── */}
      <section className="bg-op-surface-2 section-pad section-divider">
        <div className="container-wide max-w-2xl mx-auto">
          <AnimateIn>
            <p className="eyebrow mb-4">After You Sign Up</p>
            <h2 className="font-fraunces font-bold text-op-ink leading-tight mb-10"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
              Your first automation is live within 10 minutes.
            </h2>
          </AnimateIn>
          <StaggerChildren className="flex flex-col gap-6" stagger={0.1}>
            {[
              { step: '1', title: 'Import or add your first contact', desc: 'Paste in a contact, upload a CSV, or connect your existing form. No special tech required.' },
              { step: '2', title: 'Activate your top agent', desc: 'Based on your scan results, Revenue Autopilot recommends which system to turn on first. One click.' },
              { step: '3', title: 'Your automation runs', desc: "The agent handles follow-up, review requests, or reactivation on your behalf — while you get on with your day." },
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
            <MagneticButton>
              <Link href="/scanner" className="btn-primary text-sm inline-flex">
                Get Started Free <ArrowRight size={15} />
              </Link>
            </MagneticButton>
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
                <h2 className="font-fraunces font-bold text-op-ink leading-tight mb-4"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 46px)' }}>
                  Self-serve software or done-for-you systems.
                </h2>
                <p className="text-sm text-op-muted leading-relaxed mb-8 font-jakarta">
                  Start free with Revenue Autopilot and activate agents yourself, or work
                  directly with Operon to build a custom system around your business.
                </p>
                <MagneticButton>
                  <Link href="/services" className="btn-primary text-sm inline-flex">
                    Request Setup Help <ArrowRight size={15} />
                  </Link>
                </MagneticButton>
              </AnimateIn>
            </div>
            <StaggerChildren className="flex-1 grid sm:grid-cols-2 gap-4" stagger={0.1}>
              {[
                {
                  tag: 'Software',
                  title: 'Revenue Autopilot',
                  desc: 'Scan your business, get a Revenue Leak Score, and activate pre-built agents that run follow-up, reviews, and reactivation automatically.',
                  href: '/revenue-autopilot',
                },
                {
                  tag: 'Agency',
                  title: 'Operon Services',
                  desc: 'Custom CRM setup, multi-step automation, and done-for-you implementation built around your specific workflows and goals.',
                  href: '/services',
                },
              ].map(({ tag, title, desc, href }) => (
                <div key={tag} className="card flex flex-col hover:shadow-card-hover
                                          hover:-translate-y-1 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-op-subtle
                                   font-jakarta mb-4 block">{tag}</span>
                  <h3 className="font-bold font-fraunces text-op-ink text-base mb-2">{title}</h3>
                  <p className="text-xs text-op-muted leading-relaxed mb-5 flex-1 font-jakarta">{desc}</p>
                  <Link href={href}
                        className="text-xs font-semibold text-op-accent hover:text-op-accent-dk
                                   inline-flex items-center gap-1 transition-colors font-jakarta">
                    See how it works <ArrowUpRight size={11} />
                  </Link>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA — full dark, cinematic ─────────────────────── */}
      <section className="bg-op-dark section-pad relative overflow-hidden">
        {/* GLSL rolling hills — decorative background layer */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <GLSLHills width="100%" height="100%" cameraZ={125} speed={0.4} />
        </div>
        {/* Noise grain */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(212,98,42,0.15) 0%, transparent 70%)',
          }}
        />

        <AnimateIn className="container-wide max-w-2xl relative z-10">
          <p className="eyebrow mb-6 text-op-accent/60">Ready?</p>
          <h2
            className="font-fraunces font-black text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}
          >
            Your leaks are costing you{' '}
            <span className="text-op-accent italic">right now.</span>
          </h2>
          <p className="text-white/40 mb-12 text-base md:text-lg font-jakarta max-w-lg">
            Your free Revenue Leak Score shows exactly where customers may be slipping away.
            Takes 2 minutes. Free forever.
          </p>
          <MagneticButton>
            <Link href="/scanner"
                  className="btn-primary-dark px-8 py-4 text-sm inline-flex gap-2">
              Scan My Business Free <ArrowRight size={15} />
            </Link>
          </MagneticButton>
        </AnimateIn>
      </section>
    </>
  )
}
