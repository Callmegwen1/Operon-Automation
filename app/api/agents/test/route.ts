import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, FROM_EMAIL } from '@/lib/email'

const agentLabels: Record<string, string> = {
  lead_followup:  'Lead Follow-Up Agent',
  review_request: 'Review Request Agent',
  weekly_report:  'Weekly Owner Report',
}

const agentDescriptions: Record<string, string> = {
  lead_followup:  'This agent will send a follow-up email sequence to new leads at 15 min, 2 days, and 5 days after they\'re added.',
  review_request: 'This agent will send a personalized review request email to customers you select from Contacts.',
  weekly_report:  'This agent will send you a weekly summary of your Revenue Leak Score, open leaks, and agent activity every Monday at 8:00 AM.',
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type } = await req.json()
    if (!type) return NextResponse.json({ error: 'Missing agent type' }, { status: 400 })

    const { data: agentRow } = await supabase
      .from('agents')
      .select('config')
      .eq('user_id', user.id)
      .eq('type', type)
      .single()

    const config = (agentRow?.config ?? {}) as Record<string, string>

    const to =
      config.reportEmail ??
      config.replyToEmail ??
      user.email

    if (!to) return NextResponse.json({ error: 'No email address configured for this agent.' }, { status: 400 })

    const label = agentLabels[type] ?? type
    const description = agentDescriptions[type] ?? ''

    await sendEmail({
      to,
      from: FROM_EMAIL,
      subject: `[Test] ${label} is configured`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1A2E4A;">
          <p style="font-size: 13px; color: #6B7280; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Operon Automation — Agent Test</p>
          <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">${label}</h1>
          <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
            This is a test email confirming your <strong>${label}</strong> is configured and ready.
          </p>
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6;">${description}</p>
          </div>
          <p style="font-size: 13px; color: #9CA3AF;">
            You're receiving this because you clicked "Send Test" in your Operon dashboard.<br />
            Your real emails will look different — this is only a configuration check.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Agent test error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
