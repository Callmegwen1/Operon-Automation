import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, minutesFromNow, daysFromNow } from '@/lib/email'
import { leadFollowup1, leadFollowup2, leadFollowup3, newLeadNotification } from '@/lib/emails/templates'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })

    const body = await req.json()
    const name: string = body.name?.trim()
    const email: string = body.email?.trim() ?? ''
    const phone: string = body.phone?.trim() ?? ''
    const message: string = body.message?.trim() ?? ''
    const source: string = body.source?.trim() || 'Website Form'

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const supabase = getAdminClient()

    // Verify this userId exists (has a businesses or auth user record)
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Insert the contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        name,
        email,
        phone,
        type:   'lead',
        source,
        status: 'new',
      })
      .select('id')
      .single()

    // Store the message in the notes field if present (graceful — column may not exist yet)
    if (message && contact?.id) {
      try {
        await supabase.from('contacts').update({ notes: message }).eq('id', contact.id)
      } catch { /* notes column not yet available */ }
    }

    if (error) throw error

    // Fire lead follow-up sequence if the agent is enabled
    if (email) {
      const { data: agent } = await supabase
        .from('agents')
        .select('enabled, config')
        .eq('user_id', userId)
        .eq('type', 'lead_followup')
        .single()

      if (agent?.enabled) {
        const cfg = agent.config as { fromName?: string; replyToEmail?: string; phone?: string; personalNote?: string }
        const { data: business } = await supabase
          .from('businesses')
          .select('name, main_service')
          .eq('user_id', userId)
          .single()

        const businessName = business?.name ?? 'Our Team'
        const emailArgs = {
          leadName:     name,
          businessName,
          fromName:     cfg.fromName ?? businessName ?? 'The Team',
          phone:        cfg.phone ?? '',
          service:      business?.main_service,
          personalNote: cfg.personalNote,
        }
        const replyTo = cfg.replyToEmail ?? undefined

        const e1 = leadFollowup1(emailArgs)
        const e2 = leadFollowup2(emailArgs)
        const e3 = leadFollowup3({ leadName: name, businessName: emailArgs.businessName, fromName: emailArgs.fromName })

        // Owner notification — instant, no schedule
        const notif = newLeadNotification({
          businessName,
          leadName:    name,
          leadEmail:   email,
          leadPhone:   phone,
          leadMessage: message || undefined,
          source,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'}/dashboard/contacts`,
        })

        await Promise.all([
          // Notify the owner immediately
          cfg.replyToEmail
            ? sendEmail({ to: cfg.replyToEmail, subject: notif.subject, html: notif.html })
            : sendEmail({ to: user.email!, subject: notif.subject, html: notif.html }),
          // Lead follow-up sequence
          sendEmail({ to: email, replyTo, subject: e1.subject, html: e1.html, scheduledAt: minutesFromNow(15) }),
          sendEmail({ to: email, replyTo, subject: e2.subject, html: e2.html, scheduledAt: daysFromNow(2) }),
          sendEmail({ to: email, replyTo, subject: e3.subject, html: e3.html, scheduledAt: daysFromNow(5) }),
        ])

        await supabase.from('contacts').update({ status: 'contacted' }).eq('id', contact.id)
        await supabase.from('agent_activity').insert({
          user_id:    userId,
          agent_type: 'lead_followup',
          action:     'follow_up_sequence_started',
          details:    { contact_id: contact.id, lead_name: name, lead_email: email },
        })
      } else {
        // Agent not enabled — still notify owner if they have an email
        if (user.email) {
          const notif = newLeadNotification({
            businessName: '',
            leadName:    name,
            leadEmail:   email,
            leadPhone:   phone,
            leadMessage: message || undefined,
            source,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'}/dashboard/contacts`,
          })
          await sendEmail({ to: user.email, subject: notif.subject, html: notif.html })
        }
      }
    }

    return NextResponse.json({ success: true, contactId: contact.id })
  } catch (err) {
    console.error('Public lead webhook error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
