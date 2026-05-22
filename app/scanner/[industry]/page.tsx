import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AlertTriangle, Clock, Shield } from 'lucide-react'
import ScannerForm from '@/components/scanner/ScannerForm'

const INDUSTRY_MAP: Record<string, { industry: string; headline: string; sub: string }> = {
  'home-services': {
    industry: 'Home Services',
    headline: 'Find out where your home service business is losing revenue.',
    sub: 'Most home service companies miss 60–70% of potential revenue through slow follow-up and weak review loops.',
  },
  'cleaning': {
    industry: 'Cleaning Company',
    headline: 'Discover how many cleaning clients you\'re losing — and why.',
    sub: 'Cleaning companies using automated review requests earn 2× more Google reviews in 90 days.',
  },
  'trades': {
    industry: 'Contractor / Trades',
    headline: 'See how many estimates are slipping away unanswered.',
    sub: 'Contractors who follow up on estimates within 2 days win 38% more jobs than those who wait.',
  },
  'auto-shop': {
    industry: 'Auto Shop',
    headline: 'Find out where your auto shop is leaving money on the table.',
    sub: 'Auto shops with automated reminders reduce no-shows by up to 70% and recover more repeat customers.',
  },
  'med-spa': {
    industry: 'Med Spa / Aesthetics',
    headline: 'See how many med spa appointments you\'re missing.',
    sub: 'Med spas that respond to inquiries within 1 hour book 5× more appointments than those who wait.',
  },
  'fitness': {
    industry: 'Fitness Studio',
    headline: 'Find out how many members you\'re losing — and how to bring them back.',
    sub: 'Studios using reactivation campaigns recover 22% of churned clients within 30 days.',
  },
  'dental': {
    industry: 'Dental Office',
    headline: 'See where your dental practice is losing patients.',
    sub: 'Dental offices with automated recall reminders fill 35% more open appointment slots.',
  },
  'clinic': {
    industry: 'Clinic / Healthcare',
    headline: 'Identify revenue leaks in your clinic or healthcare practice.',
    sub: 'Clinics using automated follow-up see 29% higher patient retention scores.',
  },
  'real-estate': {
    industry: 'Real Estate',
    headline: 'See how many real estate leads are slipping through the cracks.',
    sub: 'Agents who follow up within 5 minutes are 21× more likely to convert an online lead.',
  },
  'restaurant': {
    industry: 'Restaurant / Food Service',
    headline: 'Find out where your restaurant is losing loyal customers.',
    sub: 'Restaurants that actively collect reviews grow 3.7× faster on Google Maps.',
  },
}

export async function generateMetadata(
  { params }: { params: { industry: string } }
): Promise<Metadata> {
  const entry = INDUSTRY_MAP[params.industry]
  if (!entry) return {}
  return {
    title: `Free Revenue Leak Scanner for ${entry.industry} | Operon Automation`,
    description: entry.sub,
  }
}

export function generateStaticParams() {
  return Object.keys(INDUSTRY_MAP).map((industry) => ({ industry }))
}

export default function IndustryScannerPage({ params }: { params: { industry: string } }) {
  const entry = INDUSTRY_MAP[params.industry]
  if (!entry) notFound()

  return (
    <>
      <section className="bg-op-navy text-white py-14">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-op-amber/20 border border-op-amber/30 rounded-full px-4 py-1.5 text-xs font-semibold text-op-amber mb-5">
            <AlertTriangle size={12} /> {entry.industry} Revenue Leak Scanner
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-manrope leading-tight mb-5">
            {entry.headline}
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">{entry.sub}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock size={14} className="text-white/40" /> Under 2 minutes
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Shield size={14} className="text-white/40" /> No credit card required
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <AlertTriangle size={14} className="text-white/40" /> Informational only
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-op-border shadow-card p-6 sm:p-8">
            <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Tell us about your {entry.industry.toLowerCase()} business</h2>
            <p className="text-sm text-op-muted mb-8">
              Your answers help us identify the most likely revenue leaks in your specific situation.
            </p>
            <ScannerForm defaultIndustry={entry.industry} />
          </div>
          <p className="text-center text-xs text-op-muted mt-6 max-w-md mx-auto">
            Revenue Leak Scores are informational only. Operon does not guarantee specific financial results, revenue increases, or customer acquisition outcomes.
          </p>
        </div>
      </section>
    </>
  )
}
