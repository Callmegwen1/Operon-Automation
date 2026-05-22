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

export const metadata: Metadata = {
  title: 'Operon Automation | Revenue Recovery for Small Businesses',
  description:
    'Find and fix the leaks costing your business customers. Operon helps small businesses recover missed leads, grow reviews, and automate follow-up.',
}

/* Stat-anchored problem statements */
const problemStatements = [
  {
    stat: '78%',
    statement: 'of businesses never follow up on a missed call.',
    detail: 'Every unanswered call is a lead that calls your competitor next. The first to follow up wins the job.',
  },
  {
    stat: '21×',
    statement: 'more likely to convert if you respond within 5 minutes.',
    detail: 'Speed matters more than most owners realize. After an hour, that lead has already moved on.',
  },
  {
    stat: '5×',
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

/* "0" stays grey — the digit gets its own color */
const digitColors = [
  'text-op-amber',
  'text-op-navy',
  'text-op-green',
  'text-op-amber',
  'text-op-navy',
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

/* Proper teardrop SVG — reads as drip, not dots */
function DripDrop() {
  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2 -bottom-5"
      width="13"
      height="17"
      viewBox="0 0 13 17"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 0 C10 4.5 13 9.5 6.5 17 C0 9.5 3 4.5 6.5 0Z"
        fill="#D97706"
        fillOpacity="0.75"
      />
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

              <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold font-manrope text-op-primary leading-[1.06] mb-7">
                Find and fix the{' '}
                <span className="relative inline-block text-op-amber pb-5">
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
          <p className="eyebrow mb-10">The Problem</p>
          <div className="flex flex-col gap-12 max-w-3xl">
            {problemStatements.map(({ stat, statement, detail }, i) => (
              <div key={stat} className="border-l-[3px] border-op-amber pl-6">
                <span className="text-[11px] font-bold tracking-[0.15em] text-op-amber block mb-2">
                  0{i + 1}
                </span>
                {/* Big amber stat anchors every problem visually */}
                <p className="text-5xl font-extrabold font-manrope text-op-amber leading-none mb-2">
                  {stat}
                </p>
                <p className="text-xl font-semibold font-manrope text-op-primary leading-snug mb-2">
                  {statement}
                </p>
                <p className="text-sm text-op-muted leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF — founder photo ─────────────────────── */}
      <section className="bg-[#FAFAFA] border-y border-op-border py-14">
        <div className="container-wide max-w-2xl">
          <div className="flex items-start gap-5">
            {/* Real founder photo — save image to public/images/founder.jpg */}
            <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-op-border shadow-sm">
              <Image
                src="/images/founder.jpg"
                alt="Leonardo Diaz, Founder of Operon Automation"
                width={64}
                height={64}
                className="w-full h-full object-cover object-top"
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

            {/* Counter-clockwise tilt — mirrors hero */}
            <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 lg:-rotate-1">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#FAFAFA] section-pad border-y border-op-border">
        <div className="container-wide">
          <p className="eyebrow mb-4">How It Works</p>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-14">
            Five steps. Fully automatic.
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
              <p className="eyebrow mb-4">Operon Services</p>
              <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-op-primary leading-tight mb-4">
                Need a custom system?
              </h2>
              <p className="text-sm text-op-muted leading-relaxed mb-8">
                Use Revenue Autopilot for self-serve revenue recovery, or work with Operon Services for custom automation built around your specific business.
              </p>
              <Link href="/services" className="btn-primary text-sm inline-flex">
                Request Setup Help <ArrowRight size={15} />
              </Link>
            </div>

            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Revenue Autopilot',
                  desc: 'Self-serve. Scan your business, see your score, and activate automation systems yourself.',
                  badge: 'Software',
                },
                {
                  title: 'Operon Services',
                  desc: 'Done-for-you. Custom systems built around your specific business workflows and goals.',
                  badge: 'Agency',
                },
              ].map(({ title, desc, badge }) => (
                <div key={title} className="card">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-op-muted mb-4 block">
                    {badge}
                  </span>
                  <h3 className="font-semibold font-manrope text-op-primary text-sm mb-2">{title}</h3>
                  <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
                </div>
              ))}
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
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold font-manrope text-white leading-tight mb-4">
            Ready to see where your business is{' '}
            <span className="relative inline-block text-op-amber pb-4">
              leaking
              <DripDrop />
            </span>{' '}
            revenue?
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
