import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, FROM_EMAIL } from '@/lib/email'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data: agentRow } = await supabase
      .from('agents')
      .select('config')
      .eq('user_id', user.id)
      .eq('type', 'lead_followup')
      .single()

    const config = (agentRow?.config ?? {}) as { fromName?: string; replyToEmail?: string }
    const fromName = config.fromName ?? 'Operon Automation'
    const from = `${fromName} <noreply@operonauto.com>`

    const result = await sendEmail({
      to: user.email,
      from,
      replyTo: config.replyToEmail,
      subject: 'Test email from Operon — deliverability check',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a2332;">
          <p style="font-weight: 700; font-size: 18px; margin: 0 0 8px;">Your Operon emails are working.</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            This is a test email sent from your Operon deliverability health check. If you received this in your inbox, your email configuration is working correctly.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #475569; margin: 0 0 6px;"><strong>Sent from:</strong> ${from}</p>
            ${config.replyToEmail ? `<p style="font-size: 13px; color: #475569; margin: 0;"><strong>Reply-to:</strong> ${config.replyToEmail}</p>` : ''}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            If this landed in spam, check your sending domain setup in Resend and ensure SPF/DKIM records are configured.
          </p>
        </div>
      `,
    })

    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Test send error:', err)
    return NextResponse.json({ error: 'Failed to send test email.' }, { status: 500 })
  }
}
