'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

const reasons = [
  'I want to use Revenue Autopilot',
  'I want custom automation',
  'I need help with marketing systems',
  'I need support',
  'Other',
]

interface Fields {
  name: string
  email: string
  phone: string
  business: string
  reason: string
  message: string
}

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>({
    name: '', email: '', phone: '', business: '', reason: '', message: '',
  })
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof Fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e: Partial<Fields> = {}
    if (!fields.name.trim())    e.name    = 'Required'
    if (!fields.email.trim())   e.email   = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Enter a valid email'
    if (!fields.reason)         e.reason  = 'Please select a reason'
    if (!fields.message.trim()) e.message = 'Please include a message'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or email us at ceo@operonauto.com')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (k: keyof Fields) =>
    `w-full border ${errors[k] ? 'border-op-red' : 'border-op-border'} rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white`

  if (submitted) {
    return (
      <div className="py-12 flex flex-col items-center text-center gap-4">
        <CheckCircle2 size={40} className="text-op-green" />
        <h3 className="font-bold font-manrope text-op-navy text-lg">Message received!</h3>
        <p className="text-sm text-op-muted max-w-xs">
          We will get back to you within one business day. In the meantime, you can scan your business free.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-op-navy mb-1.5">Name *</label>
          <input className={inputClass('name')} placeholder="Your name" value={fields.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <p className="text-xs text-op-red mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-op-navy mb-1.5">Email *</label>
          <input type="email" className={inputClass('email')} placeholder="you@business.com" value={fields.email} onChange={(e) => set('email', e.target.value)} />
          {errors.email && <p className="text-xs text-op-red mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-op-navy mb-1.5">Phone</label>
          <input className={inputClass('phone')} placeholder="(555) 000-0000" value={fields.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-op-navy mb-1.5">Business Name</label>
          <input className={inputClass('business')} placeholder="Your business" value={fields.business} onChange={(e) => set('business', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-op-navy mb-1.5">Reason for Reaching Out *</label>
        <select className={inputClass('reason')} value={fields.reason} onChange={(e) => set('reason', e.target.value)}>
          <option value="">Select a reason</option>
          {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {errors.reason && <p className="text-xs text-op-red mt-1">{errors.reason}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-op-navy mb-1.5">Message *</label>
        <textarea
          className={`${inputClass('message')} resize-none`}
          rows={4}
          placeholder="Tell us a bit about your business and what you're looking to accomplish..."
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
        />
        {errors.message && <p className="text-xs text-op-red mt-1">{errors.message}</p>}
      </div>

      {error && (
        <div className="bg-red-50 border border-op-red rounded-lg px-4 py-3 text-sm text-op-red">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary py-3.5 justify-center">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
