import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, enabled } = await req.json()
    if (!type || enabled === undefined) {
      return NextResponse.json({ error: 'Missing type or enabled' }, { status: 400 })
    }

    await supabase.from('agents').upsert(
      { user_id: user.id, type, enabled, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,type' }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Agent toggle error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
