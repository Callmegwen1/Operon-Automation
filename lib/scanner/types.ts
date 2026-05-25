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
  hasMobileViewport: boolean
  socialLinksCount: number
  performanceScore?: number
  hasMetaDescription: boolean
  hasLocalSchema: boolean
  hasBusinessHours: boolean
  hasAddress: boolean
  hasGuarantee: boolean
  hasFAQ: boolean
  hasVideo: boolean
  hasEmergencyService: boolean
  detectedPhone?: string
  detectedBookingPlatform?: string
  detectedChatPlatform?: string
  detectedCTA?: string
}

export interface ScoreBreakdownItem {
  reason: string
  points: number
}
