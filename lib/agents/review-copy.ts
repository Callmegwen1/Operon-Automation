export interface ReviewCopy {
  day0Subject: (businessName: string) => string
  day0Opening: string
  day0Ask: string
  day3Subject: (businessName: string) => string
  day3Body: string
  day7Subject: (businessName: string) => string
  day7Body: string
  privateFeedbackSubject: (businessName: string) => string
  privateFeedbackBody: string
}

const DEFAULT: ReviewCopy = {
  day0Subject: (b) => `How did we do? — ${b}`,
  day0Opening: 'It was great working with you.',
  day0Ask: 'If you have a moment, a quick review would mean a lot to us — it helps others find us and takes less than 2 minutes.',
  day3Subject: (b) => `Quick reminder — ${b}`,
  day3Body: "We noticed you haven't had a chance to leave a review yet — no worries at all. If you have a moment, we'd really appreciate it. It takes less than 2 minutes and helps us reach more customers like you.",
  day7Subject: (b) => `One last ask — ${b}`,
  day7Body: "This is the last time we'll ask — we promise. If our service was worth a review, we'd be grateful. It only takes a moment.",
  privateFeedbackSubject: (b) => `We'd love your honest feedback — ${b}`,
  privateFeedbackBody: "We want to make sure you had a great experience. Would you mind sharing any feedback — good or bad? We read every response and use it to improve.",
}

const COPY: Partial<Record<string, Partial<ReviewCopy>>> = {
  'Home Services': {
    day0Opening: 'We hope the job went smoothly and everything is working the way it should.',
    day0Ask: "If you're happy with the work, a quick Google review helps other homeowners find us — it takes under 2 minutes.",
    day3Body: "Just a quick follow-up — if you had a good experience with our team, a Google review would go a long way. Other homeowners rely on them when they're comparing contractors.",
    privateFeedbackBody: 'We want to make sure the job met your expectations. If anything wasn\'t right, please let us know — we\'ll make it right. Your honest feedback helps us improve.',
  },
  'Cleaning Company': {
    day0Opening: 'We hope your home or office is feeling fresh and clean.',
    day0Ask: 'Happy clients who leave a review help us grow without spending on ads — and it only takes about 90 seconds.',
    day3Body: "If your cleaning service met your expectations, a quick review would make a big difference for our small business. We read every one.",
    day7Body: "Last ask — if you'd be willing to share a review, we'd be grateful. It helps people in your area find trustworthy cleaning services.",
    privateFeedbackBody: 'We want to make sure your cleaning service was exactly what you expected. If anything fell short, tell us — we\'ll address it on the next visit or make it right.',
  },
  'Contractor / Trades': {
    day0Opening: 'We hope the project turned out exactly the way you envisioned it.',
    day0Ask: "A review from you helps other homeowners trust us before they reach out — and it takes less than 2 minutes to write.",
    day3Body: "We know life gets busy after a project wraps up, but if you have a few minutes, a Google review would mean a lot. Homeowners rely heavily on reviews when choosing a contractor.",
    privateFeedbackBody: "We take every project seriously and want to make sure you're 100% satisfied. If anything about the work or the experience didn't meet your expectations, please tell us directly.",
  },
  'Auto Shop': {
    day0Opening: 'We hope your vehicle is running great.',
    day0Ask: "If everything checked out, a quick Google review helps other drivers find a shop they can trust. Takes about 90 seconds.",
    day3Body: "Still thinking about that review? No pressure — but if your service experience was solid, we'd really appreciate a quick word on Google. It helps other drivers in the area find reliable service.",
    privateFeedbackBody: "We want to make sure your vehicle and your experience both met your expectations. If anything was off, tell us — we'll make it right.",
  },
  'Med Spa / Aesthetics': {
    day0Opening: 'We hope you\'re feeling great and loving your results.',
    day0Ask: "If you're happy with your treatment, a review helps other clients feel confident choosing us — and we'd be genuinely grateful.",
    day3Subject: (b) => `Still loving your results? — ${b}`,
    day3Body: "We hope you're still happy with your treatment. If you have a moment to share your experience, a review would mean a lot — prospective clients really do read them before booking.",
    day7Body: "This is the last time we'll reach out about a review. If your experience was positive, a few kind words go a long way for a small practice like ours.",
    privateFeedbackSubject: (b) => `Your experience matters to us — ${b}`,
    privateFeedbackBody: "Your satisfaction is our top priority. If anything about your visit or results didn't meet your expectations, we'd like the opportunity to address it personally. Please reply directly to this email.",
  },
  'Fitness Studio': {
    day0Opening: 'We hope you\'re enjoying your workouts and feeling the progress.',
    day0Ask: "If you're loving your experience so far, a Google review helps other people in the area find us. Takes about a minute.",
    day3Body: "Still going strong? If our studio has been a good fit for you, we'd love a review — it helps others find a community they'll love too.",
    privateFeedbackBody: "We want to make sure you're getting real value from your membership. If anything isn't working for you, tell us — we want to fix it.",
  },
  'Dental Office': {
    day0Opening: 'We hope your appointment went smoothly and you\'re feeling comfortable.',
    day0Ask: "A quick Google review helps new patients find a dentist they can trust before picking up the phone. It takes about 2 minutes.",
    day3Body: "We know dental visits aren't everyone's favorite, but if our team made yours a little easier, a review would mean a lot — new patients really rely on them.",
    privateFeedbackBody: "Patient comfort and satisfaction are our top priorities. If anything about your visit didn't meet your expectations, please let us know — we'd like the chance to make it right.",
  },
  'Clinic / Healthcare': {
    day0Opening: 'We hope you\'re feeling well and that your visit was helpful.',
    day0Ask: "A brief review helps other patients find quality care in their area. It only takes a moment and we truly appreciate it.",
    day3Body: "If your care experience was positive, a review would mean a great deal to our practice and help other patients make informed decisions about their healthcare.",
    privateFeedbackBody: "Your experience and wellbeing are our priority. If there was anything about your visit that fell short of your expectations, please share it with us directly so we can address it.",
  },
  'Real Estate': {
    day0Opening: 'Congratulations again — it was a pleasure working with you through this process.',
    day0Ask: "A review from a real client goes a long way for buyers and sellers who are researching agents. If you'd be willing to share your experience, we'd be incredibly grateful.",
    day3Body: "Buying or selling a home is a major milestone, and we hope we made it a little easier. If you have a few minutes to leave a review, it helps future clients feel confident reaching out.",
    day7Body: "Last reach-out about a review — we promise. If your experience was worth recommending, we'd love to hear from you. It means the world to a small agency like ours.",
    privateFeedbackBody: "Real estate transactions can be stressful, and we want to make sure we handled everything the way you needed. If anything about our service could have been better, please tell us directly.",
  },
  'Restaurant / Food Service': {
    day0Opening: 'We hope you enjoyed your experience and the food was exactly what you hoped for.',
    day0Ask: "If you had a great time, a quick Google review helps other diners find us — and it takes less than 2 minutes.",
    day3Body: "We noticed you haven't had a chance to leave a review yet. If your visit was enjoyable, a few words on Google or Yelp would go a long way for our team.",
    privateFeedbackBody: "We want every visit to be memorable for the right reasons. If anything about your experience didn't hit the mark, we'd love to hear about it directly so we can do better.",
  },
}

export function getReviewCopy(industry: string): ReviewCopy {
  const overrides = COPY[industry] ?? {}
  return { ...DEFAULT, ...overrides }
}
