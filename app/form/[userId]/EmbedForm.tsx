'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  userId: string
  title: string
  business: string
  color: string
}

export default function EmbedForm({ userId, title, business, color }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/public/leads/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim(),
        message: form.message.trim(),
        source:  'Website Form',
      }),
    })

    if (res.ok) {
      setDone(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inputBase =
    'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all bg-white'

  if (done) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${color}15` }}
        >
          <CheckCircle2 size={28} style={{ color }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
          Thanks, {form.name.split(' ')[0]}!
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          We received your message{business ? ` and a member of the ${business} team` : ''} will be in touch with you shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {title && (
        <h2
          className="text-xl font-bold mb-1"
          style={{ color, fontFamily: 'system-ui, sans-serif' }}
        >
          {title}
        </h2>
      )}
      {business && (
        <p className="text-sm text-gray-500 mb-6">{business}</p>
      )}
      {!business && title && <div className="mb-5" />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name <span className="text-red-400">*</span></label>
            <input
              className={inputBase}
              style={{ '--tw-ring-color': color } as React.CSSProperties}
              placeholder="John Smith"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
            <input
              className={inputBase}
              placeholder="(555) 000-0000"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-400">*</span></label>
          <input
            type="email"
            className={inputBase}
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
          <textarea
            className={`${inputBase} resize-none`}
            rows={3}
            placeholder="How can we help you?"
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !form.name.trim() || !form.email.trim()}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
          style={{ backgroundColor: color }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
