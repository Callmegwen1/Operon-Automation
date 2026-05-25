const RESEND_API = 'https://api.resend.com/emails'
const RESEND_KEY = process.env.RESEND_API_KEY!
export const FROM_EMAIL = 'Operon Automation <noreply@operonauto.com>'

export interface SendEmailResult {
  id?: string
  error?: string
}

export async function sendEmail({
  to,
  from = FROM_EMAIL,
  replyTo,
  subject,
  html,
  scheduledAt,
}: {
  to: string
  from?: string
  replyTo?: string
  subject: string
  html: string
  scheduledAt?: string
}): Promise<SendEmailResult> {
  const body: Record<string, unknown> = { from, to: [to], subject, html }
  if (replyTo) body.reply_to = replyTo
  if (scheduledAt) body.scheduled_at = scheduledAt

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return res.json()
}

export async function cancelEmail(resendId: string): Promise<boolean> {
  const res = await fetch(`${RESEND_API}/${resendId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}` },
  })
  return res.ok
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

export function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}
