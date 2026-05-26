import { NextRequest, NextResponse } from 'next/server'
import { load } from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import type { WebsiteAnalysis } from '@/lib/scanner/types'
import { rateLimit } from '@/lib/rate-limit'

const UA = 'Mozilla/5.0 (compatible; OperonScanner/1.0; +https://operonauto.com)'
const PHONE_RE = /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const FAILED: WebsiteAnalysis = {
  accessible: false,
  loadsFast: false,
  hasHttps: false,
  hasPhoneNumber: false,
  hasContactForm: false,
  hasCallToAction: false,
  hasChatWidget: false,
  hasSocialProof: false,
  hasBookingWidget: false,
  hasMobileViewport: false,
  socialLinksCount: 0,
  performanceScore: undefined,
  hasMetaDescription: false,
  hasLocalSchema: false,
  hasBusinessHours: false,
  hasAddress: false,
  hasGuarantee: false,
  hasFAQ: false,
  hasVideo: false,
  hasEmergencyService: false,
}

// ── Fetch utilities ──────────────────────────────────────────────

async function fetchPage(url: string, timeoutMs = 4000): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA }, redirect: 'follow' })
    clearTimeout(t)
    return res.ok ? res.text() : null
  } catch { return null }
}

async function fetchFirstFound(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    const html = await fetchPage(url)
    if (html) return html
  }
  return null
}

// ── URL discovery ────────────────────────────────────────────────

function extractNavLinks($: CheerioAPI, origin: string): string[] {
  const seen = new Set<string>()
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim()
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return
    try {
      const url = new URL(href, origin)
      if (url.origin !== origin) return
      if (/\.(jpe?g|png|gif|svg|pdf|css|js|ico|webp|mp4|mp3|zip|woff2?)$/i.test(url.pathname)) return
      if (url.pathname === '/') return
      seen.add(url.origin + url.pathname)
    } catch { /* skip malformed */ }
  })
  return Array.from(seen)
}

function parseSitemapUrls(xml: string, origin: string): string[] {
  const urls: string[] = []
  const re = /<loc>\s*(.*?)\s*<\/loc>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null && urls.length < 200) {
    const raw = m[1].replace(/&amp;/g, '&')
    if (raw.endsWith('.xml') || /\.(jpe?g|png|pdf|css|js)$/i.test(raw)) continue
    if (raw.startsWith(origin)) urls.push(raw)
  }
  return urls
}

async function fetchSitemapUrls(origin: string): Promise<string[]> {
  const xml = await fetchPage(`${origin}/sitemap.xml`, 3500)
  if (!xml || !xml.includes('<loc>')) return []
  return parseSitemapUrls(xml, origin)
}

type PageCategory = 'contact' | 'booking' | 'proof' | 'faq'

const CATEGORY_KEYWORDS: Record<PageCategory, [string, number][]> = {
  contact: [
    ['contact-us', 4], ['contact', 4], ['get-in-touch', 3], ['call-us', 3],
    ['reach-us', 3], ['reach', 2], ['connect', 2], ['inquir', 2], ['touch', 1],
  ],
  booking: [
    ['booking', 4], ['schedule-appointment', 4], ['book-appointment', 4],
    ['book', 3], ['schedule', 3], ['appointment', 3], ['reserv', 2],
    ['calendar', 2], ['get-a-quote', 3], ['free-quote', 3], ['estimate', 2], ['request', 1],
  ],
  proof: [
    ['testimonial', 4], ['case-stud', 3], ['success-stor', 3], ['our-work', 2],
    ['review', 3], ['client', 2], ['portfolio', 2], ['trust', 2],
    ['feedback', 2], ['rating', 2], ['gallery', 1], ['about', 1],
  ],
  faq: [
    ['faq', 4], ['frequently-asked', 4], ['questions-and-answers', 4],
    ['questions', 3], ['help-center', 3], ['knowledge', 2], ['help', 2], ['support', 1],
  ],
}

function scoreUrl(url: string, category: PageCategory): number {
  const path = new URL(url).pathname.toLowerCase()
  return CATEGORY_KEYWORDS[category].reduce(
    (total, [kw, pts]) => (path.includes(kw) ? total + pts : total), 0
  )
}

function buildCandidates(
  discovered: string[],
  origin: string,
  fallbackPaths: string[],
  category: PageCategory,
): string[] {
  const ranked = discovered
    .map((url) => ({ url, score: scoreUrl(url, category) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ url }) => url)
  const fallbacks = fallbackPaths.map((p) => `${origin}${p}`)
  return Array.from(new Set([...ranked, ...fallbacks]))
}

// ── Cheerio helpers ──────────────────────────────────────────────

// Returns clean visible body text — script/style/noscript stripped
function getBodyText($: CheerioAPI): string {
  const $body = $('body').clone()
  $body.find('script, style, noscript, template').remove()
  return $body.text().replace(/\s+/g, ' ').trim().toLowerCase()
}

// Uses Cheerio selector instead of regex — handles multiline JSON-LD and encoded chars
function extractJsonLd($: CheerioAPI): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html() || ''
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) results.push(...parsed)
      else results.push(parsed)
    } catch { /* skip malformed */ }
  })
  return results
}

// ── Check functions (use body text — not raw HTML — for keyword matching) ────

function checkPhone(bodyText: string, html: string, jsonLd: Record<string, unknown>[]): boolean {
  // Body text only — avoids matching phones inside script/JSON data blobs
  if (PHONE_RE.test(bodyText)) return true
  // tel: href is an HTML attribute, not body text
  if (/href=["']tel:/i.test(html)) return true
  return jsonLd.some((e) => e?.telephone || e?.phone)
}

// Structural: finds a <form> that actually contains an email input
function checkContactForm($: CheerioAPI): boolean {
  let found = false
  $('form').each((_, form) => {
    if (found) return false
    const $form = $(form)
    const hasEmailInput = $form.find(
      'input[type="email"], input[name*="email" i], input[placeholder*="email" i], input[id*="email" i], input[class*="email" i]'
    ).length > 0
    if (hasEmailInput) { found = true; return false }
    // Fallback: form with a submit button + contact/message language in its text
    const hasSubmit = $form.find('button[type="submit"], input[type="submit"], button:not([type])').length > 0
    const formText = $form.text().toLowerCase()
    if (hasSubmit && (formText.includes('contact') || formText.includes('message') || formText.includes('inquiry') || formText.includes('enquiry'))) {
      found = true
    }
  })
  return found
}

// Checks button and link text first, then falls back to body text
function checkCallToAction($: CheerioAPI, bodyText: string): boolean {
  const keywords = [
    'call now', 'call us', 'get a quote', 'get quote', 'request a quote',
    'free estimate', 'free consultation', 'free quote', 'book now', 'book a',
    'book online', 'schedule now', 'schedule a', 'get started', 'contact us',
    'request service', 'get in touch',
  ]
  let found = false
  $('a, button').each((_, el) => {
    if (found) return false
    const text = $(el).text().toLowerCase().trim()
    if (keywords.some((kw) => text.includes(kw))) { found = true }
  })
  if (found) return true
  return keywords.some((kw) => bodyText.includes(kw))
}

// Script src / inline checks — regex is correct here (we're looking at script tags, not text content)
function checkChatWidget(html: string): boolean {
  const lower = html.toLowerCase()
  return (
    lower.includes('intercom') || lower.includes('tidio') || lower.includes('crisp') ||
    lower.includes('drift') || lower.includes('tawk') || lower.includes('livechat') ||
    lower.includes('freshchat') || lower.includes('zendesk') || lower.includes('chatwidget') ||
    lower.includes('chat-widget') || lower.includes('podium.com') || lower.includes('birdeye.com') ||
    lower.includes('hs-scripts.com') || lower.includes('olark') || lower.includes('helpscout') ||
    lower.includes('help scout')
  )
}

function checkBookingWidget(html: string): boolean {
  const lower = html.toLowerCase()
  return (
    lower.includes('calendly') || lower.includes('acuityscheduling') || lower.includes('booksy') ||
    lower.includes('schedulicity') || lower.includes('book online') || lower.includes('book appointment') ||
    lower.includes('schedule appointment') || lower.includes('square appointments') ||
    lower.includes('setmore') || lower.includes('vagaro') || lower.includes('mindbody') ||
    lower.includes('jane.app') || lower.includes('fresha') || lower.includes('housecallpro') ||
    lower.includes('jobber') || lower.includes('servicetitan') || lower.includes('glofox') ||
    lower.includes('zenoti') || lower.includes('picktime') || lower.includes('simplybook') ||
    lower.includes('appointlet')
  )
}

function checkSocialProofStrict($: CheerioAPI, bodyText: string, jsonLd: Record<string, unknown>[]): boolean {
  if (jsonLd.some((e) => e?.aggregateRating || String(e?.['@type']).toLowerCase().includes('review'))) return true
  // Schema.org microdata attributes
  if ($('[itemprop="ratingValue"], [itemprop="reviewRating"], [itemprop="aggregateRating"]').length > 0) return true
  // CSS class/id patterns common in review widgets
  if ($('[class*="rating" i], [class*="star-rating" i], [class*="review-score" i]').length > 0) return true
  // Star characters in raw HTML
  const raw = $.html()
  if (raw.includes('★') || raw.includes('⭐')) return true
  // Body text keyword matching (script-safe)
  if (/\d+(\.\d+)?\s*\/\s*5\b/.test(bodyText)) return true
  if (/\d+(\.\d+)?\s*out\s*of\s*5/i.test(bodyText)) return true
  const kws = [
    'testimonial', '5-star', 'five-star', '5 star', 'five star',
    'google review', 'yelp review', 'facebook review',
    'what our customers', 'customers say', 'clients say',
    'satisfied customer', 'happy customer', 'trusted by',
    'customer review', 'client review', 'verified review',
  ]
  return kws.some((kw) => bodyText.includes(kw))
}

function checkSocialProofBroad($: CheerioAPI, bodyText: string): boolean {
  const raw = $.html()
  if (raw.includes('★') || raw.includes('⭐')) return true
  if ($('[itemprop="ratingValue"], [class*="rating" i], [class*="testimonial" i]').length > 0) return true
  return (
    bodyText.includes('testimonial') || bodyText.includes('review') ||
    bodyText.includes('5 star') || bodyText.includes('five star') ||
    bodyText.includes('satisfied customer') || bodyText.includes('trusted by') ||
    bodyText.includes('rating')
  )
}

function checkMobileViewport($: CheerioAPI): boolean {
  return $('meta[name="viewport"]').length > 0
}

function checkMetaDescription($: CheerioAPI): boolean {
  const content = $('meta[name="description"]').attr('content') || ''
  return content.trim().length >= 10
}

const LOCAL_SCHEMA_TYPES = new Set([
  'localbusiness', 'homeandconstructionbusiness', 'professionalservice',
  'healthandbeautybusiness', 'foodestablishment', 'autorepair', 'autodealer',
  'medicalorganization', 'dentist', 'physician', 'hospital', 'veterinarycare',
  'restaurant', 'fitnesscenter', 'beautysalon', 'hairsalon', 'nailsalon',
  'spaorbeautybusiness', 'realestatebusiness', 'legalservice', 'financialservice',
  'accountingservice', 'insuranceagency', 'plumbingservice', 'electricalcontractor',
  'hvacservice', 'roofingservice', 'generalcontractor', 'landscapingbusiness',
  'automotivebusiness', 'sportingbusiness', 'childcare', 'lodgingbusiness',
])

function checkLocalSchema(jsonLd: Record<string, unknown>[]): boolean {
  return jsonLd.some((e) => {
    const type = e?.['@type']
    if (!type) return false
    const types = Array.isArray(type) ? type : [type]
    return types.some((t) => LOCAL_SCHEMA_TYPES.has(String(t).toLowerCase()))
  })
}

function checkBusinessHours(bodyText: string, jsonLd: Record<string, unknown>[]): boolean {
  if (jsonLd.some((e) => e?.openingHours || e?.openingHoursSpecification)) return true
  const phrases = [
    'hours of operation', 'business hours', 'office hours', 'store hours',
    'open hours', 'open 7 days', 'open daily', 'by appointment only', 'available 24',
  ]
  if (phrases.some((p) => bodyText.includes(p))) return true
  if (/mon|tue|wed|thu|fri|sat|sun/i.test(bodyText) && /\d{1,2}(?::\d{2})?\s*(?:am|pm)/i.test(bodyText)) return true
  return false
}

function checkAddress($: CheerioAPI, bodyText: string, jsonLd: Record<string, unknown>[]): boolean {
  if (jsonLd.some((e) => {
    const addr = e?.address as Record<string, unknown> | undefined
    return addr?.streetAddress || e?.streetAddress
  })) return true
  // Schema.org microdata
  if ($('[itemprop="streetAddress"], [itemprop="address"]').length > 0) return true
  const phrases = ['located at', 'find us at', 'visit us at', 'our address', 'our location', 'directions to']
  if (phrases.some((p) => bodyText.includes(p))) return true
  return /\b\d{1,5}\s+[a-z][\w\s]{1,25}(?:street|avenue|boulevard|drive|road|lane|court|way|place|circle|highway|parkway|\bst\b|\bave\b|\bblvd\b|\bdr\b|\brd\b|\bln\b|\bct\b|\bpl\b|\bcir\b|\bhwy\b|\bpkwy\b)/i.test(bodyText)
}

function checkGuarantee(bodyText: string): boolean {
  return (
    bodyText.includes('satisfaction guaranteed') || bodyText.includes('satisfaction guarantee') ||
    bodyText.includes('money-back guarantee') || bodyText.includes('money back guarantee') ||
    bodyText.includes('100% guarantee') || bodyText.includes('100% satisfaction') ||
    bodyText.includes('workmanship warranty') || bodyText.includes('lifetime warranty') ||
    bodyText.includes('labor warranty') || bodyText.includes('parts warranty') ||
    bodyText.includes('backed by a warranty') || bodyText.includes('guaranteed results') ||
    bodyText.includes('we stand behind') || bodyText.includes('our guarantee')
  )
}

function checkFAQ($: CheerioAPI, bodyText: string, jsonLd: Record<string, unknown>[]): boolean {
  if (jsonLd.some((e) => String(e?.['@type']).toLowerCase() === 'faqpage')) return true
  // Accordion elements
  if ($('details').length > 0 && $('summary').length > 0) return true
  // Common FAQ class/id patterns
  if ($('[class*="faq" i], [id*="faq" i], [class*="accordion" i]').length > 0) return true
  if (
    bodyText.includes('frequently asked') || bodyText.includes('common questions') ||
    bodyText.includes('questions & answers') || bodyText.includes('questions and answers')
  ) return true
  if (/\bfaq\b/.test(bodyText)) return true
  return false
}

// Cheerio iframe/video selector — more precise than raw HTML scanning
function checkVideo($: CheerioAPI, html: string): boolean {
  if ($('video').length > 0) return true
  let found = false
  $('iframe').each((_, el) => {
    if (found) return false
    const src = ($(el).attr('src') || '').toLowerCase()
    if (src.includes('youtube') || src.includes('youtu.be') || src.includes('vimeo') ||
        src.includes('wistia') || src.includes('loom')) {
      found = true
    }
  })
  if (found) return true
  // Wistia/Loom can also load via script without an iframe src attribute
  const lower = html.toLowerCase()
  return lower.includes('wistia.com/medias') || lower.includes('loom.com/embed')
}

function checkEmergencyService(bodyText: string): boolean {
  return (
    bodyText.includes('emergency service') || bodyText.includes('emergency repair') ||
    bodyText.includes('24/7 service') || bodyText.includes('24/7 emergency') ||
    bodyText.includes('24-hour service') || bodyText.includes('24 hour service') ||
    bodyText.includes('available 24/7') || bodyText.includes('after-hours service') ||
    bodyText.includes('after hours service') || bodyText.includes('same-day service') ||
    bodyText.includes('same day service') || bodyText.includes('same-day response') ||
    bodyText.includes('available any time') || bodyText.includes('we never close')
  )
}

function countSocialLinks(html: string): number {
  const lower = html.toLowerCase()
  const platforms = [
    'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
    'linkedin.com', 'youtube.com', 'tiktok.com', 'yelp.com',
  ]
  return platforms.filter((p) => lower.includes(p)).length
}

// ── Evidence (detect*) functions ─────────────────────────────────

function detectPhoneEvidence(bodyText: string, html: string, jsonLd: Record<string, unknown>[]): string | null {
  const m = bodyText.match(PHONE_RE)
  if (m) return m[0]
  // tel: href contains the canonical number even if not in visible text
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i)
  if (telMatch) return decodeURIComponent(telMatch[1])
  for (const e of jsonLd) {
    const tel = (e?.telephone ?? e?.phone) as string | undefined
    if (tel) return tel
  }
  return null
}

const BOOKING_PLATFORMS: [string, string][] = [
  ['calendly', 'Calendly'], ['acuityscheduling', 'Acuity Scheduling'], ['booksy', 'Booksy'],
  ['housecallpro', 'HouseCall Pro'], ['jobber', 'Jobber'], ['servicetitan', 'ServiceTitan'],
  ['vagaro', 'Vagaro'], ['mindbody', 'Mindbody'], ['jane.app', 'Jane'], ['fresha', 'Fresha'],
  ['glofox', 'Glofox'], ['zenoti', 'Zenoti'], ['setmore', 'Setmore'],
  ['simplybook', 'SimplyBook'], ['schedulicity', 'Schedulicity'], ['square appointments', 'Square Appointments'],
]

function detectBookingEvidence(html: string): string | null {
  const lower = html.toLowerCase()
  for (const [keyword, name] of BOOKING_PLATFORMS) {
    if (lower.includes(keyword)) return name
  }
  return null
}

const CHAT_PLATFORMS: [string, string][] = [
  ['intercom', 'Intercom'], ['tidio', 'Tidio'], ['podium.com', 'Podium'], ['birdeye.com', 'Birdeye'],
  ['drift', 'Drift'], ['crisp', 'Crisp'], ['tawk', 'Tawk.to'], ['livechat', 'LiveChat'],
  ['freshchat', 'Freshchat'], ['zendesk', 'Zendesk'], ['olark', 'Olark'], ['helpscout', 'Help Scout'],
]

function detectChatEvidence(html: string): string | null {
  const lower = html.toLowerCase()
  for (const [keyword, name] of CHAT_PLATFORMS) {
    if (lower.includes(keyword)) return name
  }
  return null
}

const CTA_PHRASES = [
  'get a free quote', 'get a quote', 'request a quote', 'free estimate', 'free consultation',
  'book now', 'book online', 'schedule now', 'call now', 'call us today',
  'get started', 'contact us', 'request service', 'get in touch', 'start today',
]

// Checks button/link text first — more reliable than searching the whole page
function detectCTAEvidence($: CheerioAPI, bodyText: string): string | null {
  let found: string | null = null
  $('a, button').each((_, el) => {
    if (found) return false
    const text = $(el).text().toLowerCase().trim()
    const match = CTA_PHRASES.find((phrase) => text.includes(phrase))
    if (match) found = match.replace(/\b\w/g, (c) => c.toUpperCase())
  })
  if (found) return found
  for (const phrase of CTA_PHRASES) {
    if (bodyText.includes(phrase)) return phrase.replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return null
}

async function getPerformanceScore(url: string): Promise<number | undefined> {
  try {
    const key = process.env.GOOGLE_PAGESPEED_API_KEY
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${key ? `&key=${key}` : ''}`
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 12000)
    const res = await fetch(endpoint, { signal: ctrl.signal })
    clearTimeout(t)
    if (!res.ok) return undefined
    const data = await res.json()
    const score = data?.lighthouseResult?.categories?.performance?.score
    return typeof score === 'number' ? Math.round(score * 100) : undefined
  } catch { return undefined }
}

// ── POST handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`scanner:${ip}`, { limit: 6, windowMs: 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many scan requests. Please wait a minute.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.url || typeof body.url !== 'string') {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  const normalized = normalizeUrl(body.url)
  const hasHttps = normalized.startsWith('https://')
  const origin = new URL(normalized).origin

  // ── Phase 1: homepage + sitemap in parallel ──────────────────────
  const [homeResult, sitemapUrls] = await Promise.all([
    (async () => {
      try {
        const ctrl = new AbortController()
        const t = setTimeout(() => ctrl.abort(), 8000)
        const start = Date.now()
        const res = await fetch(normalized, {
          signal: ctrl.signal,
          headers: { 'User-Agent': UA },
          redirect: 'follow',
        })
        clearTimeout(t)
        const text = await res.text()
        return { ok: res.ok, fast: Date.now() - start < 3000, html: text }
      } catch { return null }
    })(),
    fetchSitemapUrls(origin),
  ])

  if (!homeResult) {
    return NextResponse.json<WebsiteAnalysis>({ ...FAILED, hasHttps })
  }

  const html = homeResult.html
  const loadsFast = homeResult.fast
  const accessible = homeResult.ok

  // Parse DOM once — all checks share this instance
  const $ = load(html)
  const bodyText = getBodyText($)
  const jsonLd = extractJsonLd($)

  // Nav links from the already-fetched DOM (free)
  const navLinks = extractNavLinks($, origin)
  const allDiscovered = Array.from(new Set([...navLinks, ...sitemapUrls]))

  // ── Homepage checks ──────────────────────────────────────────────
  let hasPhoneNumber      = checkPhone(bodyText, html, jsonLd)
  let hasContactForm      = checkContactForm($)
  let hasCallToAction     = checkCallToAction($, bodyText)
  let hasChatWidget       = checkChatWidget(html)
  let hasSocialProof      = checkSocialProofStrict($, bodyText, jsonLd)
  let hasBookingWidget    = checkBookingWidget(html)
  const hasMobileViewport = checkMobileViewport($)
  const socialLinksCount  = countSocialLinks(html)
  const hasMetaDescription = checkMetaDescription($)
  const hasLocalSchema    = checkLocalSchema(jsonLd)
  let hasBusinessHours    = checkBusinessHours(bodyText, jsonLd)
  let hasAddress          = checkAddress($, bodyText, jsonLd)
  const hasGuarantee      = checkGuarantee(bodyText)
  let hasFAQ              = checkFAQ($, bodyText, jsonLd)
  const hasVideo          = checkVideo($, html)
  const hasEmergencyService = checkEmergencyService(bodyText)

  // ── Evidence extraction ──────────────────────────────────────────
  let detectedPhone             = detectPhoneEvidence(bodyText, html, jsonLd)
  const detectedBookingPlatform = detectBookingEvidence(html)
  const detectedChatPlatform    = detectChatEvidence(html)
  const detectedCTA             = detectCTAEvidence($, bodyText)

  // ── Phase 2: ranked secondary fetches + PageSpeed — all parallel ─
  const contactCandidates = buildCandidates(allDiscovered, origin, ['/contact', '/contact-us'], 'contact')
  const bookingCandidates = buildCandidates(allDiscovered, origin, ['/book', '/booking', '/schedule', '/appointments'], 'booking')
  const proofCandidates   = buildCandidates(allDiscovered, origin, ['/testimonials', '/reviews', '/about'], 'proof')
  const faqCandidates     = buildCandidates(allDiscovered, origin, ['/faq', '/help'], 'faq')

  const [contactHtml, bookingHtml, proofHtml, faqHtml, performanceScore] = await Promise.all([
    (!hasPhoneNumber || !hasContactForm || !hasBusinessHours || !hasAddress)
      ? fetchFirstFound(contactCandidates)
      : Promise.resolve(null),
    !hasBookingWidget
      ? fetchFirstFound(bookingCandidates)
      : Promise.resolve(null),
    !hasSocialProof
      ? fetchFirstFound(proofCandidates)
      : Promise.resolve(null),
    !hasFAQ
      ? fetchFirstFound(faqCandidates)
      : Promise.resolve(null),
    getPerformanceScore(normalized),
  ])

  // Apply secondary-page checks (load Cheerio only for pages that were fetched)
  if (contactHtml) {
    const $c = load(contactHtml)
    const cText = getBodyText($c)
    const cJsonLd = extractJsonLd($c)
    if (!hasPhoneNumber) {
      hasPhoneNumber = checkPhone(cText, contactHtml, cJsonLd)
      if (hasPhoneNumber && !detectedPhone) detectedPhone = detectPhoneEvidence(cText, contactHtml, cJsonLd)
    }
    if (!hasContactForm)   hasContactForm   = checkContactForm($c)
    if (!hasBusinessHours) hasBusinessHours = checkBusinessHours(cText, cJsonLd)
    if (!hasAddress)       hasAddress       = checkAddress($c, cText, cJsonLd)
  }

  if (bookingHtml && !hasBookingWidget) hasBookingWidget = checkBookingWidget(bookingHtml)

  if (proofHtml && !hasSocialProof) {
    const $p = load(proofHtml)
    hasSocialProof = checkSocialProofBroad($p, getBodyText($p))
  }

  if (faqHtml && !hasFAQ) {
    const $f = load(faqHtml)
    hasFAQ = checkFAQ($f, getBodyText($f), extractJsonLd($f))
  }

  const effectiveLoadsFast = performanceScore !== undefined
    ? performanceScore >= 50
    : loadsFast

  return NextResponse.json<WebsiteAnalysis>({
    accessible,
    loadsFast: effectiveLoadsFast,
    hasHttps,
    hasPhoneNumber,
    hasContactForm,
    hasCallToAction,
    hasChatWidget,
    hasSocialProof,
    hasBookingWidget,
    hasMobileViewport,
    socialLinksCount,
    performanceScore,
    hasMetaDescription,
    hasLocalSchema,
    hasBusinessHours,
    hasAddress,
    hasGuarantee,
    hasFAQ,
    hasVideo,
    hasEmergencyService,
    detectedPhone: detectedPhone ?? undefined,
    detectedBookingPlatform: detectedBookingPlatform ?? undefined,
    detectedChatPlatform: detectedChatPlatform ?? undefined,
    detectedCTA: detectedCTA ?? undefined,
  })
}
