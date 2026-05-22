'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  Phone,
  Star,
  FileText,
  BarChart2,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Loader2,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ScanData {
  businessName: string
  industry: string
  cityState: string
  runsAds: string
  usesCrm: string
  manualFollowUp: string
  asksReviews: string
  tracksLeadSource: string
  biggestProblem: string
  score: number
}

interface Leak {
  icon: React.ElementType
  title: string
  impact: 'High' | 'Medium' | 'Low'
  description: string
  fix: string
  automation: string
}

function buildLeaks(data: ScanData): Leak[] {
  const leaks: Leak[] = []

  if (data.manualFollowUp === 'no') {
    leaks.push({
      icon: Phone,
      title: 'No Lead Follow-Up System',
      impact: 'High',
      description: 'Based on your answers, new leads may not be getting timely follow-up. Without a system, most leads go cold within 24 hours.',
      fix: 'Activate an automated lead follow-up sequence via text and email.',
      automation: 'Lead Follow-Up Agent — responds to new leads within minutes.',
    })
  } else if (data.manualFollowUp === 'manual') {
    leaks.push({
      icon: Phone,
      title: 'Manual Lead Follow-Up',
      impact: 'High',
      description: 'You follow up manually, which means speed and consistency depend on how busy you are. Leads contacted within 5 minutes convert far better.',
      fix: 'Add automated first-touch follow-up so every lead gets a fast response, even when you\'re busy.',
      automation: 'Lead Follow-Up Agent — handles first contact, then alerts you for qualified leads.',
    })
  }

  if (data.asksReviews === 'no' || data.asksReviews === 'sometimes') {
    leaks.push({
      icon: Star,
      title: 'Weak Review Loop',
      impact: data.asksReviews === 'no' ? 'High' : 'Medium',
      description: 'Businesses that don\'t consistently ask for reviews miss out on the social proof that drives new customers. Most happy customers won\'t review unless asked.',
      fix: 'Set up an automatic review request sequence sent to every completed job.',
      automation: 'Review Request Agent — sends review links after service completion.',
    })
  }

  if (data.runsAds === 'yes' && data.tracksLeadSource === 'no') {
    leaks.push({
      icon: BarChart2,
      title: 'Untracked Ad Spend',
      impact: 'High',
      description: 'You\'re running ads but not tracking which ones produce real customers. This means budget may be going to campaigns that don\'t convert.',
      fix: 'Implement lead source tracking so every lead is tied to the campaign that produced it.',
      automation: 'Ad Tracking Setup — connects ad clicks to actual conversions in your dashboard.',
    })
  }

  leaks.push({
    icon: FileText,
    title: 'No Estimate Follow-Up System',
    impact: 'Medium',
    description: 'Estimates that go unanswered are potential customers who just needed a nudge. Most businesses never follow up on open quotes.',
    fix: 'Create an automated estimate follow-up sequence at 2, 5, and 7 days.',
    automation: 'Estimate Follow-Up Agent — follows up on open estimates before they go cold.',
  })

  if (!data.usesCrm || data.usesCrm === 'no') {
    leaks.push({
      icon: Users,
      title: 'No Customer Reactivation',
      impact: 'Medium',
      description: 'Without a CRM or contact system, past customers who haven\'t returned in 6+ months are likely forgotten. These are your warmest leads.',
      fix: 'Build a customer reactivation campaign targeting past clients.',
      automation: 'Customer Reactivation Agent — identifies dormant customers and re-engages them.',
    })
  }

  if (data.tracksLeadSource === 'no') {
    leaks.push({
      icon: TrendingUp,
      title: 'No Lead Source Visibility',
      impact: 'Medium',
      description: 'Without knowing where leads come from, it\'s impossible to know what marketing is working or where to invest more.',
      fix: 'Set up UTM tracking and a lead source dashboard.',
      automation: 'Revenue Dashboard — shows lead source breakdown automatically.',
    })
  }

  return leaks.slice(0, 5)
}

const impactColors: Record<string, string> = {
  High:   'badge-red',
  Medium: 'badge-amber',
  Low:    'badge-blue',
}

const scoreLabel = (score: number) => {
  if (score >= 75) return { label: 'Critical', color: 'text-op-red',   border: 'border-op-red',   bg: 'bg-red-50'   }
  if (score >= 55) return { label: 'High',     color: 'text-op-amber', border: 'border-op-amber', bg: 'bg-amber-50' }
  return               { label: 'Moderate',    color: 'text-op-blue',  border: 'border-op-blue',  bg: 'bg-blue-50'  }
}

const DEMO: ScanData = {
  businessName: 'Your Business',
  industry: 'Home Services',
  cityState: '',
  runsAds: 'yes',
  usesCrm: 'no',
  manualFollowUp: 'manual',
  asksReviews: 'sometimes',
  tracksLeadSource: 'no',
  biggestProblem: 'Leads come in but don\'t convert',
  score: 68,
}

export default function ResultsDisplay() {
  const params = useSearchParams()
  const id = params.get('id')
  const [scan, setScan] = useState<ScanData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [savedToDash, setSavedToDash] = useState(false)

  useEffect(() => {
    const init = async () => {
      // Load scan data
      let scanData: ScanData | null = null
      if (id) {
        const raw = localStorage.getItem(`scan_${id}`)
        scanData = raw ? (JSON.parse(raw) as ScanData) : DEMO
      } else {
        scanData = DEMO
      }
      setScan(scanData)
      setLoaded(true)

      // Check auth — if logged in, auto-save this scan to their account
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        if (id && scanData && scanData !== DEMO) {
          try {
            await fetch('/api/scanner/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scanData }),
            })
            setSavedToDash(true)
          } catch {
            // non-blocking
          }
        }
      }
    }
    init()
  }, [id])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-op-blue" />
      </div>
    )
  }

  if (!scan) return null

  const leaks = buildLeaks(scan)
  const sl = scoreLabel(scan.score)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score card */}
      <div className={`card mb-8 border-2 ${sl.border} ${sl.bg}`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className={`w-24 h-24 rounded-full border-4 ${sl.border} flex flex-col items-center justify-center shrink-0`}>
            <span className={`text-3xl font-extrabold font-manrope ${sl.color}`}>{scan.score}</span>
            <span className="text-xs text-op-muted">/100</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-1">Revenue Leak Score for</p>
            <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">{scan.businessName || 'Your Business'}</h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${sl.border} ${sl.color} ${sl.bg}`}>
              <AlertTriangle size={12} /> {sl.label} Leak Risk
            </span>
            <p className="text-sm text-op-muted mt-3 leading-relaxed">
              Based on your answers, we identified <strong className="text-op-navy">{leaks.length} potential revenue leaks</strong> in your business. The items below show where customers may be slipping away — and what to fix first.
            </p>
            <p className="text-xs text-op-muted/70 mt-2 italic">
              This score is based on your answers and is informational only. It does not represent a guarantee of revenue recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Save to account banner */}
      {isLoggedIn && savedToDash ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6">
          <CheckCircle2 size={18} className="text-op-green shrink-0" />
          <div>
            <p className="text-sm font-semibold text-op-green">Saved to your dashboard</p>
            <p className="text-xs text-op-muted">View your results anytime in Revenue Autopilot.</p>
          </div>
          <Link href="/dashboard" className="btn-primary text-xs px-4 py-2 ml-auto shrink-0">
            Open Dashboard <ArrowRight size={13} />
          </Link>
        </div>
      ) : !isLoggedIn ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
          <div className="w-9 h-9 bg-op-blue rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-op-navy">Save your results and track your fixes</p>
            <p className="text-xs text-op-muted mt-0.5">
              Create a free account to access your Revenue Autopilot dashboard and activate fixes.
            </p>
          </div>
          <Link
            href={`/signup${id ? `?fromScan=${id}` : ''}`}
            className="btn-primary text-xs px-4 py-2 shrink-0"
          >
            Create Free Account <ArrowRight size={13} />
          </Link>
        </div>
      ) : null}

      {/* Leak cards */}
      <div className="flex flex-col gap-4 mb-10">
        {leaks.map(({ icon: Icon, title, impact, description, fix, automation }, i) => (
          <div key={title} className="card border border-op-border">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-op-bg flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-op-navy" />
                </div>
                <div>
                  <p className="text-xs text-op-muted font-inter">Leak #{i + 1}</p>
                  <h3 className="font-semibold font-manrope text-op-navy text-sm">{title}</h3>
                </div>
              </div>
              <span className={impactColors[impact]}>{impact} Impact</span>
            </div>

            <p className="text-sm text-op-muted leading-relaxed mb-3">{description}</p>

            <div className="bg-op-bg rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-op-navy mb-1">Recommended Fix</p>
              <p className="text-xs text-op-body">{fix}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-op-green">
              <CheckCircle2 size={13} className="shrink-0" />
              <span><strong>Suggested Automation:</strong> {automation}</span>
            </div>

            <div className="flex gap-2 mt-4">
              <Link href="/revenue-autopilot" className="btn-primary text-xs px-4 py-2">
                Activate This Fix
              </Link>
              <Link href="/contact" className="btn-secondary text-xs px-4 py-2">
                Request Setup Help
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="card border-2 border-op-blue mb-8">
        <h3 className="font-bold font-manrope text-op-navy mb-3">Recommended Next Steps</h3>
        <ol className="flex flex-col gap-3">
          {[
            'Activate Revenue Autopilot to start fixing these leaks automatically.',
            'Enable the Lead Follow-Up Agent first — it typically has the fastest impact.',
            'Set up the Review Request Agent to build social proof with existing customers.',
            'Review your weekly report to track what\'s recovering over time.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-op-body">
              <span className="w-5 h-5 rounded-full bg-op-blue text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/revenue-autopilot" className="btn-primary flex-1 justify-center py-4">
          Activate Revenue Autopilot <ArrowRight size={17} />
        </Link>
        <Link href="/contact" className="btn-secondary flex-1 justify-center py-4">
          Request Setup Help
        </Link>
      </div>

      <p className="text-center text-xs text-op-muted mt-5">
        Revenue Leak Scores are based on your answers and available information. Operon does not guarantee specific financial results or revenue increases.
      </p>
    </div>
  )
}
