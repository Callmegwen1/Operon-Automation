'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const industries = [
  'Home Services',
  'Cleaning Company',
  'Contractor / Trades',
  'Auto Shop',
  'Med Spa / Aesthetics',
  'Fitness Studio',
  'Dental Office',
  'Clinic / Healthcare',
  'Real Estate',
  'Restaurant / Food Service',
  'Other',
]

type ProfileForm = {
  name: string
  website_url: string
  industry: string
  phone: string
  city_state: string
  main_service: string
  avg_job_value: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    website_url: '',
    industry: '',
    phone: '',
    city_state: '',
    main_service: '',
    avg_job_value: '',
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email ?? '')

      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setForm({
          name:          data.name          ?? '',
          website_url:   data.website_url   ?? '',
          industry:      data.industry      ?? '',
          phone:         data.phone         ?? '',
          city_state:    data.city_state    ?? '',
          main_service:  data.main_service  ?? '',
          avg_job_value: data.avg_job_value != null ? String(data.avg_job_value) : '',
        })
      } else if (user.user_metadata?.business_name) {
        setForm((f) => ({ ...f, name: user.user_metadata.business_name }))
      }

      setLoading(false)
    }
    load()
  }, [])

  const set = (key: keyof ProfileForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ text: 'New passwords do not match.', ok: false })
      return
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ text: 'Password must be at least 8 characters.', ok: false })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    setPwSaving(false)
    if (error) {
      setPwMsg({ text: error.message, ok: false })
    } else {
      setPwMsg({ text: 'Password updated successfully.', ok: true })
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwMsg(null), 4000)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { avg_job_value, ...rest } = form
    await supabase.from('businesses').upsert(
      {
        user_id: user.id,
        ...rest,
        avg_job_value: avg_job_value !== '' ? Number(avg_job_value) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-op-muted" size={24} />
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold font-manrope text-op-navy mb-1">Business Profile</h1>
        <p className="text-sm text-op-muted mb-6">
          Keep your profile up to date for accurate Revenue Leak analysis.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-5" noValidate>
          {/* Account info (read-only) */}
          <div className="card bg-op-bg border border-op-border">
            <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-1">
              Account Email
            </p>
            <p className="text-sm text-op-body">{userEmail}</p>
          </div>

          <div className="card flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">
                Business Name *
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Smith's Plumbing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">Website URL</label>
              <input
                className={inputClass}
                value={form.website_url}
                onChange={(e) => set('website_url', e.target.value)}
                placeholder="www.yourbusiness.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">Industry</label>
              <select
                className={inputClass}
                value={form.industry}
                onChange={(e) => set('industry', e.target.value)}
              >
                <option value="">Select industry</option>
                {industries.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-op-navy mb-1.5">Phone</label>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-op-navy mb-1.5">
                  City / State
                </label>
                <input
                  className={inputClass}
                  value={form.city_state}
                  onChange={(e) => set('city_state', e.target.value)}
                  placeholder="Austin, TX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">
                Main Service
              </label>
              <input
                className={inputClass}
                value={form.main_service}
                onChange={(e) => set('main_service', e.target.value)}
                placeholder="e.g. Residential plumbing"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">
                Average Job / Sale Value ($)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className={inputClass}
                value={form.avg_job_value}
                onChange={(e) => set('avg_job_value', e.target.value)}
                placeholder="e.g. 850"
              />
              <p className="text-xs text-op-muted mt-1">
                Used to estimate your total revenue opportunity from open leaks.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Profile'}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-op-green font-semibold">
                  <CheckCircle2 size={15} /> Saved
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Password change */}
        <form onSubmit={handlePasswordChange} className="mt-6" noValidate>
          <h2 className="text-base font-bold font-manrope text-op-navy mb-4">Change Password</h2>
          <div className="card flex flex-col gap-4">
            {(['next', 'confirm'] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-op-navy mb-1.5">
                  {key === 'next' ? 'New Password' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={`${inputClass} pr-10`}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={key === 'next' ? 'At least 8 characters' : 'Repeat new password'}
                    autoComplete={key === 'next' ? 'new-password' : 'new-password'}
                  />
                  {key === 'next' && (
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-op-muted hover:text-op-body transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={pwSaving} className="btn-primary">
                {pwSaving ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
              </button>
              {pwMsg && (
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${pwMsg.ok ? 'text-op-green' : 'text-op-red'}`}>
                  {pwMsg.ok && <CheckCircle2 size={15} />}
                  {pwMsg.text}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
