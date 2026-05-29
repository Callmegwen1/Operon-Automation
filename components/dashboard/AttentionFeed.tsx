'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface StaleContact { id: string; name: string; email: string | null; created_at: string }
interface ColdContact  { id: string; name: string; email: string | null; updated_at: string }

export default function AttentionFeed({
  initialNewLeads,
  initialColdContacts,
}: {
  initialNewLeads: StaleContact[]
  initialColdContacts: ColdContact[]
}) {
  const [newLeads, setNewLeads] = useState(initialNewLeads)
  const [coldContacts, setColdContacts] = useState(initialColdContacts)
  const [dismissing, setDismissing] = useState<string | null>(null)

  const markDone = async (id: string, type: 'new' | 'cold') => {
    setDismissing(id)
    try {
      await fetch(`/api/contacts/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalStatus: 'completed' }),
      })
      if (type === 'new') setNewLeads((prev) => prev.filter((c) => c.id !== id))
      else setColdContacts((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setDismissing(null)
    }
  }

  if (newLeads.length === 0 && coldContacts.length === 0) return null

  return (
    <div className="card border-2 border-op-amber/30 bg-amber-50/20 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-op-amber animate-pulse" />
        <h2 className="text-sm font-bold text-op-navy">Needs your attention</h2>
      </div>
      <div className="flex flex-col gap-2">
        {newLeads.map((c) => (
          <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl border border-op-border px-4 py-3">
            <Link href={`/dashboard/contacts/${c.id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
              <p className="text-sm font-semibold text-op-navy truncate">{c.name}</p>
              <p className="text-xs text-op-amber font-medium">New lead — no follow-up yet</p>
            </Link>
            <button
              onClick={() => markDone(c.id, 'new')}
              disabled={dismissing === c.id}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0"
            >
              {dismissing === c.id
                ? <Loader2 size={11} className="animate-spin" />
                : <CheckCircle2 size={11} />}
              Done
            </button>
          </div>
        ))}
        {coldContacts.map((c) => {
          const days = Math.floor((Date.now() - new Date(c.updated_at).getTime()) / 86400000)
          return (
            <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl border border-op-border px-4 py-3">
              <Link href={`/dashboard/contacts/${c.id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
                <p className="text-sm font-semibold text-op-navy truncate">{c.name}</p>
                <p className="text-xs text-op-muted">Contacted {days}d ago — no update</p>
              </Link>
              <button
                onClick={() => markDone(c.id, 'cold')}
                disabled={dismissing === c.id}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0"
              >
                {dismissing === c.id
                  ? <Loader2 size={11} className="animate-spin" />
                  : <CheckCircle2 size={11} />}
                Done
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
