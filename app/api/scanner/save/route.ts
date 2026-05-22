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

    // Save the scan
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id:           user.id,
        score:             scanData.score,
        runs_ads:          scanData.runsAds,
        uses_crm:          scanData.usesCrm,
        manual_follow_up:  scanData.manualFollowUp,
        asks_reviews:      scanData.asksReviews,
        tracks_lead_source: scanData.tracksLeadSource,
        biggest_problem:   scanData.biggestProblem,
      })
      .select()
      .single()

    if (scanError) throw scanError

    // Create business profile if one doesn't exist yet
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existing && scanData.businessName) {
      await supabase.from('businesses').insert({
        user_id:      user.id,
        name:         scanData.businessName,
        website_url:  scanData.websiteUrl ?? '',
        industry:     scanData.industry   ?? '',
        phone:        scanData.phone      ?? '',
        city_state:   scanData.cityState  ?? '',
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

    return NextResponse.json({ success: true, scanId: scan.id })
  } catch (err) {
    console.error('Scanner save error:', err)
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 })
  }
}
