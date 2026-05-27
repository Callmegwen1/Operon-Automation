import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken, QuickAction } from '@/lib/quick-action-token'
import { cancelScheduledEmails } from '@/lib/cancel-emails'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ACTION_STATUS_MAP: Partial<Record<QuickAction, string>> = {
  booked:          'booked',
  won:             'won',
  completed:       'completed',
  lost:            'lost',
  do_not_contact:  'do_not_contact',
  needs_followup:  'new',
  estimate_accepted: 'won',
  estimate_lost:   'lost',
}

const CANCEL_ON = new Set<QuickAction>([
  'booked', 'won', 'completed', 'lost', 'do_not_contact',
  'estimate_accepted', 'estimate_lost', 'cancel_sequence',
])

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const contactId = searchParams.get('contactId') ?? ''
  const action    = searchParams.get('action') ?? ''
  const expiry    = searchParams.get('expiry') ?? ''
  const token     = searchParams.get('token') ?? ''

  const redirect = (status: string) =>
    NextResponse.redirect(`${origin}/quick-action?status=${status}&action=${action}`)

  if (!contactId || !action || !expiry || !token) return redirect('invalid')

  if (!verifyToken(contactId, action, expiry, token)) return redirect('expired')

  const supabase = getAdminClient()

  // Verify contact exists
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, user_id, name, status')
    .eq('id', contactId)
    .single()

  if (!contact) return redirect('not_found')

  const newStatus = ACTION_STATUS_MAP[action as QuickAction]

  try {
    if (action === 'cancel_sequence') {
      await cancelScheduledEmails(contactId, supabase)
    } else if (action === 'send_review') {
      // Redirect owner to review page in dashboard — they still need to pick satisfaction
      return NextResponse.redirect(
        `${origin}/dashboard/contacts/${contactId}?action=review`
      )
    } else if (newStatus) {
      await supabase
        .from('contacts')
        .update({ status: newStatus })
        .eq('id', contactId)

      if (CANCEL_ON.has(action as QuickAction)) {
        await cancelScheduledEmails(contactId, supabase)
      }
    } else {
      return redirect('invalid')
    }

    await supabase.from('agent_activity').insert({
      user_id:    contact.user_id,
      agent_type: 'lead_followup',
      action:     `quick_action_${action}`,
      details:    { contact_id: contactId, contact_name: contact.name, via: 'email_button' },
    })
  } catch {
    return redirect('error')
  }

  return redirect('done')
}
