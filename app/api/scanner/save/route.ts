import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLeaks } from '@/lib/leaks'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scanData } = await req.json()
    if (!scanData) {
      return NextResponse.json({ error: 'Missing scan data' }, { status: 400 })
    }

    // Fetch the most recent previous scan score before inserting the new one.
    // This is the authoritative source for re-scan delta — more reliable than localStorage
    // because it works across devices and after clearing browser storage.
    const { data: prevScan } = await supabase
      .from('scans')
      .select('score, website_analysis')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const previousScore: number | undefined            = prevScan?.score            ?? undefined
    const previousWebsiteAnalysis: unknown | undefined = prevScan?.website_analysis ?? undefined

    // Insert the new scan with the full payload
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id:             user.id,
        score:               scanData.score,
        business_name:       scanData.businessName     ?? null,
        industry:            scanData.industry         ?? null,
        city_state:          scanData.cityState        ?? null,
        website_url:         scanData.websiteUrl       ?? null,
        phone:               scanData.phone            ?? null,
        main_service:        scanData.mainService      ?? null,
        avg_job_value:       scanData.avgJobValue ? parseInt(scanData.avgJobValue, 10) : null,
        response_time:       scanData.responseTime     ?? null,
        monthly_leads:       scanData.monthlyLeads     ?? null,
        has_google_profile:  scanData.hasGoogleProfile ?? null,
        runs_ads:            scanData.runsAds          ?? null,
        uses_crm:            scanData.usesCrm          ?? null,
        manual_follow_up:    scanData.manualFollowUp   ?? null,
        asks_reviews:        scanData.asksReviews      ?? null,
        tracks_lead_source:  scanData.tracksLeadSource ?? null,
        biggest_problem:     scanData.biggestProblem   ?? null,
        sends_reminders:     scanData.sendsReminders   ?? null,
        has_repeat_system:   scanData.hasRepeatSystem  ?? null,
        website_analysis:    scanData.websiteAnalysis  ?? null,
        breakdown:           scanData.breakdown        ?? null,
        sub_scores:          scanData.subScores        ?? null,
      })
      .select()
      .single()

    if (scanError) throw scanError

    // Create business profile if one doesn't exist yet
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing && scanData.businessName) {
      await supabase.from('businesses').insert({
        user_id:      user.id,
        name:         scanData.businessName,
        website_url:  scanData.websiteUrl  ?? '',
        industry:     scanData.industry    ?? '',
        phone:        scanData.phone       ?? '',
        city_state:   scanData.cityState   ?? '',
        main_service: scanData.mainService ?? '',
      })
    }

    // Generate and save leaks
    const leaks = generateLeaks(scanData)
    if (leaks.length > 0) {
      await supabase.from('leaks').insert(
        leaks.map((leak) => ({
          user_id: user.id,
          scan_id: scan.id,
          ...leak,
        }))
      )
    }

    return NextResponse.json({ success: true, scanId: scan.id, previousScore, previousWebsiteAnalysis })
  } catch (err) {
    console.error('Scanner save error:', err)
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 })
  }
}
