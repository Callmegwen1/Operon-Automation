'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed')
  const linkError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white'

  return (
    <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8">
        <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto" />
      </Link>

      <div className="w-full max-w-sm">
        {/* Email confirmed banner */}
        {confirmed && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 size={16} className="text-op-green shrink-0" />
            <p className="text-sm text-op-green font-semibold">
              Email confirmed! You can now sign in below.
            </p>
          </div>
        )}

        {/* Link expired / error banner */}
        {linkError === 'link-expired' && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
            <AlertTriangle size={16} className="text-op-amber shrink-0" />
            <p className="text-sm text-op-amber font-semibold">
              That verification link has expired. Please{' '}
              <Link href="/signup" className="underline">sign up again</Link> or contact{' '}
              <a href="mailto:ceo@operonauto.com" className="underline">support</a>.
            </p>
          </div>
        )}

        <div className="card">
          <h1 className="text-2xl font-bold font-manrope text-op-navy mb-1">Welcome back</h1>
          <p className="text-sm text-op-muted mb-6">Sign in to your Revenue Autopilot dashboard.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                  placeholder="••••••••"
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
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-op-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-op-blue font-semibold hover:underline">Create one free</Link>
        </p>
        <p className="text-center text-sm text-op-muted mt-3">
          <Link href="/scanner" className="text-op-blue hover:underline">Scan my business free →</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-op-bg" />}>
      <LoginForm />
    </Suspense>
  )
}
