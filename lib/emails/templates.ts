// ── Shared wrapper ──────────────────────────────────────────
function wrap(content: string): string {
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
            Powered by <a href="https://operonauto.com" style="color:#2563EB;text-decoration:none;">Operon Automation</a> ·
            Reply STOP to opt out of follow-ups.
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
}: {
  leadName: string
  businessName: string
  fromName: string
  phone: string
  service?: string
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
        ${phone ? `<p style="margin:0 0 24px;font-size:15px;font-weight:700;color:#102A43;">📞 ${phone}</p>` : ''}
        <p style="margin:0;color:#334155;font-size:15px;">Talk soon,<br><strong>${fromName}</strong><br><span style="color:#64748B;">${businessName}</span></p>
      </td></tr>`),
  }
}

export function leadFollowup2({
  leadName,
  businessName,
  fromName,
  phone,
  service,
}: {
  leadName: string
  businessName: string
  fromName: string
  phone: string
  service?: string
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
      </td></tr>`),
  }
}

export function leadFollowup3({
  leadName,
  businessName,
  fromName,
}: {
  leadName: string
  businessName: string
  fromName: string
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
      </td></tr>`),
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
        <a href="${reviewLink}" style="display:inline-block;background:#2563EB;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
          Leave a Review →
        </a>
        <p style="margin:24px 0 0;color:#334155;font-size:14px;text-align:left;">Thank you again,<br><strong>${fromName}</strong><br><span style="color:#64748B;">${businessName}</span></p>
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
  const scoreColor = score >= 75 ? '#DC2626' : score >= 55 ? '#F59E0B' : '#2563EB'
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
          <a href="${dashboardUrl}" style="display:inline-block;background:#2563EB;color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">
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
