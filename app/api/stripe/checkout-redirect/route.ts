import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { stripe, PRICE_IDS } from '@/lib/stripe'
import type { PlanId } from '@/lib/stripe'

const SUBSCRIPTION_PRICES: Record<string, string> = {
  starter: PRICE_IDS.starter,
  growth:  PRICE_IDS.growth,
  pro:     PRICE_IDS.pro,
}

// GET /api/stripe/checkout-redirect?plan=growth
// Used after email verification when a plan was chosen before signup.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const plan = searchParams.get('plan') as PlanId | null

  const priceId = plan ? SUBSCRIPTION_PRICES[plan] : null

  if (!priceId) {
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${origin}/login`)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?subscribed=${plan}`,
      cancel_url:  `${appUrl}/pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: user.id, plan: plan! },
      },
      metadata: { user_id: user.id, plan: plan! },
    })

    return NextResponse.redirect(session.url!)
  } catch (err) {
    console.error('Checkout redirect error:', err)
    return NextResponse.redirect(`${origin}/pricing`)
  }
}
