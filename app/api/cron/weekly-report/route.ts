import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { sendEmail } from '@/lib/email'
import { weeklyReport, weeklyRevenueAIBriefing } from '@/lib/emails/templates'
import { generateLeaks } from '@/lib/leaks'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface TopLeak {
  title: string
  impact: string
}

async function generateWeeklyBriefing({
  businessName,
  industry,
  score,
  previousScore,
  openLeaks,
  fixedLeaks,
  topLeaks,
  agentActions,
  openTasks,
}: {
  businessName: string
  industry: string
  score: number
  previousScore: number | null
  openLeaks: number
  fixedLeaks: number
  topLeaks: TopLeak[]
  agentActions: number
  openTasks: number
}): Promise<{ narrative: string; priorityAction: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No API key')

  const client = new Anthropic({ apiKey })

  const scoreDeltaText = previousScore !== null
    ? `Revenue Leak Score: ${score}/100 (${score > previousScore ? `up ${score - previousScore}` : score < previousScore ? `down ${previousScore - score}` : 'unchanged'} from ${previousScore} last week)`
    : `Revenue Leak Score: ${score}/100 (first report)`

  const leakList = topLeaks.length > 0
    ? topLeaks.map(l => `- ${l.title} (${l.impact} impact)`).join('\n')
    : '- No specific leaks on record'

  const prompt = `You are a plain-speaking business advisor writing a weekly briefing for the owner of ${businessName}, a ${industry || 'small business'}.

This week's data:
- ${scoreDeltaText}
- Open revenue leaks: ${openLeaks} (${fixedLeaks} fixed so far)
- Top open leaks:
${leakList}
- Automated agent actions taken this week: ${agentActions} (emails sent, leads followed up, reviews requested)
- Owner tasks still open: ${openTasks}

Write exactly 2-3 sentences summarizing the business health in plain English. Sound like a trusted advisor texting a quick update — direct, no fluff, no jargon. Do not repeat numbers mechanically; synthesize them into meaning.

Then on a new line write: PRIORITY: [one sentence starting with a verb describing the single most important action the owner should take this week, based on the data above]

Output only the briefing sentences and the PRIORITY line. Nothing else.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  const priorityMatch = text.match(/PRIORITY:\s*(.+)/i)
  const priorityAction = priorityMatch ? priorityMatch[1].trim() : 'Review your open revenue leaks and close the highest-impact one this week.'
  const narrative = text.replace(/PRIORITY:\s*.+/i, '').trim()

  return { narrative, priorityAction }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

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
      const { data: { user } } = await supabase.auth.admin.getUserById(agent.user_id)
      const reportEmail = cfg.reportEmail ?? user?.email
      if (!reportEmail) continue

      // Fetch all data in parallel
      const [
        { data: business },
        { data: scans },
        { data: leaksData },
        { data: activity },
        { data: agentRunsData },
        { data: openTasksData },
      ] = await Promise.all([
        supabase.from('businesses').select('name, industry').eq('user_id', agent.user_id).single(),
        supabase.from('scans').select('*').eq('user_id', agent.user_id).order('created_at', { ascending: false }).limit(2),
        supabase.from('leaks').select('title, impact, status').eq('user_id', agent.user_id),
        supabase.from('agent_activity').select('id').eq('user_id', agent.user_id).gte('created_at', sevenDaysAgo),
        supabase.from('agent_runs').select('id').eq('user_id', agent.user_id).eq('status', 'completed').gte('created_at', sevenDaysAgo),
        supabase.from('agent_tasks').select('id').eq('user_id', agent.user_id).eq('status', 'open'),
      ])

      const currentScan  = scans?.[0] ?? null
      const previousScan = scans?.[1] ?? null
      if (!currentScan) continue

      const rawLeaks = (leaksData && leaksData.length > 0)
        ? leaksData as { title: string; impact: string; status?: string }[]
        : (generateLeaks(currentScan) as { title: string; impact: string; status?: string }[])

      const openLeaksList = rawLeaks.filter(l => l.status !== 'fixed')
      const fixedLeaks    = rawLeaks.length - openLeaksList.length
      const topLeaks      = openLeaksList
        .sort((a, b) => (a.impact === 'high' ? -1 : b.impact === 'high' ? 1 : 0))
        .slice(0, 3)
        .map(l => ({ title: l.title, impact: l.impact }))

      const agentActions = (agentRunsData?.length ?? 0) + (activity?.length ?? 0)
      const openTasks    = openTasksData?.length ?? 0
      const scoreDelta   = previousScan ? currentScan.score - previousScan.score : null

      // Try AI briefing — fall back to legacy template on any failure
      try {
        const { narrative, priorityAction } = await generateWeeklyBriefing({
          businessName:  business?.name ?? 'Your Business',
          industry:      business?.industry ?? '',
          score:         currentScan.score,
          previousScore: previousScan?.score ?? null,
          openLeaks:     openLeaksList.length,
          fixedLeaks,
          topLeaks,
          agentActions,
          openTasks,
        })

        const report = weeklyRevenueAIBriefing({
          businessName:  business?.name ?? 'Your Business',
          score:         currentScan.score,
          scoreDelta,
          openLeaks:     openLeaksList.length,
          fixedLeaks,
          agentActions,
          aiNarrative:   narrative,
          priorityAction,
          dashboardUrl:  'https://operonauto.com/dashboard',
        })

        await sendEmail({ to: reportEmail, subject: report.subject, html: report.html })
      } catch {
        // AI failed — send the plain data report
        const report = weeklyReport({
          businessName:  business?.name ?? 'Your Business',
          score:         currentScan.score,
          openLeaks:     openLeaksList.length,
          fixedLeaks,
          activityCount: agentActions,
          dashboardUrl:  'https://operonauto.com/dashboard',
        })
        await sendEmail({ to: reportEmail, subject: report.subject, html: report.html })
      }

      sent++
    } catch (err) {
      console.error(`Weekly report failed for user ${agent.user_id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
