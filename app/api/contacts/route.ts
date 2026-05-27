import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, FROM_EMAIL, minutesFromNow, daysFromNow } from '@/lib/email'
import { leadFollowup1, leadFollowup2, leadFollowup3 } from '@/lib/emails/templates'
import { checkContactLimit, checkAgentActionLimit, limitErrorResponse } from '@/lib/plan-limits'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ contacts: data ?? [] })
  } catch (err) {
    console.error('Contacts GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, email, phone, type = 'lead', source = '', notes = '' } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // Enforce contact limit
    const contactLimit = await checkContactLimit(supabase, user.id)
    if (!contactLimit.allowed) {
      return NextResponse.json(limitErrorResponse('contacts', contactLimit), { status: 402 })
    }

    // Save contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({ user_id: user.id, name, email, phone, type, source, notes, status: 'new' })
      .select()
      .single()

    if (error) throw error

    // If new lead with email, trigger follow-up sequence if agent is enabled
    if (type === 'lead' && email) {
      const { data: agent } = await supabase
        .from('agents')
        .select('enabled, config')
        .eq('user_id', user.id)
        .eq('type', 'lead_followup')
        .single()

      const actionLimit = await checkAgentActionLimit(supabase, user.id)
      if (agent?.enabled && actionLimit.allowed) {
        const cfg = agent.config as {
          fromName?: string
          replyToEmail?: string
          phone?: string
        }

        const { data: business } = await supabase
          .from('businesses')
          .select('name, main_service')
          .eq('user_id', user.id)
          .single()

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'
        const unsubscribeUrl = `${appUrl}/api/unsubscribe?id=${contact.id}`
        const emailArgs = {
          leadName:       name,
          businessName:   business?.name ?? 'Our Team',
          fromName:       cfg.fromName ?? business?.name ?? 'The Team',
          phone:          cfg.phone ?? '',
          service:        business?.main_service,
          unsubscribeUrl,
        }

        const replyTo = cfg.replyToEmail ?? undefined

        // Email 1 — send immediately (15 min delay to allow Resend processing)
        const e1 = leadFollowup1(emailArgs)
        await sendEmail({ to: email, replyTo, subject: e1.subject, html: e1.html, scheduledAt: minutesFromNow(15) })

        // Email 2 — Day 2
        const e2 = leadFollowup2(emailArgs)
        await sendEmail({ to: email, replyTo, subject: e2.subject, html: e2.html, scheduledAt: daysFromNow(2) })

        // Email 3 — Day 5
        const e3 = leadFollowup3({ leadName: name, businessName: emailArgs.businessName, fromName: emailArgs.fromName, unsubscribeUrl })
        await sendEmail({ to: email, replyTo, subject: e3.subject, html: e3.html, scheduledAt: daysFromNow(5) })

        // Mark contact as contacted
        await supabase.from('contacts').update({ status: 'contacted' }).eq('id', contact.id)

        // Log activity
        await supabase.from('agent_activity').insert({
          user_id:    user.id,
          agent_type: 'lead_followup',
          action:     'follow_up_sequence_started',
          details:    { contact_id: contact.id, lead_name: name, lead_email: email },
        })
      }
    }

    return NextResponse.json({ contact })
  } catch (err) {
    console.error('Contact POST error:', err)
    return NextResponse.json({ error: 'Failed to add contact' }, { status: 500 })
  }
}
