'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const ACTION_LABELS: Record<string, string> = {
  booked:           'Marked as Booked',
  won:              'Marked as Won',
  completed:        'Marked as Completed',
  lost:             'Marked as Lost',
  do_not_contact:   'Added to Do Not Contact',
  needs_followup:   'Flagged for Follow-Up',
  cancel_sequence:  'Email Sequence Cancelled',
  estimate_accepted:'Estimate Accepted',
  estimate_lost:    'Estimate Lost',
}

const STATUS_CONFIG: Record<string, { icon: string; title: string; color: string }> = {
  done:      { icon: '✓', title: 'Done',          color: 'text-green-400' },
  expired:   { icon: '⏱', title: 'Link expired',  color: 'text-yellow-400' },
  invalid:   { icon: '✗', title: 'Invalid link',   color: 'text-red-400' },
  not_found: { icon: '?', title: 'Not found',      color: 'text-red-400' },
  error:     { icon: '!', title: 'Something went wrong', color: 'text-red-400' },
}

function QuickActionContent() {
  const params = useSearchParams()
  const status = params.get('status') ?? 'invalid'
  const action = params.get('action') ?? ''

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.invalid
  const actionLabel = ACTION_LABELS[action] ?? 'Action completed'

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className={`text-6xl font-bold ${cfg.color}`}>{cfg.icon}</div>

        <div>
          <h1 className="text-2xl font-semibold text-white">{cfg.title}</h1>
          {status === 'done' && (
            <p className="mt-2 text-gray-400">{actionLabel}</p>
          )}
          {status === 'expired' && (
            <p className="mt-2 text-gray-400">
              This link expired after 14 days. Open the contact in your dashboard to update manually.
            </p>
          )}
          {(status === 'invalid' || status === 'not_found') && (
            <p className="mt-2 text-gray-400">
              This link is not valid. It may have already been used or was malformed.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-2 text-gray-400">
              Something went wrong on our end. Try again from your dashboard.
            </p>
          )}
        </div>

        <Link
          href="/dashboard"
          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function QuickActionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    }>
      <QuickActionContent />
    </Suspense>
  )
}
