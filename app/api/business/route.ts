import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, website_url } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase
      .from('businesses')
      .update({ name: name.trim(), website_url: website_url?.trim() ?? '' })
      .eq('user_id', user.id)
  } else {
    await supabase
      .from('businesses')
      .insert({ user_id: user.id, name: name.trim(), website_url: website_url?.trim() ?? '' })
  }

  return NextResponse.json({ success: true })
}
