'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, Loader2, Mail, Star, User, X, ChevronRight,
  Search, AlertTriangle, Upload, List, Kanban, CheckCircle2,
  Smile, Meh, Frown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ContactPipeline from '@/components/dashboard/ContactPipeline'

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

type Satisfaction = 'happy' | 'not_sure' | 'unhappy'
type FilterStatus = 'all' | 'new' | 'contacted' | 'completed' | 'review_requested' | 'lost'
type ViewMode = 'list' | 'pipeline'

const statusColors: Record<string, string> = {
  new:                    'bg-op-navy/10 text-op-navy',
  contacted:              'bg-amber-50 text-op-amber',
  replied:                'bg-amber-50 text-op-amber',
  booked:                 'bg-purple-50 text-purple-600',
  completed:              'bg-green-50 text-op-green',
  won:                    'bg-green-50 text-op-green',
  converted:              'bg-green-50 text-op-green',
  lost:                   'bg-red-50 text-op-red',
  no_response:            'bg-gray-100 text-gray-500',
  inactive:               'bg-gray-100 text-gray-500',
  needs_owner_attention:  'bg-red-50 text-op-red',
  review_requested:       'bg-amber-50 text-op-amber',
  review_completed:       'bg-green-50 text-op-green',
  do_not_contact:         'bg-red-100 text-op-red',
}

const statusLabel: Record<string, string> = {
  new:                    'New',
  contacted:              'Contacted',
  replied:                'Replied',
  booked:                 'Booked',
  completed:              'Completed',
  won:                    'Won',
  converted:              'Converted',
  lost:                   'Lost',
  no_response:            'No Response',
  inactive:               'Inactive',
  needs_owner_attention:  'Needs Attention',
  review_requested:       'Review Requested',
  review_completed:       'Review Received',
  do_not_contact:         'Do Not Contact',
}

const inputClass =
  'w-full border border-op-border rounded-lg px-4 py-2.5 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

const sourceOptions = [
  'Google Search',
  'Google Maps',
  'Referral',
  'Facebook / Instagram',
  'Website Form',
  'Cold Call / Walk-in',
  'Yelp',
  'Other',
]

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  })
}

// ── Satisfaction Modal ──────────────────────────────────────────
function SatisfactionModal({ contact, finalStatus, onConfirm, onCancel, loading }: {
  contact: Contact
  finalStatus: 'completed' | 'won'
  onConfirm: (satisfaction: Satisfaction) => void
  onCancel: () => void
  loading: boolean
}) {
  const [selected, setSelected] = useState<Satisfaction | null>(null)

  const options: { value: Satisfaction; icon: React.ReactNode; label: string; description: string; border: string; bg: string }[] = [
    {
      value: 'happy',
      icon: <Smile size={20} className="text-op-green" />,
      label: 'Happy with the service',
      description: "We'll send a personalized review request — 3-email sequence.",
      border: selected === 'happy' ? 'border-op-green' : 'border-op-border',
      bg: selected === 'happy' ? 'bg-green-50' : 'bg-white',
    },
    {
      value: 'not_sure',
      icon: <Meh size={20} className="text-op-amber" />,
      label: 'Not sure how they feel',
      description: "We'll send private feedback first — no public review request.",
      border: selected === 'not_sure' ? 'border-op-amber' : 'border-op-border',
      bg: selected === 'not_sure' ? 'bg-amber-50' : 'bg-white',
    },
    {
      value: 'unhappy',
      icon: <Frown size={20} className="text-op-red" />,
      label: 'Customer may be unhappy',
      description: "We'll block the review and create a follow-up task for you.",
      border: selected === 'unhappy' ? 'border-op-red' : 'border-op-border',
      bg: selected === 'unhappy' ? 'bg-red-50' : 'bg-white',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-start justify-between p-6 pb-4 border-b border-op-border">
          <div>
            <h2 className="font-bold text-op-navy font-manrope">
              {finalStatus === 'won' ? 'Deal closed — how did it go?' : 'How did the job go?'}
            </h2>
            <p className="text-sm text-op-muted mt-0.5">with {contact.name}</p>
          </div>
          <button onClick={onCancel} className="text-op-muted hover:text-op-navy transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${opt.border} ${opt.bg}`}
            >
              <span className="shrink-0 mt-0.5">{opt.icon}</span>
              <div>
                <p className="text-sm font-semibold text-op-navy">{opt.label}</p>
                <p className="text-xs text-op-muted mt-0.5">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="btn-secondary text-sm flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected || loading}
            className="btn-primary text-sm flex-1 justify-center"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Contact Form ────────────────────────────────────────────
function AddContactForm({ onAdd, onCancel }: {
  onAdd: (contact: Contact) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', type: 'lead' as 'lead' | 'customer', source: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitData, setLimitData] = useState<{ current: number; limit: number; plan: string } | null>(null)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    setLoading(true)
    setError('')
    setLimitData(null)
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      if (data.limitReached === 'contacts') {
        setLimitData({ current: data.current, limit: data.limit, plan: data.plan })
      } else {
        setError(data.error ?? 'Something went wrong')
      }
      setLoading(false)
      return
    }
    onAdd(data.contact)
    setLoading(false)
  }

  const planLabel: Record<string, string> = { starter: 'Starter', growth: 'Growth', pro: 'Pro', free: 'Free' }

  return (
    <div className="card border-2 border-op-navy/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold font-manrope text-op-navy">Add New Contact</h3>
        <button onClick={onCancel} className="text-op-muted hover:text-op-navy transition-colors"><X size={18} /></button>
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
          <select className={inputClass} value={form.source} onChange={(e) => set('source', e.target.value)}>
            <option value="">Select source</option>
            {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
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
        {limitData && (
          <div className="sm:col-span-2 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertTriangle size={15} className="text-op-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-op-amber">
                Contact limit reached — {limitData.current}/{limitData.limit} on your {planLabel[limitData.plan] ?? limitData.plan} plan
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                <Link href="/pricing" className="underline font-semibold hover:text-amber-900">Upgrade your plan →</Link>
                {' '}to add more contacts.
              </p>
            </div>
          </div>
        )}
        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary text-sm px-5 py-2.5">
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Add Contact'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary text-sm px-5 py-2.5">Cancel</button>
        </div>
      </form>
    </div>
  )
}

// ── Limit Banner ─────────────────────────────────────────────────
type LimitData = { limitReached: string; current: number; limit: number; plan: string }
function LimitBanner({ data, onDismiss }: { data: LimitData; onDismiss: () => void }) {
  const planLabel: Record<string, string> = { starter: 'Starter', growth: 'Growth', pro: 'Pro', free: 'Free' }
  const label = planLabel[data.plan] ?? data.plan
  const messages: Record<string, string> = {
    contacts:      `Contact limit reached — ${data.current}/${data.limit} on your ${label} plan`,
    emails:        `Monthly email limit reached on your ${label} plan`,
    agent_actions: `Monthly agent action limit reached on your ${label} plan`,
  }
  const heading = messages[data.limitReached] ?? `Plan limit reached on your ${label} plan`
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
      <AlertTriangle size={16} className="text-op-amber shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-op-amber">{heading}</p>
        <p className="text-xs text-amber-700 mt-0.5">
          <Link href="/pricing" className="underline font-semibold hover:text-amber-900">Upgrade your plan →</Link>
          {' '}to unlock more capacity.
        </p>
      </div>
      <button onClick={onDismiss} className="text-op-amber hover:text-amber-700 transition-colors shrink-0 mt-0.5">
        <X size={15} />
      </button>
    </div>
  )
}

// ── Contact Row ─────────────────────────────────────────────────
function ContactRow({ contact, onMarkDone, onReviewRequest, sending, completing }: {
  contact: Contact
  onMarkDone: (contact: Contact, finalStatus: 'completed' | 'won') => void
  onReviewRequest: (contact: Contact) => void
  sending: boolean
  completing: boolean
}) {
  const doneStatuses = ['completed', 'won', 'converted', 'lost', 'do_not_contact', 'review_requested', 'review_completed']
  const isDone = doneStatuses.includes(contact.status)
  const busy = sending || completing

  return (
    <div className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="w-9 h-9 rounded-full bg-op-bg flex items-center justify-center shrink-0">
        <User size={16} className="text-op-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/dashboard/contacts/${contact.id}`} className="font-semibold text-op-navy text-sm hover:text-op-navy/70 transition-colors">
            {contact.name}
          </Link>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${contact.type === 'lead' ? 'bg-op-navy/10 text-op-navy' : 'bg-purple-50 text-purple-600'}`}>
            {contact.type === 'lead' ? 'Lead' : 'Customer'}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[contact.status] ?? 'bg-gray-50 text-op-muted'}`}>
            {statusLabel[contact.status] ?? contact.status}
          </span>
        </div>
        <div className="flex gap-3 mt-0.5 flex-wrap">
          {contact.email && <p className="text-xs text-op-muted">{contact.email}</p>}
          {contact.phone && <p className="text-xs text-op-muted">{contact.phone}</p>}
          {contact.source && <p className="text-xs text-op-muted">via {contact.source}</p>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0 flex-wrap">
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <Mail size={12} /> Email
          </a>
        )}
        {/* Mark Done / Won — available until job is finished */}
        {!isDone && (
          <div className="flex flex-col items-end gap-0.5">
            <button
              onClick={() => onMarkDone(contact, 'completed')}
              disabled={completing}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              {completing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Mark Done
            </button>
            <button
              onClick={() => onMarkDone(contact, 'won')}
              disabled={completing}
              className="text-[10px] text-op-muted hover:text-op-green transition-colors px-1"
            >
              Won deal ↑
            </button>
          </div>
        )}
        {/* Manual review request for completed contacts with email */}
        {contact.email && isDone && contact.status !== 'review_requested' && contact.status !== 'review_completed' && (
          <button onClick={() => onReviewRequest(contact)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
            Review
          </button>
        )}
        <Link href={`/dashboard/contacts/${contact.id}`} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all',              label: 'All'              },
  { value: 'new',              label: 'New'              },
  { value: 'contacted',        label: 'Contacted'        },
  { value: 'completed',        label: 'Completed'        },
  { value: 'review_requested', label: 'Review Requested' },
  { value: 'lost',             label: 'Lost'             },
]

export default function ContactsPage() {
  const [contacts, setContacts]           = useState<Contact[]>([])
  const [loading, setLoading]             = useState(true)
  const [showAdd, setShowAdd]             = useState(false)
  const [sending, setSending]             = useState<string | null>(null)
  const [completingContact, setCompletingContact] = useState<Contact | null>(null)
  const [completingFinalStatus, setCompletingFinalStatus] = useState<'completed' | 'won'>('completed')
  const [satisfactionLoading, setSatisfactionLoading] = useState(false)
  const [sentMsg, setSentMsg]             = useState('')
  const [filter, setFilter]               = useState<FilterStatus>('all')
  const [search, setSearch]               = useState('')
  const [view, setView]                   = useState<ViewMode>('list')
  const [importing, setImporting]         = useState(false)
  const [importResult, setImportResult]   = useState<{ count: number } | null>(null)
  const [importError, setImportError]     = useState('')
  const [importFollowup, setImportFollowup] = useState(false)
  const [importReview, setImportReview]   = useState(false)
  const [showImportOptions, setShowImportOptions] = useState(false)
  const [upgradeRequired, setUpgradeRequired] = useState<LimitData | null>(null)
  const [sentError, setSentError]         = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
      setContacts((data as Contact[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = (contact: Contact) => {
    setContacts((prev) => [contact, ...prev])
    setShowAdd(false)
  }

  // Step 1: user clicks "Mark Done" or "Won Deal" → show satisfaction modal
  const handleMarkDone = (contact: Contact, finalStatus: 'completed' | 'won' = 'completed') => {
    setCompletingFinalStatus(finalStatus)
    setCompletingContact(contact)
  }

  // Step 2: user picks satisfaction → call complete + review-request
  const handleSatisfactionConfirm = async (satisfaction: Satisfaction) => {
    if (!completingContact) return
    setSatisfactionLoading(true)
    setSentMsg('')

    const contact = completingContact

    // Mark contact as completed or won
    const completeRes = await fetch(`/api/contacts/${contact.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalStatus: completingFinalStatus }),
    })
    const completeData = await completeRes.json()

    if (!completeRes.ok) {
      setSatisfactionLoading(false)
      setCompletingContact(null)
      setSentError(completeData.error ?? 'Failed to update contact')
      setTimeout(() => setSentError(''), 5000)
      return
    }

    // Update local state
    setContacts((prev) => prev.map((c) =>
      c.id === contact.id ? { ...c, status: completingFinalStatus, type: 'customer' } : c
    ))

    // If review system is enabled, trigger review flow
    if (completeData.reviewSystemEnabled) {
      const reviewRes = await fetch(`/api/contacts/${contact.id}/review-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ satisfaction }),
      })
      const reviewData = await reviewRes.json()

      if (reviewRes.ok) {
        if (reviewData.action === 'review_sequence_started') {
          setContacts((prev) => prev.map((c) =>
            c.id === contact.id ? { ...c, status: 'review_requested' } : c
          ))
          setSentMsg(`${contact.name} marked complete — review sequence started!`)
        } else if (reviewData.action === 'private_feedback') {
          setSentMsg(`${contact.name} marked complete — private feedback request sent.`)
        } else if (reviewData.action === 'blocked') {
          setSentMsg(`${contact.name} marked complete — review blocked, follow-up task created.`)
        }
      } else {
        if (reviewData.limitReached) {
          setUpgradeRequired({ limitReached: reviewData.limitReached, current: reviewData.current, limit: reviewData.limit, plan: reviewData.plan })
          setSentMsg(`${contact.name} marked complete.`)
        } else {
          setSentMsg(`${contact.name} marked complete.${reviewData.error ? ` (${reviewData.error})` : ''}`)
        }
      }
    } else {
      setSentMsg(`${contact.name} marked as complete.`)
    }

    setSatisfactionLoading(false)
    setCompletingContact(null)
    setTimeout(() => setSentMsg(''), 7000)
  }

  const handleReviewRequest = async (contact: Contact) => {
    setSending(contact.id)
    setSentMsg('')
    const res = await fetch(`/api/contacts/${contact.id}/review-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ satisfaction: 'happy' }),
    })
    const data = await res.json()
    setSending(null)
    if (res.ok) {
      setContacts((prev) => prev.map((c) =>
        c.id === contact.id ? { ...c, status: 'review_requested' } : c
      ))
      setSentMsg(`Review request sent to ${contact.name}!`)
      setTimeout(() => setSentMsg(''), 5000)
    } else if (data.limitReached) {
      setUpgradeRequired({ limitReached: data.limitReached, current: data.current, limit: data.limit, plan: data.plan })
    } else {
      setSentError(data.error ?? 'Failed to send review request')
      setTimeout(() => setSentError(''), 5000)
    }
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    setShowImportOptions(false)
    const text = await file.text()
    const rows = parseCSV(text)
    const res = await fetch('/api/contacts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, triggerFollowup: importFollowup, triggerReview: importReview }),
    })
    const data = await res.json()
    if (res.ok) {
      setImportResult({ count: data.imported })
      const supabase = createClient()
      const { data: fresh } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
      setContacts((fresh as Contact[]) ?? [])
      setTimeout(() => setImportResult(null), 6000)
    } else if (data.limitReached) {
      setUpgradeRequired({ limitReached: data.limitReached, current: data.current, limit: data.limit, plan: data.plan })
    } else {
      setImportError(data.error ?? 'Import failed. Please check your CSV and try again.')
      setTimeout(() => setImportError(''), 6000)
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const staleNewContacts = contacts.filter(
    (c) => c.status === 'new' && new Date(c.created_at) < sevenDaysAgo
  )

  const filtered = contacts
    .filter((c) => {
      if (filter === 'all') return true
      if (filter === 'completed') return ['completed', 'won', 'converted'].includes(c.status)
      return c.status === filter
    })
    .filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q)
    })

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-op-muted" size={24} />
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      {/* Satisfaction modal */}
      {completingContact && (
        <SatisfactionModal
          contact={completingContact}
          finalStatus={completingFinalStatus}
          onConfirm={handleSatisfactionConfirm}
          onCancel={() => setCompletingContact(null)}
          loading={satisfactionLoading}
        />
      )}

      <div className={view === 'pipeline' ? 'max-w-5xl' : 'max-w-2xl'}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-manrope text-op-navy">Contacts</h1>
            <p className="text-sm text-op-muted mt-0.5">{contacts.length} total · {contacts.filter(c => c.status === 'new').length} new</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View toggle */}
            <div className="flex border border-op-border rounded-lg overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  view === 'list' ? 'bg-op-navy text-white' : 'bg-white text-op-muted hover:text-op-navy'
                }`}
              >
                <List size={13} /> List
              </button>
              <button
                onClick={() => setView('pipeline')}
                className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors border-l border-op-border ${
                  view === 'pipeline' ? 'bg-op-navy text-white' : 'bg-white text-op-muted hover:text-op-navy'
                }`}
              >
                <Kanban size={13} /> Pipeline
              </button>
            </div>
            {/* CSV import */}
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
            />
            <div className="relative">
              <button
                onClick={() => setShowImportOptions((v) => !v)}
                disabled={importing}
                className="btn-secondary text-sm flex items-center gap-1.5"
              >
                {importing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                Import CSV
              </button>
              {showImportOptions && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-op-border rounded-xl shadow-lg p-4 z-20">
                  <p className="text-xs font-bold text-op-navy mb-3">Import Options</p>
                  <label className="flex items-start gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={importFollowup}
                      onChange={(e) => setImportFollowup(e.target.checked)}
                      className="mt-0.5 accent-op-navy shrink-0"
                    />
                    <div>
                      <p className="text-xs font-semibold text-op-navy">Send follow-up sequence</p>
                      <p className="text-xs text-op-muted mt-0.5">
                        If Lead Recovery Autopilot is enabled, imported leads will receive the follow-up sequence.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={importReview}
                      onChange={(e) => setImportReview(e.target.checked)}
                      className="mt-0.5 accent-op-navy shrink-0"
                    />
                    <div>
                      <p className="text-xs font-semibold text-op-navy">Send review requests to customers</p>
                      <p className="text-xs text-op-muted mt-0.5">
                        If Review Growth System is enabled, imported customers will receive the 3-email review sequence.
                      </p>
                    </div>
                  </label>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="btn-primary text-xs w-full justify-center"
                  >
                    Choose CSV File
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
              <Plus size={15} /> Add Contact
            </button>
          </div>
        </div>

        {/* Needs follow-up alert */}
        {staleNewContacts.length > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <AlertTriangle size={16} className="text-op-amber shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-op-amber">
                {staleNewContacts.length} contact{staleNewContacts.length > 1 ? 's' : ''} need{staleNewContacts.length === 1 ? 's' : ''} follow-up
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {staleNewContacts.slice(0, 3).map(c => c.name).join(', ')}
                {staleNewContacts.length > 3 ? ` and ${staleNewContacts.length - 3} more` : ''}
                {' '}— still &ldquo;New&rdquo; after 7 days.{' '}
                <button onClick={() => setFilter('new')} className="underline font-semibold hover:text-amber-900 transition-colors">
                  View them
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Plan limit banner */}
        {upgradeRequired && (
          <LimitBanner data={upgradeRequired} onDismiss={() => setUpgradeRequired(null)} />
        )}

        {/* Import success */}
        {importResult && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm text-op-green font-semibold">
            <CheckCircle2 size={15} />
            {importResult.count} contact{importResult.count !== 1 ? 's' : ''} imported successfully.
          </div>
        )}

        {/* Import error */}
        {importError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-op-red font-semibold">
            <AlertTriangle size={15} />
            {importError}
          </div>
        )}

        {/* Action success feedback */}
        {sentMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-op-green font-semibold">
            {sentMsg}
          </div>
        )}

        {/* Action error feedback */}
        {sentError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-op-red font-semibold">
            <AlertTriangle size={15} />
            {sentError}
          </div>
        )}

        {showAdd && <AddContactForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />}

        {/* Pipeline view */}
        {view === 'pipeline' ? (
          <ContactPipeline initialContacts={contacts} />
        ) : (
          <>
            {/* Search */}
            {contacts.length > 0 && (
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-op-muted pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or phone…"
                  className="w-full border border-op-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white"
                />
              </div>
            )}

            {/* Filter tabs */}
            {contacts.length > 0 && (
              <div className="flex gap-1 mb-4 flex-wrap">
                {FILTERS.map(({ value, label }) => {
                  const count = value === 'all'
                    ? contacts.length
                    : value === 'completed'
                    ? contacts.filter(c => ['completed', 'won', 'converted'].includes(c.status)).length
                    : contacts.filter(c => c.status === value).length
                  return (
                    <button
                      key={value}
                      onClick={() => setFilter(value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === value
                          ? 'bg-op-navy text-white'
                          : 'bg-op-bg text-op-muted hover:bg-op-border hover:text-op-navy'
                      }`}
                    >
                      {label} {count > 0 && <span className="opacity-70">({count})</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {filtered.length === 0 && !showAdd ? (
              <div className="card py-10">
                {filter === 'all' ? (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-op-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User size={24} className="text-op-muted" />
                    </div>
                    <p className="font-bold text-op-navy mb-1">No contacts yet</p>
                    <p className="text-sm text-op-muted mb-6 max-w-xs mx-auto">
                      Add your leads and customers here — Operon agents will follow up with them automatically.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => setShowImportOptions(true)}
                        className="btn-secondary text-sm flex items-center gap-1.5"
                      >
                        <Upload size={14} /> Import CSV
                      </button>
                      <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-1.5">
                        <Plus size={14} /> Add Manually
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-semibold text-op-navy mb-1">No matching contacts</p>
                    <p className="text-sm text-op-muted">No contacts with this status yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((c) => (
                  <ContactRow
                    key={c.id}
                    contact={c}
                    onMarkDone={handleMarkDone}
                    onReviewRequest={handleReviewRequest}
                    sending={sending === c.id}
                    completing={completingContact?.id === c.id && satisfactionLoading}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
