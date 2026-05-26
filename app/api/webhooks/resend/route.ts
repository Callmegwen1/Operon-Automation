import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Resend uses Svix for webhook signing.
// The secret is base64-encoded with a "whsec_" prefix.
function verifySignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return false

  const msgId        = headers.get('svix-id')
  const msgTimestamp = headers.get('svix-timestamp')
  const msgSignature = headers.get('svix-signature')
  if (!msgId || !msgTimestamp || !msgSignature) return false

  // Reject timestamps older than 5 minutes to prevent replay attacks
  const tsSeconds = parseInt(msgTimestamp, 10)
  if (Math.abs(Date.now() / 1000 - tsSeconds) > 300) return false

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const toSign      = `${msgId}.${msgTimestamp}.${rawBody}`
  const computed    = createHmac('sha256', secretBytes).update(toSign).digest('base64')

  return msgSignature.split(' ').some((sig) => sig.replace(/^v1,/, '') === computed)
}

type ResendEvent = {
  type: string
  data: {
    email_id: string
    to?: string[]
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (process.env.RESEND_WEBHOOK_SECRET) {
    if (!verifySignature(rawBody, req.headers)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: ResendEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, data } = event
  const emailId = data?.email_id
  if (!emailId) return NextResponse.json({ ok: true })

  const supabase = getAdminClient()

  // Look up the agent_message by Resend email ID
  const { data: message } = await supabase
    .from('agent_messages')
    .select('id, contact_id, user_id, status')
    .eq('external_provider_id', emailId)
    .maybeSingle()

  if (!message) return NextResponse.json({ ok: true })

  if (type === 'email.opened' && message.status === 'scheduled') {
    await supabase.from('agent_messages').update({ status: 'opened' }).eq('id', message.id)
    return NextResponse.json({ ok: true })
  }

  if (type === 'email.clicked') {
    await supabase.from('agent_messages').update({ status: 'clicked' }).eq('id', message.id)
    return NextResponse.json({ ok: true })
  }

  // Hard bounce or spam complaint — opt the contact out and cancel all pending emails
  if (type === 'email.bounced' || type === 'email.complained') {
    const { data: scheduledMessages } = await supabase
      .from('agent_messages')
      .select('id, external_provider_id')
      .eq('contact_id', message.contact_id)
      .eq('status', 'scheduled')
      .not('external_provider_id', 'is', null)

    if (scheduledMessages && scheduledMessages.length > 0) {
      const cancelResults = await Promise.allSettled(
        scheduledMessages.map((m) =>
          fetch(`https://api.resend.com/emails/${m.external_provider_id}/cancel`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
          })
        )
      )
      const cancelledIds = scheduledMessages
        .filter((_, i) => cancelResults[i].status === 'fulfilled')
        .map((m) => m.id)

      if (cancelledIds.length > 0) {
        await supabase.from('agent_messages').update({ status: 'cancelled' }).in('id', cancelledIds)
      }
    }

    await supabase
      .from('contacts')
      .update({ status: 'do_not_contact' })
      .eq('id', message.contact_id)
      .eq('user_id', message.user_id)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
