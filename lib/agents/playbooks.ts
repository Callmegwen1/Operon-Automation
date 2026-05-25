import type { Playbook, Urgency } from './classify'

export interface PlaybookConfig {
  id: Playbook
  name: string
  email1DelayMinutes: number
  email2DelayDays: number
  email3DelayDays: number
  // Subject line overrides (undefined = use default)
  email1Subject?: (businessName: string) => string
  email2Subject?: (businessName: string) => string
  email3Subject?: (businessName: string) => string
  // Opening line overrides for email body personalization
  email1Opening?: (leadName: string, intent: string) => string
  // Owner alert urgency framing
  ownerAlertPrefix: string
  // When to flag for owner action
  createTask: boolean
  taskTitle?: (leadName: string, intent: string) => string
  taskDescription?: (leadName: string, aiSummary: string) => string
}

const PLAYBOOKS: Record<Playbook, PlaybookConfig> = {
  emergency_service: {
    id: 'emergency_service',
    name: 'Emergency Service',
    email1DelayMinutes: 5,
    email2DelayDays: 1,
    email3DelayDays: 2,
    email1Subject: (b) => `We received your urgent request — ${b}`,
    email1Opening: (name, intent) =>
      `Hi ${name}, we received your message about ${intent} and want you to know we're on it. Someone from our team will reach out to you very shortly.`,
    ownerAlertPrefix: '🚨 URGENT',
    createTask: true,
    taskTitle: (name) => `Call ${name} immediately — urgent service request`,
    taskDescription: (name, summary) => `${summary}\n\nRecommended action: call within 10 minutes.`,
  },

  urgent_home_service: {
    id: 'urgent_home_service',
    name: 'Urgent Home Service',
    email1DelayMinutes: 10,
    email2DelayDays: 1,
    email3DelayDays: 3,
    email1Subject: (b) => `Following up on your request — ${b}`,
    email1Opening: (name) =>
      `Hi ${name}, thanks for reaching out. We know home issues can't wait — someone from our team will be in touch with you shortly.`,
    ownerAlertPrefix: '⚡ High priority',
    createTask: true,
    taskTitle: (name) => `Follow up with ${name} — high priority lead`,
    taskDescription: (name, summary) => `${summary}\n\nRecommended action: call or respond today.`,
  },

  appointment_request: {
    id: 'appointment_request',
    name: 'Appointment Request',
    email1DelayMinutes: 15,
    email2DelayDays: 2,
    email3DelayDays: 5,
    email1Subject: (b) => `Your appointment request — ${b}`,
    email1Opening: (name) =>
      `Hi ${name}, thanks for reaching out to schedule. Our team will confirm your appointment details shortly.`,
    ownerAlertPrefix: '📅 Appointment request',
    createTask: false,
  },

  consultation_request: {
    id: 'consultation_request',
    name: 'Consultation Request',
    email1DelayMinutes: 20,
    email2DelayDays: 2,
    email3DelayDays: 5,
    email1Subject: (b) => `Your consultation request — ${b}`,
    email1Opening: (name) =>
      `Hi ${name}, thank you for your interest. We'll reach out shortly to schedule a time that works for you.`,
    ownerAlertPrefix: '💼 Consultation request',
    createTask: false,
  },

  quote_request: {
    id: 'quote_request',
    name: 'Quote Request',
    email1DelayMinutes: 15,
    email2DelayDays: 2,
    email3DelayDays: 5,
    email1Subject: (b) => `Your quote request — ${b}`,
    email1Opening: (name) =>
      `Hi ${name}, we received your request for a quote. Our team will review the details and follow up with you shortly.`,
    ownerAlertPrefix: '💰 Quote request',
    createTask: false,
  },

  catering_or_event: {
    id: 'catering_or_event',
    name: 'Catering or Event',
    email1DelayMinutes: 15,
    email2DelayDays: 1,
    email3DelayDays: 3,
    email1Subject: (b) => `Your event inquiry — ${b}`,
    email1Opening: (name) =>
      `Hi ${name}, thank you for reaching out about your event. We'll follow up shortly to discuss availability and details.`,
    ownerAlertPrefix: '🎉 Event inquiry',
    createTask: false,
  },

  membership_inquiry: {
    id: 'membership_inquiry',
    name: 'Membership Inquiry',
    email1DelayMinutes: 15,
    email2DelayDays: 2,
    email3DelayDays: 5,
    email1Subject: (b) => `Welcome to ${b} — here's what's next`,
    email1Opening: (name) =>
      `Hi ${name}, thanks for your interest in joining! Our team will follow up to walk you through your options and answer any questions.`,
    ownerAlertPrefix: '🏋️ Membership inquiry',
    createTask: false,
  },

  standard_followup: {
    id: 'standard_followup',
    name: 'Standard Follow-Up',
    email1DelayMinutes: 15,
    email2DelayDays: 2,
    email3DelayDays: 5,
    ownerAlertPrefix: '📬 New lead',
    createTask: false,
  },
}

export function getPlaybook(id: Playbook): PlaybookConfig {
  return PLAYBOOKS[id] ?? PLAYBOOKS.standard_followup
}

// Choose a playbook based on industry + urgency as a rule-based fallback
// (AI classification takes priority — this is used only as a cross-check)
export function inferPlaybook(industry: string, urgency: Urgency): Playbook {
  if (urgency === 'urgent') return 'emergency_service'
  if (urgency === 'high') {
    if (/home service|hvac|plumb|electri|roofing|contractor|cleaning/i.test(industry)) {
      return 'urgent_home_service'
    }
    return 'urgent_home_service'
  }
  if (/dental|clinic|med spa|aesthetic|healthcare/i.test(industry)) return 'consultation_request'
  if (/restaurant|food/i.test(industry)) return 'catering_or_event'
  if (/fitness|gym/i.test(industry)) return 'membership_inquiry'
  if (/real estate/i.test(industry)) return 'consultation_request'
  if (/contractor|trades|auto shop|home service|cleaning/i.test(industry)) return 'quote_request'
  return 'standard_followup'
}
