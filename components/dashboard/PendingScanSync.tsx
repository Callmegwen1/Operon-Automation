'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, X } from 'lucide-react'

export default function PendingScanSync() {
  const router = useRouter()
  const [banner, setBanner] = useState(false)

  useEffect(() => {
    const pendingId = localStorage.getItem('operon_pending_scan_id')
    if (!pendingId) return

    const raw = localStorage.getItem(`scan_${pendingId}`)
    localStorage.removeItem('operon_pending_scan_id')
    if (!raw) return

    let scanData: unknown
    try { scanData = JSON.parse(raw) } catch { return }

    fetch('/api/scanner/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanData }),
    })
      .then((r) => {
        if (r.ok) {
          setBanner(true)
          router.refresh()
        }
      })
      .catch(() => {})
  }, [router])

  if (!banner) return null

  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 mx-6 mt-6 md:mx-8 md:mt-8">
      <CheckCircle2 size={16} className="text-op-green shrink-0" />
      <p className="text-sm font-semibold text-op-green flex-1">
        Your scan results have been saved to your dashboard!
      </p>
      <button onClick={() => setBanner(false)} className="text-op-muted hover:text-op-navy transition-colors shrink-0">
        <X size={15} />
      </button>
    </div>
  )
}
