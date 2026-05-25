import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, daysFromNow } from '@/lib/email'
import { welcomeEmail, onboardingDay1, onboardingDay3 } from '@/lib/emails/templates'

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

      // Day 0: welcome email (immediate)
      const day0 = welcomeEmail({ businessName, dashboardUrl: `${origin}/dashboard` })
      await sendEmail({ to: user.email, subject: day0.subject, html: day0.html })

      // Day 1: lead follow-up education (24 hours later)
      const day1 = onboardingDay1({ businessName, scannerUrl: `${origin}/scanner` })
      sendEmail({
        to: user.email,
        subject: day1.subject,
        html: day1.html,
        scheduledAt: daysFromNow(1),
      }).catch(() => null)

      // Day 3: activate first agent (72 hours later)
      const day3 = onboardingDay3({ businessName, agentsUrl: `${origin}/dashboard/agents` })
      sendEmail({
        to: user.email,
        subject: day3.subject,
        html: day3.html,
        scheduledAt: daysFromNow(3),
      }).catch(() => null)
    }
  } catch {
    // non-blocking — don't fail the redirect if email fails
  }

  const next = searchParams.get('next')
  const destination = next && next.startsWith('/') ? next : '/dashboard'
  return NextResponse.redirect(`${origin}${destination}`)
}
