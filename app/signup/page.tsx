'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromScan = searchParams.get('fromScan')

  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { business_name: businessName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If coming from scanner, save that scan to their new account
    if (fromScan && data.user) {
      const scanRaw = localStorage.getItem(`scan_${fromScan}`)
      if (scanRaw) {
        try {
          await fetch('/api/scanner/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scanData: JSON.parse(scanRaw) }),
          })
        } catch {
          // non-blocking
        }
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white'

  return (
    <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8">
        <Image
          src="/logos/logo-light.png"
          alt="Operon Automation"
          width={150}
          height={38}
          className="h-9 w-auto"
        />
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
              <label className="block text-sm font-semibold text-op-navy mb-1.5">
                Business Name
              </label>
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
          <Link href="/login" className="text-op-blue font-semibold hover:underline">
            Sign in
          </Link>
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
