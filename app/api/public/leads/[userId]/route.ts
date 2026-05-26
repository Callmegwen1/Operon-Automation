import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { waitUntil } from '@vercel/functions'
import { sendEmail, minutesFromNow, daysFromNow } from '@/lib/email'
import { leadFollowup1, leadFollowup2, leadFollowup3, intelligentLeadAlert } from '@/lib/emails/templates'
import { rateLimit } from '@/lib/rate-limit'
import { classifyLead } from '@/lib/agents/classify'
import { getPlaybook } from '@/lib/agents/playbooks'
import { sendSMS } from '@/lib/sms'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type LeadContext = {
  supabase:     ReturnType<typeof getAdminClient>
  userId:       string
  user:         { id: string; email?: string }
  contact:      { id: string }
  name:         string
  email:        string
  phone:        string
  message:      string
  source:       string
  businessName: string
  business:     { name?: string; main_service?: string; industry?: string; avg_job_value?: number } | null
  agent:        { enabled: boolean; config: unknown } | null
  appUrl:       string
  dashboardUrl: string
}

async function processLeadAsync(ctx: LeadContext): Promise<void> {
  const { supabase, userId, user, contact, name, email, phone, message, source,
          businessName, business, agent, appUrl, dashboardUrl } = ctx

  if (agent?.enabled && email) {
    const cfg = agent.config as {
      fromName?: string
      replyToEmail?: string
      phone?: string
      personalNote?: string
    }

    // 1. AI classification
    const classification = await classifyLead({
      industry:    business?.industry ?? '',
      businessName,
      leadName:    name,
      leadEmail:   email,
      leadPhone:   phone,
      leadMessage: message,
      leadSource:  source,
      mainService: business?.main_service,
      avgJobValue: business?.avg_job_value ?? undefined,
    })

    const playbook = getPlaybook(classification.recommendedPlaybook)

    // 2. Agent run record
    const { data: agentRun } = await supabase
      .from('agent_runs')
      .insert({
        user_id:        userId,
        agent_type:     'lead_followup',
        trigger_type:   'new_lead',
        trigger_source: source,
        contact_id:     contact.id,
        status:         'started',
        ai_summary:     classification.aiSummary,
        ai_decision:    classification,
        confidence:     classification.confidence,
        actions_taken:  [],
      })
      .select('id')
      .single()

    // 3. Urgent task
    if (classification.requiresOwnerAttention && playbook.createTask) {
      await supabase.from('agent_tasks').insert({
        user_id:     userId,
        contact_id:  contact.id,
        agent_type:  'lead_followup',
        title:       playbook.taskTitle ? playbook.taskTitle(name, classification.intent) : `Follow up with ${name}`,
        description: playbook.taskDescription
          ? playbook.taskDescription(name, classification.aiSummary)
          : classification.aiSummary,
        priority: classification.urgency === 'urgent' ? 'urgent' : 'high',
        status:   'open',
        due_at:   minutesFromNow(classification.urgency === 'urgent' ? 10 : 60),
      })
    }

    // 4. Build emails
    const unsubscribeUrl = `${appUrl}/api/unsubscribe?id=${contact.id}`
    const replyTo        = cfg.replyToEmail ?? undefined
    const emailArgs = {
      leadName:     name,
      businessName,
      fromName:     cfg.fromName ?? businessName,
      phone:        cfg.phone ?? '',
      service:      business?.main_service,
      personalNote: cfg.personalNote,
      unsubscribeUrl,
    }

    const e1Base = leadFollowup1(emailArgs)
    const e1 = playbook.email1Subject || playbook.email1Opening
      ? { subject: playbook.email1Subject ? playbook.email1Subject(businessName) : e1Base.subject, html: e1Base.html }
      : e1Base
    const e2 = leadFollowup2(emailArgs)
    const e3 = leadFollowup3({ leadName: name, businessName, fromName: cfg.fromName ?? businessName, unsubscribeUrl })

    // 5. Send owner alert + schedule sequence
    const ownerEmail  = cfg.replyToEmail ?? user.email!
    const ownerAlert  = intelligentLeadAlert({
      businessName,
      leadName:               name,
      leadEmail:              email,
      leadPhone:              phone,
      leadMessage:            message || undefined,
      source,
      dashboardUrl,
      urgency:                classification.urgency,
      alertPrefix:            playbook.ownerAlertPrefix,
      aiSummary:              classification.aiSummary,
      intent:                 classification.intent,
      playbook:               classification.recommendedPlaybook,
      requiresOwnerAttention: classification.requiresOwnerAttention,
    })

    const e1ScheduledAt = minutesFromNow(playbook.email1DelayMinutes)
    const e2ScheduledAt = daysFromNow(playbook.email2DelayDays)
    const e3ScheduledAt = daysFromNow(playbook.email3DelayDays)

    const [, msg1, msg2, msg3] = await Promise.all([
      sendEmail({ to: ownerEmail, subject: ownerAlert.subject, html: ownerAlert.html }),
      sendEmail({ to: email, replyTo, subject: e1.subject, html: e1.html, scheduledAt: e1ScheduledAt }),
      sendEmail({ to: email, replyTo, subject: e2.subject, html: e2.html, scheduledAt: e2ScheduledAt }),
      sendEmail({ to: email, replyTo, subject: e3.subject, html: e3.html, scheduledAt: e3ScheduledAt }),
    ])

    // 6. Track messages for cancellation
    const runId = agentRun?.id ?? null
    await supabase.from('agent_messages').insert([
      {
        user_id: userId, contact_id: contact.id, agent_run_id: runId,
        agent_type: 'lead_followup', channel: 'email', template_id: 'lead_followup_1',
        subject: e1.subject, status: 'scheduled', scheduled_for: e1ScheduledAt,
        external_provider_id: msg1?.id ?? null,
      },
      {
        user_id: userId, contact_id: contact.id, agent_run_id: runId,
        agent_type: 'lead_followup', channel: 'email', template_id: 'lead_followup_2',
        subject: e2.subject, status: 'scheduled', scheduled_for: e2ScheduledAt,
        external_provider_id: msg2?.id ?? null,
      },
      {
        user_id: userId, contact_id: contact.id, agent_run_id: runId,
        agent_type: 'lead_followup', channel: 'email', template_id: 'lead_followup_3',
        subject: e3.subject, status: 'scheduled', scheduled_for: e3ScheduledAt,
        external_provider_id: msg3?.id ?? null,
      },
    ])

    // 7. Update contact + complete run
    await supabase.from('contacts').update({ status: 'contacted' }).eq('id', contact.id)

    if (agentRun?.id) {
      await supabase.from('agent_runs').update({
        status: 'completed',
        actions_taken: [
          'send_owner_alert',
          'send_personalized_email_1',
          'schedule_followup_email_2',
          'schedule_followup_email_3',
          ...(classification.requiresOwnerAttention ? ['create_dashboard_task'] : []),
        ],
        updated_at: new Date().toISOString(),
      }).eq('id', agentRun.id)
    }

    // 8. SMS for urgent/emergency playbooks
    const isSmsPlaybook = ['emergency_service', 'urgent_home_service'].includes(classification.recommendedPlaybook)
    if (isSmsPlaybook && phone) {
      const smsBody = `Hi ${name}, we got your message at ${businessName} and someone will reach out to you very shortly. – ${cfg.fromName ?? businessName}`
      await sendSMS({ to: phone, body: smsBody }).catch(() => {})
    }

    await supabase.from('agent_activity').insert({
      user_id:    userId,
      agent_type: 'lead_followup',
      action:     'follow_up_sequence_started',
      details:    {
        contact_id:   contact.id,
        lead_name:    name,
        lead_email:   email,
        urgency:      classification.urgency,
        playbook:     classification.recommendedPlaybook,
        ai_summary:   classification.aiSummary,
      },
    })
  } else {
    // Agent not enabled — still notify owner
    if (user.email) {
      const appUrl2    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'
      const fallback   = intelligentLeadAlert({
        businessName,
        leadName:               name,
        leadEmail:              email,
        leadPhone:              phone,
        leadMessage:            message || undefined,
        source,
        dashboardUrl,
        urgency:                'medium',
        alertPrefix:            '📬 New lead',
        aiSummary:              `${name} submitted an inquiry via ${source}. The Lead Recovery Autopilot is not active — follow up manually.`,
        intent:                 'General inquiry',
        playbook:               'standard_followup',
        requiresOwnerAttention: false,
      })
      await sendEmail({ to: user.email, subject: fallback.subject, html: fallback.html })
    }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })

    // Rate limit: 5 submissions per IP per 10 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const rl = rateLimit(`lead:${ip}:${userId}`, { limit: 5, windowMs: 10 * 60 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const name: string = body.name?.trim()
    const email: string = body.email?.trim() ?? ''
    const phone: string = body.phone?.trim() ?? ''
    const message: string = body.message?.trim() ?? ''
    const source: string = body.source?.trim() || 'Website Form'

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    // Honeypot check — silently succeed so bots think they succeeded
    if (body._hp) return NextResponse.json({ success: true, contactId: null })

    const supabase = getAdminClient()

    // Verify this userId exists
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Dedup: if this email already exists for this business, silently succeed
    if (email) {
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', userId)
        .eq('email', email)
        .maybeSingle()
      if (existing) return NextResponse.json({ success: true, contactId: existing.id })
    }

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

    if (message && contact?.id) {
      try {
        await supabase.from('contacts').update({ notes: message }).eq('id', contact.id)
      } catch { /* graceful — notes column may not exist yet */ }
    }

    if (error) throw error

    const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'
    const dashboardUrl = `${appUrl}/dashboard/contacts`

    // Fetch agent config + business in parallel while we prepare to respond
    const [{ data: agent }, { data: business }] = await Promise.all([
      supabase.from('agents').select('enabled, config').eq('user_id', userId).eq('type', 'lead_followup').single(),
      supabase.from('businesses').select('name, main_service, industry, avg_job_value').eq('user_id', userId).single(),
    ])

    const businessName = business?.name ?? 'Our Team'

    // Return immediately — AI classification + email scheduling runs in background
    waitUntil(
      processLeadAsync({
        supabase, userId, user, contact: contact as { id: string },
        name, email, phone, message, source,
        businessName, business, agent, appUrl, dashboardUrl,
      })
    )

    return NextResponse.json({ success: true, contactId: contact.id })
  } catch (err) {
    console.error('Public lead webhook error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
