'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  type: 'lead' | 'customer'
  status: string
  source: string
  created_at: string
}

const COLUMNS: { key: string; label: string; color: string; bg: string }[] = [
  { key: 'new',       label: 'New',       color: 'text-op-navy',  bg: 'bg-op-navy/10'  },
  { key: 'contacted', label: 'Contacted', color: 'text-op-amber', bg: 'bg-amber-100'   },
  { key: 'converted', label: 'Converted', color: 'text-op-green', bg: 'bg-green-100'   },
  { key: 'lost',      label: 'Lost',      color: 'text-op-red',   bg: 'bg-red-100'     },
]

export default function ContactPipeline({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const move = async (contactId: string, newStatus: string) => {
    setContacts((prev) =>
      prev.map((c) => c.id === contactId ? { ...c, status: newStatus } : c)
    )
    const supabase = createClient()
    await supabase.from('contacts').update({ status: newStatus }).eq('id', contactId)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('contactId', id)
    setDragging(id)
  }

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('contactId')
    if (id) move(id, colKey)
    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {COLUMNS.map(({ key, label, color, bg }) => {
        const col = contacts.filter((c) => c.status === key)
        const isOver = dragOver === key
        return (
          <div
            key={key}
            onDragOver={(e) => { e.preventDefault(); setDragOver(key) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, key)}
            className={`rounded-xl border-2 transition-colors min-h-[200px] ${
              isOver ? 'border-op-navy/30 bg-op-navy/5' : 'border-op-border bg-op-bg'
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-op-border">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${bg.replace('bg-', 'bg-').replace('/10', '')} ${color}`} />
                <span className={`text-xs font-bold ${color}`}>{label}</span>
              </div>
              <span className="text-xs text-op-muted font-semibold">{col.length}</span>
            </div>

            {/* Cards */}
            <div className="p-2 flex flex-col gap-1.5">
              {col.map((contact) => (
                <div
                  key={contact.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, contact.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`bg-white rounded-lg border border-op-border p-2.5 cursor-grab active:cursor-grabbing transition-opacity ${
                    dragging === contact.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-op-navy truncate">{contact.name}</p>
                      {contact.email && (
                        <p className="text-[10px] text-op-muted truncate mt-0.5">{contact.email}</p>
                      )}
                      {contact.source && (
                        <p className="text-[10px] text-op-muted/70 mt-0.5">via {contact.source}</p>
                      )}
                    </div>
                    <Link href={`/dashboard/contacts/${contact.id}`} className="shrink-0 text-op-muted hover:text-op-navy transition-colors">
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
              {col.length === 0 && (
                <div className="flex items-center justify-center py-6">
                  <p className="text-xs text-op-muted/60">Drop here</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
