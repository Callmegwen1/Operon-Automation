import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const N8N_WEBHOOK   = 'https://operon-n8n.znwsri.easypanel.host/webhook/form-lead'
const OWNER_USER_ID = process.env.OWNER_USER_ID

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
      phone:         phone    || '',
      business_name: business || '',
      reason,
      message,
      source:    'contact-form',
      timestamp: new Date().toISOString(),
    }

    // 1. Fire n8n webhook (non-blocking)
    fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((e) => console.error('n8n contact error:', e))

    // 2. Save to Supabase contacts as owner's lead
    if (OWNER_USER_ID) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: existing } = await adminClient
        .from('contacts')
        .select('id')
        .eq('user_id', OWNER_USER_ID)
        .eq('email', email)
        .single()

      if (!existing) {
        await adminClient.from('contacts').insert({
          user_id: OWNER_USER_ID,
          name:    business ? `${name} (${business})` : name,
          email,
          phone:   phone || '',
          type:    'lead',
          source:  'Contact Form',
          status:  'new',
          notes:   `Reason: ${reason}\n\n${message}`,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
