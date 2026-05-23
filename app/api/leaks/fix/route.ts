import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { leakId } = await req.json()
    if (!leakId) return NextResponse.json({ error: 'Missing leakId' }, { status: 400 })

    await supabase
      .from('leaks')
      .update({ status: 'fixed', updated_at: new Date().toISOString() })
      .eq('id', leakId)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Leak fix error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
