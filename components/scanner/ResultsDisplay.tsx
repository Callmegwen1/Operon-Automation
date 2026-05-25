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
  XCircle,
  ArrowRight,
  TrendingUp,
  Loader2,
  Zap,
  Globe,
  Smartphone,
  Share2,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Mail,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateSubScores } from '@/lib/scanner/subscores'
import { getBenchmark } from '@/lib/scanner/benchmarks'
import { getIndustryCopy } from '@/lib/scanner/industry-copy'
import {
  estimateMonthlyImpact,
  formatImpact,
  getConfidence,
  getMonthlyLeadsFromInput,
} from '@/lib/scanner/revenue'
import type { SubScore, WebsiteAnalysis, ScoreBreakdownItem } from '@/lib/scanner/types'
import type { LeakType } from '@/lib/scanner/revenue'

interface ScanData {
  businessName: string
  industry: string
  cityState: string
  websiteUrl?: string
  runsAds: string
  usesCrm: string
  manualFollowUp: string
  responseTime?: string
  asksReviews: string
  tracksLeadSource: string
  hasGoogleProfile?: string
  monthlyLeads?: string
  sendsReminders?: string
  hasRepeatSystem?: string
  biggestProblem: string
  avgJobValue?: string
  score: number
  subScores?: SubScore[]
  websiteAnalysis?: WebsiteAnalysis | null
  breakdown?: ScoreBreakdownItem[]
  previousScore?: number
}

interface Leak {
  icon: React.ElementType
  title: string
  impact: 'High' | 'Medium' | 'Low'
  description: string
  fix: string
  automation: string
  leakType: LeakType
  severity: 'major' | 'minor'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  operonHelps: boolean
  confidence: 'High' | 'Medium' | 'Low'
  evidence: string[]
}

function buildLeaks(data: ScanData): { major: Leak[]; minor: Leak[] } {
  const major: Leak[] = []
  const minor: Leak[] = []
  const wa = data.websiteAnalysis
  const respSlow = data.responseTime === 'next_day' || data.responseTime === 'sometimes_never'
  const copy = getIndustryCopy(data.industry)

  let followupCovered = false
  let crmCovered = false
  let reviewsCovered = false
  let gbpCovered = false
  let websiteFormCovered = false

  // Pattern A: Leads slipping through the cracks
  const patternA = (data.manualFollowUp !== 'automated' || respSlow) && data.usesCrm === 'no'
  if (patternA) {
    followupCovered = true
    crmCovered = true
    major.push({
      icon: Phone,
      title: 'Leads May Be Slipping Through the Cracks',
      impact: 'High',
      leakType: 'followup',
      severity: 'major',
      difficulty: 'Medium',
      operonHelps: true,
      description: copy.patternA,
      fix: 'Activate an automated lead follow-up sequence that fires within minutes of a new inquiry, and centralize contacts in a CRM so nothing falls through.',
      automation: 'Lead Follow-Up Agent — responds to every lead within minutes, then alerts you for qualified conversations.',
      confidence: 'High',
      evidence: [
        `You said follow-up is ${data.manualFollowUp === 'no' ? 'not consistently happening' : 'handled manually'}.`,
        data.responseTime === 'next_day' ? 'New leads typically get a next-day response or longer.' :
        data.responseTime === 'sometimes_never' ? 'Response to new leads happens sometimes, or not at all.' : null,
        'No CRM or contact management system was indicated.',
      ].filter(Boolean) as string[],
    })
  }

  // Pattern B: Ad spend without attribution
  if (data.runsAds === 'yes' && data.tracksLeadSource === 'no') {
    major.push({
      icon: BarChart2,
      title: 'Ad Spend Without Clear Attribution',
      impact: 'High',
      leakType: 'ads',
      severity: 'major',
      difficulty: 'Medium',
      operonHelps: true,
      description:
        "You're running paid ads but not tracking which campaigns produce real customers. Budget is almost certainly going to campaigns that look active but don't convert.",
      fix: 'Implement lead source tracking so every lead is tied to the campaign that produced it.',
      automation: 'Revenue Dashboard — connects ad clicks to actual closed jobs in your reporting.',
      confidence: 'High',
      evidence: [
        'You said you run paid ads.',
        'You said you do not clearly track where leads come from.',
        'Without attribution, budget may be going to campaigns that generate traffic but not booked jobs.',
      ],
    })
  }

  // Pattern C: Website has no clear contact path
  const patternC = !!(wa?.accessible && !wa.hasCallToAction && !wa.hasBookingWidget && !wa.hasContactForm)
  if (patternC) {
    websiteFormCovered = true
    major.push({
      icon: FileText,
      title: 'Website Has No Clear Contact Path',
      impact: 'High',
      leakType: 'website_form',
      severity: 'major',
      difficulty: 'Easy',
      operonHelps: true,
      description:
        'Your website has no call-to-action, no booking widget, and no contact form. Visitors who are ready to hire someone leave with no way to reach you.',
      fix: 'Add a prominent call-to-action and at least one contact path (form or booking) to every page.',
      automation: "Operon's embeddable lead form installs in minutes and auto-follows up with every submission.",
      confidence: wa?.accessible ? 'High' : 'Medium',
      evidence: [
        wa?.accessible ? 'We scanned your website and key linked pages.' : null,
        'No clear call-to-action was detected on the scanned pages.',
        'No booking widget or contact form was found.',
      ].filter(Boolean) as string[],
    })
  }

  // Pattern D: Weak local trust signals
  const patternD =
    !wa?.hasSocialProof &&
    (data.hasGoogleProfile === 'no' || data.hasGoogleProfile === 'unmanaged') &&
    data.asksReviews !== 'always'
  if (patternD) {
    reviewsCovered = true
    gbpCovered = true
    major.push({
      icon: Star,
      title: 'Weak Local Trust Signals',
      impact: 'Medium',
      leakType: 'reviews',
      severity: 'major',
      difficulty: 'Medium',
      operonHelps: true,
      description: copy.reviewsPatternD,
      fix: 'Ask every completed customer for a review, respond to existing ones, and keep your Google profile updated with photos and current information.',
      automation: 'Review Request Agent — automatically sends review requests after each job and routes them to your Google profile.',
      confidence: 'High',
      evidence: [
        data.asksReviews === 'no' ? 'You said review requests are not part of your process.' : 'You said review requests happen only sometimes.',
        data.hasGoogleProfile === 'no' ? 'You indicated no active Google Business Profile.' :
        data.hasGoogleProfile === 'unmanaged' ? 'You indicated your Google Business Profile is not actively managed.' : null,
        !wa?.hasSocialProof ? 'No testimonials or reviews were detected on the scanned pages.' : null,
      ].filter(Boolean) as string[],
    })
  }

  // Individual follow-up (only if Pattern A didn't fire)
  if (!followupCovered) {
    if (data.manualFollowUp === 'no') {
      major.push({
        icon: Phone,
        title: 'No Lead Follow-Up System',
        impact: 'High',
        leakType: 'followup',
        severity: 'major',
        difficulty: 'Medium',
        operonHelps: true,
        description: copy.noFollowup,
        fix: 'Activate an automated lead follow-up sequence via text and email.',
        automation: 'Lead Follow-Up Agent — responds to new leads within minutes.',
        confidence: 'High',
        evidence: [
          'You said new leads do not receive consistent follow-up.',
          'Without a system, leads go cold within 24 hours on average.',
        ],
      })
    } else if (data.manualFollowUp === 'manual') {
      major.push({
        icon: Phone,
        title: 'Manual Lead Follow-Up',
        impact: 'High',
        leakType: 'followup_manual',
        severity: 'major',
        difficulty: 'Easy',
        operonHelps: true,
        description: copy.manualFollowup,
        fix: 'Add automated first-touch follow-up so every lead gets a fast response, even during your busiest days.',
        automation: 'Lead Follow-Up Agent — handles first contact, then alerts you for qualified leads.',
        confidence: 'High',
        evidence: [
          'You said follow-up is handled manually rather than through an automated system.',
          'Manual follow-up creates gaps during your busiest periods — when response speed matters most.',
        ],
      })
    }
    if (respSlow && data.manualFollowUp !== 'no') {
      major.push({
        icon: Phone,
        title: 'Slow Lead Response Time',
        impact: 'High',
        leakType: 'followup',
        severity: 'major',
        difficulty: 'Easy',
        operonHelps: true,
        description: copy.slowResponse(data.responseTime ?? 'next_day'),
        fix: 'Set up an automated first-touch message that fires within minutes of any new inquiry.',
        automation: "Lead Follow-Up Agent — instantly acknowledges every new lead while you're busy.",
        confidence: 'High',
        evidence: [
          `You said new leads typically get ${data.responseTime === 'next_day' ? 'a next-day response or longer' : 'a response sometimes, or not at all'}.`,
          'Research shows leads contacted within 5 minutes are 21× more likely to convert than those reached after an hour.',
        ],
      })
    }
  }

  // Individual reviews (only if Pattern D didn't fire)
  if (!reviewsCovered && (data.asksReviews === 'no' || data.asksReviews === 'sometimes')) {
    major.push({
      icon: Star,
      title: 'Weak Review Loop',
      impact: data.asksReviews === 'no' ? 'High' : 'Medium',
      leakType: 'reviews',
      severity: 'major',
      difficulty: 'Easy',
      operonHelps: true,
      description: copy.reviewsIndividual,
      fix: 'Set up an automatic review request sequence sent to every completed job.',
      automation: 'Review Request Agent — sends review links after service completion.',
      confidence: 'High',
      evidence: [
        `You said reviews are requested ${data.asksReviews === 'no' ? 'rarely or never' : 'only sometimes'}.`,
        !wa?.hasSocialProof ? 'No visible testimonial or review content was detected on the scanned pages.' : null,
      ].filter(Boolean) as string[],
    })
  }

  // Website phone
  if (wa?.accessible && !wa.hasPhoneNumber) {
    major.push({
      icon: Phone,
      title: 'Phone Number Not Found on Website',
      impact: 'Medium',
      leakType: 'website_phone',
      severity: 'major',
      difficulty: 'Easy',
      operonHelps: false,
      description:
        "Our live scan couldn't find a phone number. Customers ready to call right now can't find you — some will choose a competitor who makes it easier.",
      fix: 'Add your business phone to your website header and footer so it\'s visible on every page.',
      automation: 'Operon includes your business phone in every automated follow-up email sent to leads.',
      confidence: 'Medium',
      evidence: [
        'We scanned your homepage and did not detect a visible phone number.',
        'This includes checks in visible text, structured data, and common header and footer locations.',
      ],
    })
  }

  // Website form/booking (only if Pattern C didn't fire)
  if (!websiteFormCovered && wa?.accessible && !wa.hasContactForm && !wa.hasBookingWidget) {
    major.push({
      icon: FileText,
      title: 'No Way to Contact You Online',
      impact: 'Medium',
      leakType: 'website_form',
      severity: 'major',
      difficulty: 'Easy',
      operonHelps: true,
      description:
        "Your website has no contact form or online booking. Visitors who prefer not to call leave with no way to reach you.",
      fix: 'Add a contact form or booking widget to capture leads 24/7, even when you\'re unavailable.',
      automation: "Operon's embeddable lead form installs in minutes and auto-follows up with every submission.",
      confidence: 'Medium',
      evidence: [
        'We checked the homepage and likely contact pages but did not detect a contact form or booking widget.',
        'Visitors who prefer not to call have no reliable way to reach you.',
      ],
    })
  }

  // Estimate follow-up
  if (data.manualFollowUp !== 'automated') {
    major.push({
      icon: FileText,
      title: 'No Estimate Follow-Up System',
      impact: 'Medium',
      leakType: 'estimate',
      severity: 'major',
      difficulty: 'Medium',
      operonHelps: true,
      description: copy.estimateFollowup,
      fix: 'Create an automated estimate follow-up sequence at 2, 5, and 7 days.',
      automation: 'Estimate Follow-Up Agent — follows up on open estimates before they go cold.',
      confidence: 'High',
      evidence: [
        `You said follow-up is ${data.manualFollowUp === 'manual' ? 'handled manually' : 'not fully automated'}.`,
        'Most businesses never systematically follow up on open estimates — jobs that were close to closing go cold.',
      ],
    })
  }

  // CRM / reactivation (only if Pattern A didn't fire)
  if (!crmCovered && data.usesCrm === 'no') {
    major.push({
      icon: Users,
      title: 'No Customer Reactivation',
      impact: 'Medium',
      leakType: 'reactivation',
      severity: 'major',
      difficulty: 'Medium',
      operonHelps: true,
      description: copy.reactivation,
      fix: 'Build a customer reactivation campaign targeting past clients.',
      automation: 'Customer Reactivation Agent — identifies dormant customers and re-engages them.',
      confidence: 'High',
      evidence: [
        'You said you do not use a CRM or contact management system.',
        'Without a contact database, there is no reliable way to identify or re-engage past clients.',
      ],
    })
  }

  // Lead source visibility
  if (data.tracksLeadSource === 'no' && data.runsAds !== 'yes') {
    major.push({
      icon: TrendingUp,
      title: 'No Lead Source Visibility',
      impact: 'Medium',
      leakType: 'lead_source',
      severity: 'major',
      difficulty: 'Medium',
      operonHelps: false,
      description:
        "Without knowing where leads come from, it's impossible to know what marketing is working or where to invest more.",
      fix: 'Set up UTM tracking and a lead source dashboard.',
      automation: 'Revenue Dashboard — shows lead source breakdown automatically.',
      confidence: 'High',
      evidence: [
        'You said you do not clearly track where leads come from.',
        'Without source data, there is no way to know which marketing is working or where to invest next.',
      ],
    })
  }

  // GBP (only if Pattern D didn't fire)
  if (!gbpCovered) {
    if (data.hasGoogleProfile === 'no') {
      major.push({
        icon: Globe,
        title: 'No Google Business Profile',
        impact: 'High',
        leakType: 'google_profile',
        severity: 'major',
        difficulty: 'Easy',
        operonHelps: true,
        description:
          "Google Business Profile is the #1 driver of local search visibility. Without it, you're invisible when customers search for your service in your city.",
        fix: 'Claim and verify your Google Business Profile at business.google.com, add photos, hours, and services.',
        automation: 'Operon can automatically request reviews and send them to your GBP link once verified.',
        confidence: 'High',
        evidence: [
          'You indicated no active Google Business Profile.',
          'Google Business Profile is the primary driver of local search visibility for service businesses.',
        ],
      })
    } else if (data.hasGoogleProfile === 'unmanaged') {
      major.push({
        icon: Globe,
        title: 'Unmanaged Google Business Profile',
        impact: 'Medium',
        leakType: 'google_profile',
        severity: 'major',
        difficulty: 'Easy',
        operonHelps: true,
        description:
          "Having a GBP is a start — but an outdated listing with few reviews signals to Google that you're less relevant than competitors who actively manage theirs.",
        fix: 'Log in weekly to respond to reviews, post updates, and confirm your hours and service area are correct.',
        automation: 'Review Request Agent sends customers directly to your GBP review link.',
        confidence: 'High',
        evidence: [
          'You indicated your Google Business Profile exists but is not actively managed.',
          'Inactive profiles with few recent reviews rank lower than competitors who update theirs regularly.',
        ],
      })
    }
  }

  // ── Minor leaks ──────────────────────────────────────────────────
  if (wa?.accessible) {
    if (!wa.hasLocalSchema) {
      minor.push({
        icon: BarChart2,
        title: 'Missing Local Business Data (Schema.org)',
        impact: 'Medium',
        leakType: 'local_schema',
        severity: 'minor',
        difficulty: 'Medium',
        operonHelps: false,
        confidence: 'High',
        evidence: ['No LocalBusiness structured data was detected on your homepage.'],
        description: 'No structured data found. Google uses schema.org/LocalBusiness to populate the local pack and rich results.',
        fix: 'Add a LocalBusiness JSON-LD block to your homepage with your name, address, phone, hours, and service type.',
        automation: "Operon's website review identifies schema gaps and provides ready-to-install code.",
      })
    }
    if (!wa.hasBusinessHours) {
      minor.push({
        icon: Smartphone,
        title: 'Business Hours Not Listed',
        impact: 'Low',
        leakType: 'no_hours',
        severity: 'minor',
        difficulty: 'Easy',
        operonHelps: false,
        confidence: 'High',
        evidence: ['Business hours were not detected in visible text or structured data on the scanned pages.'],
        description: "Customers searching in the evening can't tell if you're open — so many don't bother calling.",
        fix: 'Add your hours to the header, footer, or a dedicated contact section.',
        automation: "Operon's follow-up emails include your business hours so leads know the best time to reach you.",
      })
    }
    if (!wa.hasMetaDescription) {
      minor.push({
        icon: FileText,
        title: 'No Search Description Set',
        impact: 'Low',
        leakType: 'no_meta',
        severity: 'minor',
        difficulty: 'Easy',
        operonHelps: false,
        confidence: 'High',
        evidence: ['No meta description tag was found on your homepage.'],
        description: "Missing meta description — the snippet shown under your link in Google. Without it, Google auto-generates one that often doesn't convert.",
        fix: 'Add a 150-character meta description to your homepage describing what you do and who you serve.',
        automation: "Operon's website audit flags SEO gaps and provides copy suggestions.",
      })
    }
    if (!wa.hasGuarantee) {
      minor.push({
        icon: CheckCircle2,
        title: 'No Guarantee or Warranty Mentioned',
        impact: 'Low',
        leakType: 'no_guarantee',
        severity: 'minor',
        difficulty: 'Easy',
        operonHelps: false,
        confidence: 'Medium',
        evidence: ['No guarantee or warranty language was detected on the scanned pages.'],
        description: 'No satisfaction guarantee or warranty language found. A clear guarantee reduces buyer hesitation at the decision point.',
        fix: 'Add a visible guarantee statement — even "100% satisfaction guaranteed" moves conversions.',
        automation: 'Operon includes trust statements in automated follow-up messages to reassure undecided leads.',
      })
    }
    if (!wa.hasFAQ) {
      minor.push({
        icon: Info,
        title: 'No FAQ Section',
        impact: 'Low',
        leakType: 'no_meta',
        severity: 'minor',
        difficulty: 'Easy',
        operonHelps: false,
        confidence: 'Medium',
        evidence: ['No FAQ or common questions section was detected on the scanned pages.'],
        description: 'No FAQ section detected. Answering common questions reduces friction and handles objections before prospects leave.',
        fix: 'Add a FAQ section answering the 5–7 most common questions you get from new customers.',
        automation: 'Operon chatbot can answer common questions automatically via your website or SMS.',
      })
    }
    if (!wa.hasVideo) {
      minor.push({
        icon: Smartphone,
        title: 'No Video Content',
        impact: 'Low',
        leakType: 'no_meta',
        severity: 'minor',
        difficulty: 'Hard',
        operonHelps: false,
        confidence: 'Medium',
        evidence: ['No embedded video content was detected on the scanned pages.'],
        description: 'No video found on your site. Even a short explainer or before/after video increases time on site and trust.',
        fix: 'Add one short video — a service overview, customer testimonial, or before/after result.',
        automation: 'Operon campaigns can include video links in follow-up messages.',
      })
    }
    if (wa.socialLinksCount === 0) {
      minor.push({
        icon: Share2,
        title: 'No Social Media Links Found',
        impact: 'Low',
        leakType: 'no_meta',
        severity: 'minor',
        difficulty: 'Easy',
        operonHelps: false,
        confidence: 'High',
        evidence: ['No links to social media profiles were detected on the scanned pages.'],
        description: 'No social media links detected. Social presence builds trust and provides additional search signals.',
        fix: 'Add links to your active social profiles in the website header or footer.',
        automation: 'Operon can cross-post review requests and job completions to your social channels.',
      })
    }
  }

  return { major: major.slice(0, 6), minor }
}

const impactColors: Record<string, string> = {
  High:   'badge-red',
  Medium: 'badge-amber',
  Low:    'badge-navy',
}

const difficultyColors: Record<string, string> = {
  Easy:   'bg-green-50 text-op-green border border-green-200',
  Medium: 'bg-amber-50 text-op-amber border border-amber-200',
  Hard:   'bg-red-50 text-op-red border border-red-200',
}

const scoreLabel = (score: number) => {
  if (score >= 70) return { label: 'Healthy',  color: 'text-op-green', border: 'border-op-green', bg: 'bg-green-50' }
  if (score >= 45) return { label: 'At Risk',  color: 'text-op-amber', border: 'border-op-amber', bg: 'bg-amber-50' }
  return                  { label: 'Critical', color: 'text-op-red',   border: 'border-op-red',   bg: 'bg-red-50'   }
}

function pageSpeedLabel(score: number): { text: string; color: string } {
  if (score < 30)  return { text: 'Critical — may be costing you leads', color: 'text-op-red' }
  if (score < 50)  return { text: 'Poor — visitors may leave before your page loads', color: 'text-op-red' }
  if (score < 70)  return { text: 'Average — room for improvement', color: 'text-op-amber' }
  return                  { text: 'Good', color: 'text-op-green' }
}

const DEMO: ScanData = {
  businessName: 'Your Business', industry: 'Home Services', cityState: '',
  runsAds: 'yes', usesCrm: 'no', manualFollowUp: 'manual', asksReviews: 'sometimes',
  tracksLeadSource: 'no', biggestProblem: 'Leads come in but don\'t convert', score: 34,
}

const SITE_CHECKS: {
  key: keyof WebsiteAnalysis
  label: string
  tip: string
  evidenceKey?: keyof WebsiteAnalysis
}[] = [
  { key: 'hasHttps',          label: 'Secure HTTPS connection',          tip: 'Affects trust and Google ranking.' },
  { key: 'loadsFast',         label: 'Good performance score',           tip: 'Slow pages can reduce calls, form fills, and ad performance — especially visitors coming from Google or paid ads.' },
  { key: 'hasMobileViewport', label: 'Mobile-friendly viewport',         tip: 'Sites without a viewport tag break on phones.' },
  { key: 'hasMetaDescription',label: 'Search description set (SEO)',     tip: 'Missing meta description hurts click-through from Google.' },
  { key: 'hasLocalSchema',    label: 'Local business data (schema.org)', tip: 'Structured data helps Google show you in the local pack.' },
  { key: 'hasPhoneNumber',    label: 'Phone number found on site',       tip: 'Customers want a direct line — ideally on every page.', evidenceKey: 'detectedPhone' },
  { key: 'hasContactForm',    label: 'Contact form detected',            tip: 'Captures leads 24/7 without a phone call.' },
  { key: 'hasCallToAction',   label: 'Clear call-to-action',             tip: 'Tells visitors what to do next.', evidenceKey: 'detectedCTA' },
  { key: 'hasBusinessHours',  label: 'Business hours listed',            tip: "Customers need to know when you're available before they call." },
  { key: 'hasAddress',        label: 'Physical address visible',         tip: 'An address builds trust and helps local SEO.' },
  { key: 'hasChatWidget',     label: 'Live chat widget',                 tip: 'Engages visitors in real time.', evidenceKey: 'detectedChatPlatform' },
  { key: 'hasSocialProof',    label: 'Reviews / testimonials',           tip: 'Social proof increases conversions by 34%.' },
  { key: 'hasBookingWidget',  label: 'Online booking available',         tip: 'Let customers self-schedule without calling.', evidenceKey: 'detectedBookingPlatform' },
  { key: 'hasGuarantee',      label: 'Guarantee or warranty mentioned',  tip: 'Reduces buyer hesitation at the decision point.' },
  { key: 'hasFAQ',            label: 'FAQ or common questions',          tip: 'Answers objections before customers leave.' },
  { key: 'hasVideo',          label: 'Video content',                    tip: 'Video increases time on site and trust.' },
]

export default function ResultsDisplay() {
  const params = useSearchParams()
  const id = params.get('id')
  const [scan, setScan] = useState<ScanData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [savedToDash, setSavedToDash] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showMinorLeaks, setShowMinorLeaks] = useState(false)
  const [showTransparency, setShowTransparency] = useState(false)
  const [prevWebsiteAnalysis, setPrevWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null)
  const [isSendingReport, setIsSendingReport] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    const init = async () => {
      let scanData: ScanData | null = null
      if (id) {
        const raw = localStorage.getItem(`scan_${id}`)
        scanData = raw ? (JSON.parse(raw) as ScanData) : DEMO
      } else {
        scanData = DEMO
      }
      setScan(scanData)
      setLoaded(true)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        if (id && scanData && scanData !== DEMO) {
          try {
            const res = await fetch('/api/scanner/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scanData }),
            })
            const saved = await res.json().catch(() => null)
            setSavedToDash(true)
            // Server is authoritative for the previous score — works across devices
            // and after clearing localStorage. Update state if server has a value.
            if (saved?.previousScore !== undefined) {
              setScan((s) => s ? { ...s, previousScore: saved.previousScore } : s)
            }
            if (saved?.previousWebsiteAnalysis) {
              setPrevWebsiteAnalysis(saved.previousWebsiteAnalysis as WebsiteAnalysis)
            }
          } catch { /* non-blocking */ }
        }
      } else {
        if (id && scanData && scanData !== DEMO) {
          localStorage.setItem('operon_pending_scan_id', id)
        }
      }
    }
    init()
  }, [id])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-op-navy" />
      </div>
    )
  }

  if (!scan) return null

  const handlePrint = () => {
    setShowBreakdown(true)
    setShowMinorLeaks(true)
    setShowTransparency(true)
    setTimeout(() => {
      window.print()
      const restore = () => {
        setShowBreakdown(false)
        setShowMinorLeaks(false)
        setShowTransparency(false)
        window.removeEventListener('afterprint', restore)
      }
      window.addEventListener('afterprint', restore)
    }, 200)
  }

  const handleEmailReport = async () => {
    if (!scan || isSendingReport) return
    setIsSendingReport(true)
    try {
      await fetch('/api/scanner/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanData: scan }),
      })
      setReportSent(true)
    } catch { /* non-blocking */ }
    finally { setIsSendingReport(false) }
  }

  const { major: majorLeaks, minor: minorLeaks } = buildLeaks(scan)
  const sl = scoreLabel(scan.score)
  const subScores: SubScore[] = scan.subScores ?? calculateSubScores({ ...scan, industry: scan.industry })
  const benchmark = getBenchmark(scan.industry)
  const websiteAnalysis = scan.websiteAnalysis ?? null
  const passCount = websiteAnalysis ? SITE_CHECKS.filter((c) => {
    const val = websiteAnalysis[c.key]
    return typeof val === 'boolean' ? val : false
  }).length : 0
  const avgJobValue = scan.avgJobValue ? parseFloat(scan.avgJobValue) : 0
  const delta = scan.previousScore !== undefined ? scan.score - scan.previousScore : null

  const diffItems = prevWebsiteAnalysis && websiteAnalysis && websiteAnalysis.accessible
    ? SITE_CHECKS
        .filter(c => typeof websiteAnalysis[c.key] === 'boolean' && typeof prevWebsiteAnalysis[c.key] === 'boolean')
        .map(c => ({
          label: c.label,
          prev: prevWebsiteAnalysis[c.key] as boolean,
          curr: websiteAnalysis[c.key] as boolean,
        }))
        .filter(d => d.prev !== d.curr)
    : []
  const improved = diffItems.filter(d => !d.prev && d.curr)
  const regressed = diffItems.filter(d => d.prev && !d.curr)

  // Revenue estimates with optional monthly leads override
  const hasActualLeads = !!(scan.monthlyLeads && scan.monthlyLeads !== 'not_sure')
  const monthlyLeadsOverride = hasActualLeads
    ? getMonthlyLeadsFromInput(scan.monthlyLeads!, scan.industry)
    : undefined
  const confidence = getConfidence(hasActualLeads, avgJobValue > 0)

  const totalOpportunity = avgJobValue > 0
    ? majorLeaks.reduce((sum, l) => {
        const imp = estimateMonthlyImpact(l.leakType, avgJobValue, scan.industry, monthlyLeadsOverride)
        return imp ? { low: sum.low + imp.low, high: sum.high + imp.high } : sum
      }, { low: 0, high: 0 })
    : null

  const scanSummarySubject = websiteAnalysis?.accessible
    ? `We scanned ${scan.businessName ? `${scan.businessName}'s website` : 'your website'} live and found`
    : 'Based on your answers, we identified'
  const scanSummarySuffix = websiteAnalysis?.accessible
    ? 'that may be costing you customers each month.'
    : 'worth reviewing.'

  return (
    <div className="max-w-2xl mx-auto">

      {/* 1. Score card */}
      <div className={`card mb-6 border-2 ${sl.border} ${sl.bg}`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className={`w-24 h-24 rounded-full border-4 ${sl.border} flex flex-col items-center justify-center shrink-0`}>
            <span className={`text-3xl font-extrabold font-manrope ${sl.color}`}>{scan.score}</span>
            <span className="text-xs text-op-muted">/100</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-1">Revenue Health Score for</p>
            <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">{scan.businessName || 'Your Business'}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${sl.border} ${sl.color} ${sl.bg}`}>
                <AlertTriangle size={12} /> {sl.label}
              </span>
              {delta !== null && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${delta > 0 ? 'border-green-200 text-op-green bg-green-50' : 'border-red-200 text-op-red bg-red-50'}`}>
                  {delta > 0
                    ? <><TrendingUp size={12} /> +{delta} pts since last scan</>
                    : <><TrendingDown size={12} /> {delta} pts since last scan</>
                  }
                </span>
              )}
            </div>
            <p className="text-sm text-op-muted mt-3 leading-relaxed">
              Based on your answers, we identified <strong className="text-op-navy">{majorLeaks.length} revenue leak{majorLeaks.length !== 1 ? 's' : ''}</strong> in your business.
            </p>
          </div>
        </div>

        {scan.breakdown && scan.breakdown.length > 0 && (
          <div className="mt-5 border-t border-op-border/50 pt-4">
            <button
              onClick={() => setShowBreakdown((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-op-navy hover:text-op-navy/70 transition-colors"
            >
              <Info size={13} />
              {showBreakdown ? 'Hide' : 'Show'} score breakdown
              {showBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showBreakdown && (
              <div className="mt-3 flex flex-col gap-1.5">
                {scan.breakdown.map(({ reason, points }) => (
                  <div key={reason} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-op-muted">{reason}</span>
                    <span className="text-xs font-bold shrink-0 text-op-red">−{points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scan summary */}
      {scan !== DEMO && majorLeaks.length > 0 && (
        <div className="card mb-5 border-l-4 border-op-navy py-4">
          <p className="text-sm text-op-body leading-relaxed">
            {scanSummarySubject}{' '}
            <strong className="text-op-navy">{majorLeaks.length} revenue gap{majorLeaks.length !== 1 ? 's' : ''}</strong>
            {' '}{scanSummarySuffix}
            {majorLeaks[0] && <> Your top priority: <strong className="text-op-navy">{majorLeaks[0].title}</strong>.</>}
          </p>
        </div>
      )}

      {/* Report actions */}
      {scan !== DEMO && (
        <div className="flex gap-2 justify-end mb-4 print:hidden">
          <button onClick={handlePrint} className="btn-secondary text-xs px-3 py-2 gap-1.5">
            <Download size={13} /> Download PDF
          </button>
          {isLoggedIn && (
            <button
              onClick={handleEmailReport}
              disabled={isSendingReport || reportSent}
              className="btn-secondary text-xs px-3 py-2 gap-1.5 disabled:opacity-60"
            >
              <Mail size={13} /> {reportSent ? 'Report Sent!' : isSendingReport ? 'Sending...' : 'Email Report'}
            </button>
          )}
        </div>
      )}

      {/* What changed since last scan */}
      {(improved.length > 0 || regressed.length > 0) && (
        <div className="card mb-6 border border-op-border">
          <h3 className="font-bold font-manrope text-op-navy mb-3 text-sm">What Changed Since Your Last Scan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {improved.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-op-green mb-2 flex items-center gap-1.5">
                  <TrendingUp size={12} /> {improved.length} Fixed
                </p>
                <div className="flex flex-col gap-1.5">
                  {improved.map(d => (
                    <div key={d.label} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-op-green shrink-0" />
                      <span className="text-xs text-op-body">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {regressed.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-op-red mb-2 flex items-center gap-1.5">
                  <TrendingDown size={12} /> {regressed.length} New Issue{regressed.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-col gap-1.5">
                  {regressed.map(d => (
                    <div key={d.label} className="flex items-center gap-2">
                      <XCircle size={13} className="text-op-red shrink-0" />
                      <span className="text-xs text-op-body">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Save/CTA banner */}
      {isLoggedIn && savedToDash ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 print:hidden">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-op-navy/5 border border-op-navy/20 rounded-xl px-5 py-4 mb-6 print:hidden">
          <div className="w-9 h-9 bg-op-navy rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-op-navy">Save your results and track your fixes</p>
            <p className="text-xs text-op-muted mt-0.5">Create a free account to access your Revenue Autopilot dashboard.</p>
          </div>
          <Link href={`/signup${id ? `?fromScan=${id}` : ''}`} className="btn-primary text-xs px-4 py-2 shrink-0">
            Create Free Account <ArrowRight size={13} />
          </Link>
        </div>
      ) : null}

      {/* 3. Monthly opportunity callout */}
      {confidence !== 'low' && totalOpportunity && totalOpportunity.low > 0 && (
        <div className="card mb-6 border-2 border-op-amber/30 bg-amber-50/30">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TrendingDown size={16} className="text-op-amber" />
            <h3 className="font-bold font-manrope text-op-navy">Estimated Monthly Revenue at Risk</h3>
            <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-semibold ${confidence === 'high' ? 'bg-green-50 text-op-green border border-green-200' : 'bg-amber-50 text-op-amber border border-amber-200'}`}>
              {confidence === 'high' ? 'Based on your inputs' : 'Based on industry averages'}
            </span>
          </div>
          <p className="text-3xl font-extrabold font-manrope text-op-red mb-2">
            {formatImpact(totalOpportunity)}
          </p>
          <p className="text-xs text-op-muted leading-relaxed">
            Estimated combined monthly revenue slipping through your {majorLeaks.length} open leaks,
            based on {avgJobValue > 0 ? `your $${avgJobValue.toLocaleString()} average job value` : 'industry averages'} and {scan.industry} close rates.
            Fixing even one leak meaningfully moves the number.
          </p>
          <p className="text-xs text-op-muted/70 mt-2 italic">
            Estimates are based on your answers, visible website signals, and industry averages. They show opportunity size, not guaranteed revenue recovered.
          </p>
        </div>
      )}

      {/* 4. First 3 Fixes */}
      {majorLeaks.length > 0 && (
        <div className="card mb-6 border border-op-navy/15 bg-op-navy/[0.02]">
          <h3 className="font-bold font-manrope text-op-navy mb-4">Your First 3 Fixes</h3>
          <div className="flex flex-col gap-4">
            {majorLeaks.slice(0, 3).map((leak, i) => {
              const Icon = leak.icon
              return (
                <div key={leak.title} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-op-navy text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-op-navy">{leak.title}</p>
                    </div>
                    <p className="text-xs text-op-muted mb-2">{leak.fix}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[leak.difficulty]}`}>
                        {leak.difficulty} fix
                      </span>
                      <span className={impactColors[leak.impact]}>{leak.impact} Impact</span>
                      {leak.operonHelps && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-op-navy/10 text-op-navy border border-op-navy/20 font-medium flex items-center gap-1">
                          <Zap size={10} /> Operon can help
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. Major Revenue Leaks */}
      <div className="flex flex-col gap-4 mb-6">
        <h3 className="font-bold font-manrope text-op-navy">Revenue Leaks</h3>
        {majorLeaks.map(({ icon: Icon, title, impact, description, fix, automation, leakType, difficulty, operonHelps, evidence, confidence }, i) => {
          const impact$ = avgJobValue > 0
            ? estimateMonthlyImpact(leakType, avgJobValue, scan.industry, monthlyLeadsOverride)
            : null

          return (
            <div key={title} className="card border border-op-border">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-op-bg flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-op-navy" />
                  </div>
                  <div>
                    <p className="text-xs text-op-muted">Leak #{i + 1}</p>
                    <h3 className="font-semibold font-manrope text-op-navy text-sm">{title}</h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={impactColors[impact]}>{impact} Impact</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    confidence === 'High'   ? 'bg-green-50 text-op-green border-green-200' :
                    confidence === 'Medium' ? 'bg-amber-50 text-op-amber border-amber-200' :
                                             'bg-op-bg text-op-muted border-op-border'
                  }`}>{confidence} confidence</span>
                  {impact$ && (
                    <span className="text-xs font-bold text-op-red bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      ~{formatImpact(impact$)} at risk
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-op-muted leading-relaxed mb-3">{description}</p>

              {evidence.length > 0 && (
                <div className="rounded-lg bg-op-bg px-3 py-2.5 mb-3">
                  <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-1.5">Based on:</p>
                  <ul className="flex flex-col gap-1">
                    {evidence.map((ev, ei) => (
                      <li key={ei} className="text-xs text-op-body flex items-start gap-1.5">
                        <span className="text-op-navy/40 shrink-0">—</span>
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-op-bg rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-op-navy mb-1">Recommended Fix</p>
                <p className="text-xs text-op-body">{fix}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-op-green">
                <CheckCircle2 size={13} className="shrink-0" />
                <span><strong>Suggested Operon System:</strong> {automation}</span>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap print:hidden">
                <Link href="/revenue-autopilot" className="btn-primary text-xs px-4 py-2">See How Operon Helps</Link>
                <Link href="/contact" className="btn-secondary text-xs px-4 py-2">Request Setup Help</Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* 6. Website Health Check */}
      {websiteAnalysis && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Globe size={16} className="text-op-navy" />
            <h3 className="font-bold font-manrope text-op-navy">Website Health Check</h3>
            {websiteAnalysis.performanceScore !== undefined && (() => {
              const ps = pageSpeedLabel(websiteAnalysis.performanceScore!)
              return (
                <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-op-bg border border-op-border ${ps.color}`}>
                  Speed: {websiteAnalysis.performanceScore}/100 — {ps.text}
                </span>
              )
            })()}
          </div>
          {!websiteAnalysis.accessible ? (
            <p className="text-sm text-op-muted mt-2">
              We couldn&apos;t reach your website. Make sure the URL is correct and the site is publicly accessible.
            </p>
          ) : (
            <>
              <p className="text-xs text-op-muted mb-4">
                Live analysis — {passCount} of {SITE_CHECKS.length} checks passed.
                {websiteAnalysis.socialLinksCount > 0 && (
                  <span className="ml-2 text-op-green font-medium">
                    {websiteAnalysis.socialLinksCount} social platform{websiteAnalysis.socialLinksCount > 1 ? 's' : ''} detected.
                  </span>
                )}
                {websiteAnalysis.socialLinksCount === 0 && (
                  <span className="ml-2 text-op-amber font-medium">No social media links found.</span>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SITE_CHECKS.map(({ key, label, tip, evidenceKey }) => {
                  const raw = websiteAnalysis[key]
                  const pass = typeof raw === 'boolean' ? raw : false
                  const evidence = evidenceKey ? websiteAnalysis[evidenceKey] as string | undefined : undefined
                  return (
                    <div key={key} className={`flex items-start gap-2.5 rounded-lg p-2.5 ${pass ? 'bg-green-50' : 'bg-red-50/60'}`}>
                      {pass
                        ? <CheckCircle2 size={15} className="text-op-green shrink-0 mt-0.5" />
                        : <XCircle size={15} className="text-op-red shrink-0 mt-0.5" />
                      }
                      <div>
                        <p className={`text-xs font-medium ${pass ? 'text-op-navy' : 'text-op-muted'}`}>{label}</p>
                        {pass && evidence && (
                          <p className="text-xs text-op-green mt-0.5">Detected: {evidence}</p>
                        )}
                        {!pass && <p className="text-xs text-op-muted/80 mt-0.5">{tip}</p>}
                      </div>
                    </div>
                  )
                })}
                <div className={`flex items-start gap-2.5 rounded-lg p-2.5 ${websiteAnalysis.socialLinksCount > 0 ? 'bg-green-50' : 'bg-red-50/60'}`}>
                  {websiteAnalysis.socialLinksCount > 0
                    ? <CheckCircle2 size={15} className="text-op-green shrink-0 mt-0.5" />
                    : <XCircle size={15} className="text-op-red shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={`text-xs font-medium ${websiteAnalysis.socialLinksCount > 0 ? 'text-op-navy' : 'text-op-muted'}`}>
                      Social media links
                      {websiteAnalysis.socialLinksCount > 0 && ` (${websiteAnalysis.socialLinksCount})`}
                    </p>
                    {websiteAnalysis.socialLinksCount === 0 && (
                      <p className="text-xs text-op-muted/80 mt-0.5">Social presence builds trust and SEO signals.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 7. Secondary Improvements (minor leaks — collapsible) */}
      {minorLeaks.length > 0 && (
        <div className="card mb-6">
          <button
            onClick={() => setShowMinorLeaks((v) => !v)}
            className="flex items-center justify-between w-full"
          >
            <div>
              <h3 className="font-bold font-manrope text-op-navy text-left">Secondary Improvements</h3>
              <p className="text-xs text-op-muted mt-0.5">
                {minorLeaks.length} lower-priority website fix{minorLeaks.length !== 1 ? 'es' : ''} — quick wins once the major leaks are sealed.
              </p>
            </div>
            {showMinorLeaks ? <ChevronUp size={16} className="text-op-muted shrink-0" /> : <ChevronDown size={16} className="text-op-muted shrink-0" />}
          </button>
          {showMinorLeaks && (
            <div className="mt-4 flex flex-col gap-3 border-t border-op-border pt-4">
              {minorLeaks.map(({ icon: Icon, title, difficulty, fix }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-op-bg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-op-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-medium text-op-navy">{title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${difficultyColors[difficulty]}`}>{difficulty}</span>
                    </div>
                    <p className="text-xs text-op-muted">{fix}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. Category sub-scores */}
      <div className="card mb-6">
        <h3 className="font-bold font-manrope text-op-navy mb-1">Health by Category</h3>
        <p className="text-xs text-op-muted mb-5">Higher bar = more revenue leaking in that area.</p>
        <div className="flex flex-col gap-4">
          {subScores.map(({ name, score, color, label }) => (
            <div key={name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-op-navy">{name}</span>
                <span className="text-xs font-semibold" style={{ color }}>{label}</span>
              </div>
              <div className="w-full bg-op-border rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Industry benchmarks */}
      <div className="card mb-6 bg-op-navy text-white border-0">
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wide mb-1">Industry Benchmarks</p>
        <h3 className="text-base font-bold font-manrope text-white mb-4">
          {scan.industry !== 'Other' ? scan.industry : 'Your Industry'} — How Do Others Compare?
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div>
            <p className="text-2xl font-extrabold text-op-amber">{benchmark.leadsLostToSlowFollowUp}</p>
            <p className="text-xs text-white/60 mt-0.5 leading-snug">of leads lost to slow follow-up</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-op-amber">{benchmark.avgFirstContactTime}</p>
            <p className="text-xs text-white/60 mt-0.5 leading-snug">avg time to first contact</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-op-amber">{benchmark.neverAskReviews}</p>
            <p className="text-xs text-white/60 mt-0.5 leading-snug">of businesses never ask for reviews</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-op-amber">{benchmark.stat4Value}</p>
            <p className="text-xs text-white/60 mt-0.5 leading-snug">{benchmark.stat4Label}</p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-white/80 leading-relaxed">
            <span className="text-op-amber font-semibold">Top opportunity: </span>
            {benchmark.topOpportunity}
          </p>
        </div>
      </div>

      {/* 10. How this report was created */}
      <div className="card mb-8 border border-op-border/60">
        <button
          onClick={() => setShowTransparency((v) => !v)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="font-semibold text-sm text-op-navy">How this report was created</h3>
          {showTransparency ? <ChevronUp size={15} className="text-op-muted shrink-0" /> : <ChevronDown size={15} className="text-op-muted shrink-0" />}
        </button>
        {showTransparency && (
          <p className="text-xs text-op-muted mt-3 leading-relaxed border-t border-op-border pt-3">
            We combined your answers with a live scan of your website. The scanner looked for customer-facing signals like calls-to-action, contact paths, reviews, booking options, business information, and mobile performance. Then it matched those findings to common revenue patterns in your industry. Dollar estimates use your job value and industry lead volume to show opportunity size — they represent what recovering each leak could unlock, not guaranteed results.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 print:hidden">
        <Link href="/revenue-autopilot" className="btn-primary flex-1 justify-center py-4">
          Activate Revenue Autopilot <ArrowRight size={17} />
        </Link>
        <Link href="/contact" className="btn-secondary flex-1 justify-center py-4">
          Request Setup Help
        </Link>
      </div>

      <p className="text-center text-xs text-op-muted mb-8">
        Revenue Leak Scores are based on your answers and available information. Operon does not guarantee specific financial results or revenue increases.
      </p>
    </div>
  )
}
