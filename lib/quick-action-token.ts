import { createHmac } from 'crypto'

export type QuickAction =
  | 'booked'
  | 'won'
  | 'completed'
  | 'lost'
  | 'do_not_contact'
  | 'needs_followup'
  | 'cancel_sequence'
  | 'send_review'
  | 'estimate_accepted'
  | 'estimate_lost'

const EXPIRY_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

function getSecret(): string {
  const s = process.env.QUICK_ACTION_SECRET ?? process.env.CRON_SECRET
  if (!s) throw new Error('QUICK_ACTION_SECRET env var not set')
  return s
}

function sign(contactId: string, action: string, expiry: number): string {
  return createHmac('sha256', getSecret())
    .update(`${contactId}:${action}:${expiry}`)
    .digest('base64url')
}

export function generateToken(
  contactId: string,
  action: QuickAction,
  expiryMs = Date.now() + EXPIRY_MS,
): { token: string; expiry: number } {
  return { token: sign(contactId, action, expiryMs), expiry: expiryMs }
}

export function verifyToken(
  contactId: string,
  action: string,
  expiry: string,
  token: string,
): boolean {
  const expiryNum = parseInt(expiry, 10)
  if (isNaN(expiryNum) || Date.now() > expiryNum) return false
  const expected = sign(contactId, action, expiryNum)
  return expected === token
}

export function buildActionUrl(
  baseUrl: string,
  contactId: string,
  action: QuickAction,
): string {
  const { token, expiry } = generateToken(contactId, action)
  const p = new URLSearchParams({ contactId, action, expiry: String(expiry), token })
  return `${baseUrl}/api/quick-action?${p}`
}
