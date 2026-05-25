const MONTHLY_LEADS: Record<string, number> = {
  'Home Services':             25,
  'Cleaning Company':          20,
  'Contractor / Trades':       15,
  'Auto Shop':                 40,
  'Med Spa / Aesthetics':      25,
  'Fitness Studio':            20,
  'Dental Office':             25,
  'Clinic / Healthcare':       35,
  'Real Estate':               12,
  'Restaurant / Food Service':  0,
}
const DEFAULT_MONTHLY_LEADS = 20

const MONTHLY_LEADS_MAP: Record<string, number> = {
  '0-10': 5,
  '11-25': 18,
  '26-50': 38,
  '51-100': 75,
  '100+': 120,
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export function getConfidence(hasActualLeads: boolean, hasAvgJobValue: boolean): ConfidenceLevel {
  if (hasActualLeads && hasAvgJobValue) return 'high'
  if (hasAvgJobValue) return 'medium'
  return 'low'
}

export function getMonthlyLeadsFromInput(input: string, industry: string): number {
  if (MONTHLY_LEADS_MAP[input] !== undefined) return MONTHLY_LEADS_MAP[input]
  return MONTHLY_LEADS[industry] ?? DEFAULT_MONTHLY_LEADS
}

export type LeakType =
  | 'followup'
  | 'followup_manual'
  | 'reviews'
  | 'ads'
  | 'website_phone'
  | 'website_form'
  | 'estimate'
  | 'reactivation'
  | 'lead_source'
  | 'reminders'
  | 'no_meta'
  | 'local_schema'
  | 'no_hours'
  | 'no_guarantee'
  | 'google_profile'

const RATES: Record<LeakType, [number, number]> = {
  followup:       [0.15, 0.25],
  followup_manual:[0.08, 0.15],
  reviews:        [0.08, 0.16],
  ads:            [0.12, 0.20],
  website_phone:  [0.04, 0.09],
  website_form:   [0.07, 0.13],
  estimate:       [0.10, 0.18],
  reactivation:   [0.05, 0.12],
  lead_source:    [0.06, 0.11],
  reminders:      [0.07, 0.14],
  no_meta:        [0.06, 0.12],
  local_schema:   [0.09, 0.17],
  no_hours:       [0.04, 0.08],
  no_guarantee:   [0.05, 0.10],
  google_profile: [0.14, 0.24],
}

export function estimateMonthlyImpact(
  type: LeakType,
  avgJobValue: number,
  industry: string,
  monthlyLeadsOverride?: number
): { low: number; high: number } | null {
  if (!avgJobValue || avgJobValue <= 0) return null
  const leads = monthlyLeadsOverride ?? (MONTHLY_LEADS[industry] ?? DEFAULT_MONTHLY_LEADS)
  if (leads === 0) return null

  const [lo, hi] = RATES[type] ?? [0.05, 0.10]
  return {
    low:  Math.round(leads * lo * avgJobValue),
    high: Math.round(leads * hi * avgJobValue),
  }
}

export function formatImpact(impact: { low: number; high: number }): string {
  const fmt = (n: number) =>
    n >= 10000 ? `$${(n / 1000).toFixed(0)}k`
    : n >= 1000  ? `$${(n / 1000).toFixed(1)}k`
    : `$${n}`
  return `${fmt(impact.low)}–${fmt(impact.high)}/mo`
}
