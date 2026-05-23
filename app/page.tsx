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
} from 'lucide-react'
import DashboardMockup from '@/components/dashboard/DashboardMockup'
import LeakScoreCard from '@/components/dashboard/LeakScoreCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

export const metadata: Metadata = {
  title: 'Operon Automation | Revenue Recovery for Small Businesses',
  description:
    'Find and fix the leaks costing your business customers. Operon helps small businesses recover missed leads, grow reviews, and automate follow-up.',
}

/* Stat-anchored problem statements */
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
  'Estimate and invoice follow-up agents',
  'Weekly Owner Report — what ran, what recovered',
]

const howSteps = [
  { num: '01', title: 'Scan your business',           desc: 'Answer a few questions about your leads, follow-up, reviews, and marketing.' },
  { num: '02', title: 'See your revenue leaks',       desc: 'Get a Revenue Leak Score and a clear view of where customers may be slipping away.' },
  { num: '03', title: 'Activate recommended fixes',   desc: 'Revenue Autopilot recommends the exact systems to activate for your business.' },
  { num: '04', title: 'Recover missed opportunities', desc: 'Automated follow-up, review requests, and reactivation campaigns run on your behalf.' },
  { num: '05', title: 'Get a weekly owner report',    desc: 'See what is running, what recovered, and what needs attention — every week.' },
]

/* "0" stays grey — all digits are amber */
const digitColors = [
  'text-op-amber',
  'text-op-amber',
  'text-op-amber',
  'text-op-amber',
  'text-op-amber',
]

/* Slight hand-placed rotations on decorative numbers */
const numRotations = ['rotate-0', '-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2']

const industries = [
  { icon: Home,        label: 'Home Services'     },
  { icon: Sparkles,    label: 'Med Spas'          },
  { icon: Car,         label: 'Auto Shops'         },
  { icon: Dumbbell,    label: 'Fitness Studios'    },
  { icon: Smile,       label: 'Dental Offices'     },
  { icon: Stethoscope, label: 'Clinics'            },
  { icon: Wrench,      label: 'Cleaning Companies' },
  { icon: Building2,   label: 'Contractors'        },
  { icon: TrendingUp,  label: 'Real Estate'        },
  { icon: Users,       label: 'Local Services'     },
]

/*
 * Three water drops hanging from the word — proper teardrop geometry:
 * pointed tip at y=0 (text bottom), widens via bezier, caps with a semicircle.
 * Glossy highlight ellipse on each drop makes them read as liquid.
 * SVG fills the word width so drops spread naturally across "leaks"/"leaking".
 */
function DripDrop() {
  return (
    <svg
      className="absolute left-0 w-full pointer-events-none overflow-visible"
      style={{ top: 'calc(100% - 2px)' }}
      viewBox="0 0 154 42"
      fill="none"
      aria-hidden="true"
    >
      {/* Small drop — just detaching, cx=18 r=6 h=18 */}
      <path
        d="M18,0 C19.2,3.6 24,6 24,12 A6,6 0 0 1 12,12 C12,6 16.8,3.6 18,0 Z"
        fill="#D97706" fillOpacity="0.55"
      />
      <ellipse cx="15" cy="4.5" rx="1.5" ry="2" fill="white" fillOpacity="0.42" transform="rotate(-20 15 4.5)" />

      {/* Medium drop — mid-fall, cx=68 r=9 h=26 */}
      <path
        d="M68,0 C69.8,5.1 77,8.5 77,17 A9,9 0 0 1 59,17 C59,8.5 66.2,5.1 68,0 Z"
        fill="#D97706" fillOpacity="0.78"
      />
      <ellipse cx="64" cy="6.5" rx="2.5" ry="3.5" fill="white" fillOpacity="0.38" transform="rotate(-20 64 6.5)" />

      {/* Large drop — nearly at impact, cx=128 r=12 h=36 */}
      <path
        d="M128,0 C130.4,7.2 140,12 140,24 A12,12 0 0 1 116,24 C116,12 125.6,7.2 128,0 Z"
        fill="#D97706" fillOpacity="0.92"
      />
      <ellipse cx="124" cy="9.5" rx="3.5" ry="5" fill="white" fillOpacity="0.35" transform="rotate(-20 124 9.5)" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white pt-20 md:pt-28 pb-8 overflow-hidden">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

            <div className="flex-none w-full lg:w-[480px] text-center lg:text-left">
              {/* Eyebrow with more voice */}
              <p className="eyebrow mb-5">Something&apos;s leaking.</p>

              <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold font-manrope text-op-primary leading-[1.06] mb-10">
                Find and fix the{' '}
                <span className="relative inline-block text-op-amber">
                  leaks
                  <DripDrop />
                </span>{' '}
                costing you customers.
              </h1>

              <p className="text-base text-op-muted leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Operon scans your business and shows exactly where leads, reviews, and revenue are slipping away.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                <Link href="/scanner" className="btn-primary px-7 py-3.5 text-sm">
                  Scan My Business Free
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm text-op-muted hover:text-op-navy transition-colors underline underline-offset-4"
                >
                  See how it works
                </Link>
              </div>
              <p className="text-xs text-op-muted mt-4 text-center lg:text-left">
                No credit card · Results in 2 minutes · Free for any local service business
              </p>
            </div>

            {/* Slight clockwise tilt — feels placed, not rendered */}
            <div className="flex-1 w-full lg:rotate-1">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ──────────────────────────────────────────── */}
      <section className="bg-white section-pad border-t border-op-border">
        <div className="container-wide">
          <p className="eyebrow mb-4">The Problem</p>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-10">
            The numbers most owners don&apos;t want to think about.
          </h2>
          <div className="flex flex-col gap-12 max-w-3xl">
            {problemStatements.map(({ value, suffix, statement, detail }, i) => (
              <div key={value} className="border-l-[3px] border-op-amber pl-6">
                <span className="text-[11px] font-bold tracking-[0.15em] text-op-amber block mb-2">
                  0{i + 1}
                </span>
                {/* Big amber stat — counts up when scrolled into view */}
                <AnimatedCounter
                  value={value}
                  suffix={suffix}
                  className="text-5xl font-extrabold font-manrope text-op-amber leading-none mb-2 block"
                />
                <p className="text-xl font-semibold font-manrope text-op-primary leading-snug mb-2">
                  {statement}
                </p>
                <p className="text-sm text-op-muted leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCENARIOS — what Operon actually fixes ───────────── */}
      <section className="bg-[#FAFAFA] section-pad border-t border-op-border">
        <div className="container-wide">
          <p className="eyebrow mb-4">What It Fixes</p>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-10">
            Real situations. Real solutions.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                situation: 'A lead fills out your form on a Saturday evening.',
                without:   'You see it Monday. They\'ve already hired someone else.',
                with:      'Operon sends a follow-up in 15 minutes, automatically — while you\'re off the clock.',
              },
              {
                situation: 'A customer is happy with the job. They just didn\'t leave a review.',
                without:   'You forget to ask. The moment passes. Your rating stays flat.',
                with:      'One click sends a personalized review request. They post it that same day.',
              },
              {
                situation: 'You\'re not sure which leads are converting or where they\'re coming from.',
                without:   'You guess. You spend money on ads that may not be working.',
                with:      'Your weekly report shows exactly what ran, what recovered, and what needs attention.',
              },
            ].map(({ situation, without, with: withText }) => (
              <div key={situation} className="card flex flex-col gap-4">
                <p className="text-sm font-semibold text-op-navy leading-snug">{situation}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2.5 bg-red-50 rounded-lg px-3 py-2.5">
                    <span className="text-op-red font-bold text-xs shrink-0 mt-0.5">Without</span>
                    <p className="text-xs text-op-muted leading-relaxed">{without}</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-green-50 rounded-lg px-3 py-2.5">
                    <span className="text-op-green font-bold text-xs shrink-0 mt-0.5">With</span>
                    <p className="text-xs text-op-muted leading-relaxed">{withText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/scanner" className="btn-primary text-sm inline-flex">
              See Where Your Business Leaks <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF — founder photo ─────────────────────── */}
      <section className="bg-white border-y border-op-border py-14">
        <div className="container-wide max-w-2xl">
          <div className="flex items-start gap-5">
            {/* Real founder photo — save image to public/images/founder.jpg */}
            <div className="shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 border-op-border shadow-sm">
              <Image
                src="/images/founder.jpg"
                alt="Leonardo Diaz, Founder of Operon Automation"
                width={96}
                height={96}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="relative flex-1">
              <span
                className="absolute -top-5 -left-1 text-[80px] font-serif leading-none text-op-amber/10 select-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="text-lg font-manrope text-op-primary leading-relaxed mb-3 relative">
                &ldquo;Built this because I watched good businesses lose revenue to problems they didn&apos;t know they had.&rdquo;
              </p>
              <p className="text-sm font-semibold text-op-navy">Leonardo Diaz</p>
              <p className="text-xs text-op-muted">Founder, Operon Automation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVENUE AUTOPILOT ────────────────────────────────── */}
      <section className="bg-white section-pad">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">

            <div className="flex-none w-full lg:w-[440px]">
              <p className="eyebrow mb-4">Revenue Autopilot</p>
              <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-4">
                Scan, identify, and fix leaks automatically.
              </h2>
              <p className="text-sm text-op-muted leading-relaxed mb-6">
                Revenue Autopilot shows your Revenue Leak Score and recommends the exact systems to activate. Agents run in the background so you can focus on your business.
              </p>
              <ul className="flex flex-col gap-2.5 mb-8">
                {autopilotFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-op-body">
                    <CheckCircle2 size={15} className="text-op-green shrink-0" />
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
            </div>

            {/* Leak Score card — distinct from the hero dashboard */}
            <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 pb-6">
              <LeakScoreCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#FAFAFA] section-pad border-y border-op-border">
        <div className="container-wide">
          <p className="eyebrow mb-4">How It Works</p>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-14">
            Scan once. Autopilot handles the rest.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {howSteps.map(({ num, title, desc }, i) => (
              <div key={num} className="flex flex-col">
                {/* "0" grey, digit gets its own color */}
                <span className={`text-[72px] font-extrabold font-manrope leading-none mb-4 select-none inline-block ${numRotations[i]}`}>
                  <span className="text-op-border">0</span>
                  <span className={digitColors[i]}>{num[1]}</span>
                </span>
                <h3 className="text-sm font-semibold text-op-primary mb-2">{title}</h3>
                <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <section className="bg-white section-pad">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">

            <div className="flex-none w-full lg:w-[440px]">
              <p className="eyebrow mb-4">Two Ways to Work Together</p>
              <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-4">
                Self-serve software or done-for-you systems.
              </h2>
              <p className="text-sm text-op-muted leading-relaxed mb-8">
                Start free with Revenue Autopilot and activate agents yourself, or work directly with Operon to build a custom system around your business.
              </p>
              <Link href="/services" className="btn-primary text-sm inline-flex">
                Request Setup Help <ArrowRight size={15} />
              </Link>
            </div>

            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              <div className="card flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-4 block">Software</span>
                <h3 className="font-semibold font-manrope text-op-primary text-sm mb-2">Revenue Autopilot</h3>
                <p className="text-xs text-op-muted leading-relaxed mb-4 flex-1">
                  Scan your business, get a Revenue Leak Score, and activate pre-built agents that run follow-up, reviews, and reactivation automatically.
                </p>
                <Link href="/revenue-autopilot" className="text-xs font-semibold text-op-navy hover:underline inline-flex items-center gap-1">
                  See how it works <ArrowRight size={11} />
                </Link>
              </div>
              <div className="card flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-4 block">Agency</span>
                <h3 className="font-semibold font-manrope text-op-primary text-sm mb-2">Operon Services</h3>
                <p className="text-xs text-op-muted leading-relaxed mb-4 flex-1">
                  Custom CRM setup, multi-step automation, and done-for-you implementation built around your specific workflows and goals.
                </p>
                <Link href="/services" className="text-xs font-semibold text-op-navy hover:underline inline-flex items-center gap-1">
                  See services <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INDUSTRIES ───────────────────────────────────────── */}
      <section className="bg-[#FAFAFA] section-pad border-y border-op-border">
        <div className="container-wide">
          <p className="eyebrow mb-4">Who We Serve</p>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-10">
            Built for local service businesses.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {industries.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                href="/industries"
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-op-border bg-white hover:border-op-navy transition-all group overflow-hidden"
              >
                <Icon size={14} className="text-op-muted group-hover:text-op-navy transition-colors shrink-0" />
                <span className="text-sm text-op-muted group-hover:text-op-navy transition-colors font-medium leading-tight flex-1">
                  {label}
                </span>
                <ArrowRight
                  size={11}
                  className="shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-op-navy transition-all duration-200"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="bg-op-navy section-pad">
        <div className="container-wide max-w-2xl">
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-white leading-tight mb-10">
            Your leaks are costing you right now.{' '}
            <span className="text-op-amber">Find them free.</span>
          </h2>
          <p className="text-white/60 mb-8 text-base">
            Your free Revenue Leak Score shows exactly where customers may be slipping away.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 bg-white text-op-navy font-bold font-inter px-7 py-3.5 rounded-lg text-sm hover:bg-op-bg transition-colors"
          >
            Scan My Business Free <ArrowRight size={15} />
          </Link>
          <p className="mt-4 text-xs text-white/30">No cost. No commitment. Results in under 2 minutes.</p>
        </div>
      </section>
    </>
  )
}
