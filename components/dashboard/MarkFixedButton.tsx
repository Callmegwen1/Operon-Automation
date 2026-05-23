'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function MarkFixedButton({ leakId, initialFixed }: { leakId: string; initialFixed: boolean }) {
  const [fixed, setFixed] = useState(initialFixed)
  const [loading, setLoading] = useState(false)

  if (fixed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-op-green bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
        <CheckCircle2 size={13} /> Fixed
      </span>
    )
  }

  const handleFix = async () => {
    setLoading(true)
    await fetch('/api/leaks/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leakId }),
    })
    setFixed(true)
    setLoading(false)
  }

  return (
    <button
      onClick={handleFix}
      disabled={loading}
      className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
    >
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : <><CheckCircle2 size={14} /> Mark Fixed</>
      }
    </button>
  )
}
