'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Star, Mail, Trash2, Bot, BarChart2, CheckCircle2, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  type: 'lead' | 'customer'
  status: string
  source: string
  notes: string
  created_at: string
}

interface Activity {
  id: string
  agent_type: string
  action: string
  details: Record<string, string>
  created_at: string
}

const statusOptions = ['new', 'contacted', 'converted', 'lost']

const statusColors: Record<string, string> = {
  new:       'bg-op-navy/10 text-op-navy border-op-navy/20',
  contacted: 'bg-amber-50 text-op-amber border-amber-200',
  converted: 'bg-green-50 text-op-green border-green-200',
  lost:      'bg-red-50 text-op-red border-red-200',
}

function activityLabel(a: Activity): string {
  const d = a.details ?? {}
  if (a.action === 'review_request_sent')      return 'Review request sent'
  if (a.action === 'lead_followup_scheduled')  return `Follow-up sequence started (email ${d.email_number ?? '1'})`
  return a.action.replace(/_/g, ' ')
}

function AgentIcon({ type }: { type: string }) {
  if (type === 'review_request') return <Star size={14} className="text-op-amber" />
  if (type === 'lead_followup')  return <Mail size={14} className="text-op-navy" />
  if (type === 'weekly_report')  return <BarChart2 size={14} className="text-op-green" />
  return <Bot size={14} className="text-op-muted" />
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const inputClass =
  'w-full border border-op-border rounded-lg px-4 py-2.5 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sendingReview, setSendingReview] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')
  const [converting, setConverting] = useState(false)
  const [convertMsg, setConvertMsg] = useState('')
  const [status, setStatus]     = useState('')
  const [notes, setNotes]       = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: c }, { data: acts }] = await Promise.all([
        supabase.from('contacts').select('*').eq('id', id).single(),
        supabase
          .from('agent_activity')
          .select('*')
          .filter('details->>contact_id', 'eq', id)
          .order('created_at', { ascending: false }),
      ])
      if (!c) { router.push('/dashboard/contacts'); return }
      setContact(c as Contact)
      setStatus(c.status)
      setNotes(c.notes ?? '')
      setActivity((acts ?? []) as Activity[])
      setLoading(false)
    }
    load()
  }, [id, router])

  const handleSave = async () => {
    if (!contact) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('contacts').update({ status, notes }).eq('id', id)
    setContact((c) => c ? { ...c, status, notes } : c)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('contacts').delete().eq('id', id)
    router.push('/dashboard/contacts')
  }

  const handleReviewRequest = async () => {
    setSendingReview(true)
    setReviewMsg('')
    const res = await fetch(`/api/contacts/${id}/review-request`, { method: 'POST' })
    const data = await res.json()
    setSendingReview(false)
    setReviewMsg(res.ok ? 'Review request sent!' : (data.error ?? 'Failed to send'))
    setTimeout(() => setReviewMsg(''), 4000)
  }

  const handleConvert = async () => {
    setConverting(true)
    setConvertMsg('')
    const res = await fetch(`/api/contacts/${id}/convert`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setContact((c) => c ? { ...c, status: 'converted', type: 'customer' } : c)
      setStatus('converted')
      setConvertMsg(data.reviewSent ? 'Converted! Review request sent automatically.' : 'Contact marked as converted.')
    } else {
      setConvertMsg(data.error ?? 'Something went wrong')
    }
    setConverting(false)
    setTimeout(() => setConvertMsg(''), 5000)
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-op-muted" size={24} />
      </main>
    )
  }

  if (!contact) return null

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      <div className="max-w-2xl">
        {/* Back */}
        <Link href="/dashboard/contacts" className="inline-flex items-center gap-1.5 text-sm text-op-muted hover:text-op-navy transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Contacts
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-manrope text-op-navy">{contact.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${contact.type === 'lead' ? 'bg-op-navy/10 text-op-navy border-op-navy/20' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                {contact.type === 'lead' ? 'Lead' : 'Customer'}
              </span>
              {contact.source && (
                <span className="text-xs text-op-muted">via {contact.source}</span>
              )}
              <span className="text-xs text-op-muted">
                Added {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
                <Mail size={12} /> Email
              </a>
            )}
            {contact.email && (
              <button
                onClick={handleReviewRequest}
                disabled={sendingReview}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                {sendingReview ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
                Review
              </button>
            )}
            {contact.type === 'lead' && contact.status !== 'converted' && (
              <button
                onClick={handleConvert}
                disabled={converting}
                className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                {converting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                Mark Converted
              </button>
            )}
          </div>
        </div>

        {reviewMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-op-green font-semibold">
            {reviewMsg}
          </div>
        )}

        {convertMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-op-green font-semibold flex items-center gap-2">
            <CheckCircle2 size={14} /> {convertMsg}
          </div>
        )}

        {/* Their message from form */}
        {contact.notes && contact.source === 'Website Form' && (
          <div className="card border-l-4 border-l-op-navy mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-op-navy" />
              <h2 className="text-sm font-bold text-op-navy">Their Message</h2>
            </div>
            <p className="text-sm text-op-body leading-relaxed">{contact.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="card">
            <h2 className="text-sm font-bold text-op-navy mb-4">Contact Info</h2>
            <div className="flex flex-col gap-3 text-sm">
              {contact.email && (
                <div>
                  <p className="text-xs text-op-muted mb-0.5">Email</p>
                  <p className="text-op-body">{contact.email}</p>
                </div>
              )}
              {contact.phone && (
                <div>
                  <p className="text-xs text-op-muted mb-0.5">Phone</p>
                  <p className="text-op-body">{contact.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status + notes (editable) */}
          <div className="card">
            <h2 className="text-sm font-bold text-op-navy mb-4">Status & Notes</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-op-navy mb-1.5">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                        status === s
                          ? (statusColors[s] ?? 'bg-op-navy text-white border-op-navy')
                          : 'bg-white text-op-muted border-op-border hover:border-op-navy'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-op-navy mb-1.5">Notes</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Add notes about this contact..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`btn-primary text-xs px-4 py-2 self-start ${saved ? 'bg-op-green' : ''}`}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? '✓ Saved' : <><Save size={13} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>

        {/* Activity timeline */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-op-navy mb-4">Agent Activity</h2>
          {activity.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-sm text-op-muted">No agent activity for this contact yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activity.map((a) => (
                <div key={a.id} className="card py-3 px-4 flex items-start gap-3">
                  <span className="shrink-0 mt-0.5"><AgentIcon type={a.agent_type} /></span>
                  <div className="flex-1">
                    <p className="text-sm text-op-body">{activityLabel(a)}</p>
                    <p className="text-xs text-op-muted mt-0.5">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="mt-8 pt-6 border-t border-op-border">
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-op-red font-semibold">Delete {contact.name}? This cannot be undone.</p>
              <button
                onClick={handleDelete}
                className="text-xs font-semibold text-white bg-op-red px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-op-muted hover:text-op-navy transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 text-xs text-op-muted hover:text-op-red transition-colors"
            >
              <Trash2 size={13} /> Delete this contact
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
