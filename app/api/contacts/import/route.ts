import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, minutesFromNow, daysFromNow } from '@/lib/email'
import { leadFollowup1, leadFollowup2, leadFollowup3 } from '@/lib/emails/templates'

interface ImportRow {
  name: string
  email?: string
  phone?: string
  type?: 'lead' | 'customer'
  source?: string
}

async function triggerFollowupSequence(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  contactId: string,
  name: string,
  email: string
) {
  const { data: agent } = await supabase
    .from('agents')
    .select('enabled, config')
    .eq('user_id', userId)
    .eq('type', 'lead_followup')
    .single()

  if (!agent?.enabled) return

  const cfg = agent.config as { fromName?: string; replyToEmail?: string; phone?: string }
  const { data: business } = await supabase
    .from('businesses')
    .select('name, main_service')
    .eq('user_id', userId)
    .single()

  const emailArgs = {
    leadName:     name,
    businessName: business?.name ?? 'Our Team',
    fromName:     cfg.fromName ?? business?.name ?? 'The Team',
    phone:        cfg.phone ?? '',
    service:      business?.main_service,
  }
  const replyTo = cfg.replyToEmail ?? undefined

  const e1 = leadFollowup1(emailArgs)
  const e2 = leadFollowup2(emailArgs)
  const e3 = leadFollowup3({ leadName: name, businessName: emailArgs.businessName, fromName: emailArgs.fromName })

  await Promise.all([
    sendEmail({ to: email, replyTo, subject: e1.subject, html: e1.html, scheduledAt: minutesFromNow(15) }),
    sendEmail({ to: email, replyTo, subject: e2.subject, html: e2.html, scheduledAt: daysFromNow(2) }),
    sendEmail({ to: email, replyTo, subject: e3.subject, html: e3.html, scheduledAt: daysFromNow(5) }),
  ])

  await supabase.from('contacts').update({ status: 'contacted' }).eq('id', contactId)
  await supabase.from('agent_activity').insert({
    user_id:    userId,
    agent_type: 'lead_followup',
    action:     'follow_up_sequence_started',
    details:    { contact_id: contactId, lead_name: name, lead_email: email },
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { rows, triggerFollowup = false } = await req.json() as {
      rows: ImportRow[]
      triggerFollowup?: boolean
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    const valid = rows
      .filter((r) => r.name?.trim())
      .map((r) => ({
        user_id: user.id,
        name:    r.name.trim(),
        email:   r.email?.trim()  || '',
        phone:   r.phone?.trim()  || '',
        type:    r.type === 'customer' ? 'customer' : 'lead',
        source:  r.source?.trim() || 'CSV Import',
        status:  'new',
      }))

    if (valid.length === 0) {
      return NextResponse.json({ error: 'No valid rows found' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert(valid)
      .select('id, name, email, type')

    if (error) throw error

    // Optionally fire the lead follow-up sequence for each imported lead with an email
    if (triggerFollowup && data) {
      const leadFollowups = data.filter(
        (c: { type: string; email: string }) => c.type === 'lead' && c.email
      )
      await Promise.allSettled(
        leadFollowups.map((c: { id: string; name: string; email: string }) =>
          triggerFollowupSequence(supabase, user.id, c.id, c.name, c.email)
        )
      )
    }

    return NextResponse.json({ imported: data?.length ?? 0 })
  } catch (err) {
    console.error('Contact import error:', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
