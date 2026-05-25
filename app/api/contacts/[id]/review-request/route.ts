import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, daysFromNow } from '@/lib/email'
import {
  reviewRequest,
  reviewRequestDay3,
  reviewRequestDay7,
  privateFeedbackRequest,
} from '@/lib/emails/templates'
import { getReviewCopy } from '@/lib/agents/review-copy'

type Satisfaction = 'happy' | 'not_sure' | 'unhappy'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const satisfaction: Satisfaction = body.satisfaction ?? 'happy'

    // Fetch contact
    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    if (!contact.email) return NextResponse.json({ error: 'Contact has no email' }, { status: 400 })

    // Fetch agent config + business
    const [{ data: agent }, { data: business }] = await Promise.all([
      supabase.from('agents').select('config').eq('user_id', user.id).eq('type', 'review_request').single(),
      supabase.from('businesses').select('name, industry').eq('user_id', user.id).single(),
    ])

    const cfg = (agent?.config ?? {}) as {
      reviewLink?: string
      fromName?: string
      replyToEmail?: string
    }

    const businessName = business?.name ?? 'Our Business'
    const industry     = business?.industry ?? ''
    const fromName     = cfg.fromName ?? businessName
    const replyToEmail = cfg.replyToEmail ?? user.email ?? ''
    const copy         = getReviewCopy(industry)
    const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'
    const unsubUrl     = `${appUrl}/api/unsubscribe?id=${contact.id}`

    // ── Create agent run ────────────────────────────────────────
    const { data: agentRun } = await supabase
      .from('agent_runs')
      .insert({
        user_id:       user.id,
        agent_type:    'review_request',
        trigger_type:  'manual_review_request',
        trigger_source: 'contacts_page',
        contact_id:    contact.id,
        status:        'started',
        ai_summary:    `Review ${satisfaction === 'happy' ? 'request' : satisfaction === 'not_sure' ? 'feedback request' : 'blocked — customer satisfaction uncertain'} for ${contact.name}`,
        ai_decision:   { satisfaction, industry, reviewLinkProvided: !!cfg.reviewLink },
        actions_taken: [],
        confidence:    1.0,
      })
      .select('id')
      .single()

    const runId = agentRun?.id ?? null

    // ── Unhappy: block public review, create owner task ──────────
    if (satisfaction === 'unhappy') {
      await Promise.all([
        supabase.from('contacts').update({ status: 'needs_owner_attention' }).eq('id', contact.id),
        supabase.from('agent_tasks').insert({
          user_id:     user.id,
          contact_id:  contact.id,
          agent_type:  'review_request',
          title:       `Follow up with ${contact.name} — do not send public review request`,
          description: `${contact.name} was marked as potentially unhappy. Reach out directly before requesting any review. Contact: ${contact.email}${contact.phone ? ' · ' + contact.phone : ''}.`,
          priority:    'high',
          status:      'open',
        }),
        supabase.from('agent_activity').insert({
          user_id:    user.id,
          agent_type: 'review_request',
          action:     'review_blocked_unhappy_customer',
          details:    { contact_id: contact.id, customer_name: contact.name },
        }),
      ])

      if (runId) {
        await supabase.from('agent_runs').update({
          status: 'skipped',
          actions_taken: ['blocked_review', 'created_owner_task', 'updated_contact_status'],
          updated_at: new Date().toISOString(),
        }).eq('id', runId)
      }

      return NextResponse.json({ success: true, action: 'blocked', reason: 'Customer marked as unhappy — review blocked, task created.' })
    }

    // ── Not sure: send private feedback request only ────────────
    if (satisfaction === 'not_sure') {
      const email = privateFeedbackRequest({
        customerName:  contact.name,
        businessName,
        fromName,
        replyToEmail,
        body:          copy.privateFeedbackBody,
        unsubscribeUrl: unsubUrl,
      })

      const msg = await sendEmail({ to: contact.email, replyTo: replyToEmail, subject: email.subject, html: email.html })

      await Promise.all([
        supabase.from('contacts').update({ status: 'contacted' }).eq('id', contact.id),
        supabase.from('agent_messages').insert({
          user_id:              user.id,
          contact_id:           contact.id,
          agent_run_id:         runId,
          agent_type:           'review_request',
          channel:              'email',
          template_id:          'private_feedback',
          subject:              email.subject,
          status:               'sent',
          sent_at:              new Date().toISOString(),
          external_provider_id: msg?.id ?? null,
        }),
        supabase.from('agent_activity').insert({
          user_id:    user.id,
          agent_type: 'review_request',
          action:     'private_feedback_sent',
          details:    { contact_id: contact.id, customer_name: contact.name },
        }),
      ])

      if (runId) {
        await supabase.from('agent_runs').update({
          status: 'completed',
          actions_taken: ['sent_private_feedback_request'],
          updated_at: new Date().toISOString(),
        }).eq('id', runId)
      }

      return NextResponse.json({ success: true, action: 'private_feedback' })
    }

    // ── Happy: send public review request + schedule Day 3 + Day 7
    if (!cfg.reviewLink) {
      return NextResponse.json(
        { error: 'No review link configured. Add one in the Review Growth System settings.' },
        { status: 400 }
      )
    }

    const day0 = reviewRequest({
      customerName: contact.name,
      businessName,
      fromName,
      reviewLink:   cfg.reviewLink,
    })
    const day3 = reviewRequestDay3({
      customerName:  contact.name,
      businessName,
      fromName,
      reviewLink:    cfg.reviewLink,
      body:          copy.day3Body,
      unsubscribeUrl: unsubUrl,
    })
    const day7 = reviewRequestDay7({
      customerName:  contact.name,
      businessName,
      fromName,
      reviewLink:    cfg.reviewLink,
      body:          copy.day7Body,
      unsubscribeUrl: unsubUrl,
    })

    const day3At = daysFromNow(3)
    const day7At = daysFromNow(7)

    const [msg0, msg3, msg7] = await Promise.all([
      sendEmail({ to: contact.email, replyTo: replyToEmail, subject: day0.subject, html: day0.html }),
      sendEmail({ to: contact.email, replyTo: replyToEmail, subject: day3.subject, html: day3.html, scheduledAt: day3At }),
      sendEmail({ to: contact.email, replyTo: replyToEmail, subject: day7.subject, html: day7.html, scheduledAt: day7At }),
    ])

    await Promise.all([
      supabase.from('contacts').update({ status: 'review_requested' }).eq('id', contact.id),
      supabase.from('agent_messages').insert([
        {
          user_id: user.id, contact_id: contact.id, agent_run_id: runId,
          agent_type: 'review_request', channel: 'email', template_id: 'review_day0',
          subject: day0.subject, status: 'sent', sent_at: new Date().toISOString(),
          external_provider_id: msg0?.id ?? null,
        },
        {
          user_id: user.id, contact_id: contact.id, agent_run_id: runId,
          agent_type: 'review_request', channel: 'email', template_id: 'review_day3',
          subject: day3.subject, status: 'scheduled', scheduled_for: day3At,
          external_provider_id: msg3?.id ?? null,
        },
        {
          user_id: user.id, contact_id: contact.id, agent_run_id: runId,
          agent_type: 'review_request', channel: 'email', template_id: 'review_day7',
          subject: day7.subject, status: 'scheduled', scheduled_for: day7At,
          external_provider_id: msg7?.id ?? null,
        },
      ]),
      supabase.from('agent_activity').insert({
        user_id:    user.id,
        agent_type: 'review_request',
        action:     'review_request_sent',
        details:    { contact_id: contact.id, customer_name: contact.name, sequence: '3-email' },
      }),
    ])

    if (runId) {
      await supabase.from('agent_runs').update({
        status: 'completed',
        actions_taken: ['sent_review_request_day0', 'scheduled_reminder_day3', 'scheduled_reminder_day7'],
        updated_at: new Date().toISOString(),
      }).eq('id', runId)
    }

    return NextResponse.json({ success: true, action: 'review_sequence_started' })
  } catch (err) {
    console.error('Review request error:', err)
    return NextResponse.json({ error: 'Failed to send review request' }, { status: 500 })
  }
}
