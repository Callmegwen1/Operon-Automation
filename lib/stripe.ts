import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const PRICE_IDS = {
  starter: 'price_1TbEkbFKZzKKzdwxkPjyJbrh',
  growth:  'price_1TbElIFKZzKKzdwxHQvOZ0el',
  pro:     'price_1TbEliFKZzKKzdwxpK52XtCy',
  setup_starter: 'price_1TbEmOFKZzKKzdwxMcZom0Hh',
  setup_growth:  'price_1TbEmqFKZzKKzdwx6yrupEkq',
} as const

export type PlanId = 'free' | 'starter' | 'growth' | 'pro'

export const PLAN_FROM_PRICE: Record<string, PlanId> = {
  [PRICE_IDS.starter]: 'starter',
  [PRICE_IDS.growth]:  'growth',
  [PRICE_IDS.pro]:     'pro',
}
