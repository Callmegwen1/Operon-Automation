'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { track } from '@/lib/analytics'

interface Props {
  plan: 'starter' | 'growth' | 'pro'
  label: string
  primary?: boolean
  className?: string
}

export default function CheckoutButton({ plan, label, primary = false, className }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setError('')

    track('plan_clicked',      { plan_clicked: plan, source: 'pricing_page' })
    track('checkout_started',  { plan_clicked: plan })

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })

    if (res.status === 401) {
      // Not logged in — send to signup with plan intent preserved
      router.push(`/signup?plan=${plan}`)
      return
    }

    const data = await res.json()
    setLoading(false)

    if (!res.ok || !data.url) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    window.location.href = data.url
  }

  const base = primary
    ? 'inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold bg-op-navy text-white hover:bg-[#0F1F2E] active:scale-95 transition-all'
    : 'inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold bg-white text-op-navy border border-op-border hover:border-op-navy active:scale-95 transition-all'

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className ?? base}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <>{label} <ArrowRight size={14} /></>
        }
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
