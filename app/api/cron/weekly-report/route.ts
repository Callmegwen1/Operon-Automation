import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { weeklyReport } from '@/lib/emails/templates'
import { generateLeaks } from '@/lib/leaks'

// Uses the service-role client to read all users' data server-side
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  // Find all users with weekly_report agent enabled
  const { data: agents } = await supabase
    .from('agents')
    .select('user_id, config')
    .eq('type', 'weekly_report')
    .eq('enabled', true)

  if (!agents || agents.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  let sent = 0

  for (const agent of agents) {
    try {
      const cfg = agent.config as { reportEmail?: string }

      // Get user email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(agent.user_id)
      const reportEmail = cfg.reportEmail ?? user?.email
      if (!reportEmail) continue

      // Fetch business + latest scan + leaks
      const [{ data: business }, { data: scan }, { data: leaks }, { data: activity }] =
        await Promise.all([
          supabase.from('businesses').select('name').eq('user_id', agent.user_id).single(),
          supabase.from('scans').select('*').eq('user_id', agent.user_id).order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('leaks').select('status').eq('user_id', agent.user_id),
          supabase.from('agent_activity').select('id').eq('user_id', agent.user_id).gte('created_at', sevenDaysAgo),
        ])

      if (!scan) continue

      const rawLeaks = (leaks && leaks.length > 0)
        ? (leaks as { status?: string }[])
        : (generateLeaks(scan) as { status?: string }[])
      const openLeaks = rawLeaks.filter((l) => l.status !== 'fixed').length
      const fixedLeaks = rawLeaks.length - openLeaks

      const report = weeklyReport({
        businessName:  business?.name ?? 'Your Business',
        score:         scan.score,
        openLeaks,
        fixedLeaks,
        activityCount: activity?.length ?? 0,
        dashboardUrl:  'https://operonauto.com/dashboard',
      })

      await sendEmail({ to: reportEmail, subject: report.subject, html: report.html })
      sent++
    } catch (err) {
      console.error(`Weekly report failed for user ${agent.user_id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
