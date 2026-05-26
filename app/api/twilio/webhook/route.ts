import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits[0] === '1') return digits.slice(1)
  return digits
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const from    = params.get('From') ?? ''
  const message = (params.get('Body') ?? '').trim().toUpperCase()

  if (!from) {
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const isStop = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(message)

  if (isStop) {
    const supabase = getAdminClient()
    const normalized = normalizePhone(from)

    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, phone')
      .not('phone', 'is', null)

    const matches = (contacts ?? []).filter((c: { id: string; phone: string }) => {
      return normalizePhone(c.phone) === normalized
    })

    if (matches.length > 0) {
      await supabase
        .from('contacts')
        .update({ status: 'do_not_contact' })
        .in('id', matches.map((c: { id: string }) => c.id))
    }
  }

  return new NextResponse('<?xml version="1.0"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}
