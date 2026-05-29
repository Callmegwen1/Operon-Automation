import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, daysFromNow } from '@/lib/email'
import { estimateDay0, estimateDay1, estimateDay3 } from '@/lib/emails/templates'
import { getEstimateCopy } from '@/lib/agents/estimate-copy'
import { checkAgentActionLimit, checkEmailLimit, limitErrorResponse } from '@/lib/plan-limits'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const amount: string | undefined = body.amount?.trim() || undefined

    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    if (!contact.email) return NextResponse.json({ error: 'Contact has no email' }, { status: 400 })

    const [{ data: agent }, { data: business }] = await Promise.all([
      supabase.from('agents').select('config, enabled').eq('user_id', user.id).eq('type', 'estimate_followup').single(),
      supabase.from('businesses').select('name, industry').eq('user_id', user.id).single(),
    ])

    if (!agent?.enabled) {
      return NextResponse.json({ error: 'Estimate Recovery agent is not enabled' }, { status: 400 })
    }

    // Enforce limits before triggering sequence
    const [actionLimit, emailLimit] = await Promise.all([
      checkAgentActionLimit(supabase, user.id),
      checkEmailLimit(supabase, user.id),
    ])
    if (!actionLimit.allowed) {
      return NextResponse.json(limitErrorResponse('agent_actions', actionLimit), { status: 402 })
    }
    if (!emailLimit.allowed) {
      return NextResponse.json(limitErrorResponse('emails', emailLimit), { status: 402 })
    }

    const cfg = (agent.config ?? {}) as {
      fromName?: string
      replyToEmail?: string
      estimateOpener?: string
      estimateBody?: string
    }

    const businessName = business?.name ?? 'Our Business'
    const industry     = business?.industry ?? ''
    const fromName     = cfg.fromName ?? businessName
    const replyToEmail = cfg.replyToEmail ?? user.email ?? ''
    const copy         = getEstimateCopy(industry)
    const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'
    const unsubUrl     = `${appUrl}/api/unsubscribe?id=${contact.id}`

    const { data: agentRun } = await supabase
      .from('agent_runs')
      .insert({
        user_id:        user.id,
        agent_type:     'estimate_followup',
        trigger_type:   'manual_estimate_sent',
        trigger_source: 'contact_detail_page',
        contact_id:     contact.id,
        status:         'started',
        ai_summary:     `Estimate follow-up sequence started for ${contact.name}${amount ? ` — ${amount}` : ''}`,
        ai_decision:    { industry, amount: amount ?? null },
        actions_taken:  [],
        confidence:     1.0,
      })
      .select('id')
      .single()

    const runId = agentRun?.id ?? null

    const email0 = estimateDay0({
      contactName:    contact.name,
      businessName,
      fromName,
      replyToEmail,
      opener:         cfg.estimateOpener ?? copy.day0Opener,
      body:           cfg.estimateBody   ?? copy.day0Body,
      amount,
      unsubscribeUrl: unsubUrl,
    })
    const email1 = estimateDay1({
      contactName:    contact.name,
      businessName,
      fromName,
      body:           copy.day1Body,
      unsubscribeUrl: unsubUrl,
    })
    const email3 = estimateDay3({
      contactName:    contact.name,
      businessName,
      fromName,
      body:           copy.day3Body,
      unsubscribeUrl: unsubUrl,
    })

    const day0Subject = copy.day0Subject(businessName)
    const day1Subject = copy.day1Subject(businessName)
    const day3Subject = copy.day3Subject(businessName)

    const day1At = daysFromNow(1)
    const day3At = daysFromNow(3)

    const [msg0, msg1, msg3] = await Promise.all([
      sendEmail({ to: contact.email, replyTo: replyToEmail, subject: day0Subject, html: email0.html }),
      sendEmail({ to: contact.email, replyTo: replyToEmail, subject: day1Subject, html: email1.html, scheduledAt: day1At }),
      sendEmail({ to: contact.email, replyTo: replyToEmail, subject: day3Subject, html: email3.html, scheduledAt: day3At }),
    ])

    await Promise.all([
      supabase.from('contacts').update({ status: 'contacted' }).eq('id', contact.id),
      supabase.from('agent_messages').insert([
        {
          user_id: user.id, contact_id: contact.id, agent_run_id: runId,
          agent_type: 'estimate_followup', channel: 'email', template_id: 'estimate_day0',
          subject: day0Subject, status: 'sent', sent_at: new Date().toISOString(),
          external_provider_id: msg0?.id ?? null,
        },
        {
          user_id: user.id, contact_id: contact.id, agent_run_id: runId,
          agent_type: 'estimate_followup', channel: 'email', template_id: 'estimate_day1',
          subject: day1Subject, status: 'scheduled', scheduled_for: day1At,
          external_provider_id: msg1?.id ?? null,
        },
        {
          user_id: user.id, contact_id: contact.id, agent_run_id: runId,
          agent_type: 'estimate_followup', channel: 'email', template_id: 'estimate_day3',
          subject: day3Subject, status: 'scheduled', scheduled_for: day3At,
          external_provider_id: msg3?.id ?? null,
        },
      ]),
      supabase.from('agent_activity').insert({
        user_id:    user.id,
        agent_type: 'estimate_followup',
        action:     'estimate_sequence_started',
        details:    { contact_id: contact.id, customer_name: contact.name, amount: amount ?? null },
      }),
    ])

    if (runId) {
      await supabase.from('agent_runs').update({
        status: 'completed',
        actions_taken: ['sent_estimate_day0', 'scheduled_followup_day1', 'scheduled_followup_day3'],
        updated_at: new Date().toISOString(),
      }).eq('id', runId)
    }

    return NextResponse.json({ success: true, action: 'estimate_sequence_started' })
  } catch (err) {
    console.error('Send estimate error:', err)
    return NextResponse.json({ error: 'Failed to send estimate sequence' }, { status: 500 })
  }
}
