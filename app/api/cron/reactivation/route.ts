import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { reactivationEmail } from '@/lib/emails/templates'
import { getReactivationCopy } from '@/lib/agents/reactivation-copy'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  const { data: agents } = await supabase
    .from('agents')
    .select('user_id, config')
    .eq('type', 'reactivation')
    .eq('enabled', true)

  if (!agents || agents.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  let sent = 0

  for (const agent of agents) {
    try {
      const cfg = (agent.config ?? {}) as { fromName?: string; replyToEmail?: string }

      const [{ data: business }, { data: dormantContacts }] = await Promise.all([
        supabase.from('businesses').select('name, industry').eq('user_id', agent.user_id).single(),
        supabase
          .from('contacts')
          .select('id, name, email, status, updated_at')
          .eq('user_id', agent.user_id)
          .eq('type', 'customer')
          .in('status', ['completed', 'won'])
          .neq('status', 'do_not_contact')
          .lt('updated_at', sixtyDaysAgo)
          .not('email', 'is', null),
      ])

      if (!dormantContacts || dormantContacts.length === 0) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(agent.user_id)
      const businessName = business?.name ?? 'Our Business'
      const industry     = business?.industry ?? ''
      const fromName     = cfg.fromName ?? businessName
      const replyToEmail = cfg.replyToEmail ?? user?.email ?? ''
      const copy         = getReactivationCopy(industry)
      const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'

      for (const contact of dormantContacts) {
        if (!contact.email) continue

        try {
          const unsubUrl = `${appUrl}/api/unsubscribe?id=${contact.id}`
          const subject  = copy.subject(businessName)
          const email    = reactivationEmail({
            customerName:   contact.name,
            businessName,
            fromName,
            replyToEmail,
            opener:         copy.opener,
            body:           copy.body,
            unsubscribeUrl: unsubUrl,
          })

          const { data: agentRun } = await supabase
            .from('agent_runs')
            .insert({
              user_id:        agent.user_id,
              agent_type:     'reactivation',
              trigger_type:   'cron_reactivation',
              trigger_source: 'weekly_cron',
              contact_id:     contact.id,
              status:         'started',
              ai_summary:     `Reactivation email sent to ${contact.name} — dormant 60+ days`,
              ai_decision:    { industry, daysDormant: Math.floor((Date.now() - new Date(contact.updated_at).getTime()) / 86400000) },
              actions_taken:  [],
              confidence:     1.0,
            })
            .select('id')
            .single()

          const runId = agentRun?.id ?? null
          const msg = await sendEmail({ to: contact.email, replyTo: replyToEmail, subject, html: email.html })

          await Promise.all([
            supabase.from('contacts').update({ status: 'contacted' }).eq('id', contact.id),
            supabase.from('agent_messages').insert({
              user_id:              agent.user_id,
              contact_id:           contact.id,
              agent_run_id:         runId,
              agent_type:           'reactivation',
              channel:              'email',
              template_id:          'reactivation_winback',
              subject,
              status:               'sent',
              sent_at:              new Date().toISOString(),
              external_provider_id: msg?.id ?? null,
            }),
            supabase.from('agent_activity').insert({
              user_id:    agent.user_id,
              agent_type: 'reactivation',
              action:     'reactivation_email_sent',
              details:    { contact_id: contact.id, customer_name: contact.name },
            }),
          ])

          if (runId) {
            await supabase.from('agent_runs').update({
              status: 'completed',
              actions_taken: ['sent_reactivation_email', 'updated_contact_status'],
              updated_at: new Date().toISOString(),
            }).eq('id', runId)
          }

          sent++
        } catch (err) {
          console.error(`Reactivation failed for contact ${contact.id}:`, err)
        }
      }
    } catch (err) {
      console.error(`Reactivation cron failed for user ${agent.user_id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
