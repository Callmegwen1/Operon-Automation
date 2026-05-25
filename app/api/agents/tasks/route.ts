import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: tasks, error } = await supabase
      .from('agent_tasks')
      .select(`
        id, agent_type, title, description, priority, status, due_at, created_at,
        contact_id,
        contacts ( name, email, phone )
      `)
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return NextResponse.json({ tasks: tasks ?? [] })
  } catch (err) {
    console.error('Agent tasks GET error:', err)
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    if (!['open', 'done', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { error } = await supabase
      .from('agent_tasks')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Agent tasks PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
