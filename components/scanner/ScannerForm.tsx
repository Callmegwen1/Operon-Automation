'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { calculateSubScores } from '@/lib/scanner/subscores'
import { getMultiplier } from '@/lib/scanner/industry'
import type { WebsiteAnalysis, ScoreBreakdownItem } from '@/lib/scanner/types'
import { track, scoreRange } from '@/lib/analytics'

interface FormData {
  businessName: string
  websiteUrl: string
  industry: string
  industryOther: string
  phone: string
  cityState: string
  mainService: string
  avgJobValue: string
  runsAds: string
  usesCrm: string
  manualFollowUp: string
  asksReviews: string
  tracksLeadSource: string
  hasGoogleProfile: string
  monthlyLeads: string      // optional — unlocks high-confidence estimates
  responseTime: string      // how fast do you respond to new leads
  sendsReminders: string    // industry-specific Q1
  hasRepeatSystem: string   // industry-specific Q2
  biggestProblem: string
  biggestProblemOther: string
  email: string
}

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

const problems = [
  'Not enough leads coming in',
  'Leads come in but don\'t convert',
  'Hard to follow up consistently',
  'Customers don\'t leave reviews',
  'Trouble collecting payments',
  'Don\'t know where leads come from',
  'Old customers aren\'t coming back',
  'Too much manual work / admin',
  'Other',
]

// Industry-specific questions shown in Step 2
interface IndustryQ {
  key: 'sendsReminders' | 'hasRepeatSystem'
  label: string
  options: { value: string; label: string }[]
}

const INDUSTRY_QUESTIONS: Partial<Record<string, [IndustryQ, IndustryQ]>> = {
  'Home Services': [
    {
      key: 'sendsReminders',
      label: 'Do you send follow-ups on open estimates and quotes?',
      options: [
        { value: 'yes',       label: 'Yes — we follow up on every estimate within 48 hours' },
        { value: 'sometimes', label: 'Sometimes — only if we remember' },
        { value: 'no',        label: 'No — we send the estimate and wait for them to call back' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you re-engage past customers who haven\'t called in 6+ months?',
      options: [
        { value: 'yes',       label: 'Yes — we run reactivation campaigns or check-ins' },
        { value: 'sometimes', label: 'Occasionally — only if we think of it' },
        { value: 'no',        label: 'No — we rely on them to contact us when they need us' },
      ],
    },
  ],
  'Contractor / Trades': [
    {
      key: 'sendsReminders',
      label: 'Do you follow up on estimates and bids within 48 hours?',
      options: [
        { value: 'yes',       label: 'Yes — we follow up on every bid systematically' },
        { value: 'sometimes', label: 'Sometimes — when we\'re not too busy' },
        { value: 'no',        label: 'No — we send the quote and wait' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you have a process to re-engage past clients for new projects?',
      options: [
        { value: 'yes',       label: 'Yes — we stay in touch and reach out proactively' },
        { value: 'sometimes', label: 'Occasionally' },
        { value: 'no',        label: 'No — we rely on referrals and word of mouth' },
      ],
    },
  ],
  'Cleaning Company': [
    {
      key: 'sendsReminders',
      label: 'Do you send rebooking reminders to recurring or lapsed clients?',
      options: [
        { value: 'yes',       label: 'Yes — automated reminders go out regularly' },
        { value: 'sometimes', label: 'Sometimes — manually when we have time' },
        { value: 'no',        label: 'No — clients book again when they feel like it' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you win back clients who haven\'t booked in 60+ days?',
      options: [
        { value: 'yes',       label: 'Yes — we have a win-back campaign or process' },
        { value: 'sometimes', label: 'Occasionally' },
        { value: 'no',        label: 'No — we don\'t reach out to lapsed clients' },
      ],
    },
  ],
  'Auto Shop': [
    {
      key: 'sendsReminders',
      label: 'Do you send service interval reminders (oil changes, inspections, etc.)?',
      options: [
        { value: 'yes',       label: 'Yes — automated reminders go out based on mileage or time' },
        { value: 'sometimes', label: 'Occasionally — only for some customers' },
        { value: 'no',        label: 'No — customers come back when they remember' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you follow up with customers who haven\'t returned in 6+ months?',
      options: [
        { value: 'yes',       label: 'Yes — we have a lapsed customer outreach process' },
        { value: 'sometimes', label: 'Occasionally' },
        { value: 'no',        label: 'No — we wait for them to come back on their own' },
      ],
    },
  ],
  'Med Spa / Aesthetics': [
    {
      key: 'sendsReminders',
      label: 'Do you send rebooking reminders after appointments?',
      options: [
        { value: 'yes',       label: 'Yes — clients get a reminder to rebook before results fade' },
        { value: 'sometimes', label: 'Occasionally' },
        { value: 'no',        label: 'No — clients rebook when they want to' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you have a loyalty or VIP system to bring clients back?',
      options: [
        { value: 'yes',       label: 'Yes — we have packages, memberships, or a loyalty program' },
        { value: 'sometimes', label: 'We have something informal' },
        { value: 'no',        label: 'No — no formal retention system' },
      ],
    },
  ],
  'Fitness Studio': [
    {
      key: 'sendsReminders',
      label: 'Do you follow up with members who haven\'t visited in 2+ weeks?',
      options: [
        { value: 'yes',       label: 'Yes — we check in with at-risk members automatically' },
        { value: 'sometimes', label: 'Occasionally — only if staff notices' },
        { value: 'no',        label: 'No — we find out when they cancel' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you have a lapsed member win-back campaign?',
      options: [
        { value: 'yes',       label: 'Yes — we reach out to cancelled or inactive members' },
        { value: 'sometimes', label: 'Occasionally' },
        { value: 'no',        label: 'No — once they leave we move on' },
      ],
    },
  ],
  'Dental Office': [
    {
      key: 'sendsReminders',
      label: 'Do you send recall reminders for cleanings and checkups?',
      options: [
        { value: 'yes',       label: 'Yes — automated recalls go out every 6 months' },
        { value: 'sometimes', label: 'Sometimes — manually for some patients' },
        { value: 'no',        label: 'No — patients schedule on their own initiative' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you re-engage patients who have missed or cancelled appointments?',
      options: [
        { value: 'yes',       label: 'Yes — we follow up with no-shows and cancellations' },
        { value: 'sometimes', label: 'Sometimes' },
        { value: 'no',        label: 'No — if they cancel we wait for them to rebook' },
      ],
    },
  ],
  'Clinic / Healthcare': [
    {
      key: 'sendsReminders',
      label: 'Do you send appointment reminders and reduce no-shows?',
      options: [
        { value: 'yes',       label: 'Yes — automated reminders 24–48 hrs before appointments' },
        { value: 'sometimes', label: 'Sometimes — only for certain appointment types' },
        { value: 'no',        label: 'No — patients are expected to remember on their own' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you follow up with patients after visits for continued care?',
      options: [
        { value: 'yes',       label: 'Yes — post-visit follow-ups are part of our process' },
        { value: 'sometimes', label: 'For some patients' },
        { value: 'no',        label: 'No — patients reach out if they need something' },
      ],
    },
  ],
  'Real Estate': [
    {
      key: 'sendsReminders',
      label: 'Do you have a nurture sequence for leads not ready to buy or sell yet?',
      options: [
        { value: 'yes',       label: 'Yes — long-term drip campaigns keep me top of mind' },
        { value: 'sometimes', label: 'Informal — occasional check-ins' },
        { value: 'no',        label: 'No — if they\'re not ready now I move on' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you stay in touch with past clients to generate referrals?',
      options: [
        { value: 'yes',       label: 'Yes — regular touches, market updates, anniversary messages' },
        { value: 'sometimes', label: 'Occasionally — mostly personal relationships' },
        { value: 'no',        label: 'No systematic approach' },
      ],
    },
  ],
  'Restaurant / Food Service': [
    {
      key: 'sendsReminders',
      label: 'Do you have online ordering or digital reservations?',
      options: [
        { value: 'yes',       label: 'Yes — customers can order or reserve online' },
        { value: 'sometimes', label: 'Partial — only for some channels' },
        { value: 'no',        label: 'No — everything is walk-in or phone' },
      ],
    },
    {
      key: 'hasRepeatSystem',
      label: 'Do you have a way to bring customers back (loyalty, SMS, email)?',
      options: [
        { value: 'yes',       label: 'Yes — loyalty program, email or SMS list' },
        { value: 'sometimes', label: 'Informal — social media mostly' },
        { value: 'no',        label: 'No formal system' },
      ],
    },
  ],
}

const steps = [
  { label: 'Your Business',  fields: ['businessName', 'industry', 'phone', 'cityState', 'mainService'] },
  { label: 'Your Systems',   fields: ['runsAds', 'usesCrm', 'manualFollowUp', 'responseTime', 'asksReviews', 'tracksLeadSource', 'hasGoogleProfile'] },
  { label: 'Your Challenge', fields: ['biggestProblem', 'email'] },
]

interface ScoreResult {
  score: number
  breakdown: ScoreBreakdownItem[]
}

function calculateScore(data: FormData, websiteAnalysis?: WebsiteAnalysis | null): ScoreResult {
  const m = getMultiplier(data.industry)
  let score = 0
  const breakdown: ScoreBreakdownItem[] = []

  const add = (reason: string, pts: number) => {
    if (pts <= 0) return
    score += pts
    breakdown.push({ reason, points: pts })
  }

  // Follow-up
  if (data.manualFollowUp === 'no') {
    add('No lead follow-up process', Math.round(20 * m.followup))
  } else if (data.manualFollowUp === 'manual') {
    add('Manual, inconsistent follow-up', Math.round(12 * m.followup))
  }

  // Reviews
  if (data.asksReviews === 'no') {
    add('Never ask for reviews', Math.round(15 * m.reviews))
  } else if (data.asksReviews === 'sometimes') {
    add('Rarely ask for reviews', Math.round(8 * m.reviews))
  }

  // Ads + tracking
  if (data.runsAds === 'yes' && data.tracksLeadSource === 'no') {
    add('Running ads without conversion tracking', Math.round(18 * m.ads))
  } else if (data.runsAds === 'yes' && data.tracksLeadSource === 'sometimes') {
    add('Inconsistent ad tracking', Math.round(10 * m.ads))
  }

  // CRM
  if (data.usesCrm === 'no') add('No CRM or contact management system', 10)

  // Lead source — only when ads check hasn't already covered it
  if (data.tracksLeadSource === 'no' && data.runsAds !== 'yes') {
    add('Unknown lead sources', 10)
  } else if (data.tracksLeadSource === 'sometimes' && data.runsAds !== 'yes') {
    add('Inconsistent lead source tracking', 5)
  }

  // Response time — only penalize when they have *some* follow-up but it's slow.
  // If manualFollowUp === 'no', they already took the full followup penalty above; don't double-count.
  if (data.manualFollowUp !== 'no') {
    if (data.responseTime === 'next_day') add('Response time: next day or longer', Math.round(5 * m.followup))
    else if (data.responseTime === 'sometimes_never') add('Response time: sometimes never', Math.round(10 * m.followup))
  }

  // Google Business Profile
  if (data.hasGoogleProfile === 'no') {
    add('No Google Business Profile', 12)
  } else if (data.hasGoogleProfile === 'unmanaged') {
    add('Google Business Profile not actively managed', 6)
  }

  // Industry-specific Q1: reminders / estimate follow-up
  if (data.sendsReminders === 'no') {
    add('No reminder or follow-up system', Math.round(8 * m.followup))
  } else if (data.sendsReminders === 'sometimes') {
    add('Inconsistent reminders / follow-ups', Math.round(4 * m.followup))
  }

  // Industry-specific Q2: repeat / reactivation system
  if (data.hasRepeatSystem === 'no') add('No customer reactivation system', 6)
  else if (data.hasRepeatSystem === 'sometimes') add('Informal reactivation only', 3)

  // Biggest problem bonus
  const problemBonus: Record<string, number> = {
    'Leads come in but don\'t convert': 8,
    'Hard to follow up consistently':   10,
    'Customers don\'t leave reviews':   7,
    'Trouble collecting payments':      8,
    'Don\'t know where leads come from': 10,
    'Old customers aren\'t coming back': 6,
    'Too much manual work / admin':     5,
  }
  const bonus = problemBonus[data.biggestProblem] ?? 5
  add(`Reported challenge: "${data.biggestProblem}"`, bonus)

  // Website analysis
  if (websiteAnalysis?.accessible) {
    if (!websiteAnalysis.hasHttps)       add('Website not secured (no HTTPS)', 5)

    // Use PageSpeed score when available; fall back to naive load check
    if (websiteAnalysis.performanceScore !== undefined) {
      if (websiteAnalysis.performanceScore < 30)      add('Very poor mobile performance score', 10)
      else if (websiteAnalysis.performanceScore < 50) add('Poor mobile performance score', 7)
      else if (websiteAnalysis.performanceScore < 70) add('Average mobile performance score', 4)
    } else if (!websiteAnalysis.loadsFast) {
      add('Website loads slowly (>3s)', 7)
    }

    if (!websiteAnalysis.hasPhoneNumber)  add('No phone number on website', 5)
    if (!websiteAnalysis.hasContactForm)  add('No contact form detected', 6)
    if (!websiteAnalysis.hasCallToAction) add('No clear call-to-action', 6)
    if (!websiteAnalysis.hasSocialProof)  add('No reviews or testimonials visible', 4)
    if (!websiteAnalysis.hasMobileViewport) add('Site may not be mobile-friendly', 4)
    if (websiteAnalysis.socialLinksCount === 0) add('No social media presence detected', 2)

    // New website quality signals
    if (!websiteAnalysis.hasMetaDescription) add('Missing search meta description', 5)
    if (!websiteAnalysis.hasLocalSchema)     add('No local business structured data (schema.org)', 5)
    if (!websiteAnalysis.hasBusinessHours)   add('Business hours not listed on website', 4)
    if (!websiteAnalysis.hasAddress)         add('Physical address not visible on website', 3)
    if (!websiteAnalysis.hasGuarantee)       add('No guarantee or warranty mentioned', 3)
    if (!websiteAnalysis.hasFAQ)             add('No FAQ section or common questions', 3)
    if (!websiteAnalysis.hasVideo)           add('No video content on website', 2)

    // Emergency service is only penalized for industries where it matters
    const emergencyIndustries = ['Home Services', 'Contractor / Trades', 'Auto Shop', 'Clinic / Healthcare']
    if (!websiteAnalysis.hasEmergencyService && emergencyIndustries.includes(data.industry)) {
      add('No emergency or same-day service mentioned', 4)
    }
  }

  // Invert: 100 = no leaks, 0 = everything is broken
  return { score: Math.max(0, 100 - Math.min(score, 100)), breakdown }
}

interface Props {
  defaultIndustry?: string
}

export default function ScannerForm({ defaultIndustry }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [data, setData] = useState<FormData>({
    businessName: '', websiteUrl: '', industry: defaultIndustry ?? '', industryOther: '',
    phone: '', cityState: '', mainService: '', avgJobValue: '',
    runsAds: '', usesCrm: '', manualFollowUp: '', responseTime: '', asksReviews: '', tracksLeadSource: '',
    hasGoogleProfile: '', monthlyLeads: '', sendsReminders: '', hasRepeatSystem: '',
    biggestProblem: '', biggestProblemOther: '', email: '',
  })

  const analysisRef  = useRef<Promise<WebsiteAnalysis | null> | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    track('scanner_viewed', { industry: defaultIndustry ?? undefined })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof FormData, value: string) => {
    setData((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validateStep = (): boolean => {
    const required = steps[step].fields as (keyof FormData)[]
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    required.forEach((f) => {
      if (!data[f]) newErrors[f] = 'This field is required'
    })
    if (data.industry === 'Other' && !data.industryOther) {
      newErrors.industryOther = 'Please specify your industry'
    }
    if (data.biggestProblem === 'Other' && !data.biggestProblemOther) {
      newErrors.biggestProblemOther = 'Please describe your challenge'
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const next = () => {
    if (!validateStep()) return
    if (step === 0) {
      // First step completed → scanner started
      startTimeRef.current = Date.now()
      const industry = data.industry === 'Other' ? data.industryOther : data.industry
      track('scanner_started', {
        industry:    industry || undefined,
        website_url: data.websiteUrl || undefined,
      })
      if (data.websiteUrl) {
        analysisRef.current = fetch('/api/scanner/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: data.websiteUrl }),
        })
          .then((r) => r.json() as Promise<WebsiteAnalysis>)
          .catch(() => null)
      }
    } else {
      track('scanner_step_completed', {
        industry:  (data.industry === 'Other' ? data.industryOther : data.industry) || undefined,
        properties: { step },
      })
    }
    setStep((s) => s + 1)
  }

  const back = () => setStep((s) => s - 1)

  const submit = async () => {
    if (!validateStep()) return
    setLoading(true)

    const finalIndustry = data.industry === 'Other' ? data.industryOther : data.industry
    const finalProblem  = data.biggestProblem === 'Other' ? data.biggestProblemOther : data.biggestProblem
    const resolvedData  = { ...data, industry: finalIndustry, biggestProblem: finalProblem }

    let websiteAnalysis: WebsiteAnalysis | null = null
    if (analysisRef.current) {
      const cap = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
      websiteAnalysis = await Promise.race([analysisRef.current, cap])
    }

    track('scanner_submitted', { industry: finalIndustry || undefined })

    const { score, breakdown } = calculateScore(resolvedData, websiteAnalysis)
    const subScores = calculateSubScores({ ...resolvedData, industry: finalIndustry })

    const id = Date.now().toString()

    // Re-scan delta: check localStorage for a previous scan with the same email
    let previousScore: number | undefined
    try {
      for (const key of Object.keys(localStorage)) {
        if (!key.startsWith('scan_') || key === `scan_${id}`) continue
        const prev = JSON.parse(localStorage.getItem(key) ?? 'null')
        if (prev?.email === resolvedData.email && typeof prev?.score === 'number') {
          previousScore = prev.score
          break
        }
      }
    } catch { /* ignore */ }

    const scanPayload = {
      ...resolvedData,
      score,
      breakdown,
      subScores,
      websiteAnalysis,
      previousScore,
      monthlyLeads: data.monthlyLeads || undefined,
      date: new Date().toISOString(),
    }
    localStorage.setItem(`scan_${id}`, JSON.stringify(scanPayload))

    // Track scanner completed with safe aggregate data (no PII)
    track('scanner_completed', {
      industry:    finalIndustry || undefined,
      website_url: resolvedData.websiteUrl || undefined,
      score,
      score_range: scoreRange(score),
      top_leak_ids: breakdown?.slice(0, 5).map((b: ScoreBreakdownItem) => b.reason).filter(Boolean),
      properties:  {
        scan_duration_ms: startTimeRef.current ? Date.now() - startTimeRef.current : undefined,
        has_website: !!resolvedData.websiteUrl,
        avg_job_value_set: !!resolvedData.avgJobValue,
        monthly_leads_set: !!resolvedData.monthlyLeads,
      },
    })

    try {
      await fetch('/api/scanner/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanData: resolvedData, score }),
      })
    } catch {
      console.error('Scanner submit failed')
    }

    router.push(`/scanner/results?id=${id}`)
  }

  const inputClass = (field: keyof FormData) =>
    `w-full border ${errors[field] ? 'border-op-red' : 'border-op-border'} rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white`

  const radioClass = (active: boolean) =>
    `flex items-center gap-3 border ${active ? 'border-op-navy bg-op-navy/10' : 'border-op-border bg-white'} rounded-lg px-4 py-3 cursor-pointer hover:border-op-navy hover:bg-op-navy/5 transition-all`

  const RadioDot = ({ active }: { active: boolean }) => (
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-op-navy' : 'border-op-border'}`}>
      {active && <div className="w-2 h-2 rounded-full bg-op-navy" />}
    </div>
  )

  const progress = ((step) / steps.length) * 100
  const industryQs = INDUSTRY_QUESTIONS[data.industry] ?? null

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold text-op-muted mb-2">
          <span>Step {step + 1} of {steps.length} — {steps[step].label}</span>
          <span>{Math.round(progress + 33)}% complete</span>
        </div>
        <div className="w-full bg-op-border rounded-full h-2">
          <div
            className="bg-op-navy h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress + 33}%` }}
          />
        </div>
      </div>

      {/* Step 1: Business Info */}
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-op-navy mb-1.5">Business Name *</label>
            <input className={inputClass('businessName')} placeholder="e.g. Smith's Plumbing" value={data.businessName} onChange={(e) => set('businessName', e.target.value)} />
            {errors.businessName && <p className="text-xs text-op-red mt-1">{errors.businessName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-op-navy mb-1.5">
              Website URL <span className="text-op-muted font-normal">(optional — enables live site analysis)</span>
            </label>
            <input className={inputClass('websiteUrl')} placeholder="e.g. www.smithsplumbing.com" value={data.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-op-navy mb-1.5">Industry *</label>
            <select className={inputClass('industry')} value={data.industry} onChange={(e) => set('industry', e.target.value)}>
              <option value="">Select your industry</option>
              {industries.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            {errors.industry && <p className="text-xs text-op-red mt-1">{errors.industry}</p>}
            {data.industry === 'Other' && (
              <div className="mt-2">
                <input
                  className={inputClass('industryOther')}
                  placeholder="e.g. Landscaping, Photography, Event Planning..."
                  value={data.industryOther}
                  onChange={(e) => set('industryOther', e.target.value)}
                />
                {errors.industryOther && <p className="text-xs text-op-red mt-1">{errors.industryOther}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">Phone Number *</label>
              <input className={inputClass('phone')} placeholder="(555) 000-0000" value={data.phone} onChange={(e) => set('phone', e.target.value)} />
              {errors.phone && <p className="text-xs text-op-red mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-op-navy mb-1.5">City / State *</label>
              <input className={inputClass('cityState')} placeholder="e.g. Austin, TX" value={data.cityState} onChange={(e) => set('cityState', e.target.value)} />
              {errors.cityState && <p className="text-xs text-op-red mt-1">{errors.cityState}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-op-navy mb-1.5">Main Service You Offer *</label>
            <input className={inputClass('mainService')} placeholder="e.g. Residential plumbing, HVAC installation..." value={data.mainService} onChange={(e) => set('mainService', e.target.value)} />
            {errors.mainService && <p className="text-xs text-op-red mt-1">{errors.mainService}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-op-navy mb-1.5">
              Average Job / Sale Value <span className="text-op-muted font-normal">(optional — enables revenue impact estimates)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-op-muted text-sm">$</span>
              <input
                type="number"
                min="0"
                step="50"
                className={`${inputClass('avgJobValue')} pl-8`}
                placeholder="e.g. 850"
                value={data.avgJobValue}
                onChange={(e) => set('avgJobValue', e.target.value)}
              />
            </div>
            <p className="text-xs text-op-muted mt-1">Used to estimate the monthly revenue impact of each leak.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-op-navy mb-1.5">
              Monthly Leads / Inquiries <span className="text-op-muted font-normal">(optional — improves estimate accuracy)</span>
            </label>
            <select
              className={inputClass('monthlyLeads')}
              value={data.monthlyLeads}
              onChange={(e) => set('monthlyLeads', e.target.value)}
            >
              <option value="">Select a range (or skip)</option>
              <option value="0-10">0–10 per month</option>
              <option value="11-25">11–25 per month</option>
              <option value="26-50">26–50 per month</option>
              <option value="51-100">51–100 per month</option>
              <option value="100+">100+ per month</option>
              <option value="not_sure">Not sure</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Systems */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          {([
            {
              key: 'runsAds' as keyof FormData,
              label: 'Do you run paid ads? (Google, Facebook, etc.)',
              options: [
                { value: 'yes',      label: 'Yes — Google, Facebook, or other paid ads' },
                { value: 'no',       label: 'No — only organic / word of mouth' },
                { value: 'planning', label: 'Not yet, but planning to start' },
              ],
            },
            {
              key: 'usesCrm' as keyof FormData,
              label: 'How do you manage your contacts and customers?',
              options: [
                { value: 'yes',     label: 'We use a proper CRM (HubSpot, GoHighLevel, etc.)' },
                { value: 'partial', label: 'Sort of — spreadsheets, notes, or basic tools' },
                { value: 'no',      label: 'We don\'t have a system — it\'s all in our heads' },
              ],
            },
            {
              key: 'manualFollowUp' as keyof FormData,
              label: 'How do you follow up with new leads?',
              options: [
                { value: 'automated', label: 'Automated — sequences fire without us doing anything' },
                { value: 'manual',    label: 'Manually — we call or email when we remember' },
                { value: 'no',        label: 'Honestly, we don\'t have a real follow-up process' },
              ],
            },
            {
              key: 'responseTime' as keyof FormData,
              label: 'How quickly do you typically respond to a new lead or inquiry?',
              options: [
                { value: 'under_5min',      label: 'Under 5 minutes — we respond immediately' },
                { value: 'within_1hr',      label: 'Within 1 hour — we check messages regularly' },
                { value: 'same_day',        label: 'Same day — we get back to people when we can' },
                { value: 'next_day',        label: 'Next day or longer' },
                { value: 'sometimes_never', label: 'Sometimes not at all — depends on how busy we are' },
              ],
            },
            {
              key: 'asksReviews' as keyof FormData,
              label: 'Do you ask customers to leave Google / online reviews?',
              options: [
                { value: 'always',    label: 'Yes — we ask every customer, every time' },
                { value: 'sometimes', label: 'Occasionally — only if we think of it' },
                { value: 'no',        label: 'Rarely or never — we don\'t have a process for it' },
              ],
            },
            {
              key: 'tracksLeadSource' as keyof FormData,
              label: 'Do you know where your leads and customers come from?',
              options: [
                { value: 'yes',       label: 'Yes — we track it in a system or spreadsheet' },
                { value: 'sometimes', label: 'Sometimes — we have a rough idea but it\'s not tracked' },
                { value: 'no',        label: 'Not really — we\'re not sure what\'s working' },
              ],
            },
            {
              key: 'hasGoogleProfile' as keyof FormData,
              label: 'Do you have a Google Business Profile (Google Maps listing)?',
              options: [
                { value: 'yes',       label: 'Yes — claimed, verified, and I keep it updated' },
                { value: 'unmanaged', label: 'It exists but I rarely log in or update it' },
                { value: 'no',        label: 'No, or I\'m not sure if I have one' },
              ],
            },
          ] as { key: keyof FormData; label: string; options: { value: string; label: string }[] }[]).map(({ key, label, options }) => (
            <div key={key}>
              <p className="text-sm font-semibold text-op-navy mb-3">{label} *</p>
              <div className="flex flex-col gap-2">
                {options.map((opt) => (
                  <label key={opt.value} className={radioClass(data[key] === opt.value)}>
                    <RadioDot active={data[key] === opt.value} />
                    <input type="radio" className="sr-only" name={key} value={opt.value} checked={data[key] === opt.value} onChange={() => set(key, opt.value)} />
                    <span className="text-sm text-op-body">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors[key] && <p className="text-xs text-op-red mt-1">{errors[key]}</p>}
            </div>
          ))}

          {/* Industry-specific questions */}
          {industryQs && (
            <>
              <div className="border-t border-op-border pt-2">
                <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-4">
                  {data.industry} — specific questions
                </p>
              </div>
              {industryQs.map(({ key, label, options }) => (
                <div key={key}>
                  <p className="text-sm font-semibold text-op-navy mb-3">{label}</p>
                  <div className="flex flex-col gap-2">
                    {options.map((opt) => (
                      <label key={opt.value} className={radioClass(data[key] === opt.value)}>
                        <RadioDot active={data[key] === opt.value} />
                        <input type="radio" className="sr-only" name={key} value={opt.value} checked={data[key] === opt.value} onChange={() => set(key, opt.value)} />
                        <span className="text-sm text-op-body">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Step 3: Challenge + Email */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-semibold text-op-navy mb-3">What is your biggest challenge right now? *</p>
            <div className="flex flex-col gap-2">
              {problems.map((p) => (
                <label key={p} className={radioClass(data.biggestProblem === p)}>
                  <RadioDot active={data.biggestProblem === p} />
                  <input type="radio" className="sr-only" name="biggestProblem" value={p} checked={data.biggestProblem === p} onChange={() => set('biggestProblem', p)} />
                  <span className="text-sm text-op-body">{p}</span>
                </label>
              ))}
            </div>
            {errors.biggestProblem && <p className="text-xs text-op-red mt-1">{errors.biggestProblem}</p>}
            {data.biggestProblem === 'Other' && (
              <div className="mt-3">
                <input
                  className={inputClass('biggestProblemOther')}
                  placeholder="Describe your biggest challenge..."
                  value={data.biggestProblemOther}
                  onChange={(e) => set('biggestProblemOther', e.target.value)}
                />
                {errors.biggestProblemOther && <p className="text-xs text-op-red mt-1">{errors.biggestProblemOther}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-op-navy mb-1.5">Email Address to Receive Your Results *</label>
            <input
              type="email"
              className={inputClass('email')}
              placeholder="you@yourbusiness.com"
              value={data.email}
              onChange={(e) => set('email', e.target.value)}
            />
            {errors.email && <p className="text-xs text-op-red mt-1">{errors.email}</p>}
            <p className="text-xs text-op-muted mt-2">
              Your Revenue Leak Score will be sent to this address. No spam — ever.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-op-amber leading-relaxed">
              <strong>Note:</strong> Your score is based on your answers and available information. Revenue Leak Scores are informational only — Operon does not guarantee specific financial results.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-op-border">
        <button
          onClick={back}
          disabled={step === 0}
          className="btn-secondary px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < steps.length - 1 ? (
          <button onClick={next} className="btn-primary px-6 py-2.5">
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={submit} disabled={loading} className="btn-primary px-6 py-2.5 min-w-[180px]">
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Generating Score...</>
            ) : (
              <>Generate My Score <ChevronRight size={16} /></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
