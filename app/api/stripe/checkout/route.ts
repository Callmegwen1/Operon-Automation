import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PRICE_IDS } from '@/lib/stripe'
import type { PlanId } from '@/lib/stripe'

const SUBSCRIPTION_PRICES: Record<string, string> = {
  starter: PRICE_IDS.starter,
  growth:  PRICE_IDS.growth,
  pro:     PRICE_IDS.pro,
}

const SETUP_PRICES: Record<string, string> = {
  starter: PRICE_IDS.setup_starter,
  growth:  PRICE_IDS.setup_growth,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in first to subscribe.' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const plan: PlanId = body.plan
    const includeSetup: boolean = !!body.includeSetup

    const priceId = SUBSCRIPTION_PRICES[plan]
    if (!priceId) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://operonauto.com'

    // Build line items — subscription + optional one-time setup add-on
    const lineItems: { price: string; quantity: number }[] = [
      { price: priceId, quantity: 1 },
    ]
    if (includeSetup && SETUP_PRICES[plan]) {
      lineItems.push({ price: SETUP_PRICES[plan], quantity: 1 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: lineItems,
      success_url: `${appUrl}/dashboard?subscribed=${plan}`,
      cancel_url: `${appUrl}/pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: user.id, plan },
      },
      metadata: { user_id: user.id, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
