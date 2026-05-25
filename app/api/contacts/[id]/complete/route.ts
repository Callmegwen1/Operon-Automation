import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const finalStatus = body.finalStatus === 'won' ? 'won' : 'completed'

    const { data: contact } = await supabase
      .from('contacts')
      .select('id, email, name')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    await supabase
      .from('contacts')
      .update({ status: finalStatus, type: 'customer' })
      .eq('id', params.id)

    // Check if Review Growth System is enabled so frontend knows to show satisfaction modal
    const { data: agent } = await supabase
      .from('agents')
      .select('enabled')
      .eq('user_id', user.id)
      .eq('type', 'review_request')
      .single()

    const reviewSystemEnabled = !!(agent?.enabled && contact.email)

    return NextResponse.json({ success: true, reviewSystemEnabled, finalStatus })
  } catch (err) {
    console.error('Complete contact error:', err)
    return NextResponse.json({ error: 'Failed to mark contact as complete' }, { status: 500 })
  }
}
