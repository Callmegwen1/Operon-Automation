import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit } from '@/lib/rate-limit'

const SYSTEM_PROMPT = `You are Ope, the friendly AI assistant for Operon Automation (operonauto.com). You live in a chat widget on the website and help small business owners understand how Operon can help them stop losing customers and revenue.

PERSONALITY:
- Warm, direct, and genuinely helpful — like a knowledgeable friend
- Honest: if Operon isn't a fit, say so
- Concise: 2–4 sentences for simple questions, more detail only when explaining a specific product or comparing plans
- Never use filler phrases like "Great question!" or "Certainly!"

ABOUT OPERON:
Operon helps small businesses (home services, cleaning, trades, auto shops, med spas, fitness studios, dental offices, clinics, real estate, restaurants) find and fix revenue leaks — customers and money lost because of slow follow-up, no review system, cold estimates, and inactive customers.

PRODUCTS:
1. Revenue Leak Scanner (FREE, 3 minutes) — A 3-step form that gives a Revenue Leak Score (0–100) and identifies the exact leaks costing the business customers. Always recommend this as the first step. Link: /scanner

2. Lead Recovery Autopilot — When a new lead comes in, AI classifies urgency and sends a personalized follow-up email within 15 minutes. Chooses from 8 playbooks based on industry and intent. Sends 3 emails over 5 days. Alerts the owner for urgent leads.

3. Review Growth System — After completing a job, one click sends a review request to the customer. A satisfaction filter screens out unhappy customers — they get a private feedback email, not a public review link. Includes Day 3 and Day 7 follow-up reminders.

4. Estimate Recovery Autopilot — Automatically follows up on sent estimates: an email at Day 0 (with the estimate), Day 1 check-in, and Day 3 final nudge. Industry-specific copy.

5. Customer Reactivation Autopilot — Every Sunday, sends personalized win-back emails to customers who haven't booked in 60+ days.

6. Weekly Revenue Briefing — Every Monday at 8am: Revenue Leak Score, what the agents did that week, and what needs attention. No dashboard check-in required.

PRICING:
- Free: Revenue Leak Scanner only
- Starter — $149/month: one system of your choice
- Growth — $299/month: all systems (most popular)
- Pro — $599/month: all systems + priority support + higher limits

COMMON QUESTIONS:
- "Is there a setup fee?" Optional done-for-you setup is $299 one-time for Starter, included in Growth and Pro.
- "Do I need a CRM?" No — Operon has a built-in contact system.
- "Does it send texts?" SMS is available on Growth and Pro plans via the Lead Recovery Autopilot for urgent leads.
- "Does it work for [industry]?" If it's a service business with leads and customers, yes. Operon supports 10+ industries.
- "Can I cancel?" Yes, anytime. No long-term contracts.

RULES:
- Always suggest the free scanner as the starting point — it's free, takes 3 minutes, and shows exactly which system they need
- Never promise specific revenue amounts (e.g., "you'll make $X more")
- For account, billing, or technical support issues, direct to the dashboard at /dashboard or email hello@operonauto.com
- If someone clearly isn't a small business owner or needs enterprise software, be honest that Operon is built for small businesses
- Keep it human — no bullet-point walls unless listing plan features`

const MAX_HISTORY  = 20   // messages to keep in context
const MAX_CHARS    = 600  // max chars per message from client

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`ope:${ip}`, { limit: 40, windowMs: 60 * 1000 })
  if (!rl.allowed) return new Response('Too many requests', { status: 429 })

  let body: { messages?: unknown }
  try { body = await req.json() }
  catch { return new Response('Bad request', { status: 400 }) }

  if (!Array.isArray(body.messages)) return new Response('Bad request', { status: 400 })

  const messages: ChatMessage[] = (body.messages as unknown[])
    .filter((m): m is ChatMessage =>
      typeof m === 'object' && m !== null &&
      (m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant' &&
      typeof (m as ChatMessage).content === 'string'
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))

  // Must end with a user message
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return new Response('Bad request', { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return new Response('Service unavailable', { status: 503 })

  const client = new Anthropic({ apiKey })

  const encoder  = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 450,
          system:     SYSTEM_PROMPT,
          messages,
        })

        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode("I'm having trouble connecting right now. Try refreshing, or email us at hello@operonauto.com!")
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':           'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control':          'no-cache',
    },
  })
}
