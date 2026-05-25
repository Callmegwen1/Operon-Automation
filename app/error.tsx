'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={28} className="text-op-red" />
      </div>
      <h1 className="text-2xl font-bold font-manrope text-op-navy mb-2">Something went wrong</h1>
      <p className="text-sm text-op-muted mb-8 max-w-sm">
        An unexpected error occurred. If this keeps happening, reach us at{' '}
        <a href="mailto:ceo@operonauto.com" className="text-op-navy hover:underline">ceo@operonauto.com</a>.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} /> Try Again
        </button>
        <Link href="/dashboard" className="btn-secondary text-sm">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
