import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`analytics:${ip}`, { limit: 120, windowMs: 60 * 1000 })
  if (!rl.allowed) return NextResponse.json({ ok: false }, { status: 429 })

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  if (!body.event_name || typeof body.event_name !== 'string') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const supabase = getAdminClient()
  try {
    await supabase.from('analytics_events').insert({
      event_name:     body.event_name,
      anonymous_id:   body.anonymous_id   ?? null,
      user_id:        body.user_id        ?? null,
      session_id:     body.session_id     ?? null,
      page_path:      body.page_path      ?? null,
      referrer:       body.referrer       ?? null,
      utm_source:     body.utm_source     ?? null,
      utm_medium:     body.utm_medium     ?? null,
      utm_campaign:   body.utm_campaign   ?? null,
      utm_content:    body.utm_content    ?? null,
      utm_term:       body.utm_term       ?? null,
      scan_id:        body.scan_id        ?? null,
      business_id:    body.business_id    ?? null,
      industry:       body.industry       ?? null,
      website_domain: body.website_domain ?? null,
      score:          body.score          ?? null,
      score_range:    body.score_range    ?? null,
      top_leak_ids:   body.top_leak_ids   ?? null,
      plan_clicked:   body.plan_clicked   ?? null,
      agent_type:     body.agent_type     ?? null,
      source:         body.source         ?? null,
      properties:     body.properties     ?? null,
    })
  } catch { /* non-blocking */ }

  return NextResponse.json({ ok: true })
}
