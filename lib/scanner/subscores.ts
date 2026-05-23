import type { SubScore } from './types'
import { getMultiplier } from './industry'

type ScanAnswers = {
  runsAds: string
  usesCrm: string
  manualFollowUp: string
  asksReviews: string
  tracksLeadSource: string
  industry?: string
}

function classify(score: number): SubScore['label'] {
  if (score >= 65) return 'High Risk'
  if (score >= 35) return 'At Risk'
  return 'Low Risk'
}

function palette(score: number): { color: string; bg: string } {
  if (score >= 65) return { color: '#EF4444', bg: '#FEF2F2' }
  if (score >= 35) return { color: '#F59E0B', bg: '#FFFBEB' }
  return { color: '#22C55E', bg: '#F0FDF4' }
}

function sub(name: string, raw: number): SubScore {
  const score = Math.min(Math.max(Math.round(raw), 0), 100)
  return { name, score, label: classify(score), ...palette(score) }
}

export function calculateSubScores(data: ScanAnswers): SubScore[] {
  const m = getMultiplier(data.industry ?? '')

  // Lead Recovery — how automated / fast is your lead response?
  let leadRecovery = 10
  if (data.manualFollowUp === 'no') leadRecovery = Math.min(Math.round(85 * m.followup), 100)
  else if (data.manualFollowUp === 'manual') leadRecovery = Math.min(Math.round(55 * m.followup), 100)

  // Review Generation — are you consistently collecting social proof?
  let reviewGen = 10
  if (data.asksReviews === 'no') reviewGen = Math.min(Math.round(80 * m.reviews), 100)
  else if (data.asksReviews === 'sometimes') reviewGen = Math.min(Math.round(45 * m.reviews), 100)

  // Tracking & Visibility — do you know where business comes from?
  let tracking = 10
  if (data.tracksLeadSource === 'no') tracking = 70
  else if (data.tracksLeadSource === 'sometimes') tracking = 38
  if (data.runsAds === 'yes' && data.tracksLeadSource === 'no') tracking = Math.min(tracking + Math.round(15 * m.ads), 100)

  // Systems & CRM — are your contacts and workflows managed?
  let systems = 10
  if (data.usesCrm === 'no') systems = 65
  else if (data.usesCrm === 'partial') systems = 35

  // Customer Retention — are you re-engaging past customers?
  let retention = 5
  if (data.usesCrm === 'no') retention += 40
  else if (data.usesCrm === 'partial') retention += 20
  if (data.asksReviews === 'no') retention += Math.round(30 * m.reviews)
  else if (data.asksReviews === 'sometimes') retention += Math.round(15 * m.reviews)

  return [
    sub('Lead Recovery',        leadRecovery),
    sub('Review Generation',    reviewGen),
    sub('Tracking & Visibility',tracking),
    sub('Systems & CRM',        systems),
    sub('Customer Retention',   Math.min(retention, 100)),
  ]
}
