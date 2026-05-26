export interface ReactivationCopy {
  subject: (businessName: string) => string
  opener: string
  body: string
}

const DEFAULT: ReactivationCopy = {
  subject: (b) => `We miss you — ${b}`,
  opener: "It's been a while since we've seen you, and we wanted to reach out.",
  body: "We'd love the chance to work together again. If there's anything we can help with, reply to this email or give us a call — we're here.",
}

const COPY: Partial<Record<string, Partial<ReactivationCopy>>> = {
  'Home Services': {
    subject: (b) => `Quick check-in from ${b}`,
    opener: "We noticed it's been a while since your last service, and wanted to check in.",
    body: "If anything around the house needs attention — or if you'd just like us to take a look — we're a call or reply away. We'd love to earn your business again.",
  },
  'Contractor / Trades': {
    subject: (b) => `Got another project in mind? — ${b}`,
    opener: "Hope everything we did together has been holding up well.",
    body: "If you have another project coming up or know someone who does, we'd love to be your first call. Reply here and we'll get back to you quickly.",
  },
  'Auto Shop': {
    subject: (b) => `Time for a check-up? — ${b}`,
    opener: "It's been a while since your last visit, and wanted to make sure your vehicle is still running well.",
    body: "If you're due for an oil change, inspection, or anything else, we're happy to get you in. Just reply or give us a call.",
  },
  'Cleaning Company': {
    subject: (b) => `Ready for a fresh clean? — ${b}`,
    opener: "We haven't had the chance to take care of your space in a while and wanted to check in.",
    body: "If you're ready to get back on a cleaning schedule — or just need a one-time refresh — we can usually get you in within the week. Reply to book.",
  },
  'Med Spa / Aesthetics': {
    subject: (b) => `Your next treatment is waiting — ${b}`,
    opener: "We've been thinking about you and wanted to reach out.",
    body: "If you're ready to schedule your next appointment or want to hear about any new treatments we're offering, just reply and we'll set something up for you.",
  },
  'Real Estate': {
    subject: (b) => `Checking in — ${b}`,
    opener: "Just wanted to touch base and see how things are going.",
    body: "If you're thinking about buying, selling, or just curious about where the market stands, I'd love to catch up. Reply or call anytime.",
  },
}

export function getReactivationCopy(industry: string): ReactivationCopy {
  const overrides = COPY[industry] ?? {}
  return { ...DEFAULT, ...overrides }
}
