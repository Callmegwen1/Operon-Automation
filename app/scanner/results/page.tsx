import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Loader2 } from 'lucide-react'
import ResultsDisplay from '@/components/scanner/ResultsDisplay'

export const metadata: Metadata = {
  title: 'Your Revenue Leak Score | Operon Automation',
  description: 'See your Revenue Leak Score and the top areas where your business may be losing customers.',
  robots: 'noindex',
}

export default function ResultsPage() {
  return (
    <section className="section-pad bg-op-bg min-h-screen">
      <div className="container-wide">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold font-manrope text-op-navy mb-3">
            Your Revenue Leak Score
          </h1>
          <p className="text-op-muted max-w-lg mx-auto">
            Based on your answers, here are the top areas where your business may be losing customers — and what to fix first.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-24">
              <Loader2 size={28} className="animate-spin text-op-blue" />
            </div>
          }
        >
          <ResultsDisplay />
        </Suspense>
      </div>
    </section>
  )
}
