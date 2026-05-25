// ── Shared wrapper ──────────────────────────────────────────
function wrap(content: string, unsubscribeUrl?: string): string {
  const optOut = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color:#94A3B8;text-decoration:underline;">Unsubscribe</a>`
    : 'Reply STOP to opt out'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        ${content}
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0;color:#94A3B8;font-size:11px;">
            Powered by <a href="https://operonauto.com" style="color:#1A2E4A;text-decoration:none;">Operon Automation</a> ·
            ${optOut}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Lead Follow-Up ───────────────────────────────────────────
export function leadFollowup1({
  leadName,
  businessName,
  fromName,
  phone,
  service,
  personalNote,
  unsubscribeUrl,
}: {
  leadName: string
  businessName: string
  fromName: string
  phone: string
  service?: string
  personalNote?: string
  unsubscribeUrl?: string
}): { subject: string; html: string } {
  return {
    subject: `Following up on your inquiry — ${businessName}`,
    html: wrap(`
      <tr><td style="background:#102A43;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${businessName}</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${leadName},</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          Just wanted to make sure your message to <strong>${businessName}</strong> didn't get missed.
        </p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          ${fromName} will be in touch with you shortly${service ? ` about ${service}` : ''}. In the meantime, feel free to reach us directly:
        </p>
        ${phone ? `<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#102A43;">📞 ${phone}</p>` : ''}
        ${personalNote ? `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;padding-top:16px;border-top:1px solid #E5E7EB;">${personalNote}</p>` : ''}
        <p style="margin:0;color:#334155;font-size:15px;">Talk soon,<br><strong>${fromName}</strong><br><span style="color:#64748B;">${businessName}</span></p>
      </td></tr>`, unsubscribeUrl),
  }
}

export function leadFollowup2({
  leadName,
  businessName,
  fromName,
  phone,
  service,
  unsubscribeUrl,
}: {
  leadName: string
  businessName: string
  fromName: string
  phone: string
  service?: string
  unsubscribeUrl?: string
}): { subject: string; html: string } {
  return {
    subject: `Still thinking about it? — ${businessName}`,
    html: wrap(`
      <tr><td style="background:#102A43;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${businessName}</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${leadName},</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          I'm following up to make sure you got everything you needed from us.
        </p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          If you have any questions about ${service || 'how we can help'}, I'd love to talk. Just reply to this email or give us a call:
        </p>
        ${phone ? `<p style="margin:0 0 24px;font-size:15px;font-weight:700;color:#102A43;">📞 ${phone}</p>` : ''}
        <p style="margin:0;color:#334155;font-size:15px;">— <strong>${fromName}</strong><br><span style="color:#64748B;">${businessName}</span></p>
      </td></tr>`, unsubscribeUrl),
  }
}

export function leadFollowup3({
  leadName,
  businessName,
  fromName,
  unsubscribeUrl,
}: {
  leadName: string
  businessName: string
  fromName: string
  unsubscribeUrl?: string
}): { subject: string; html: string } {
  return {
    subject: `One last note from ${businessName}`,
    html: wrap(`
      <tr><td style="background:#102A43;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${businessName}</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${leadName},</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          I know you're busy — I'll keep this short.
        </p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          If you're still looking for help, we're here whenever you're ready. No pressure at all.
        </p>
        <p style="margin:0;color:#334155;font-size:15px;">— <strong>${fromName}</strong><br><span style="color:#64748B;">${businessName}</span></p>
      </td></tr>`, unsubscribeUrl),
  }
}

// ── Review Request ───────────────────────────────────────────
export function reviewRequest({
  customerName,
  businessName,
  fromName,
  reviewLink,
}: {
  customerName: string
  businessName: string
  fromName: string
  reviewLink: string
}): { subject: string; html: string } {
  return {
    subject: `How did we do? — ${businessName}`,
    html: wrap(`
      <tr><td style="background:#102A43;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${businessName}</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;text-align:center;">
        <p style="margin:0 0 8px;font-size:28px;">⭐⭐⭐⭐⭐</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${customerName},</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;text-align:left;">
          Thank you for choosing <strong>${businessName}</strong>. It was a pleasure working with you.
        </p>
        <p style="margin:0 0 28px;color:#334155;font-size:15px;line-height:1.6;text-align:left;">
          If you have a moment, a quick review would mean a lot to us — it helps other people find us and takes about 2 minutes.
        </p>
        <a href="${reviewLink}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
          Leave a Review →
        </a>
        <p style="margin:24px 0 0;color:#334155;font-size:14px;text-align:left;">Thank you again,<br><strong>${fromName}</strong><br><span style="color:#64748B;">${businessName}</span></p>
      </td></tr>`),
  }
}

// ── Welcome Email ────────────────────────────────────────────
export function welcomeEmail({
  businessName,
  dashboardUrl,
}: {
  businessName: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: 'Welcome to Operon — here\'s what to do first',
    html: wrap(`
      <tr><td style="background:#102A43;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0 0 4px;color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Welcome aboard</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Operon Automation</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${businessName},</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          Your account is confirmed and your Revenue Autopilot dashboard is ready. Here's what to do first:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td style="padding:12px;background:#F8FAFC;border-radius:8px;border-left:3px solid #1A2E4A;margin-bottom:8px;">
            <p style="margin:0;color:#102A43;font-size:13px;font-weight:700;">1. Complete your business profile</p>
            <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Add your business details so your agents know who they're representing.</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          <tr><td style="padding:12px;background:#F8FAFC;border-radius:8px;border-left:3px solid #1A2E4A;">
            <p style="margin:0;color:#102A43;font-size:13px;font-weight:700;">2. Run your Revenue Leak Scan</p>
            <p style="margin:4px 0 0;color:#64748B;font-size:12px;">See exactly where your business may be losing customers and revenue.</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="padding:12px;background:#F8FAFC;border-radius:8px;border-left:3px solid #1A2E4A;">
            <p style="margin:0;color:#102A43;font-size:13px;font-weight:700;">3. Activate your first agent</p>
            <p style="margin:4px 0 0;color:#64748B;font-size:12px;">The Lead Follow-Up Agent typically has the fastest impact — start there.</p>
          </td></tr>
        </table>
        <div style="text-align:center;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Open My Dashboard →
          </a>
        </div>
        <p style="margin:24px 0 0;color:#64748B;font-size:13px;text-align:center;">
          Questions? Reply to this email or reach us at <a href="mailto:ceo@operonauto.com" style="color:#1A2E4A;">ceo@operonauto.com</a>
        </p>
      </td></tr>`),
  }
}

// ── Weekly Owner Report ──────────────────────────────────────
export function weeklyReport({
  businessName,
  score,
  openLeaks,
  fixedLeaks,
  activityCount,
  dashboardUrl,
}: {
  businessName: string
  score: number
  openLeaks: number
  fixedLeaks: number
  activityCount: number
  dashboardUrl: string
}): { subject: string; html: string } {
  const scoreColor = score >= 75 ? '#DC2626' : score >= 55 ? '#F59E0B' : '#22C55E'
  const scoreLabel = score >= 75 ? 'Critical' : score >= 55 ? 'High Risk' : 'Moderate'

  return {
    subject: `Your Weekly Revenue Autopilot Report — ${businessName}`,
    html: wrap(`
      <tr><td style="background:#102A43;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0 0 4px;color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Weekly Report</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${businessName}</p>
      </td></tr>
      <tr><td style="background:#ffffff;padding:36px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="padding:16px;background:#F8FAFC;border-radius:8px;text-align:center;width:33%;">
              <p style="margin:0;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;">Leak Score</p>
              <p style="margin:4px 0 0;color:${scoreColor};font-size:28px;font-weight:800;">${score}<span style="font-size:14px;color:#94A3B8;">/100</span></p>
              <p style="margin:2px 0 0;color:${scoreColor};font-size:11px;font-weight:700;">${scoreLabel}</p>
            </td>
            <td style="width:8px;"></td>
            <td style="padding:16px;background:#F8FAFC;border-radius:8px;text-align:center;width:33%;">
              <p style="margin:0;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;">Open Leaks</p>
              <p style="margin:4px 0 0;color:#102A43;font-size:28px;font-weight:800;">${openLeaks}</p>
              <p style="margin:2px 0 0;color:#64748B;font-size:11px;">Need attention</p>
            </td>
            <td style="width:8px;"></td>
            <td style="padding:16px;background:#F8FAFC;border-radius:8px;text-align:center;width:33%;">
              <p style="margin:0;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;">Agent Actions</p>
              <p style="margin:4px 0 0;color:#16A34A;font-size:28px;font-weight:800;">${activityCount}</p>
              <p style="margin:2px 0 0;color:#16A34A;font-size:11px;">This week</p>
            </td>
          </tr>
        </table>
        <div style="text-align:center;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">
            Open My Dashboard →
          </a>
        </div>
      </td></tr>
      <tr><td style="background:#F8FAFC;border-radius:0 0 12px 12px;padding:16px 36px;border-top:1px solid #E5E7EB;">
        <p style="margin:0;color:#94A3B8;font-size:12px;">
          Revenue Leak Scores are informational only. Operon does not guarantee specific financial results.
        </p>
      </td></tr>`),
  }
}

// ── New Lead Notification (to owner) ─────────────────────────
export function newLeadNotification({
  businessName,
  leadName,
  leadEmail,
  leadPhone,
  leadMessage,
  source,
  dashboardUrl,
}: {
  businessName: string
  leadName: string
  leadEmail: string
  leadPhone: string
  leadMessage?: string
  source: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `New lead: ${leadName} just reached out`,
    html: wrap(`
      <tr><td style="background:#102A43;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0 0 4px;color:#22C55E;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🔔 New Lead — ${businessName}</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${leadName} just reached out</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;margin-bottom:${leadMessage ? '20px' : '24px'};">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 10px;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Contact Info</p>
            <p style="margin:0 0 6px;color:#102A43;font-size:16px;font-weight:700;">${leadName}</p>
            ${leadEmail ? `<p style="margin:0 0 4px;color:#334155;font-size:14px;">📧 <a href="mailto:${leadEmail}" style="color:#1A2E4A;">${leadEmail}</a></p>` : ''}
            ${leadPhone ? `<p style="margin:0 0 4px;color:#334155;font-size:14px;">📞 ${leadPhone}</p>` : ''}
            <p style="margin:10px 0 0;color:#94A3B8;font-size:12px;">via ${source}</p>
          </td></tr>
        </table>
        ${leadMessage ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border-left:3px solid #22C55E;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Their Message</p>
            <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">${leadMessage}</p>
          </td></tr>
        </table>
        ` : ''}
        <p style="margin:0 0 24px;color:#64748B;font-size:13px;line-height:1.6;">
          A follow-up sequence has started automatically. The lead will receive emails at 15 min, Day 2, and Day 5.
        </p>
        <div style="text-align:center;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
            View in Dashboard →
          </a>
        </div>
      </td></tr>`),
  }
}

// ── Intelligent Lead Alert (owner) — AI-powered ───────────────
export function intelligentLeadAlert({
  businessName,
  leadName,
  leadEmail,
  leadPhone,
  leadMessage,
  source,
  dashboardUrl,
  urgency,
  alertPrefix,
  aiSummary,
  intent,
  playbook,
  requiresOwnerAttention,
}: {
  businessName: string
  leadName: string
  leadEmail: string
  leadPhone: string
  leadMessage?: string
  source: string
  dashboardUrl: string
  urgency: string
  alertPrefix: string
  aiSummary: string
  intent: string
  playbook: string
  requiresOwnerAttention: boolean
}): { subject: string; html: string } {
  const isUrgent = urgency === 'urgent' || urgency === 'high'
  const headerBg = isUrgent ? '#7F1D1D' : '#102A43'
  const urgencyBadgeBg = urgency === 'urgent' ? '#FEF2F2' : urgency === 'high' ? '#FFF7ED' : '#F0FDF4'
  const urgencyBadgeColor = urgency === 'urgent' ? '#DC2626' : urgency === 'high' ? '#D97706' : '#16A34A'
  const urgencyLabel = urgency === 'urgent' ? 'URGENT' : urgency === 'high' ? 'HIGH PRIORITY' : urgency === 'medium' ? 'NEW LEAD' : 'NEW LEAD'

  return {
    subject: isUrgent
      ? `${alertPrefix}: ${leadName} needs immediate attention — ${businessName}`
      : `New lead: ${leadName} via ${source} — ${businessName}`,
    html: wrap(`
      <tr><td style="background:${headerBg};border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0 0 4px;color:${isUrgent ? '#FCA5A5' : '#22C55E'};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${alertPrefix} — ${businessName}</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${leadName} just reached out</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">

        ${requiresOwnerAttention ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:20px;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0;color:#DC2626;font-size:13px;font-weight:700;">⚡ Action Required — This lead may need a call</p>
            <p style="margin:4px 0 0;color:#991B1B;font-size:12px;line-height:1.5;">${aiSummary}</p>
          </td></tr>
        </table>` : `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;margin-bottom:20px;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0;color:#15803D;font-size:13px;font-weight:700;">🤖 Lead Recovery Autopilot — AI Summary</p>
            <p style="margin:4px 0 0;color:#166534;font-size:12px;line-height:1.5;">${aiSummary}</p>
          </td></tr>
        </table>`}

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 10px;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Contact Info</p>
            <p style="margin:0 0 6px;color:#102A43;font-size:16px;font-weight:700;">${leadName}</p>
            ${leadEmail ? `<p style="margin:0 0 4px;color:#334155;font-size:14px;">📧 <a href="mailto:${leadEmail}" style="color:#1A2E4A;">${leadEmail}</a></p>` : ''}
            ${leadPhone ? `<p style="margin:0 0 4px;color:#334155;font-size:14px;">📞 <strong>${leadPhone}</strong></p>` : ''}
            <div style="margin-top:10px;display:inline-block;">
              <span style="background:${urgencyBadgeBg};color:${urgencyBadgeColor};font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;">${urgencyLabel}</span>
              <span style="margin-left:6px;background:#F1F5F9;color:#64748B;font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;">via ${source}</span>
            </div>
          </td></tr>
        </table>

        ${leadMessage ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-left:3px solid #1A2E4A;border-radius:0 8px 8px 0;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Their Message</p>
            <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">${leadMessage}</p>
          </td></tr>
        </table>` : ''}

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;margin-bottom:24px;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">System Status</p>
            <p style="margin:0 0 2px;color:#334155;font-size:13px;">🎯 Intent detected: <strong>${intent}</strong></p>
            <p style="margin:0 0 2px;color:#334155;font-size:13px;">📋 Playbook: <strong>${playbook.replace(/_/g, ' ')}</strong></p>
            <p style="margin:0;color:#334155;font-size:13px;">✉️ Follow-up sequence started automatically</p>
          </td></tr>
        </table>

        <div style="text-align:center;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
            View Lead in Dashboard →
          </a>
        </div>
      </td></tr>`),
  }
}

// ── Onboarding Day 1 ─────────────────────────────────────────
export function onboardingDay1({
  businessName,
  scannerUrl,
}: {
  businessName: string
  scannerUrl: string
}): { subject: string; html: string } {
  return {
    subject: 'Your biggest revenue leak is probably this one',
    html: wrap(`
      <tr><td style="background:#1A2E4A;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0 0 4px;color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Day 1 — Operon</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">The leak that costs most businesses the most</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${businessName},</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          Leads that don't hear back within 5 minutes are <strong>80% less likely to convert.</strong>
        </p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          Most businesses lose 60–70% of their inbound leads not because the service is bad — but because the follow-up is slow or inconsistent. When someone reaches out, they're also reaching out to your competitors.
        </p>
        <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
          Your Revenue Leak Scan shows exactly where this is happening in your business. If you haven't run it yet, it takes under 2 minutes.
        </p>
        <div style="text-align:center;">
          <a href="${scannerUrl}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Run My Revenue Leak Scan →
          </a>
        </div>
        <p style="margin:24px 0 0;color:#64748B;font-size:13px;">
          — The Operon Team<br>
          <a href="mailto:ceo@operonauto.com" style="color:#1A2E4A;">ceo@operonauto.com</a>
        </p>
      </td></tr>`),
  }
}

// ── Onboarding Day 3 ─────────────────────────────────────────
export function onboardingDay3({
  businessName,
  agentsUrl,
}: {
  businessName: string
  agentsUrl: string
}): { subject: string; html: string } {
  return {
    subject: 'One step that takes 2 minutes and runs forever',
    html: wrap(`
      <tr><td style="background:#1A2E4A;border-radius:12px 12px 0 0;padding:28px 36px;">
        <p style="margin:0 0 4px;color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Day 3 — Operon</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Activate your first agent</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:36px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${businessName},</p>
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
          The Lead Follow-Up Agent is the single highest-impact thing most businesses can activate. Once it's on, every new lead gets a response within minutes — automatically, even when you're busy on a job.
        </p>
        <p style="margin:0 0 8px;color:#1A2E4A;font-size:14px;font-weight:700;">Here's all it takes:</p>
        <table width="100%" cellpadding="12" cellspacing="0" style="margin-bottom:24px;background:#F8FAFC;border-radius:8px;border:1px solid #E5E7EB;">
          <tr><td style="color:#334155;font-size:13px;line-height:1.6;">
            1. Add your name and reply-to email<br>
            2. Toggle it on<br>
            3. It runs from there — every new lead, every time
          </td></tr>
        </table>
        <div style="text-align:center;">
          <a href="${agentsUrl}" style="display:inline-block;background:#1A2E4A;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Activate My First Agent →
          </a>
        </div>
        <p style="margin:24px 0 0;color:#64748B;font-size:13px;">
          — The Operon Team<br>
          <a href="mailto:ceo@operonauto.com" style="color:#1A2E4A;">ceo@operonauto.com</a>
        </p>
      </td></tr>`),
  }
}
