'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

  if (done) {
    return (
      <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
        <Link href="/" className="mb-8">
          <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto" />
        </Link>
        <div className="w-full max-w-sm card text-center">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={26} className="text-op-green" />
          </div>
          <h1 className="text-xl font-bold font-manrope text-op-navy mb-2">Password updated</h1>
          <p className="text-sm text-op-muted">Taking you to your dashboard…</p>
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
              <Lock size={18} className="text-op-navy" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-manrope text-op-navy">Choose a new password</h1>
              <p className="text-xs text-op-muted">At least 8 characters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-op-navy mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  className={`${inputClass} pr-11`}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-op-muted hover:text-op-navy transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-op-navy mb-1.5">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={inputClass}
                placeholder="Same as above"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-op-red bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
