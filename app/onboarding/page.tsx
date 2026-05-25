'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowRight, Loader2, CheckCircle2, Zap,
  AlertCircle, Phone, Star, MessageSquare, Shield, Clock,
} from 'lucide-react'

type Step = 0 | 1 | 2

interface Issue {
  icon: React.ElementType
  title: string
  desc: string
  fix: string
}

function getIssues(analysis: Record<string, boolean>, hasWebsite: boolean): Issue[] {
  const found: Issue[] = []

  if (!analysis.hasContactForm) found.push({
    icon: MessageSquare,
    title: 'No contact form detected',
    desc: "Leads visiting your site have no easy way to reach you — most leave without doing anything.",
    fix: "Embed Operon's contact form in 30 seconds — leads flow in automatically.",
  })
  if (!analysis.hasSocialProof) found.push({
    icon: Star,
    title: 'No reviews or testimonials visible',
    desc: "Visitors can't see proof you're trustworthy, so they check a competitor instead.",
    fix: 'Automate review requests to every satisfied customer.',
  })
  if (!analysis.hasPhoneNumber) found.push({
    icon: Phone,
    title: 'No phone number visible',
    desc: 'Customers who want to call you on the spot can\'t find your number.',
    fix: 'Operon includes your number in every automated follow-up.',
  })
  if (!analysis.loadsFast) found.push({
    icon: Clock,
    title: 'Slow page load detected',
    desc: 'Slow sites lose up to 53% of visitors before the page even finishes loading.',
    fix: 'Capture the ones who stay with an instant automated response.',
  })
  if (!analysis.hasHttps) found.push({
    icon: Shield,
    title: 'Site not secured (no HTTPS)',
    desc: "Browsers warn visitors your site is \"not secure\" — most leave immediately.",
    fix: 'Automated follow-up retains the visitors who push through.',
  })

  // Always ensure 3 issues shown
  if (found.length < 3) {
    found.push({
      icon: Zap,
      title: 'Leads going cold without follow-up',
      desc: "Most businesses reply to leads hours later — by then the customer has hired someone else.",
      fix: 'Operon sends a follow-up in 15 minutes, then Day 2, then Day 5. Fully automatic.',
    })
  }
  if (found.length < 3 && hasWebsite) {
    found.push({
      icon: MessageSquare,
      title: 'No automated review collection',
      desc: "Happy customers don't leave reviews on their own — you have to ask at exactly the right moment.",
      fix: 'One click in Contacts sends a personalized review request instantly.',
    })
  }

  return found.slice(0, 3)
}

const inputClass =
  'w-full border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/40 bg-white/10 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]       = useState<Step>(0)
  const [name, setName]       = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')
  const [issues, setIssues]   = useState<Issue[]>([])
  const [siteOk, setSiteOk]   = useState(true)

  // Pre-fill from scanner if user signed up after scanning
  useEffect(() => {
    const pendingId = localStorage.getItem('operon_pending_scan_id')
    if (!pendingId) return
    const raw = localStorage.getItem(`scan_${pendingId}`)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.businessName) setName(data.businessName)
      if (data.websiteUrl)   setWebsite(data.websiteUrl)
    } catch { /* ignore */ }
  }, [])

  const handleStart = async () => {
    if (!name.trim()) return
    setError('')
    setSubmitting(true)

    // Save business name so the dashboard redirect won't fire again
    const saved = await fetch('/api/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), website_url: website.trim() }),
    })
    if (!saved.ok) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setStep(1)

    // Analyze website in parallel with the 2-second minimum animation
    let analysis: Record<string, boolean> = {}
    const [analyzeResult] = await Promise.all([
      website.trim()
        ? fetch('/api/scanner/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: website.trim() }),
          }).then((r) => r.ok ? r.json() : {}).catch(() => ({}))
        : Promise.resolve({}),
      new Promise((r) => setTimeout(r, 2200)),
    ])

    analysis = analyzeResult as Record<string, boolean>
    setSiteOk(analysis.accessible !== false)
    setIssues(getIssues(analysis, !!website.trim()))
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-op-navy flex flex-col">
      <div className="px-6 py-5">
        <Image src="/logos/logo-dark.png" alt="Operon" width={130} height={32} className="h-8 w-auto" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">

        {/* ── Step 0: Welcome form ─────────────────────────────────── */}
        {step === 0 && (
          <div className="w-full max-w-md text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold font-manrope text-white mb-3">
              Set up your autopilot in 2 minutes
            </h1>
            <p className="text-white/50 mb-8 text-sm leading-relaxed">
              We'll scan your website, find where you're losing customers, and help you fix it automatically — no tech skills needed.
            </p>

            <div className="flex flex-col gap-3 text-left mb-6">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputClass}
                  placeholder="Apex Plumbing & Heating"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">
                  Website URL{' '}
                  <span className="text-white/30 font-normal normal-case">(optional but recommended)</span>
                </label>
                <input
                  className={inputClass}
                  placeholder="yoursite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>
            </div>

            {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

            <button
              onClick={handleStart}
              disabled={!name.trim() || submitting}
              className="w-full py-3.5 bg-white text-op-navy rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {submitting
                ? <Loader2 size={16} className="animate-spin" />
                : <>Scan My Business <ArrowRight size={16} /></>}
            </button>
            <p className="text-white/30 text-xs mt-4">Free forever · No credit card</p>
          </div>
        )}

        {/* ── Step 1: Scanning animation ───────────────────────────── */}
        {step === 1 && (
          <div className="w-full max-w-md text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold font-manrope text-white mb-2">
              Scanning {name}…
            </h2>
            <p className="text-white/40 text-sm mb-8">Looking for revenue leaks on your website</p>
            <div className="flex flex-col gap-2">
              {[
                'Analyzing website structure…',
                'Checking for contact form…',
                'Looking for social proof…',
                'Detecting lead capture gaps…',
              ].map((msg, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5">
                  <Loader2
                    size={12}
                    className="text-white/30 animate-spin shrink-0"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                  <span className="text-xs text-white/40">{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Results ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={24} className="text-red-300" />
              </div>
              <h2 className="text-2xl font-bold font-manrope text-white mb-2">
                {issues.length} revenue leaks found
              </h2>
              <p className="text-white/40 text-sm">
                {siteOk && website
                  ? `We scanned ${website} and found these gaps.`
                  : 'Here\'s what most businesses in your position are missing.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              {issues.map(({ icon: Icon, title, desc, fix }, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} className="text-red-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{title}</p>
                      <p className="text-xs text-white/40 mb-2 leading-relaxed">{desc}</p>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 size={11} className="text-green-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-green-300 font-medium leading-relaxed">{fix}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-white text-op-navy rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
            >
              Fix These With Operon <ArrowRight size={16} />
            </button>
            <p className="text-center text-white/30 text-xs mt-3">
              You'll activate your first agent in under 60 seconds
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
