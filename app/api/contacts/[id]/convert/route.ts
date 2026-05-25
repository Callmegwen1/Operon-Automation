import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { reviewRequest } from '@/lib/emails/templates'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: contact, error: contactErr } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (contactErr || !contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  // Mark as converted customer
  await supabase
    .from('contacts')
    .update({ status: 'converted', type: 'customer' })
    .eq('id', params.id)

  // Send review request if agent is enabled and contact has an email
  let reviewSent = false
  if (contact.email) {
    const { data: agent } = await supabase
      .from('agents')
      .select('enabled, config')
      .eq('user_id', user.id)
      .eq('type', 'review_request')
      .single()

    if (agent?.enabled) {
      const cfg = agent.config as { fromName?: string; replyToEmail?: string; reviewLink?: string }
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('user_id', user.id)
        .single()

      if (cfg.reviewLink) {
        const email = reviewRequest({
          customerName: contact.name,
          businessName: business?.name ?? '',
          fromName:     cfg.fromName ?? business?.name ?? 'The Team',
          reviewLink:   cfg.reviewLink,
        })
        await sendEmail({
          to:      contact.email,
          replyTo: cfg.replyToEmail,
          subject: email.subject,
          html:    email.html,
        })

        await supabase.from('agent_activity').insert({
          user_id:         user.id,
          agent_type:      'review_request',
          action:          'review_request_sent',
          recipient_email: contact.email,
          subject:         email.subject,
          details:         { customer_name: contact.name, contact_id: contact.id },
        })

        reviewSent = true
      }
    }
  }

  return NextResponse.json({ success: true, reviewSent })
}
