import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

interface ScanData {
  businessName?: string
  industry?: string
  score: number
  breakdown?: { reason: string; points: number }[]
  websiteAnalysis?: {
    accessible?: boolean
    hasPhoneNumber?: boolean
    hasContactForm?: boolean
    hasCallToAction?: boolean
    hasBookingWidget?: boolean
    hasSocialProof?: boolean
    loadsFast?: boolean
    hasHttps?: boolean
    hasMobileViewport?: boolean
    hasMetaDescription?: boolean
    hasLocalSchema?: boolean
    hasBusinessHours?: boolean
    performanceScore?: number
  }
}

function scoreColor(score: number): string {
  if (score >= 70) return '#16a34a'
  if (score >= 45) return '#d97706'
  return '#dc2626'
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Healthy'
  if (score >= 45) return 'At Risk'
  return 'Critical'
}

function buildReportHtml(data: ScanData): string {
  const sc = scoreColor(data.score)
  const sl = scoreLabel(data.score)
  const wa = data.websiteAnalysis

  const websiteRows: { label: string; pass: boolean }[] = wa?.accessible
    ? [
        { label: 'Phone number visible',          pass: !!wa.hasPhoneNumber },
        { label: 'Contact form or online booking', pass: !!(wa.hasContactForm || wa.hasBookingWidget) },
        { label: 'Call-to-action present',         pass: !!wa.hasCallToAction },
        { label: 'Reviews or testimonials',        pass: !!wa.hasSocialProof },
        { label: 'HTTPS secure connection',        pass: !!wa.hasHttps },
        { label: 'Mobile-friendly viewport',       pass: !!wa.hasMobileViewport },
        { label: 'Good page speed',                pass: !!wa.loadsFast },
        { label: 'Meta description (SEO)',         pass: !!wa.hasMetaDescription },
        { label: 'Local business schema',          pass: !!wa.hasLocalSchema },
        { label: 'Business hours listed',          pass: !!wa.hasBusinessHours },
      ]
    : []

  const speedNote = wa?.performanceScore !== undefined
    ? `<p style="margin:8px 0 0;font-size:12px;color:#6b7280;">PageSpeed score: <strong>${wa.performanceScore}/100</strong></p>`
    : ''

  const websiteSection = websiteRows.length > 0
    ? `<h2 style="font-size:15px;font-weight:bold;color:#1a2d3d;margin:28px 0 10px;">Website Health Check</h2>
       ${speedNote}
       <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:10px;">
         ${websiteRows.map(r => `
           <tr>
             <td style="padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">
               ${r.pass ? '✅' : '❌'}&nbsp; ${r.label}
             </td>
           </tr>
         `).join('')}
       </table>`
    : ''

  const breakdownSection = data.breakdown && data.breakdown.length > 0
    ? `<h2 style="font-size:15px;font-weight:bold;color:#1a2d3d;margin:28px 0 10px;">Score Breakdown</h2>
       <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
         ${data.breakdown.map(b => `
           <tr>
             <td style="padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${b.reason}</td>
             <td style="padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:12px;color:#dc2626;text-align:right;font-weight:bold;white-space:nowrap;">−${b.points} pts</td>
           </tr>
         `).join('')}
       </table>`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Revenue Leak Report</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:24px 16px;">

    <div style="background:#1a2d3d;border-radius:12px 12px 0 0;padding:28px 28px 24px;text-align:center;">
      <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.45);font-weight:600;">Revenue Leak Report</p>
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:bold;color:#fff;">${data.businessName || 'Your Business'}</h1>
      ${data.industry ? `<p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">${data.industry}</p>` : ''}
    </div>

    <div style="background:#fff;border-radius:0 0 12px 12px;padding:28px;">

      <div style="text-align:center;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #f3f4f6;">
        <div style="display:inline-block;width:72px;height:72px;border-radius:50%;border:4px solid ${sc};margin-bottom:10px;line-height:64px;text-align:center;">
          <span style="font-size:26px;font-weight:bold;color:${sc};line-height:1;">${data.score}</span>
        </div>
        <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;">Revenue Health Score</p>
        <span style="display:inline-block;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:bold;background:${sc}18;color:${sc};border:1px solid ${sc}33;">${sl}</span>
      </div>

      ${websiteSection}
      ${breakdownSection}

      <div style="margin-top:28px;padding:20px;background:#f9fafb;border-radius:8px;text-align:center;">
        <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.5;">
          View your full results, track fixes, and see your improvement over time.
        </p>
        <a href="https://operonauto.com/dashboard"
           style="display:inline-block;background:#1a2d3d;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-size:13px;font-weight:bold;">
          Open Dashboard →
        </a>
      </div>

      <p style="margin:20px 0 0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6;">
        This report was generated by <strong>Operon Automation</strong>.<br>
        Revenue estimates are based on your inputs and industry averages.
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scanData } = await req.json()
    if (!scanData) {
      return NextResponse.json({ error: 'Missing scan data' }, { status: 400 })
    }

    const html = buildReportHtml(scanData as ScanData)
    const businessName = (scanData as ScanData).businessName || 'Your Business'

    await sendEmail({
      to: user.email,
      subject: `Revenue Leak Report — ${businessName} (Score: ${(scanData as ScanData).score}/100)`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Scanner report error:', err)
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 })
  }
}
