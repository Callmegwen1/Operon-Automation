import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ImportRow {
  name: string
  email?: string
  phone?: string
  type?: 'lead' | 'customer'
  source?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { rows } = await req.json() as { rows: ImportRow[] }
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

    const { data, error } = await supabase
      .from('contacts')
      .insert(valid)
      .select('id')

    if (error) throw error

    return NextResponse.json({ imported: data?.length ?? 0 })
  } catch (err) {
    console.error('Contact import error:', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
