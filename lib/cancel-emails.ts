import { cancelEmail } from '@/lib/email'
import type { SupabaseClient } from '@supabase/supabase-js'

// Statuses that mean the contact should no longer receive any scheduled emails
const CANCEL_STATUSES = new Set([
  'booked',
  'won',
  'completed',
  'do_not_contact',
  'review_completed',
])

export function shouldCancelEmails(status: string): boolean {
  return CANCEL_STATUSES.has(status)
}

export async function cancelScheduledEmails(
  contactId: string,
  supabase: SupabaseClient,
): Promise<void> {
  const { data: messages } = await supabase
    .from('agent_messages')
    .select('id, external_provider_id')
    .eq('contact_id', contactId)
    .eq('status', 'scheduled')
    .not('external_provider_id', 'is', null)

  if (!messages || messages.length === 0) return

  await Promise.allSettled(
    messages.map(async (msg) => {
      const ok = await cancelEmail(msg.external_provider_id as string)
      if (ok) {
        await supabase
          .from('agent_messages')
          .update({ status: 'cancelled' })
          .eq('id', msg.id)
      }
    })
  )
}
