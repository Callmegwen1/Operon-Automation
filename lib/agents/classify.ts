import Anthropic from '@anthropic-ai/sdk'

export type Urgency = 'low' | 'medium' | 'high' | 'urgent'
export type CustomerStage = 'just_browsing' | 'comparing_options' | 'ready_to_book' | 'emergency'
export type Sentiment = 'neutral' | 'positive' | 'stressed' | 'frustrated'
export type Playbook =
  | 'standard_followup'
  | 'urgent_home_service'
  | 'consultation_request'
  | 'appointment_request'
  | 'emergency_service'
  | 'quote_request'
  | 'catering_or_event'
  | 'membership_inquiry'

export interface LeadClassification {
  urgency: Urgency
  intent: string
  customerStage: CustomerStage
  sentiment: Sentiment
  recommendedPlaybook: Playbook
  requiresOwnerAttention: boolean
  ownerAlertSummary: string
  aiSummary: string
  confidence: number
  reasoning: string
}

export interface LeadContext {
  industry: string
  businessName: string
  leadName: string
  leadEmail: string
  leadPhone: string
  leadMessage: string
  leadSource: string
  mainService?: string
  avgJobValue?: number
}

const FALLBACK: LeadClassification = {
  urgency: 'medium',
  intent: 'General inquiry',
  customerStage: 'comparing_options',
  sentiment: 'neutral',
  recommendedPlaybook: 'standard_followup',
  requiresOwnerAttention: false,
  ownerAlertSummary: '',
  aiSummary: '',
  confidence: 0.3,
  reasoning: 'AI classification unavailable — default applied.',
}

export async function classifyLead(context: LeadContext): Promise<LeadClassification> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return buildFallback(context)

  const client = new Anthropic({ apiKey })

  const prompt = `You are an AI classifier for a small business revenue system. Analyze this incoming lead and extract key intelligence so the system can respond appropriately.

Business context:
- Business: ${context.businessName}
- Industry: ${context.industry}
- Main service: ${context.mainService || 'Not specified'}
- Average job value: ${context.avgJobValue ? `$${context.avgJobValue}` : 'Unknown'}

Lead details:
- Name: ${context.leadName}
- Email: ${context.leadEmail || 'Not provided'}
- Phone: ${context.leadPhone || 'Not provided'}
- Message: "${context.leadMessage || 'No message provided'}"
- Source: ${context.leadSource}

Respond ONLY with valid JSON — no explanation, no markdown:
{
  "urgency": "low|medium|high|urgent",
  "intent": "brief description of what the customer wants (max 60 chars)",
  "customerStage": "just_browsing|comparing_options|ready_to_book|emergency",
  "sentiment": "neutral|positive|stressed|frustrated",
  "recommendedPlaybook": "standard_followup|urgent_home_service|consultation_request|appointment_request|emergency_service|quote_request|catering_or_event|membership_inquiry",
  "requiresOwnerAttention": true|false,
  "ownerAlertSummary": "one sentence for the owner, include urgency signal if present (max 120 chars)",
  "aiSummary": "2-3 sentence dashboard summary of this lead",
  "confidence": 0.0,
  "reasoning": "brief explanation of urgency/playbook decision (max 100 chars)"
}

Classification rules:
- Mark urgent if message contains: broken, not working, emergency, flooding, today, right now, ASAP, urgent
- Mark requiresOwnerAttention=true if urgency is high or urgent, or if phone provided with urgent message
- Mark emergency_service playbook for service breakdowns, safety issues, water damage, HVAC failures
- Mark consultation_request for med spa, dental, legal, or financial inquiries
- Never invent facts not in the message`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    // Strip any accidental markdown fences
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const parsed = JSON.parse(clean) as LeadClassification
    // Ensure ownerAlertSummary has a default if empty
    if (!parsed.ownerAlertSummary) {
      parsed.ownerAlertSummary = `New lead from ${context.leadName} via ${context.leadSource}`
    }
    if (!parsed.aiSummary) {
      parsed.aiSummary = `${context.leadName} submitted an inquiry via ${context.leadSource}.`
    }
    return parsed
  } catch {
    return buildFallback(context)
  }
}

function buildFallback(context: LeadContext): LeadClassification {
  // Rule-based fallback so the lead route never fails
  const msg = (context.leadMessage || '').toLowerCase()
  const isUrgent = /broken|not working|emergency|flooding|today|right now|asap|urgent|stopped/.test(msg)
  return {
    ...FALLBACK,
    urgency: isUrgent ? 'urgent' : 'medium',
    requiresOwnerAttention: isUrgent,
    ownerAlertSummary: isUrgent
      ? `Urgent lead: ${context.leadName} — check message immediately`
      : `New lead from ${context.leadName} via ${context.leadSource}`,
    aiSummary: `${context.leadName} submitted an inquiry via ${context.leadSource}${context.leadMessage ? '. Message: "' + context.leadMessage.slice(0, 120) + (context.leadMessage.length > 120 ? '…' : '') + '"' : ''}.`,
    recommendedPlaybook: isUrgent ? 'urgent_home_service' : 'standard_followup',
    customerStage: isUrgent ? 'emergency' : 'comparing_options',
    sentiment: isUrgent ? 'stressed' : 'neutral',
  }
}
