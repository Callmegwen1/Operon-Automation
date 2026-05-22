'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { calculateSubScores } from '@/lib/scanner/subscores'
import type { WebsiteAnalysis } from '@/lib/scanner/types'

interface FormData {
  businessName: string
  websiteUrl: string
  industry: string
  industryOther: string
  phone: string
  cityState: string
  mainService: string
  runsAds: string
  usesCrm: string
  manualFollowUp: string
  asksReviews: string
  tracksLeadSource: string
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

const steps = [
  { label: 'Your Business',  fields: ['businessName', 'industry', 'phone', 'cityState', 'mainService'] },
  { label: 'Your Systems',   fields: ['runsAds', 'usesCrm', 'manualFollowUp', 'asksReviews', 'tracksLeadSource'] },
  { label: 'Your Challenge', fields: ['biggestProblem', 'email'] },
]

function calculateScore(data: FormData): number {
  let score = 35

  if (data.runsAds === 'yes' && data.tracksLeadSource === 'no') score += 18
  if (data.runsAds === 'yes' && data.tracksLeadSource === 'sometimes') score += 10
  if (data.manualFollowUp === 'no') score += 20
  if (data.manualFollowUp === 'manual') score += 12
  if (data.asksReviews === 'no') score += 15
  if (data.asksReviews === 'sometimes') score += 8
  if (data.usesCrm === 'no') score += 10
  if (data.tracksLeadSource === 'no') score += 10

  const problemBonus: Record<string, number> = {
    'Leads come in but don\'t convert': 8,
    'Hard to follow up consistently': 10,
    'Customers don\'t leave reviews': 7,
    'Trouble collecting payments': 8,
    'Don\'t know where leads come from': 10,
    'Old customers aren\'t coming back': 6,
    'Too much manual work / admin': 5,
  }
  score += problemBonus[data.biggestProblem] ?? 5

  return Math.min(score, 94)
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
    phone: '', cityState: '', mainService: '', runsAds: '', usesCrm: '',
    manualFollowUp: '', asksReviews: '', tracksLeadSource: '',
    biggestProblem: '', biggestProblemOther: '', email: '',
  })

  const analysisRef = useRef<Promise<WebsiteAnalysis | null> | null>(null)

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
    if (step === 0 && data.websiteUrl) {
      analysisRef.current = fetch('/api/scanner/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.websiteUrl }),
      })
        .then((r) => r.json() as Promise<WebsiteAnalysis>)
        .catch(() => null)
    }
    setStep((s) => s + 1)
  }

  const back = () => setStep((s) => s - 1)

  const submit = async () => {
    if (!validateStep()) return
    setLoading(true)

    // Resolve "Other" values before saving
    const finalIndustry = data.industry === 'Other' ? data.industryOther : data.industry
    const finalProblem   = data.biggestProblem === 'Other' ? data.biggestProblemOther : data.biggestProblem

    const resolvedData = { ...data, industry: finalIndustry, biggestProblem: finalProblem }
    const score = calculateScore(resolvedData)
    const subScores = calculateSubScores(resolvedData)

    let websiteAnalysis: WebsiteAnalysis | null = null
    if (analysisRef.current) {
      const cap = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
      websiteAnalysis = await Promise.race([analysisRef.current, cap])
    }

    const id = Date.now().toString()
    const scanPayload = { ...resolvedData, score, subScores, websiteAnalysis, date: new Date().toISOString() }
    localStorage.setItem(`scan_${id}`, JSON.stringify(scanPayload))

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
    `w-full border ${errors[field] ? 'border-op-red' : 'border-op-border'} rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-blue/40 focus:border-op-blue transition-all bg-white`

  const radioClass = (active: boolean) =>
    `flex items-center gap-3 border ${active ? 'border-op-blue bg-blue-50' : 'border-op-border bg-white'} rounded-lg px-4 py-3 cursor-pointer hover:border-op-blue hover:bg-blue-50/50 transition-all`

  const RadioDot = ({ active }: { active: boolean }) => (
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-op-blue' : 'border-op-border'}`}>
      {active && <div className="w-2 h-2 rounded-full bg-op-blue" />}
    </div>
  )

  const progress = ((step) / steps.length) * 100

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
            className="bg-op-blue h-2 rounded-full transition-all duration-500"
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
                { value: 'no',       label: 'No — only organic / word of mouth'          },
                { value: 'planning', label: 'Not yet, but planning to start'             },
              ],
            },
            {
              key: 'usesCrm' as keyof FormData,
              label: 'How do you manage your contacts and customers?',
              options: [
                { value: 'yes',     label: 'We use a proper CRM (HubSpot, GoHighLevel, etc.)' },
                { value: 'partial', label: 'Sort of — spreadsheets, notes, or basic tools'    },
                { value: 'no',      label: 'We don\'t have a system — it\'s all in our heads' },
              ],
            },
            {
              key: 'manualFollowUp' as keyof FormData,
              label: 'How do you follow up with new leads?',
              options: [
                { value: 'automated', label: 'Automated — sequences fire without us doing anything' },
                { value: 'manual',    label: 'Manually — we call or email when we remember'         },
                { value: 'no',        label: 'Honestly, we don\'t have a real follow-up process'    },
              ],
            },
            {
              key: 'asksReviews' as keyof FormData,
              label: 'Do you ask customers to leave Google / online reviews?',
              options: [
                { value: 'always',    label: 'Yes — we ask every customer, every time'       },
                { value: 'sometimes', label: 'Occasionally — only if we think of it'         },
                { value: 'no',        label: 'Rarely or never — we don\'t have a process for it' },
              ],
            },
            {
              key: 'tracksLeadSource' as keyof FormData,
              label: 'Do you know where your leads and customers come from?',
              options: [
                { value: 'yes',       label: 'Yes — we track it in a system or spreadsheet'  },
                { value: 'sometimes', label: 'Sometimes — we have a rough idea but it\'s not tracked' },
                { value: 'no',        label: 'Not really — we\'re not sure what\'s working'  },
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
