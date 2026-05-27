// Client-side analytics module.
// All exports are no-ops on the server — safe to import in any component,
// but only produces side-effects when called in browser context.

const ANON_ID_KEY  = 'operon_anon_id'
const UTM_KEY      = 'operon_utm'
const SESSION_KEY  = 'operon_session'

const UTM_PARAMS   = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid'] as const

function isBrowser(): boolean { return typeof window !== 'undefined' }

// ── Identity ──────────────────────────────────────────────────

export function getAnonymousId(): string {
  if (!isBrowser()) return ''
  let id = localStorage.getItem(ANON_ID_KEY)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(ANON_ID_KEY, id) }
  return id
}

export function getSessionId(): string {
  if (!isBrowser()) return ''
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id) }
  return id
}

// ── UTM capture ───────────────────────────────────────────────

export type UtmData = Partial<Record<typeof UTM_PARAMS[number], string>> & {
  captured_at?: string
  landing_page?: string
}

export function captureUtmsFromUrl(): void {
  if (!isBrowser()) return
  const params = new URLSearchParams(window.location.search)
  const found: UtmData = {}
  let hasUtm = false
  for (const key of UTM_PARAMS) {
    const val = params.get(key)
    if (val) { found[key] = val; hasUtm = true }
  }
  if (hasUtm) {
    found.captured_at = new Date().toISOString()
    found.landing_page = window.location.pathname
    localStorage.setItem(UTM_KEY, JSON.stringify(found))
  }
}

export function getUtms(): UtmData {
  if (!isBrowser()) return {}
  try { return JSON.parse(localStorage.getItem(UTM_KEY) ?? '{}') }
  catch { return {} }
}

// ── Helpers ───────────────────────────────────────────────────

export function scoreRange(score: number): string {
  if (score >= 80) return 'high'
  if (score >= 60) return 'moderate'
  if (score >= 40) return 'low'
  return 'critical'
}

function safeDomain(url?: string): string | undefined {
  if (!url) return undefined
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname }
  catch { return undefined }
}

// ── Event tracking ────────────────────────────────────────────

export interface TrackProps {
  user_id?:       string   // internal UUID — safe to store
  scan_id?:       string
  business_id?:   string
  industry?:      string
  website_url?:   string   // will be converted to domain only
  score?:         number
  score_range?:   string
  top_leak_ids?:  string[]
  plan_clicked?:  string
  agent_type?:    string
  source?:        string
  properties?:    Record<string, unknown>
}

// Meta Pixel: selected events mapped to standard pixel events
const META_EVENT_MAP: Record<string, string> = {
  scanner_started:         'Lead',
  scanner_completed:       'CompleteRegistration',
  email_report_requested:  'Lead',
  signup_completed:        'Lead',
  checkout_started:        'InitiateCheckout',
  purchase_completed:      'Purchase',
  agent_activated:         'CustomizeProduct',
}

function fireMetaPixel(event: string, props?: TrackProps): void {
  const fbq = (window as unknown as Record<string, unknown>).fbq as ((...a: unknown[]) => void) | undefined
  if (!fbq) return
  const pixelEvent = META_EVENT_MAP[event]
  if (!pixelEvent) return
  const safe: Record<string, unknown> = {}
  if (props?.plan_clicked) safe.content_name = props.plan_clicked
  fbq('track', pixelEvent, safe)
}

function firePostHog(event: string, props?: TrackProps, utms?: UtmData): void {
  const ph = (window as unknown as Record<string, unknown>).posthog as { capture?: (...a: unknown[]) => void } | undefined
  if (!ph?.capture) return
  // Only safe, non-PII properties
  ph.capture(event, {
    $current_url:  window.location.href,
    industry:      props?.industry,
    score_range:   props?.score_range,
    plan_clicked:  props?.plan_clicked,
    agent_type:    props?.agent_type,
    source:        props?.source,
    has_website:   props?.website_url ? true : undefined,
    ...utms,
  })
}

export function track(event: string, props?: TrackProps): void {
  if (!isBrowser()) return

  const utms        = getUtms()
  const anonymous_id = getAnonymousId()
  const session_id  = getSessionId()
  const domain      = safeDomain(props?.website_url)

  // Internal Supabase — fire and forget
  fetch('/api/analytics/track', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:     event,
      anonymous_id,
      user_id:        props?.user_id ?? null,
      session_id,
      page_path:      window.location.pathname,
      referrer:       document.referrer || undefined,
      ...utms,
      scan_id:        props?.scan_id,
      business_id:    props?.business_id,
      industry:       props?.industry,
      website_domain: domain,
      score:          props?.score,
      score_range:    props?.score_range,
      top_leak_ids:   props?.top_leak_ids,
      plan_clicked:   props?.plan_clicked,
      agent_type:     props?.agent_type,
      source:         props?.source,
      properties:     props?.properties,
    }),
  }).catch(() => {})

  // PostHog (safe props only — no PII)
  firePostHog(event, props, utms)

  // Meta Pixel (selected events only — no PII)
  fireMetaPixel(event, props)
}
