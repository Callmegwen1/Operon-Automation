export interface SubScore {
  name: string
  score: number
  label: 'Low Risk' | 'At Risk' | 'High Risk'
  color: string
  bg: string
}

export interface WebsiteAnalysis {
  accessible: boolean
  loadsFast: boolean
  hasHttps: boolean
  hasPhoneNumber: boolean
  hasContactForm: boolean
  hasCallToAction: boolean
  hasChatWidget: boolean
  hasSocialProof: boolean
  hasBookingWidget: boolean
}
