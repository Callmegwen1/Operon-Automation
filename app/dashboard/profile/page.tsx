'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
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
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    website_url: '',
    industry: '',
    phone: '',
    city_state: '',
    main_service: '',
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
          name:         data.name         ?? '',
          website_url:  data.website_url  ?? '',
          industry:     data.industry     ?? '',
          phone:        data.phone        ?? '',
          city_state:   data.city_state   ?? '',
          main_service: data.main_service ?? '',
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('businesses').upsert(
      { user_id: user.id, ...form, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputClass =
    'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white'

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

        <form onSubmit={handleSave} className="flex flex-col gap-5">
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
      </div>
    </main>
  )
}
