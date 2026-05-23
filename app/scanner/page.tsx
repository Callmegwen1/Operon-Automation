import type { Metadata } from 'next'
import { AlertTriangle, Clock, Shield } from 'lucide-react'
import ScannerForm from '@/components/scanner/ScannerForm'

export const metadata: Metadata = {
  title: 'Free Revenue Leak Scanner | Operon Automation',
  description:
    'Get your free Revenue Leak Score. Answer a few questions about your business and Operon will show where customers may be slipping away.',
}

export default function ScannerPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-op-navy text-white py-14">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-op-amber/20 border border-op-amber/30 rounded-full px-4 py-1.5 text-xs font-semibold text-op-amber mb-5">
            <AlertTriangle size={12} /> Free Revenue Leak Scanner
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-manrope leading-tight mb-5">
            Get your free Revenue Leak Score.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Answer a few questions about your website, leads, follow-up, reviews, and marketing. Operon will show where customers may be slipping away.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock size={14} className="text-white/40" /> Under 2 minutes
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Shield size={14} className="text-white/40" /> No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-op-border shadow-card p-6 sm:p-8">
            <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Tell us about your business</h2>
            <p className="text-sm text-op-muted mb-8">
              Your answers help us identify the most likely revenue leaks in your specific business.
            </p>
            <ScannerForm />
          </div>

          <p className="text-center text-xs text-op-muted mt-6 max-w-md mx-auto">
            Your score is based on available information and your answers. Revenue Leak Scores are informational only. Operon does not guarantee specific financial results, revenue increases, or customer acquisition outcomes.
          </p>
        </div>
      </section>
    </>
  )
}
