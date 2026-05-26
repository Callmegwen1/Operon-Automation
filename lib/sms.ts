function formatE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return `+${digits}`
}

export async function sendSMS({
  to,
  body,
}: {
  to: string
  body: string
}): Promise<{ sid: string } | null> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio env vars not set — SMS skipped')
    return null
  }

  const toE164 = formatE164(to)
  const url    = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: toE164, From: fromNumber, Body: body }).toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Twilio SMS error:', err)
    return null
  }

  const data = await res.json()
  return { sid: data.sid }
}
