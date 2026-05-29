'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Star, Mail, Trash2, Bot, BarChart2,
  CheckCircle2, AlertTriangle, MessageSquare, Smile, Meh, Frown, X, FileText,
  Copy, Check, Phone,
} from 'lucide-react'
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

interface AgentMessage {
  id: string
  agent_type: string
  subject: string | null
  channel: string
  status: string
  sent_at: string
  template_id: string | null
}

type TimelineEntry =
  | { kind: 'activity'; data: Activity }
  | { kind: 'message';  data: AgentMessage }

type Satisfaction = 'happy' | 'not_sure' | 'unhappy'

const statusOptions = [
  'new', 'contacted', 'replied', 'booked',
  'completed', 'won', 'lost', 'no_response',
  'needs_owner_attention', 'inactive',
  'review_requested', 'review_completed', 'do_not_contact',
]

const statusColors: Record<string, string> = {
  new:                    'bg-op-navy/10 text-op-navy border-op-navy/20',
  contacted:              'bg-amber-50 text-op-amber border-amber-200',
  replied:                'bg-amber-50 text-op-amber border-amber-200',
  booked:                 'bg-purple-50 text-purple-600 border-purple-200',
  completed:              'bg-green-50 text-op-green border-green-200',
  won:                    'bg-green-50 text-op-green border-green-200',
  converted:              'bg-green-50 text-op-green border-green-200',
  lost:                   'bg-red-50 text-op-red border-red-200',
  no_response:            'bg-gray-100 text-gray-500 border-gray-200',
  inactive:               'bg-gray-100 text-gray-500 border-gray-200',
  needs_owner_attention:  'bg-red-50 text-op-red border-red-200',
  review_requested:       'bg-amber-50 text-op-amber border-amber-200',
  review_completed:       'bg-green-50 text-op-green border-green-200',
  do_not_contact:         'bg-red-100 text-op-red border-red-300',
}

const statusLabel: Record<string, string> = {
  new:                   'New',
  contacted:             'Contacted',
  replied:               'Replied',
  booked:                'Booked',
  completed:             'Completed',
  won:                   'Won',
  converted:             'Converted',
  lost:                  'Lost',
  no_response:           'No Response',
  inactive:              'Inactive',
  needs_owner_attention: 'Needs Attention',
  review_requested:      'Review Requested',
  review_completed:      'Review Received',
  do_not_contact:        'Do Not Contact',
}

function activityLabel(a: Activity): string {
  const d = a.details ?? {}
  if (a.action === 'review_request_sent')              return 'Review request sent (3-email sequence)'
  if (a.action === 'private_feedback_sent')             return 'Private feedback request sent'
  if (a.action === 'review_blocked_unhappy_customer')   return 'Review blocked — follow-up task created'
  if (a.action === 'lead_followup_scheduled')           return `Follow-up sequence started (email ${d.email_number ?? '1'})`
  if (a.action === 'reactivation_email_sent')           return 'Reactivation email sent'
  if (a.action === 'estimate_sent')                     return 'Estimate email sent'
  return a.action.replace(/_/g, ' ')
}

function messageLabel(m: AgentMessage): string {
  const tid = m.template_id ?? ''
  if (tid === 'estimate_day0')           return 'Estimate sent — Day 0'
  if (tid === 'estimate_day1')           return 'Estimate follow-up sent — Day 1'
  if (tid === 'estimate_day3')           return 'Estimate follow-up sent — Day 3'
  if (tid === 'reactivation_winback')    return 'Reactivation email sent'
  if (tid.startsWith('review_request'))  return 'Review request sent'
  if (tid.startsWith('review_reminder')) return 'Review reminder sent'
  if (tid === 'private_feedback')        return 'Private feedback request sent'
  if (m.agent_type === 'lead_followup')  return m.subject ? `Follow-up email: "${m.subject}"` : 'Follow-up email sent'
  return m.subject ? `Email sent: "${m.subject}"` : 'Email sent'
}

function timelineTime(e: TimelineEntry): number {
  return new Date(e.kind === 'activity' ? e.data.created_at : e.data.sent_at).getTime()
}

function TimelineIcon({ entry }: { entry: TimelineEntry }) {
  if (entry.kind === 'message') return <Mail size={14} className="text-op-navy" />
  const type = entry.data.agent_type
  if (type === 'review_request') return <Star size={14} className="text-op-amber" />
  if (type === 'lead_followup')  return <Mail size={14} className="text-op-navy" />
  if (type === 'weekly_report')  return <BarChart2 size={14} className="text-op-green" />
  return <Bot size={14} className="text-op-muted" />
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

const AVATAR_COLORS = [
  'bg-op-navy', 'bg-purple-600', 'bg-op-green', 'bg-op-amber',
  'bg-rose-500', 'bg-cyan-600',  'bg-indigo-500',
]
function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initial = name.trim()[0]?.toUpperCase() ?? '?'
  const color   = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
  return (
    <div className={`${size === 'lg' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-sm'} ${color} text-white rounded-full flex items-center justify-center font-bold shrink-0`}>
      {initial}
    </div>
  )
}

// ── Satisfaction Modal ────────────────────────────────────────
function SatisfactionModal({ contactName, finalStatus, onConfirm, onCancel, loading }: {
  contactName: string
  finalStatus: 'completed' | 'won'
  onConfirm: (satisfaction: Satisfaction) => void
  onCancel: () => void
  loading: boolean
}) {
  const [selected, setSelected] = useState<Satisfaction | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selected && !loading) onConfirm(selected)
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, loading, onConfirm, onCancel])

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
            <p className="text-sm text-op-muted mt-0.5">with {contactName}</p>
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

function EstimateModal({ contactName, onConfirm, onCancel, loading }: {
  contactName: string
  onConfirm: (amount: string) => void
  onCancel: () => void
  loading: boolean
}) {
  const [amount, setAmount] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading) onConfirm(amount)
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [amount, loading, onConfirm, onCancel])

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-start justify-between p-6 pb-4 border-b border-op-border">
          <div>
            <h2 className="font-bold text-op-navy font-manrope">Send Estimate to {contactName}</h2>
            <p className="text-sm text-op-muted mt-0.5">A 3-email follow-up sequence starts automatically.</p>
          </div>
          <button onClick={onCancel} className="text-op-muted hover:text-op-navy transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-op-navy mb-1.5">Estimate Amount (optional)</label>
            <input
              className={inputClass}
              placeholder="e.g. $1,200 or $800–$1,100"
              value={amount}
              onChange={(e) => {
                // Allow digits, $, commas, dashes, en-dash, spaces — prevent free-form text injection
                const v = e.target.value.replace(/[^0-9$,.\-–\s]/g, '')
                setAmount(v)
              }}
              maxLength={40}
            />
            <p className="text-xs text-op-muted mt-1.5">Leave blank to send the email without a displayed total.</p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="btn-secondary text-sm flex-1 justify-center">Cancel</button>
          <button
            onClick={() => onConfirm(amount)}
            disabled={loading}
            className="btn-primary text-sm flex-1 justify-center"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Send Estimate →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── What Happened Modal ───────────────────────────────────────
function WhatHappenedModal({ contact, estimateEnabled, onClose, onMarkDone, onEstimate, onReview }: {
  contact: Contact
  estimateEnabled: boolean
  onClose: () => void
  onMarkDone: (status: 'completed' | 'won') => void
  onEstimate: () => void
  onReview: () => void
}) {
  const isLead = contact.type === 'lead'

  const options = [
    {
      label: 'Job completed',
      description: "Mark it done and send a review request if the customer is happy.",
      icon: <CheckCircle2 size={18} className="text-op-green" />,
      border: 'border-op-border hover:border-op-green',
      action: () => onMarkDone('completed'),
    },
    {
      label: 'Deal closed — we won it',
      description: "Log it as a win. You'll have a chance to request a review.",
      icon: <Star size={18} className="text-op-amber" />,
      border: 'border-op-border hover:border-op-amber',
      action: () => onMarkDone('won'),
    },
    ...(isLead && estimateEnabled ? [{
      label: 'Send them an estimate',
      description: "Email the quote and start a 3-email follow-up automatically.",
      icon: <FileText size={18} className="text-op-navy" />,
      border: 'border-op-border hover:border-op-navy',
      action: () => { onClose(); onEstimate() },
    }] : []),
    ...(contact.email ? [{
      label: 'Request a review',
      description: "Send a direct review request email to this contact.",
      icon: <Star size={18} className="text-op-amber" />,
      border: 'border-op-border hover:border-op-amber',
      action: () => { onClose(); onReview() },
    }] : []),
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-start justify-between p-5 pb-4 border-b border-op-border">
          <div>
            <h2 className="font-bold text-op-navy font-manrope">What happened with {contact.name}?</h2>
            <p className="text-xs text-op-muted mt-0.5">Pick what fits — we'll update everything automatically.</p>
          </div>
          <button onClick={onClose} className="text-op-muted hover:text-op-navy transition-colors ml-3 shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2.5">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${opt.border}`}
            >
              <span className="shrink-0 mt-0.5">{opt.icon}</span>
              <div>
                <p className="text-sm font-semibold text-op-navy">{opt.label}</p>
                <p className="text-xs text-op-muted mt-0.5">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <button onClick={onClose} className="btn-secondary w-full text-sm justify-center">
            Nothing yet — go back
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [contact, setContact]       = useState<Contact | null>(null)
  const [activity, setActivity]     = useState<Activity[]>([])
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [sendingReview, setSendingReview] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [reviewMsg, setReviewMsg]   = useState('')
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false)
  const [satisfactionFinalStatus, setSatisfactionFinalStatus] = useState<'completed' | 'won'>('completed')
  const [satisfactionLoading, setSatisfactionLoading] = useState(false)
  const [showEstimateModal, setShowEstimateModal] = useState(false)
  const [estimateLoading, setEstimateLoading] = useState(false)
  const [actionMsg, setActionMsg]   = useState('')
  const [actionIsError, setActionIsError] = useState(false)
  const [reviewIsError, setReviewIsError] = useState(false)
  const [status, setStatus]         = useState('')
  const [notes, setNotes]           = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [estimateAgentEnabled, setEstimateAgentEnabled] = useState(false)
  const [showWhatHappened, setShowWhatHappened] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: c }, { data: acts }, { data: msgs }, { data: estimateAgent }] = await Promise.all([
        supabase.from('contacts').select('*').eq('id', id).single(),
        supabase
          .from('agent_activity')
          .select('*')
          .filter('details->>contact_id', 'eq', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('agent_messages')
          .select('id, agent_type, subject, channel, status, sent_at, template_id')
          .eq('contact_id', id)
          .order('sent_at', { ascending: false }),
        supabase.from('agents').select('enabled').eq('type', 'estimate_followup').single(),
      ])
      if (!c) { router.push('/dashboard/contacts'); return }
      setContact(c as Contact)
      setStatus(c.status)
      setNotes(c.notes ?? '')
      setActivity((acts ?? []) as Activity[])
      setAgentMessages((msgs ?? []) as AgentMessage[])
      setEstimateAgentEnabled(estimateAgent?.enabled === true)
      setLoading(false)
    }
    load()
  }, [id, router])

  const autoSave = useCallback(async (newStatus: string, newNotes: string) => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('contacts').update({ status: newStatus, notes: newNotes }).eq('id', id)
    setContact((c) => c ? { ...c, status: newStatus, notes: newNotes } : c)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [id])

  const handleNotesChange = (val: string) => {
    setNotes(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(status, val), 1000)
  }

  const handleStatusChange = (s: string) => {
    setStatus(s)
    autoSave(s, notes)
  }

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('contacts').delete().eq('id', id)
    router.push('/dashboard/contacts')
  }

  // Manual review request (always happy satisfaction)
  const handleReviewRequest = async () => {
    setSendingReview(true)
    setReviewMsg('')
    const res = await fetch(`/api/contacts/${id}/review-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ satisfaction: 'happy' }),
    })
    const data = await res.json()
    setSendingReview(false)
    if (res.ok) {
      setContact((c) => c ? { ...c, status: 'review_requested' } : c)
      setStatus('review_requested')
      setReviewIsError(false)
      setReviewMsg('Review request sent — 3-email sequence started!')
    } else {
      setReviewIsError(true)
      setReviewMsg(data.error ?? 'Failed to send')
    }
    setTimeout(() => setReviewMsg(''), 5000)
  }

  // Mark Done / Won Deal flow
  const handleMarkDone = (finalStatus: 'completed' | 'won' = 'completed') => {
    setSatisfactionFinalStatus(finalStatus)
    setShowSatisfactionModal(true)
  }

  const handleSatisfactionConfirm = async (satisfaction: Satisfaction) => {
    if (!contact) return
    setSatisfactionLoading(true)
    setActionMsg('')

    const completeRes = await fetch(`/api/contacts/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalStatus: satisfactionFinalStatus }),
    })
    const completeData = await completeRes.json()

    if (!completeRes.ok) {
      setSatisfactionLoading(false)
      setShowSatisfactionModal(false)
      setActionIsError(true)
      setActionMsg(completeData.error ?? 'Failed to update contact')
      setTimeout(() => setActionMsg(''), 5000)
      return
    }

    setContact((c) => c ? { ...c, status: satisfactionFinalStatus, type: 'customer' } : c)
    setStatus(satisfactionFinalStatus)

    if (completeData.reviewSystemEnabled) {
      const reviewRes = await fetch(`/api/contacts/${id}/review-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ satisfaction }),
      })
      const reviewData = await reviewRes.json()

      if (reviewRes.ok) {
        setActionIsError(false)
        if (reviewData.action === 'review_sequence_started') {
          setContact((c) => c ? { ...c, status: 'review_requested' } : c)
          setStatus('review_requested')
          setActionMsg('Marked complete — review sequence started!')
        } else if (reviewData.action === 'private_feedback') {
          setActionMsg('Marked complete — private feedback request sent.')
        } else if (reviewData.action === 'blocked') {
          setContact((c) => c ? { ...c, status: 'needs_owner_attention' } : c)
          setStatus('needs_owner_attention')
          setActionMsg('Marked complete — review blocked, follow-up task created.')
        }
      } else {
        setActionIsError(true)
        setActionMsg(`Marked complete, but review failed.${reviewData.error ? ` (${reviewData.error})` : ''}`)
      }
    } else {
      setActionIsError(false)
      setActionMsg('Contact marked as complete.')
    }

    setSatisfactionLoading(false)
    setShowSatisfactionModal(false)
    setTimeout(() => setActionMsg(''), 7000)
  }

  const handleSendEstimate = async (amount: string) => {
    setEstimateLoading(true)
    const res = await fetch(`/api/contacts/${id}/send-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const data = await res.json()
    setEstimateLoading(false)
    setShowEstimateModal(false)
    if (res.ok) {
      setContact((c) => c ? { ...c, status: 'contacted' } : c)
      setStatus('contacted')
      setActionIsError(false)
      setActionMsg('Estimate sent — 3-email follow-up sequence started.')
    } else {
      setActionIsError(true)
      setActionMsg(data.error ?? 'Failed to send estimate')
    }
    setTimeout(() => setActionMsg(''), 7000)
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-op-muted" size={24} />
      </main>
    )
  }

  if (!contact) return null

  const doneStatuses = ['completed', 'won', 'converted', 'lost', 'do_not_contact', 'review_requested', 'review_completed']
  const isDone = doneStatuses.includes(contact.status)
  const isReviewStatus = ['review_requested', 'review_completed'].includes(contact.status)

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      {showWhatHappened && contact && (
        <WhatHappenedModal
          contact={contact}
          estimateEnabled={estimateAgentEnabled}
          onClose={() => setShowWhatHappened(false)}
          onMarkDone={(status) => { setShowWhatHappened(false); handleMarkDone(status) }}
          onEstimate={() => setShowEstimateModal(true)}
          onReview={() => { setShowWhatHappened(false); handleReviewRequest() }}
        />
      )}
      {showSatisfactionModal && contact && (
        <SatisfactionModal
          contactName={contact.name}
          finalStatus={satisfactionFinalStatus}
          onConfirm={handleSatisfactionConfirm}
          onCancel={() => setShowSatisfactionModal(false)}
          loading={satisfactionLoading}
        />
      )}
      {showEstimateModal && contact && (
        <EstimateModal
          contactName={contact.name}
          onConfirm={handleSendEstimate}
          onCancel={() => setShowEstimateModal(false)}
          loading={estimateLoading}
        />
      )}

      <div className="max-w-2xl">
        {/* Back */}
        <Link href="/dashboard/contacts" className="inline-flex items-center gap-1.5 text-sm text-op-muted hover:text-op-navy transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Contacts
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar name={contact.name} />
            <div>
            <h1 className="text-2xl font-bold font-manrope text-op-navy">{contact.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${contact.type === 'lead' ? 'bg-op-navy/10 text-op-navy border-op-navy/20' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                {contact.type === 'lead' ? 'Lead' : 'Customer'}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[contact.status] ?? 'bg-gray-50 text-op-muted border-op-border'}`}>
                {statusLabel[contact.status] ?? contact.status}
              </span>
              {contact.source && (
                <span className="text-xs text-op-muted">via {contact.source}</span>
              )}
              <span className="text-xs text-op-muted">
                Added {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap items-start">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
                <Mail size={12} /> Email
              </a>
            )}
            {/* Single action button — replaces the previous multi-button cluster */}
            {!isDone && (
              <button
                onClick={() => setShowWhatHappened(true)}
                className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                <CheckCircle2 size={12} /> What happened? →
              </button>
            )}
            {/* Review request for done contacts not yet reviewed */}
            {contact.email && isDone && !isReviewStatus && (
              <button
                onClick={handleReviewRequest}
                disabled={sendingReview}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                {sendingReview ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
                Request Review
              </button>
            )}
          </div>
        </div>

        {reviewMsg && (
          <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-semibold flex items-center gap-2 ${
            reviewIsError
              ? 'bg-red-50 border border-red-200 text-op-red'
              : 'bg-green-50 border border-green-200 text-op-green'
          }`}>
            {reviewIsError ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {reviewMsg}
          </div>
        )}

        {actionMsg && (
          <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-semibold flex items-center gap-2 ${
            actionIsError
              ? 'bg-red-50 border border-red-200 text-op-red'
              : 'bg-green-50 border border-green-200 text-op-green'
          }`}>
            {actionIsError ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {actionMsg}
          </div>
        )}

        {/* Review sequence status banner */}
        {contact.status === 'review_requested' && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <Star size={15} className="text-op-amber shrink-0" />
            <div>
              <p className="text-sm font-semibold text-op-amber">Review sequence active</p>
              <p className="text-xs text-amber-700 mt-0.5">Day 0 sent · Day 3 and Day 7 reminders scheduled.</p>
            </div>
          </div>
        )}

        {contact.status === 'review_completed' && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
            <Star size={15} className="text-op-green shrink-0" />
            <p className="text-sm font-semibold text-op-green">Review received — great work!</p>
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
                  <div className="flex items-center gap-2">
                    <p className="text-op-body flex-1 truncate">{contact.email}</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(contact.email); setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000) }}
                      className="text-op-muted hover:text-op-navy transition-colors shrink-0"
                      title="Copy email"
                    >
                      {copiedEmail ? <Check size={12} className="text-op-green" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div>
                  <p className="text-xs text-op-muted mb-0.5">Phone</p>
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-op-body hover:text-op-navy transition-colors w-fit">
                    <Phone size={12} className="text-op-muted" />
                    {contact.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Status + notes (auto-saved) */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-op-navy">Status & Notes</h2>
              <span className="text-xs h-4 flex items-center gap-1 text-op-muted">
                {saving && <><Loader2 size={10} className="animate-spin" /> Saving…</>}
                {saved && !saving && <><Check size={10} className="text-op-green" /> <span className="text-op-green">Saved</span></>}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-op-navy mb-1.5">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                        status === s
                          ? (statusColors[s] ?? 'bg-op-navy text-white border-op-navy')
                          : 'bg-white text-op-muted border-op-border hover:border-op-navy'
                      }`}
                    >
                      {statusLabel[s] ?? s}
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
                  onChange={(e) => handleNotesChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity timeline */}
        {(() => {
          const timeline: TimelineEntry[] = [
            ...activity.map((a) => ({ kind: 'activity' as const, data: a })),
            ...agentMessages.map((m) => ({ kind: 'message' as const, data: m })),
          ].sort((a, b) => timelineTime(b) - timelineTime(a))

          return (
            <div className="mt-6">
              <h2 className="text-sm font-bold text-op-navy mb-4">
                Operon Activity
                {timeline.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-op-muted">({timeline.length} events)</span>
                )}
              </h2>
              {timeline.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-sm text-op-muted">No agent activity for this contact yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {timeline.map((entry) => {
                    const label = entry.kind === 'activity' ? activityLabel(entry.data) : messageLabel(entry.data)
                    const time  = entry.kind === 'activity' ? entry.data.created_at : entry.data.sent_at
                    const isEmail = entry.kind === 'message'
                    return (
                      <div
                        key={`${entry.kind}-${entry.data.id}`}
                        className={`card py-3 px-4 flex items-start gap-3 ${isEmail ? 'border-op-navy/10' : ''}`}
                      >
                        <span className="shrink-0 mt-0.5">
                          <TimelineIcon entry={entry} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-op-body">{label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-op-muted">{timeAgo(time)}</p>
                            {isEmail && (
                              <span className="text-[10px] bg-op-navy/5 text-op-muted px-1.5 py-0.5 rounded-full font-medium">
                                email
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

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
