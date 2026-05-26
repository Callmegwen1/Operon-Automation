export interface EstimateCopy {
  day0Subject: (businessName: string) => string
  day0Opener: string
  day0Body: string
  day1Subject: (businessName: string) => string
  day1Body: string
  day3Subject: (businessName: string) => string
  day3Body: string
}

const DEFAULT: EstimateCopy = {
  day0Subject: (b) => `Your estimate from ${b}`,
  day0Opener: "Thanks for the opportunity to put together an estimate for you.",
  day0Body: "I've put together pricing based on what we discussed. Take a look when you get a chance — happy to answer any questions or adjust the scope if needed.",
  day1Subject: (b) => `Quick check-in on your estimate — ${b}`,
  day1Body: "Just wanted to make sure the estimate landed in your inbox. If you have any questions about the pricing or what's included, I'm happy to walk through it.",
  day3Subject: (b) => `Last follow-up on the estimate — ${b}`,
  day3Body: "This will be my last follow-up — I don't want to be a bother. If you're still thinking it over or need to adjust the scope, just reply and we'll make it work. Otherwise, no worries at all.",
}

const COPY: Partial<Record<string, Partial<EstimateCopy>>> = {
  'Home Services': {
    day0Opener: "Thanks for letting us take a look at the job.",
    day0Body: "I've put together the estimate based on what we discussed. Feel free to reach out if anything looks off or you want to change the scope — no commitment needed.",
    day1Body: "Just checking in to make sure the estimate reached you. We have availability this week if you want to move forward.",
    day3Body: "Last follow-up from us. If the timing or price isn't right, just say the word and we can revisit. We'd love to get the job done for you.",
  },
  'Contractor / Trades': {
    day0Opener: "It was great talking through the project with you.",
    day0Body: "Here's the estimate based on our conversation. I'm happy to go over any line items or adjust the scope — just reply to this email.",
    day1Body: "Wanted to follow up on the estimate I sent. Materials and scheduling can shift, so locking in sooner helps ensure we can hit your timeline.",
    day3Body: "One last check-in before I close this out. If budget or timing is a concern, let's talk — there's usually a way to make it work.",
  },
  'Auto Shop': {
    day0Opener: "Thanks for bringing your vehicle in.",
    day0Body: "I've written up the estimate for the work we discussed. Let me know if you have questions about what's included or if you'd like to prioritize certain repairs.",
    day1Body: "Just following up on the repair estimate. If you're still deciding, we're happy to walk through what's urgent vs. what can wait.",
    day3Body: "Last follow-up on your vehicle estimate. If you'd like to move forward — or just do the critical repairs for now — give us a call or reply here.",
  },
  'Cleaning Company': {
    day0Opener: "Thanks for reaching out — we'd love to take care of your space.",
    day0Body: "Here's the quote based on what we discussed. We're flexible on scheduling and can adjust the service list if needed.",
    day1Body: "Just checking in on the cleaning quote. If you'd like to get started or have any questions, we're ready.",
    day3Body: "One last follow-up on your quote. We have openings this week — happy to schedule a first visit if you're ready.",
  },
  'Med Spa / Aesthetics': {
    day0Opener: "Thank you for your interest in our treatments.",
    day0Body: "I've put together a personalized treatment plan and pricing based on our consultation. Please take a look and don't hesitate to reach out with any questions.",
    day1Subject: (b) => `Your personalized plan — ${b}`,
    day1Body: "Following up to make sure you received your treatment plan. I'm happy to answer any questions about the treatments, what to expect, or pricing.",
    day3Body: "This is my last follow-up. If you'd like to schedule a consultation or have any questions about the plan, I'm here — no pressure at all.",
  },
  'Real Estate': {
    day0Opener: "It was a pleasure discussing your needs.",
    day0Body: "I've prepared an overview of our services and fees based on our conversation. Please review at your convenience — I'm happy to answer any questions.",
    day1Body: "Following up to make sure you received my proposal. If you'd like to discuss the details or have any questions, I'm available for a quick call.",
    day3Body: "Last follow-up from me. The market moves quickly — if you're ready to take the next step, I'd love to help you move forward.",
  },
}

export function getEstimateCopy(industry: string): EstimateCopy {
  const overrides = COPY[industry] ?? {}
  return { ...DEFAULT, ...overrides }
}
