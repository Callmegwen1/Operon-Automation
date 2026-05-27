'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Loader2, Eye, EyeOff, Mail, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'

function SignupForm() {
  const searchParams = useSearchParams()
  const fromScan = searchParams.get('fromScan')
  const plan     = searchParams.get('plan')

  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    track('signup_started', {
      plan_clicked: plan ?? undefined,
      source: fromScan ? 'scanner' : plan ? 'pricing' : 'organic',
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    // If user came from pricing with a plan intent, preserve it through the verify flow
    const callbackUrl = plan
      ? `${window.location.origin}/api/auth/callback?next=/api/stripe/checkout-redirect?plan=${plan}`
      : `${window.location.origin}/api/auth/callback`
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { business_name: businessName },
        emailRedirectTo: callbackUrl,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    track('signup_completed', {
      plan_clicked: plan ?? undefined,
      source: fromScan ? 'scanner' : plan ? 'pricing' : 'organic',
    })
    setSubmitted(true)
    setLoading(false)
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white'

  // ── Pending verification screen ──────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
        <Link href="/" className="mb-8">
          <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto" />
        </Link>
        <div className="w-full max-w-sm">
          <div className="card text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail size={26} className="text-op-blue" />
            </div>
            <h1 className="text-2xl font-bold font-manrope text-op-navy mb-2">Check your email</h1>
            <p className="text-sm text-op-muted leading-relaxed mb-1">
              We sent a verification link to
            </p>
            <p className="text-sm font-semibold text-op-navy mb-4">{email}</p>
            <p className="text-sm text-op-muted leading-relaxed mb-5">
              Click the link in the email to activate your account and access your dashboard. It may take a minute to arrive.
            </p>

            {fromScan && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2 text-left">
                <CheckCircle2 size={15} className="text-op-green shrink-0 mt-0.5" />
                <p className="text-xs text-op-green leading-relaxed">
                  Your scan results will be saved to your account once your email is verified.
                </p>
              </div>
            )}

            <p className="text-xs text-op-muted">
              Didn&apos;t get it? Check your spam folder. If it&apos;s still missing,{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="text-op-blue hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>

          <p className="text-center text-sm text-op-muted mt-6">
            Already verified?{' '}
            <Link href="/login" className="text-op-blue font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Signup form ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8">
        <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto" />
      </Link>

      <div className="w-full max-w-sm">
        {fromScan && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-center">
            <p className="text-sm text-op-green font-semibold">
              Your scan results will be saved to your account.
            </p>
          </div>
        )}

        <div className="card">
          <h1 className="text-2xl font-bold font-manrope text-op-navy mb-1">
            Create your free account
          </h1>
          <p className="text-sm text-op-muted mb-6">Access your Revenue Autopilot dashboard.</p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Smith's Plumbing"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="w-full border border-op-border rounded-lg px-4 py-3 pr-11 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-op-muted hover:text-op-navy transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-op-red">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs text-op-blue leading-relaxed">
                <strong>Heads up:</strong> After signing up, we&apos;ll send a verification email to confirm your address. Check your inbox to activate your account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-1"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-xs text-op-muted text-center mt-4">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-op-blue hover:underline">Terms</Link> and{' '}
            <Link href="/privacy" className="text-op-blue hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-op-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-op-blue font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-op-bg" />}>
      <SignupForm />
    </Suspense>
  )
}
