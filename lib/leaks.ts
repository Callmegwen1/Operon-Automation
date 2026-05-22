export type Impact = 'low' | 'medium' | 'high'

export interface Leak {
  title: string
  description: string
  impact: Impact
  recommended_fix: string
}

export function generateLeaks(data: {
  runsAds?: string
  usesCrm?: string
  manualFollowUp?: string
  asksReviews?: string
  tracksLeadSource?: string
  biggestProblem?: string
  runs_ads?: string
  uses_crm?: string
  manual_follow_up?: string
  asks_reviews?: string
  tracks_lead_source?: string
  biggest_problem?: string
}): Leak[] {
  // Support both camelCase (scanner form) and snake_case (DB rows)
  const runsAds = data.runsAds ?? data.runs_ads
  const usesCrm = data.usesCrm ?? data.uses_crm
  const manualFollowUp = data.manualFollowUp ?? data.manual_follow_up
  const asksReviews = data.asksReviews ?? data.asks_reviews
  const tracksLeadSource = data.tracksLeadSource ?? data.tracks_lead_source

  const leaks: Leak[] = []

  if (manualFollowUp === 'no') {
    leaks.push({
      title: 'No Lead Follow-Up System',
      description: "Leads that don't hear back within 5 minutes are 80% less likely to convert. Without a follow-up system, potential customers move on to a competitor.",
      impact: 'high',
      recommended_fix: 'Activate the Lead Follow-Up Agent to send automated responses within minutes of a new inquiry.',
    })
  } else if (manualFollowUp === 'manual') {
    leaks.push({
      title: 'Manual Follow-Up Creating Gaps',
      description: 'Manual follow-up is inconsistent and often delayed during busy periods. Leads slip through the cracks when the team is overwhelmed.',
      impact: 'medium',
      recommended_fix: 'Add an automated first-response system to ensure no lead waits more than a few minutes.',
    })
  }

  if (asksReviews === 'no') {
    leaks.push({
      title: 'No Review Request System',
      description: "Most happy customers won't leave a review unless asked. Without a system, you're leaving reputation growth and social proof on the table.",
      impact: 'high',
      recommended_fix: 'Activate the Review Request Agent to automatically ask satisfied customers for reviews after service.',
    })
  } else if (asksReviews === 'sometimes') {
    leaks.push({
      title: 'Inconsistent Review Requests',
      description: 'You occasionally ask for reviews but miss many opportunities. Consistent, timely requests grow your reputation significantly faster.',
      impact: 'medium',
      recommended_fix: 'Automate review requests to run consistently after every completed job or service.',
    })
  }

  if (runsAds === 'yes' && tracksLeadSource === 'no') {
    leaks.push({
      title: 'Ad Spend Not Being Tracked',
      description: "You're running paid ads but can't tell which ones bring paying customers. Budget is likely being wasted on campaigns that don't convert.",
      impact: 'high',
      recommended_fix: 'Set up lead source tracking to see which ads convert to real customers, not just clicks.',
    })
  } else if (runsAds === 'yes' && tracksLeadSource === 'sometimes') {
    leaks.push({
      title: 'Partial Ad Tracking',
      description: "You track some leads but miss others. Incomplete data makes it hard to know which ad spend is worth keeping.",
      impact: 'medium',
      recommended_fix: 'Implement consistent tracking across all ad channels to identify your best-performing campaigns.',
    })
  }

  leaks.push({
    title: 'Estimate Follow-Up Gap',
    description: 'Most businesses send an estimate and wait. Following up at day 2, 5, and 7 recovers 20–40% of estimates that would otherwise go cold.',
    impact: 'medium',
    recommended_fix: 'Activate the Estimate Follow-Up Agent to automatically nudge prospects at key intervals after sending a quote.',
  })

  if (usesCrm === 'no') {
    leaks.push({
      title: 'No Contact Management System',
      description: 'Without a CRM, past customers and leads get forgotten over time. Reactivating old customers costs 5x less than acquiring new ones.',
      impact: 'medium',
      recommended_fix: 'Connect a CRM and activate the Customer Reactivation Agent to re-engage past clients who have gone quiet.',
    })
  }

  if (leaks.length < 5) {
    leaks.push({
      title: 'Revenue Visibility Gap',
      description: "Without a centralized dashboard, it's hard to spot patterns in where customers drop off or which services are most profitable.",
      impact: 'low',
      recommended_fix: 'Use the Revenue Autopilot dashboard to track trends, identify weak points, and measure recovery over time.',
    })
  }

  return leaks.slice(0, 5)
}
