import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Zap,
  Settings,
  Phone,
  Database,
  Search,
  Globe,
  Star,
  Users,
  BarChart2,
  Puzzle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

export const metadata: Metadata = {
  title: 'Services | Operon Automation',
  description:
    'Custom automation and marketing systems built around your business. CRM setup, lead follow-up, ad tracking, review automation, and done-for-you workflows.',
}

const services = [
  { icon: Settings,   title: 'Business Process Automation',     desc: 'Map and automate the manual tasks that slow your team down — from intake to invoicing.' },
  { icon: Zap,        title: 'AI Workflow Automation',           desc: 'Layer intelligent automation into your existing workflows without disrupting how you work.' },
  { icon: Phone,      title: 'Lead Follow-Up Systems',           desc: 'Custom multi-channel follow-up sequences that respond instantly and stay persistent.' },
  { icon: Database,   title: 'CRM Setup & Configuration',        desc: 'Choose, set up, and configure the right CRM for your business with automations pre-loaded.' },
  { icon: Search,     title: 'Revenue Leak Audits',              desc: 'A deep audit of your business systems to find every place customers and revenue slip through.' },
  { icon: BarChart2,  title: 'Ad Tracking & Reporting',          desc: 'End-to-end tracking from ad click to closed sale, so you know exactly what is working.' },
  { icon: Globe,      title: 'Website & Landing Page Systems',   desc: 'Conversion-focused pages and funnels designed to capture and convert local traffic.' },
  { icon: Star,       title: 'Review Automation',                desc: 'Automated review request systems that build your reputation on Google, Yelp, and more.' },
  { icon: Users,      title: 'Customer Reactivation Campaigns',  desc: 'Done-for-you campaigns that bring back past customers who haven\'t returned in months.' },
  { icon: BarChart2,  title: 'Data Dashboards',                  desc: 'Custom reporting dashboards that give you a clear view of your business performance.' },
  { icon: Puzzle,     title: 'Custom Integrations',              desc: 'Connect your tools — CRM, scheduling software, POS, phone system, and more.' },
]

const examples = [
  { title: 'Missed Call Recovery System',     desc: 'Auto-text every missed call within 60 seconds, capture the lead, and route it to the right person.' },
  { title: 'Estimate-to-Invoice Pipeline',    desc: 'Automated follow-up from estimate sent → approved → invoiced → paid, with reminders at every stage.' },
  { title: 'Review Growth Campaign',          desc: 'Request reviews at the right moment, route positive reviews to Google, and handle negative feedback privately.' },
  { title: 'New Customer Welcome Flow',       desc: 'Onboard new customers with a branded welcome sequence that sets expectations and asks for a referral.' },
  { title: '90-Day Reactivation Sequence',    desc: 'Identify customers who haven\'t booked in 90 days and bring them back with a targeted offer.' },
  { title: 'Multi-Location Revenue Dashboard', desc: 'See leads, revenue, reviews, and ad performance across all locations in one view.' },
]

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-op-bg section-pad">
        <div className="container-wide max-w-3xl mx-auto text-center">
          <span className="badge-green mb-5 inline-flex">
            <Settings size={12} /> Operon Services
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-manrope text-op-navy leading-tight mb-5">
            Custom automation and marketing systems built around your business.
          </h1>
          <p className="text-lg text-op-muted leading-relaxed mb-8">
            Use Revenue Autopilot for self-serve revenue recovery, or work with Operon Services when your business needs a deeper custom system.
          </p>
          <Link href="/contact" className="btn-primary px-8 py-4 text-base">
            Request Setup Help <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="What We Build"
              title="Everything your business needs to run"
              titleHighlight="smarter."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover">
                <div className="w-11 h-11 rounded-xl bg-op-bg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-op-blue" />
                </div>
                <h3 className="font-semibold font-manrope text-op-navy mb-2">{title}</h3>
                <p className="text-sm text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Autopilot vs Services comparison */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="Which Is Right for You?"
              title="Revenue Autopilot vs. Operon Services"
              center
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="card border-2 border-op-border">
              <span className="badge-blue mb-4 inline-flex">Revenue Autopilot</span>
              <h3 className="font-bold font-manrope text-op-navy mb-3">Self-serve. Start today.</h3>
              <ul className="flex flex-col gap-3 mb-6">
                {[
                  'Get started in minutes',
                  'Pre-built Autopilot Agents',
                  'Revenue Leak Scanner included',
                  'Weekly Owner Report',
                  'Best for businesses ready to activate pre-built systems',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-op-body">
                    <CheckCircle2 size={14} className="text-op-blue mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/scanner" className="btn-primary w-full justify-center">
                Start with Free Scanner
              </Link>
            </div>

            <div className="card border-2 border-op-green">
              <span className="badge-green mb-4 inline-flex">Operon Services</span>
              <h3 className="font-bold font-manrope text-op-navy mb-3">Done-for-you. Custom-built.</h3>
              <ul className="flex flex-col gap-3 mb-6">
                {[
                  'Custom workflow design',
                  'CRM setup and configuration',
                  'Integrations with your existing tools',
                  'Multi-location or complex setups',
                  'Best for businesses that need it built for them',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-op-body">
                    <CheckCircle2 size={14} className="text-op-green mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="btn-primary w-full justify-center bg-op-green hover:bg-green-700">
                Request Setup Help
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Example systems */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="Example Systems"
              title="Real systems we build for real"
              titleHighlight="businesses."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {examples.map(({ title, desc }) => (
              <div key={title} className="card-hover bg-op-bg border border-op-border">
                <h3 className="font-semibold font-manrope text-op-navy text-sm mb-2">{title}</h3>
                <p className="text-xs text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-op-navy text-white">
        <div className="container-wide text-center max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold font-manrope mb-5">
            Ready to build your system?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Tell us about your business and we will recommend the right starting point — Revenue Autopilot, a custom service, or both.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-op-navy font-bold px-7 py-4 rounded-lg hover:bg-op-bg transition-colors">
              Request Setup Help <ArrowRight size={17} />
            </Link>
            <Link href="/scanner" className="btn-outline-white px-7 py-4">
              Start with Free Scanner
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
