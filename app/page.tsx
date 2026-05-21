import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Phone,
  Clock,
  Star,
  FileText,
  DollarSign,
  BarChart2,
  Users,
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
} from 'lucide-react'
import DashboardMockup from '@/components/dashboard/DashboardMockup'
import SectionHeader from '@/components/ui/SectionHeader'

export const metadata: Metadata = {
  title: 'Operon Automation | Revenue Recovery Systems for Small Businesses',
  description:
    'Find and fix the leaks costing your business customers. Operon helps small businesses recover missed leads, improve follow-up, grow reviews, and automate the work that slips through the cracks.',
}

const leakCards = [
  {
    icon: Phone,
    color: 'text-op-amber',
    bg: 'bg-amber-50 border-amber-200',
    title: 'Missed Calls',
    desc: 'Every unanswered call is a lead that calls your competitor next. Most businesses never follow up.',
  },
  {
    icon: Clock,
    color: 'text-op-red',
    bg: 'bg-red-50 border-red-200',
    title: 'Slow Lead Follow-Up',
    desc: 'Speed is everything. Leads contacted within 5 minutes are 21x more likely to convert.',
  },
  {
    icon: FileText,
    color: 'text-op-amber',
    bg: 'bg-amber-50 border-amber-200',
    title: 'No Quote Follow-Up',
    desc: 'Estimates sent and forgotten. A simple follow-up system can recover a significant portion of these.',
  },
  {
    icon: Star,
    color: 'text-op-blue',
    bg: 'bg-blue-50 border-blue-200',
    title: 'Weak Review System',
    desc: 'Businesses with strong reviews get chosen first. Not asking for reviews is leaving trust on the table.',
  },
  {
    icon: DollarSign,
    color: 'text-op-red',
    bg: 'bg-red-50 border-red-200',
    title: 'Unpaid Invoices',
    desc: 'Work done, money owed. Automated reminders collect faster without awkward manual follow-ups.',
  },
  {
    icon: BarChart2,
    color: 'text-op-muted',
    bg: 'bg-slate-50 border-slate-200',
    title: 'Untracked Ad Spend',
    desc: 'Running ads without knowing which ones bring real customers means spending on guesswork.',
  },
  {
    icon: Users,
    color: 'text-op-green',
    bg: 'bg-green-50 border-green-200',
    title: 'Lost Past Customers',
    desc: "Your best lead is someone who already trusted you. Old customers who've gone quiet can be reactivated.",
  },
]

const howSteps = [
  { num: '01', title: 'Scan your business', desc: 'Answer a few questions about your leads, follow-up, reviews, and marketing.' },
  { num: '02', title: 'See your revenue leaks', desc: 'Get a Revenue Leak Score and a clear view of where customers may be slipping away.' },
  { num: '03', title: 'Activate recommended fixes', desc: 'Revenue Autopilot recommends simple systems. Activate the ones that fit your business.' },
  { num: '04', title: 'Recover missed opportunities', desc: 'Automated follow-up, review requests, and reactivation campaigns run on your behalf.' },
  { num: '05', title: 'Get a weekly owner report', desc: 'See what is running, what recovered, and what needs attention — every week.' },
]

const industries = [
  { icon: Home,      label: 'Home Services'    },
  { icon: Sparkles,  label: 'Med Spas'         },
  { icon: Car,       label: 'Auto Shops'        },
  { icon: Dumbbell,  label: 'Fitness Studios'   },
  { icon: Smile,     label: 'Dental Offices'    },
  { icon: Stethoscope, label: 'Clinics'         },
  { icon: Wrench,    label: 'Cleaning Companies'},
  { icon: Building2, label: 'Contractors'       },
  { icon: TrendingUp, label: 'Real Estate Teams'},
  { icon: Users,     label: 'Local Services'    },
]

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="bg-op-bg pt-16 pb-0 overflow-hidden">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-op-amber animate-pulse" />
                <span className="text-xs font-semibold text-op-amber">Revenue Leak Scanner — Free</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-manrope text-op-navy leading-[1.1] mb-6">
                Find and fix the{' '}
                <span className="text-op-amber underline decoration-wavy decoration-amber-300 underline-offset-4">
                  leaks
                </span>{' '}
                costing your business customers.
              </h1>

              <p className="text-lg text-op-muted leading-relaxed mb-8">
                Operon helps small businesses recover missed leads, improve follow-up, grow reviews, track revenue leaks, and automate the work that usually slips through the cracks.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/scanner" className="btn-primary px-7 py-3.5 text-base">
                  Scan My Business Free
                  <ArrowRight size={17} />
                </Link>
                <Link href="/services" className="btn-secondary px-7 py-3.5 text-base">
                  See Services
                </Link>
              </div>

              <p className="mt-5 text-xs text-op-muted">
                No credit card required &middot; Results in under 2 minutes
              </p>
            </div>

            {/* Right: Dashboard */}
            <div className="flex-1 w-full max-w-md lg:max-w-none pb-0 px-4 lg:px-0 lg:pt-8">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ──────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <SectionHeader
              eyebrow="The Problem"
              title="Your business may be losing customers in places"
              titleHighlight="you cannot see."
              description="Most businesses do not only need more leads. They need to stop losing the leads they already get. Missed calls, slow follow-up, weak reviews, unpaid invoices, untracked ads, and old customers slipping away — these are revenue leaks."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leakCards.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className={`card-hover border ${bg}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-semibold font-manrope text-op-navy text-sm mb-2">{title}</h3>
                <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVENUE AUTOPILOT PREVIEW ────────────────────────── */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-lg">
              <SectionHeader
                eyebrow="Revenue Autopilot"
                title="Scan, identify, and fix the leaks automatically."
                description="Revenue Autopilot scans your business, shows you a Revenue Leak Score, and recommends the exact systems to activate. Each agent runs on autopilot so you can focus on running your business."
              />
              <ul className="mt-8 flex flex-col gap-3">
                {[
                  'Revenue Leak Dashboard with clear visibility',
                  'Automated lead follow-up and call recovery',
                  'Review request and reputation system',
                  'Estimate and invoice follow-up agents',
                  'Weekly Owner Report — what ran, what recovered',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-op-green mt-0.5 shrink-0" />
                    <span className="text-sm text-op-body">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Link href="/revenue-autopilot" className="btn-primary">
                  Learn More <ChevronRight size={16} />
                </Link>
                <Link href="/scanner" className="btn-secondary">
                  Scan Free
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVENUE LEAK SCANNER PREVIEW ────────────────────── */}
      <section className="section-pad bg-op-navy text-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeader
              eyebrow="Free Tool"
              title="Get your free Revenue Leak"
              titleHighlight="Score."
              description="Answer a few questions about your website, leads, follow-up, reviews, and marketing. Operon will show where customers may be slipping away — no cost, no commitment."
              center
              light
            />
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/scanner" className="btn-primary px-8 py-4 text-base">
                Get Your Free Score
                <ArrowRight size={18} />
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/40">
              Results in under 2 minutes. No credit card. No guaranteed revenue claims.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SERVICES PREVIEW ─────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-lg">
              <SectionHeader
                eyebrow="Operon Services"
                title="Need a deeper custom system?"
                description="Use Revenue Autopilot for self-serve revenue recovery, or work with Operon Services for custom automation and marketing systems built around your specific business."
              />
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  'CRM setup & automation',
                  'Custom lead follow-up',
                  'Marketing systems',
                  'Revenue dashboards',
                  'Ad tracking & reporting',
                  'Done-for-you workflows',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-op-green shrink-0" />
                    <span className="text-sm text-op-body">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/services" className="btn-primary mt-8 inline-flex">
                Request Setup Help <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { icon: Users, title: 'Revenue Autopilot', desc: 'Self-serve. Scan, score, and activate systems yourself.', badge: 'Software', badgeColor: 'badge-blue' },
                { icon: Wrench, title: 'Operon Services', desc: 'Done-for-you. Custom systems built with you.', badge: 'Agency', badgeColor: 'badge-green' },
              ].map(({ icon: Icon, title, desc, badge, badgeColor }) => (
                <div key={title} className="card-hover col-span-1">
                  <span className={`${badgeColor} mb-4 inline-flex`}>{badge}</span>
                  <Icon size={24} className="text-op-navy mb-3" />
                  <h3 className="font-semibold font-manrope text-op-navy text-sm mb-2">{title}</h3>
                  <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="text-center mb-14">
            <SectionHeader
              eyebrow="How It Works"
              title="Simple steps to stop the"
              titleHighlight="leaks."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {howSteps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                {i < howSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+28px)] w-full h-px bg-op-border" />
                )}
                <div className="w-10 h-10 rounded-full bg-op-blue text-white flex items-center justify-center font-bold font-manrope text-sm mb-4 shrink-0 z-10">
                  {num}
                </div>
                <h3 className="font-semibold font-manrope text-op-navy text-sm mb-2">{title}</h3>
                <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INDUSTRIES ───────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="Who We Serve"
              title="Built for local and service"
              titleHighlight="businesses."
              center
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {industries.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                href="/industries"
                className="card-hover flex flex-col items-center gap-3 py-6 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-op-bg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <Icon size={22} className="text-op-muted group-hover:text-op-blue transition-colors" />
                </div>
                <span className="text-xs font-semibold text-op-body group-hover:text-op-blue transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="section-pad bg-op-blue text-white">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold font-manrope leading-tight mb-5">
            Ready to see where your business is leaking revenue?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Your free Revenue Leak Score shows the top areas where customers may be slipping away — and what to fix first.
          </p>
          <Link href="/scanner" className="inline-flex items-center gap-2 bg-white text-op-blue font-bold font-inter px-8 py-4 rounded-lg text-base hover:bg-blue-50 transition-colors">
            Scan My Business Free <ArrowRight size={18} />
          </Link>
          <p className="mt-4 text-sm text-white/50">
            No cost. No commitment. Results in under 2 minutes.
          </p>
        </div>
      </section>
    </>
  )
}
