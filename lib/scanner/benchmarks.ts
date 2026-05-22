export interface Benchmark {
  leadsLostToSlowFollowUp: string
  avgFirstContactTime: string
  neverAskReviews: string
  stat4Label: string
  stat4Value: string
  topOpportunity: string
}

const DATA: Record<string, Benchmark> = {
  'Home Services': {
    leadsLostToSlowFollowUp: '67%',
    avgFirstContactTime: '47 hrs',
    neverAskReviews: '58%',
    stat4Label: 'of repeat customers ignored',
    stat4Value: '3 in 4',
    topOpportunity: 'Automating quote follow-up within 5 minutes doubles close rates for home service businesses.',
  },
  'Cleaning Company': {
    leadsLostToSlowFollowUp: '62%',
    avgFirstContactTime: '36 hrs',
    neverAskReviews: '64%',
    stat4Label: 'of clients re-booked via automation',
    stat4Value: '41%',
    topOpportunity: 'Cleaning companies using automated review requests earn 2× more Google reviews in 90 days.',
  },
  'Contractor / Trades': {
    leadsLostToSlowFollowUp: '71%',
    avgFirstContactTime: '52 hrs',
    neverAskReviews: '55%',
    stat4Label: 'of estimates never followed up',
    stat4Value: '60%',
    topOpportunity: 'Contractors who follow up on estimates within 2 days win 38% more jobs than those who wait.',
  },
  'Auto Shop': {
    leadsLostToSlowFollowUp: '59%',
    avgFirstContactTime: '24 hrs',
    neverAskReviews: '61%',
    stat4Label: 'of customers lost after first visit',
    stat4Value: '45%',
    topOpportunity: 'Auto shops with automated appointment reminders reduce no-shows by up to 70%.',
  },
  'Med Spa / Aesthetics': {
    leadsLostToSlowFollowUp: '73%',
    avgFirstContactTime: '8 hrs',
    neverAskReviews: '49%',
    stat4Label: 'avg repeat booking rate',
    stat4Value: '28%',
    topOpportunity: 'Med spas responding to inquiries within 1 hour book 5× more appointments than those who wait a day.',
  },
  'Fitness Studio': {
    leadsLostToSlowFollowUp: '65%',
    avgFirstContactTime: '30 hrs',
    neverAskReviews: '52%',
    stat4Label: 'of members churn per month',
    stat4Value: '5–8%',
    topOpportunity: 'Studios using reactivation campaigns for inactive members recover 22% of churned clients within 30 days.',
  },
  'Dental Office': {
    leadsLostToSlowFollowUp: '57%',
    avgFirstContactTime: '18 hrs',
    neverAskReviews: '43%',
    stat4Label: 'of patients never return after first visit',
    stat4Value: '32%',
    topOpportunity: 'Dental offices with automated recall reminders fill 35% more open appointment slots.',
  },
  'Clinic / Healthcare': {
    leadsLostToSlowFollowUp: '61%',
    avgFirstContactTime: '22 hrs',
    neverAskReviews: '47%',
    stat4Label: 'of new patients come from online now',
    stat4Value: '60%',
    topOpportunity: 'Clinics using automated follow-up see 29% higher patient retention and satisfaction scores.',
  },
  'Real Estate': {
    leadsLostToSlowFollowUp: '78%',
    avgFirstContactTime: '11 hrs',
    neverAskReviews: '39%',
    stat4Label: 'of leads close after 5+ touchpoints',
    stat4Value: '80%',
    topOpportunity: 'Agents who follow up within 5 minutes are 21× more likely to convert an online lead.',
  },
  'Restaurant / Food Service': {
    leadsLostToSlowFollowUp: '55%',
    avgFirstContactTime: 'N/A',
    neverAskReviews: '66%',
    stat4Label: 'of revenue comes from repeat customers',
    stat4Value: '65–75%',
    topOpportunity: 'Restaurants that actively collect reviews grow 3.7× faster on Google Maps than those that don\'t.',
  },
}

const DEFAULT: Benchmark = {
  leadsLostToSlowFollowUp: '63%',
  avgFirstContactTime: '36 hrs',
  neverAskReviews: '55%',
  stat4Label: 'of revenue left uncaptured on average',
  stat4Value: '20–35%',
  topOpportunity: 'Businesses that automate follow-up and review collection grow 2–3× faster than those that don\'t.',
}

export function getBenchmark(industry: string): Benchmark {
  return DATA[industry] ?? DEFAULT
}
