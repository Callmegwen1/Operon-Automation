export interface IndustryMultiplier {
  followup: number
  reviews: number
  ads: number
}

export const industryMultipliers: Record<string, IndustryMultiplier> = {
  'Real Estate':              { followup: 1.4, reviews: 0.8, ads: 1.2 },
  'Med Spa / Aesthetics':     { followup: 1.3, reviews: 1.1, ads: 1.0 },
  'Home Services':            { followup: 1.1, reviews: 1.0, ads: 1.0 },
  'Contractor / Trades':      { followup: 1.0, reviews: 0.9, ads: 1.1 },
  'Cleaning Company':         { followup: 1.0, reviews: 1.2, ads: 1.0 },
  'Auto Shop':                { followup: 0.9, reviews: 1.1, ads: 0.9 },
  'Fitness Studio':           { followup: 0.9, reviews: 1.1, ads: 0.9 },
  'Dental Office':            { followup: 0.9, reviews: 1.2, ads: 0.9 },
  'Clinic / Healthcare':      { followup: 0.9, reviews: 1.0, ads: 1.0 },
  'Restaurant / Food Service':{ followup: 0.7, reviews: 1.3, ads: 0.8 },
}

export function getMultiplier(industry: string): IndustryMultiplier {
  return industryMultipliers[industry] ?? { followup: 1.0, reviews: 1.0, ads: 1.0 }
}
