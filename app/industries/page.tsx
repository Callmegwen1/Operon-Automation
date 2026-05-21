import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Home, Sparkles, Car, Dumbbell, Smile, Stethoscope,
  Wrench, Building2, TrendingUp, Users, ArrowRight,
} from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

export const metadata: Metadata = {
  title: 'Industries We Serve | Operon Automation',
  description:
    'Revenue recovery and automation systems for home services, med spas, auto shops, fitness studios, dental offices, clinics, contractors, and more.',
}

const industries = [
  {
    icon: Home,
    name: 'Home Services',
    leaks: ['Missed calls from homeowners', 'Estimates sent, never followed up', 'No review system after jobs', 'Unpaid invoices sitting open', 'No customer reactivation for repeat jobs'],
    how: 'Operon auto-responds to missed calls, follows up on quotes, collects reviews after each job, sends invoice reminders, and reactivates past homeowners.',
  },
  {
    icon: Sparkles,
    name: 'Med Spas & Aesthetics',
    leaks: ['New inquiry forms not followed up fast', 'No rebooking sequence after treatments', 'Slow review collection', 'Ad spend not tied to booked appointments', 'Membership cancellations not rescued'],
    how: 'Fast lead follow-up, automated rebooking reminders, review requests after each visit, and ad-to-booking tracking.',
  },
  {
    icon: Car,
    name: 'Auto Shops',
    leaks: ['Estimates never responded to', 'No follow-up after repairs for repeat service', 'Slow or no review requests', 'Calls missed during busy hours', 'No seasonal service reminders'],
    how: 'Estimate follow-up, service reminder sequences, missed call recovery, and automated review requests after each job.',
  },
  {
    icon: Dumbbell,
    name: 'Fitness Studios',
    leaks: ['Trial signups that go cold', 'No re-engagement for members who stop attending', 'Membership renewals not auto-reminded', 'No review collection', 'Lead inquiries not followed up'],
    how: 'Trial-to-member conversion sequences, attendance-based re-engagement, renewal reminders, and review automation.',
  },
  {
    icon: Smile,
    name: 'Dental Offices',
    leaks: ['No-shows not recovered', 'New patient forms not followed up', 'Missing Google review requests', 'Lapsed patients not reactivated', 'Insurance followup gaps'],
    how: 'Appointment reminders, no-show recovery, new patient follow-up, review requests post-visit, and lapsed patient reactivation.',
  },
  {
    icon: Stethoscope,
    name: 'Clinics & Healthcare',
    leaks: ['Missed calls from patients', 'No follow-up for patient inquiries', 'Low review presence', 'Old patients not contacted for annual visits', 'Slow intake follow-up'],
    how: 'Missed call recovery, intake follow-up automation, review requests, and patient reactivation for annual or recurring visits.',
  },
  {
    icon: Wrench,
    name: 'Cleaning Companies',
    leaks: ['New quote requests not followed up', 'No recurring booking reminders', 'Weak review system', 'Missed calls from prospective clients', 'No reactivation for past clients'],
    how: 'Quote follow-up within minutes, recurring booking reminders, review automation after each clean, and past-client reactivation.',
  },
  {
    icon: Building2,
    name: 'Contractors',
    leaks: ['Estimates sitting without follow-up', 'Seasonal demand not captured', 'No referral system', 'Poor Google review presence', 'Unpaid invoices dragging on'],
    how: 'Multi-touch estimate follow-up, review collection after project completion, invoice reminders, and referral request automation.',
  },
  {
    icon: TrendingUp,
    name: 'Real Estate Teams',
    leaks: ['Leads from portals not followed up fast enough', 'Old leads going cold in the pipeline', 'Weak review and testimonial system', 'No source tracking across portals', 'No past-client reactivation'],
    how: 'Instant lead response to Zillow/Realtor inquiries, pipeline follow-up sequences, past client reactivation, and review automation.',
  },
  {
    icon: Users,
    name: 'Local Service Businesses',
    leaks: ['Inconsistent lead follow-up', 'No review system', 'Manual admin slowing the team down', 'Old customers not re-engaged', 'Untracked ad spend'],
    how: 'Operon\'s Autopilot Agents handle follow-up, reviews, invoices, and reactivation — so your team focuses on the work.',
  },
]

export default function IndustriesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-op-bg section-pad">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <SectionHeader
            eyebrow="Industries"
            title="Revenue recovery systems for"
            titleHighlight="local businesses."
            description="Operon is built for the businesses that run your community — home services, healthcare, fitness, auto, and more. Every industry has its own leaks. We help you find and fix yours."
            center
          />
        </div>
      </section>

      {/* Industry cards */}
      <section className="section-pad bg-white pt-0">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industries.map(({ icon: Icon, name, leaks, how }) => (
              <div key={name} className="card-hover">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-op-bg flex items-center justify-center">
                    <Icon size={22} className="text-op-navy" />
                  </div>
                  <h2 className="text-lg font-bold font-manrope text-op-navy">{name}</h2>
                </div>

                <div className="mb-5">
                  <p className="text-xs font-semibold text-op-amber uppercase tracking-wide mb-3">Common Revenue Leaks</p>
                  <ul className="flex flex-col gap-2">
                    {leaks.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-sm text-op-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-op-amber mt-1.5 shrink-0" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-op-green uppercase tracking-wide mb-1.5">How Operon Helps</p>
                  <p className="text-xs text-op-body leading-relaxed">{how}</p>
                </div>

                <Link href="/scanner" className="btn-primary text-xs px-4 py-2 inline-flex">
                  Scan My {name} Business <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-op-blue text-white">
        <div className="container-wide text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold font-manrope mb-5">
            Don't see your industry? We still help.
          </h2>
          <p className="text-lg text-white/70 mb-8">
            If you run a local or service business, you almost certainly have revenue leaks. The scanner works for any business. Try it free.
          </p>
          <Link href="/scanner" className="inline-flex items-center gap-2 bg-white text-op-blue font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors">
            Scan My Business Free <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}
