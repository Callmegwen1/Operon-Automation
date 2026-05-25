'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSubmitted(true)
    setLoading(false)
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

  if (submitted) {
    return (
      <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
        <Link href="/" className="mb-8">
          <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto" />
        </Link>
        <div className="w-full max-w-sm card text-center">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={26} className="text-op-green" />
          </div>
          <h1 className="text-xl font-bold font-manrope text-op-navy mb-2">Check your inbox</h1>
          <p className="text-sm text-op-muted mb-5">
            We sent a password reset link to <strong className="text-op-navy">{email}</strong>.
            It expires in 1 hour.
          </p>
          <Link href="/login" className="text-sm text-op-navy hover:underline font-semibold">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8">
        <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto" />
      </Link>

      <div className="w-full max-w-sm">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-op-bg rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-op-navy" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-manrope text-op-navy">Reset your password</h1>
              <p className="text-xs text-op-muted">We'll email you a reset link</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-op-navy mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoFocus
                className={inputClass}
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-op-red bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <Link href="/login" className="flex items-center gap-1.5 text-sm text-op-muted hover:text-op-navy transition-colors justify-center mt-5">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  )
}
