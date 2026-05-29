import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, PLAN_FROM_PRICE } from '@/lib/stripe'
import type Stripe from 'stripe'
import type { PlanId } from '@/lib/stripe'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function upsertSubscription(supabase: ReturnType<typeof getAdminClient>, {
  userId,
  customerId,
  subscriptionId,
  plan,
  status,
  currentPeriodEnd,
}: {
  userId: string
  customerId: string
  subscriptionId: string
  plan: PlanId
  status: string
  currentPeriodEnd: number | null
}) {
  await supabase.from('subscriptions').upsert({
    user_id:                userId,
    stripe_customer_id:     customerId,
    stripe_subscription_id: subscriptionId,
    plan,
    status,
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminClient()

  try {
    switch (event.type) {
      // ── New subscription created via Checkout ──────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId       = session.client_reference_id ?? session.metadata?.user_id
        const customerId   = session.customer as string
        const subId        = session.subscription as string
        const plan         = (session.metadata?.plan ?? 'starter') as PlanId

        if (!userId) { console.error('No user_id in checkout session'); break }

        const sub = await stripe.subscriptions.retrieve(subId)
        await upsertSubscription(supabase, {
          userId,
          customerId,
          subscriptionId: subId,
          plan,
          status: sub.status,
          currentPeriodEnd: (sub as { current_period_end?: number }).current_period_end ?? null,
        })

        // Internal analytics — non-blocking
        try {
          await supabase.from('analytics_events').insert({
            event_name:   'purchase_completed',
            user_id:      userId,
            plan_clicked: plan,
            properties:   { billing_cycle: 'monthly' },
          })
        } catch { /* non-blocking */ }

        break
      }

      // ── Plan change, renewal, or trial conversion ──────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription & { current_period_end: number }
        const customerId = sub.customer as string

        const { data: existing } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existing?.user_id) break

        const priceId = sub.items.data[0]?.price?.id ?? ''
        const plan    = PLAN_FROM_PRICE[priceId] ?? 'starter'

        await upsertSubscription(supabase, {
          userId:           existing.user_id,
          customerId,
          subscriptionId:   sub.id,
          plan,
          status:           sub.status,
          currentPeriodEnd: sub.current_period_end ?? null,
        })
        break
      }

      // ── Cancellation ───────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase
          .from('subscriptions')
          .update({ plan: 'free', status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Payment failure → mark past_due ───────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId   = typeof invoice.subscription === 'string' ? invoice.subscription : null
        if (subId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId)
        }
        break
      }

      // ── Payment success → clear past_due back to active ───────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subId   = typeof invoice.subscription === 'string' ? invoice.subscription : null
        // Only update if billing_reason is not 'subscription_create' (that's handled by checkout.session.completed)
        if (subId && (invoice as { billing_reason?: string }).billing_reason !== 'subscription_create') {
          await supabase
            .from('subscriptions')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId)
        }
        break
      }
    }
  } catch (err) {
    // Return 500 so Stripe retries the event — all our writes are idempotent
    console.error(`Stripe webhook handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
