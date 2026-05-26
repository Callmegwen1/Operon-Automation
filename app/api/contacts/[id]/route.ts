import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shouldCancelEmails, cancelScheduledEmails } from '@/lib/cancel-emails'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  const { data: activity } = await supabase
    .from('agent_activity')
    .select('*')
    .contains('details', { contact_id: params.id })
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ contact, activity: activity ?? [] })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['notes', 'name', 'email', 'phone', 'status'] as const
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cancel scheduled emails when contact reaches a terminal/opted-out status
  if (typeof updates.status === 'string' && shouldCancelEmails(updates.status)) {
    cancelScheduledEmails(params.id, supabase).catch(() => {})
  }

  return NextResponse.json({ contact: data })
}
