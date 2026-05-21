import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK = 'https://operon-n8n.znwsri.easypanel.host/webhook/form-lead'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, business, reason, message } = body

    if (!name || !email || !reason || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = {
      name,
      email,
      phone: phone || '',
      business_name: business || '',
      reason,
      message,
      source: 'contact-form',
      timestamp: new Date().toISOString(),
    }

    const n8nRes = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!n8nRes.ok) {
      console.error('n8n webhook error:', await n8nRes.text())
      // Still return success to the user — don't block UX on backend errors
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
