import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, minutesFromNow, daysFromNow } from '@/lib/email'
import { leadFollowup1, leadFollowup2, leadFollowup3, reviewRequest, reviewRequestDay3, reviewRequestDay7 } from '@/lib/emails/templates'
import { getReviewCopy } from '@/lib/agents/review-copy'
import { checkContactLimit, checkAgentActionLimit, limitErrorResponse } from '@/lib/plan-limits'

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'
  const unsubscribeUrl = `${appUrl}/api/unsubscribe?id=${contactId}`
  const emailArgs = {
    leadName:       name,
    businessName:   business?.name ?? 'Our Team',
    fromName:       cfg.fromName ?? business?.name ?? 'The Team',
    phone:          cfg.phone ?? '',
    service:        business?.main_service,
    unsubscribeUrl,
  }
  const replyTo = cfg.replyToEmail ?? undefined

  const e1 = leadFollowup1(emailArgs)
  const e2 = leadFollowup2(emailArgs)
  const e3 = leadFollowup3({ leadName: name, businessName: emailArgs.businessName, fromName: emailArgs.fromName, unsubscribeUrl })

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

async function triggerReviewSequence(
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
    .eq('type', 'review_request')
    .single()

  if (!agent?.enabled) return

  const cfg = agent.config as { reviewLink?: string; fromName?: string; replyToEmail?: string }
  if (!cfg.reviewLink) return

  const [{ data: business }] = await Promise.all([
    supabase.from('businesses').select('name, industry').eq('user_id', userId).single(),
  ])

  const businessName = business?.name ?? 'Our Business'
  const industry     = business?.industry ?? ''
  const fromName     = cfg.fromName ?? businessName
  const replyToEmail = cfg.replyToEmail ?? undefined
  const copy         = getReviewCopy(industry)
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'
  const unsubUrl     = `${appUrl}/api/unsubscribe?id=${contactId}`

  const day0 = reviewRequest({ customerName: name, businessName, fromName, reviewLink: cfg.reviewLink })
  const day3 = reviewRequestDay3({ customerName: name, businessName, fromName, reviewLink: cfg.reviewLink, body: copy.day3Body, unsubscribeUrl: unsubUrl })
  const day7 = reviewRequestDay7({ customerName: name, businessName, fromName, reviewLink: cfg.reviewLink, body: copy.day7Body, unsubscribeUrl: unsubUrl })

  await Promise.all([
    sendEmail({ to: email, replyTo: replyToEmail, subject: day0.subject, html: day0.html }),
    sendEmail({ to: email, replyTo: replyToEmail, subject: day3.subject, html: day3.html, scheduledAt: daysFromNow(3) }),
    sendEmail({ to: email, replyTo: replyToEmail, subject: day7.subject, html: day7.html, scheduledAt: daysFromNow(7) }),
  ])

  await Promise.all([
    supabase.from('contacts').update({ status: 'review_requested' }).eq('id', contactId),
    supabase.from('agent_activity').insert({
      user_id:    userId,
      agent_type: 'review_request',
      action:     'review_request_sent',
      details:    { contact_id: contactId, customer_name: name, sequence: '3-email', source: 'csv_import' },
    }),
  ])
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { rows, triggerFollowup = false, triggerReview = false } = await req.json() as {
      rows: ImportRow[]
      triggerFollowup?: boolean
      triggerReview?: boolean
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

    // Enforce contact limit — check remaining capacity vs rows being imported
    const contactLimit = await checkContactLimit(supabase, user.id)
    if (!contactLimit.allowed) {
      return NextResponse.json(limitErrorResponse('contacts', contactLimit), { status: 402 })
    }
    if (valid.length > contactLimit.remaining) {
      return NextResponse.json({
        error: `Import too large for your plan. You can add ${contactLimit.remaining} more contact${contactLimit.remaining !== 1 ? 's' : ''} (${contactLimit.current}/${contactLimit.limit} used). Reduce your import or upgrade at /pricing.`,
        limitReached: 'contacts',
        current:  contactLimit.current,
        limit:    contactLimit.limit,
        remaining: contactLimit.remaining,
        plan:     contactLimit.plan,
        upgradeUrl: '/pricing',
      }, { status: 402 })
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert(valid)
      .select('id, name, email, type')

    if (error) throw error

    if (data) {
      const actionLimit = await checkAgentActionLimit(supabase, user.id)

      // Optionally fire the lead follow-up sequence for imported leads
      if (triggerFollowup && actionLimit.allowed) {
        const leadFollowups = data.filter(
          (c: { type: string; email: string }) => c.type === 'lead' && c.email
        )
        await Promise.allSettled(
          leadFollowups.map((c: { id: string; name: string; email: string }) =>
            triggerFollowupSequence(supabase, user.id, c.id, c.name, c.email)
          )
        )
      }

      // Optionally fire the review sequence for imported customers
      if (triggerReview && actionLimit.allowed) {
        const customers = data.filter(
          (c: { type: string; email: string }) => c.type === 'customer' && c.email
        )
        await Promise.allSettled(
          customers.map((c: { id: string; name: string; email: string }) =>
            triggerReviewSequence(supabase, user.id, c.id, c.name, c.email)
          )
        )
      }
    }

    return NextResponse.json({ imported: data?.length ?? 0 })
  } catch (err) {
    console.error('Contact import error:', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
