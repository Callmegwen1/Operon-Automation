'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Mail, Star, User, X } from 'lucide-react'
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

const statusColors: Record<string, string> = {
  new:       'bg-blue-50 text-op-blue',
  contacted: 'bg-amber-50 text-op-amber',
  converted: 'bg-green-50 text-op-green',
  lost:      'bg-red-50 text-op-red',
}

const inputClass =
  'w-full border border-op-border rounded-lg px-4 py-2.5 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white'

function AddContactForm({ onAdd, onCancel }: {
  onAdd: (contact: Contact) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', type: 'lead' as 'lead' | 'customer', source: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    onAdd(data.contact)
    setLoading(false)
  }

  return (
    <div className="card border-2 border-op-blue/30 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold font-manrope text-op-navy">Add New Contact</h3>
        <button onClick={onCancel} className="text-op-muted hover:text-op-navy transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-op-navy mb-1">Name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Smith" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-op-navy mb-1">Email</label>
          <input type="email" className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="john@email.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-op-navy mb-1">Phone</label>
          <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 000-0000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-op-navy mb-1">Type</label>
          <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="lead">Lead</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-op-navy mb-1">Source</label>
          <input className={inputClass} value={form.source} onChange={(e) => set('source', e.target.value)} placeholder="Google, Referral, etc." />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-op-navy mb-1">Notes</label>
          <input className={inputClass} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes..." />
        </div>

        {error && (
          <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <p className="text-sm text-op-red">{error}</p>
          </div>
        )}

        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary text-sm px-5 py-2.5">
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Add Contact'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary text-sm px-5 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function ContactRow({ contact, onReviewRequest }: {
  contact: Contact
  onReviewRequest: (contact: Contact) => void
}) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-op-bg flex items-center justify-center shrink-0">
        <User size={16} className="text-op-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-op-navy text-sm">{contact.name}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${contact.type === 'lead' ? 'bg-blue-50 text-op-blue' : 'bg-purple-50 text-purple-600'}`}>
            {contact.type === 'lead' ? 'Lead' : 'Customer'}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[contact.status] ?? 'bg-gray-50 text-op-muted'}`}>
            {contact.status}
          </span>
        </div>
        <div className="flex gap-3 mt-0.5 flex-wrap">
          {contact.email && <p className="text-xs text-op-muted">{contact.email}</p>}
          {contact.phone && <p className="text-xs text-op-muted">{contact.phone}</p>}
          {contact.source && <p className="text-xs text-op-muted">via {contact.source}</p>}
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        {contact.type === 'lead' && contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Mail size={12} /> Email
          </a>
        )}
        {contact.email && (
          <button
            onClick={() => onReviewRequest(contact)}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Star size={12} /> Review Request
          </button>
        )}
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [sentMsg, setSentMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
      setContacts((data as Contact[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = (contact: Contact) => {
    setContacts((prev) => [contact, ...prev])
    setShowAdd(false)
  }

  const handleReviewRequest = async (contact: Contact) => {
    setSending(contact.id)
    setSentMsg('')
    const res = await fetch(`/api/contacts/${contact.id}/review-request`, { method: 'POST' })
    const data = await res.json()
    setSending(null)
    setSentMsg(res.ok ? `Review request sent to ${contact.name}!` : (data.error ?? 'Failed to send'))
    setTimeout(() => setSentMsg(''), 5000)
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-op-muted" size={24} />
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-manrope text-op-navy">Contacts</h1>
            <p className="text-sm text-op-muted mt-0.5">Manage your leads and customers.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            <Plus size={15} /> Add Contact
          </button>
        </div>

        {sentMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-op-green font-semibold">
            {sentMsg}
          </div>
        )}

        {showAdd && <AddContactForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />}

        {contacts.length === 0 && !showAdd ? (
          <div className="card text-center py-12">
            <User size={32} className="text-op-muted mx-auto mb-3" />
            <p className="font-semibold text-op-navy mb-1">No contacts yet</p>
            <p className="text-sm text-op-muted mb-4">Add your first lead or customer to get started.</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm mx-auto">
              <Plus size={14} /> Add First Contact
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contacts.map((c) => (
              <div key={c.id} className={sending === c.id ? 'opacity-60 pointer-events-none' : ''}>
                <ContactRow contact={c} onReviewRequest={handleReviewRequest} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
