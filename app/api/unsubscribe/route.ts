import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cancelScheduledEmails } from '@/lib/cancel-emails'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.redirect(`${origin}/unsubscribe?status=invalid`)
  }

  try {
    const supabase = getAdminClient()

    // 'do_not_contact' is the valid status — 'unsubscribed' is not in the constraint
    const { error } = await supabase
      .from('contacts')
      .update({ status: 'do_not_contact' })
      .eq('id', id)

    if (error) {
      return NextResponse.redirect(`${origin}/unsubscribe?status=error`)
    }

    // Cancel any scheduled emails for this contact
    await cancelScheduledEmails(id, supabase)
  } catch {
    return NextResponse.redirect(`${origin}/unsubscribe?status=error`)
  }

  return NextResponse.redirect(`${origin}/unsubscribe?status=done`)
}
