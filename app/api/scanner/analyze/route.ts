import { NextRequest, NextResponse } from 'next/server'
import type { WebsiteAnalysis } from '@/lib/scanner/types'

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
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.url || typeof body.url !== 'string') {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  const normalized = normalizeUrl(body.url)
  const hasHttps = normalized.startsWith('https://')

  let html = ''
  let loadsFast = false
  let accessible = false

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const start = Date.now()
    const res = await fetch(normalized, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OperonScanner/1.0; +https://operonauto.com)' },
      redirect: 'follow',
    })
    clearTimeout(timer)
    loadsFast = Date.now() - start < 3000
    html = await res.text()
    accessible = res.ok
  } catch {
    return NextResponse.json<WebsiteAnalysis>({ ...FAILED, hasHttps })
  }

  const lower = html.toLowerCase()

  const hasPhoneNumber =
    /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.test(html) ||
    lower.includes('tel:')

  const hasContactForm =
    /<form[^>]*>/i.test(html) &&
    (lower.includes('type="email"') ||
      lower.includes("type='email'") ||
      lower.includes('name="email"') ||
      lower.includes("name='email'") ||
      lower.includes('contact') ||
      lower.includes('reach us'))

  const hasCallToAction =
    lower.includes('call now') ||
    lower.includes('get a quote') ||
    lower.includes('get quote') ||
    lower.includes('free estimate') ||
    lower.includes('free consultation') ||
    lower.includes('book now') ||
    lower.includes('book a') ||
    lower.includes('schedule') ||
    lower.includes('get started') ||
    lower.includes('contact us')

  const hasChatWidget =
    lower.includes('intercom') ||
    lower.includes('tidio') ||
    lower.includes('crisp') ||
    lower.includes('drift') ||
    lower.includes('tawk') ||
    lower.includes('livechat') ||
    lower.includes('freshchat') ||
    lower.includes('zendesk') ||
    lower.includes('chatwidget') ||
    lower.includes('chat-widget')

  const hasSocialProof =
    lower.includes('testimonial') ||
    lower.includes('review') ||
    lower.includes('5 star') ||
    lower.includes('five star') ||
    lower.includes('★') ||
    lower.includes('⭐') ||
    lower.includes('satisfied customer') ||
    lower.includes('trusted by') ||
    lower.includes('rating')

  const hasBookingWidget =
    lower.includes('calendly') ||
    lower.includes('acuityscheduling') ||
    lower.includes('booksy') ||
    lower.includes('schedulicity') ||
    lower.includes('book online') ||
    lower.includes('book appointment') ||
    lower.includes('schedule appointment') ||
    lower.includes('square appointments') ||
    lower.includes('setmore')

  return NextResponse.json<WebsiteAnalysis>({
    accessible,
    loadsFast,
    hasHttps,
    hasPhoneNumber,
    hasContactForm,
    hasCallToAction,
    hasChatWidget,
    hasSocialProof,
    hasBookingWidget,
  })
}
