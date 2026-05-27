import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits[0] === '1') return digits.slice(1)
  return digits
}

// Twilio signs webhooks with HMAC-SHA1.
// Signature = base64(HMAC-SHA1(authToken, url + sorted_params_concatenated))
function verifyTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  const sorted = Object.keys(params).sort().reduce((s, k) => s + k + params[k], '')
  const computed = createHmac('sha1', authToken).update(url + sorted).digest('base64')
  return computed === signature
}

const TWIML_EMPTY = '<?xml version="1.0"?><Response></Response>'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params  = Object.fromEntries(new URLSearchParams(rawBody))

  // Verify Twilio signature when auth token is configured
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (authToken) {
    const signature = req.headers.get('x-twilio-signature') ?? ''
    const url       = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'}/api/twilio/webhook`
    if (!verifyTwilioSignature(authToken, signature, url, params)) {
      return new NextResponse(TWIML_EMPTY, {
        status: 403,
        headers: { 'Content-Type': 'text/xml' },
      })
    }
  }

  const from    = params['From'] ?? ''
  const message = (params['Body'] ?? '').trim().toUpperCase()

  if (!from) {
    return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } })
  }

  const isStop = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(message)

  if (isStop) {
    const supabase   = getAdminClient()
    const normalized = normalizePhone(from)

    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, phone')
      .not('phone', 'is', null)

    const matches = (contacts ?? []).filter((c: { id: string; phone: string }) =>
      normalizePhone(c.phone) === normalized
    )

    if (matches.length > 0) {
      await supabase
        .from('contacts')
        .update({ status: 'do_not_contact' })
        .in('id', matches.map((c: { id: string }) => c.id))
    }
  }

  return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } })
}
