import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const N8N_WEBHOOK   = 'https://operon-n8n.znwsri.easypanel.host/webhook/form-lead'
const RESEND_API    = 'https://api.resend.com/emails'
const RESEND_KEY    = process.env.RESEND_API_KEY!
const FROM_EMAIL    = 'Operon Automation <noreply@operonauto.com>'
const ALERT_EMAIL   = 'ceo@operonauto.com'
const OWNER_USER_ID = process.env.OWNER_USER_ID

function scoreLabel(score: number) {
  if (score >= 75) return { label: 'Critical', color: '#ef4444' }
  if (score >= 55) return { label: 'High',     color: '#f59e0b' }
  return               { label: 'Moderate',    color: '#22c55e' }
}

function buildResultsEmail(data: Record<string, string>, score: number): string {
  const { label, color } = scoreLabel(score)
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr><td style="background:#1A2E4A;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#B8963E;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Operon Automation</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:800;">Your Revenue Leak Score is Ready</h1>
        </td></tr>

        <tr><td style="background:#ffffff;padding:40px;text-align:center;">
          <div style="display:inline-block;width:100px;height:100px;border-radius:50%;border:4px solid ${color};margin:0 auto 16px;">
            <p style="margin:28px 0 0;color:${color};font-size:32px;font-weight:800;">${score}</p>
            <p style="margin:0;color:#6B7280;font-size:11px;">/100</p>
          </div>
          <p style="margin:0;color:#6B7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${label} Leak Risk</p>
          <h2 style="margin:12px 0 8px;color:#1A2E4A;font-size:20px;font-weight:800;">Hi ${data.businessName || 'there'},</h2>
          <p style="margin:0 auto;color:#6B7280;font-size:14px;line-height:1.6;max-width:420px;">
            Based on your answers, your business has a <strong style="color:${color};">${label.toLowerCase()} risk</strong> of losing customers through revenue leaks.
          </p>
        </td></tr>

        <tr><td style="background:#f9fafb;padding:0 40px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#1A2E4A;font-size:14px;font-weight:700;margin:24px 0 12px;">Key areas to fix:</p>
          ${data.manualFollowUp !== 'automated' ? `
          <table width="100%" style="margin-bottom:10px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;" cellpadding="12" cellspacing="0">
            <tr><td>
              <p style="margin:0;color:#ef4444;font-size:11px;font-weight:700;text-transform:uppercase;">HIGH IMPACT</p>
              <p style="margin:2px 0 0;color:#1A2E4A;font-size:13px;font-weight:600;">Lead Follow-Up System</p>
              <p style="margin:4px 0 0;color:#6B7280;font-size:12px;">Automated follow-up converts 3–5x more leads than manual outreach.</p>
            </td></tr>
          </table>` : ''}
          ${data.asksReviews !== 'always' ? `
          <table width="100%" style="margin-bottom:10px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;" cellpadding="12" cellspacing="0">
            <tr><td>
              <p style="margin:0;color:#f59e0b;font-size:11px;font-weight:700;text-transform:uppercase;">MEDIUM IMPACT</p>
              <p style="margin:2px 0 0;color:#1A2E4A;font-size:13px;font-weight:600;">Review Request Loop</p>
              <p style="margin:4px 0 0;color:#6B7280;font-size:12px;">Most happy customers won't review unless asked. Automate it.</p>
            </td></tr>
          </table>` : ''}
          <table width="100%" style="margin-bottom:10px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;" cellpadding="12" cellspacing="0">
            <tr><td>
              <p style="margin:0;color:#f59e0b;font-size:11px;font-weight:700;text-transform:uppercase;">MEDIUM IMPACT</p>
              <p style="margin:2px 0 0;color:#1A2E4A;font-size:13px;font-weight:600;">Estimate Follow-Up</p>
              <p style="margin:4px 0 0;color:#6B7280;font-size:12px;">Automated nudges at 2, 5, and 7 days recover 20–40% of lost quotes.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:#ffffff;padding:32px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 6px;color:#1A2E4A;font-size:15px;font-weight:700;">Ready to fix these leaks?</p>
          <p style="margin:0 0 20px;color:#6B7280;font-size:13px;line-height:1.5;">Create your free account to save your results, track fixes, and activate the agents that handle this automatically.</p>
          <a href="https://operonauto.com/signup?email=${encodeURIComponent(data.email)}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Save My Results &amp; Fix Leaks →
          </a>
          <p style="margin:16px 0 0;color:#6B7280;font-size:12px;">Free forever · No credit card needed · <a href="https://operonauto.com/contact" style="color:#1A2E4A;">Talk to us first</a></p>
        </td></tr>

        <tr><td style="background:#1A2E4A;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff80;font-size:11px;">Operon Automation · operonauto.com · ceo@operonauto.com</p>
          <p style="margin:6px 0 0;color:#ffffff40;font-size:10px;font-style:italic;">Revenue Leak Scores are informational only.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildAlertEmail(data: Record<string, string>, score: number): string {
  const { label } = scoreLabel(score)
  return `
<p><strong>🔔 New Scanner Lead — ${label} Risk (Score: ${score}/100)</strong></p>
<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:13px;">
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Business</td><td style="padding:6px;border:1px solid #ddd;">${data.businessName}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Industry</td><td style="padding:6px;border:1px solid #ddd;">${data.industry}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Location</td><td style="padding:6px;border:1px solid #ddd;">${data.cityState}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:6px;border:1px solid #ddd;">${data.phone}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:6px;border:1px solid #ddd;">${data.email}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Website</td><td style="padding:6px;border:1px solid #ddd;">${data.websiteUrl || 'N/A'}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Follow-Up</td><td style="padding:6px;border:1px solid #ddd;">${data.manualFollowUp}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Asks Reviews</td><td style="padding:6px;border:1px solid #ddd;">${data.asksReviews}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">Biggest Problem</td><td style="padding:6px;border:1px solid #ddd;">${data.biggestProblem}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;color:red;">Leak Score</td><td style="padding:6px;border:1px solid #ddd;font-weight:bold;color:red;">${score}/100 — ${label}</td></tr>
</table>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { scanData, score } = body as { scanData: Record<string, string>; score: number }

    if (!scanData?.email || !scanData?.businessName || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Notify via n8n webhook
    fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: scanData.businessName,
        email: scanData.email,
        phone: scanData.phone || '',
        source: 'revenue-leak-scanner',
        score,
        industry: scanData.industry,
        city_state: scanData.cityState,
        timestamp: new Date().toISOString(),
      }),
    }).catch((e) => console.error('n8n error:', e))

    // 2. Send results email to prospect
    const prospectEmail = fetch(RESEND_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [scanData.email],
        subject: `Your Revenue Leak Score: ${score}/100 — ${scoreLabel(score).label} Risk`,
        html: buildResultsEmail(scanData, score),
      }),
    })

    // 3. Alert email to Leo
    const alertEmail = fetch(RESEND_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ALERT_EMAIL],
        subject: `🔔 New Scanner Lead: ${scanData.businessName} — Score ${score}/100`,
        html: buildAlertEmail(scanData, score),
      }),
    })

    // 4. Auto-add scanner submitter to owner's CRM
    if (OWNER_USER_ID) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Check if contact already exists for this owner
      const { data: existing } = await adminClient
        .from('contacts')
        .select('id')
        .eq('user_id', OWNER_USER_ID)
        .eq('email', scanData.email)
        .single()

      if (!existing) {
        const { data: newContact } = await adminClient.from('contacts').insert({
          user_id: OWNER_USER_ID,
          name:    scanData.businessName,
          email:   scanData.email,
          phone:   scanData.phone || '',
          type:    'lead',
          source:  'scanner',
          status:  'new',
          notes:   `Industry: ${scanData.industry} | Score: ${score}/100 | Location: ${scanData.cityState}`,
        }).select().single()

        // If Lead Follow-Up agent is enabled for owner, trigger sequence
        if (newContact) {
          const { data: agent } = await adminClient
            .from('agents')
            .select('config, enabled')
            .eq('user_id', OWNER_USER_ID)
            .eq('type', 'lead_followup')
            .single()

          if (agent?.enabled && scanData.email) {
            const cfg = agent.config as {
              fromName?: string
              phone?: string
              replyToEmail?: string
            }
            const now = new Date()

            const seq = [
              { delay: 15 * 60 * 1000,        num: 1 },
              { delay: 2 * 24 * 60 * 60 * 1000, num: 2 },
              { delay: 5 * 24 * 60 * 60 * 1000, num: 3 },
            ]

            for (const { delay, num } of seq) {
              const scheduledAt = new Date(now.getTime() + delay).toISOString()
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: FROM_EMAIL,
                  to: [scanData.email],
                  replyTo: cfg.replyToEmail,
                  subject: num === 1
                    ? `Following up on your Revenue Leak Scan — Operon`
                    : num === 2
                    ? `Still thinking about fixing your revenue leaks?`
                    : `One last note from Operon`,
                  html: `<p>Hi ${scanData.businessName},</p><p>Your Revenue Leak Score was ${score}/100. We'd love to help you fix those leaks.</p><p>— ${cfg.fromName ?? 'The Operon Team'}</p>`,
                  scheduledAt,
                }),
              }).catch(() => null)
            }

            await adminClient.from('agent_activity').insert({
              user_id:    OWNER_USER_ID,
              agent_type: 'lead_followup',
              action:     'lead_followup_scheduled',
              details:    { contact_id: newContact.id, contact_name: scanData.businessName },
            })
          }
        }
      }
    }

    await Promise.allSettled([prospectEmail, alertEmail])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Scanner submit error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
