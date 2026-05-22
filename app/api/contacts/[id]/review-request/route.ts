import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { reviewRequest } from '@/lib/emails/templates'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch contact
    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    if (!contact.email) return NextResponse.json({ error: 'Contact has no email' }, { status: 400 })

    // Fetch agent config
    const { data: agent } = await supabase
      .from('agents')
      .select('config')
      .eq('user_id', user.id)
      .eq('type', 'review_request')
      .single()

    const cfg = (agent?.config ?? {}) as {
      reviewLink?: string
      fromName?: string
      replyToEmail?: string
    }

    if (!cfg.reviewLink) {
      return NextResponse.json(
        { error: 'No review link configured. Add one in the Review Request Agent settings.' },
        { status: 400 }
      )
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('user_id', user.id)
      .single()

    const emailData = reviewRequest({
      customerName: contact.name,
      businessName: business?.name ?? 'Our Business',
      fromName:     cfg.fromName ?? business?.name ?? 'The Team',
      reviewLink:   cfg.reviewLink,
    })

    await sendEmail({
      to:      contact.email,
      replyTo: cfg.replyToEmail,
      subject: emailData.subject,
      html:    emailData.html,
    })

    // Log activity
    await supabase.from('agent_activity').insert({
      user_id:    user.id,
      agent_type: 'review_request',
      action:     'review_request_sent',
      details:    { contact_id: contact.id, customer_name: contact.name },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review request error:', err)
    return NextResponse.json({ error: 'Failed to send review request' }, { status: 500 })
  }
}
