import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/emails/templates'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=link-expired`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=link-expired`)
  }

  // Send a welcome email — non-blocking
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const businessName = (user.user_metadata?.business_name as string | undefined) ?? 'there'
      const { subject, html } = welcomeEmail({
        businessName,
        dashboardUrl: `${origin}/dashboard`,
      })
      await sendEmail({ to: user.email, subject, html })
    }
  } catch {
    // non-blocking — don't fail the redirect if email fails
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
