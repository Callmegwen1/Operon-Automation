export interface IndustryLeakCopy {
  patternA: string
  noFollowup: string
  manualFollowup: string
  slowResponse: (speed: string) => string
  reviewsPatternD: string
  reviewsIndividual: string
  estimateFollowup: string
  reactivation: string
}

const DEFAULT: IndustryLeakCopy = {
  patternA:
    "New leads aren't getting fast, consistent follow-up — and with no CRM, contacts are scattered. Most uncontacted leads go cold within 24 hours and never come back.",
  noFollowup:
    "New leads aren't getting any follow-up. Without a system, most leads go cold within 24 hours and choose a competitor who responds first.",
  manualFollowup:
    "You follow up manually, which means speed and consistency depend on how busy you are. Leads contacted within 5 minutes convert far better than those contacted hours later.",
  slowResponse: (speed) =>
    `You typically respond to new leads ${speed === 'next_day' ? 'next day or longer' : 'sometimes not at all'}. Leads contacted within 5 minutes are 21× more likely to convert than those contacted after an hour.`,
  reviewsPatternD:
    "No reviews or testimonials visible on your site, your Google profile needs attention, and reviews aren't collected consistently. Prospects comparing options will choose the business with more visible credibility.",
  reviewsIndividual:
    "Businesses that don't consistently ask for reviews miss the social proof that drives new customers. Most happy customers won't review unless asked.",
  estimateFollowup:
    "Estimates that go unanswered are customers who just needed a nudge. Most businesses never follow up on open quotes.",
  reactivation:
    "Without a CRM, past customers who haven't returned in 6+ months are likely forgotten. These are your warmest leads.",
}

const COPY: Partial<Record<string, Partial<IndustryLeakCopy>>> = {
  'Home Services': {
    patternA:
      "When a homeowner's pipe bursts or AC stops working, they call several local contractors and book whoever responds first. Without a CRM and consistent follow-up, those jobs are going to competitors who call back faster.",
    noFollowup:
      "Home service calls are often urgent — a broken furnace or leaking roof can't wait. Without a follow-up system, leads who don't hear back quickly move to the next contractor on their list.",
    manualFollowup:
      "In home services, whoever calls back first usually wins the job. Manual follow-up tied to your availability means losing jobs on your busiest days — exactly when you can least afford to.",
    slowResponse: (speed) =>
      `Home service calls are often urgent — ${speed === 'next_day' ? 'waiting until next day' : 'inconsistent response times'} means homeowners book a competitor while you're still catching up.`,
    reviewsIndividual:
      "Homeowners search for '[service] near me' and compare the top results — which are ranked almost entirely by review count and recency. Falling behind competitors on reviews means fewer calls before you've had a chance to bid.",
    estimateFollowup:
      "Estimates in home services often stall because homeowners are comparing bids. A follow-up sequence at 2, 5, and 7 days consistently closes jobs that would otherwise go quiet.",
    reactivation:
      "Past customers are your best source of repeat work and referrals — seasonal maintenance, new projects, neighbors who ask for recommendations. Without a CRM, those relationships go cold.",
  },

  'Cleaning Company': {
    patternA:
      "When someone reaches out about cleaning services, they're typically comparing 3–5 companies and booking whoever responds first. Without fast follow-up and a CRM to track clients, you lose new bookings and the recurring revenue that follows.",
    noFollowup:
      "Cleaning inquiries are easy to lose — prospects contact multiple companies and book whoever responds promptly. Without a follow-up system, slow responses cost you recurring clients, not just one-time jobs.",
    manualFollowup:
      "Cleaning clients often need a nudge to commit. Manual follow-up tied to your schedule means inconsistent outreach — and recurring clients go to whoever follows up first.",
    reviewsIndividual:
      "Cleaning services run on word-of-mouth and referrals. Happy clients who aren't asked for a review almost never leave one — and your next 10 clients may be reading your Google reviews right now.",
    estimateFollowup:
      "Cleaning quotes that go quiet often just need a follow-up to convert. A simple 2–5 day sequence re-engages prospects who were interested but got busy.",
    reactivation:
      "Lapsed cleaning clients are your easiest wins — they already trust you and know your work. A targeted win-back campaign can refill your recurring schedule without a dollar spent on advertising.",
  },

  'Contractor / Trades': {
    patternA:
      "Homeowners getting bids usually hire the contractor who communicates most reliably — not always the cheapest. Without automated follow-up and a CRM, jobs go to competitors who respond faster and stay in touch through the decision.",
    noFollowup:
      "In trades, whoever shows up first and follows through consistently wins the bid. Without a follow-up system, leads you've already invested time and effort into go cold and sign with someone else.",
    manualFollowup:
      "Bid follow-up is where most contractors lose jobs they should have won. Manual outreach depends on memory and availability — automation fires on time, every time, regardless of how busy the job site is.",
    slowResponse: (speed) =>
      `Most homeowners soliciting bids are comparing 3–5 contractors simultaneously. ${speed === 'next_day' ? 'A next-day response' : 'Inconsistent response times'} often mean the job is already spoken for before you get back to them.`,
    reviewsIndividual:
      "Most homeowners research contractors online before reaching out. A strong review profile with project-specific feedback is often what moves someone from browsing to calling you.",
    estimateFollowup:
      "Most homeowners need 2–3 touchpoints after a quote before they commit. Without a follow-up sequence, you're leaving jobs on the table that more persistent competitors will close.",
    reactivation:
      "Past clients who hired you once are far easier to sell than cold leads — they know your work and trust you. A seasonal outreach campaign keeps you top of mind for their next project and their neighbors' referrals.",
  },

  'Auto Shop': {
    patternA:
      "When a car needs urgent repair, customers call multiple shops and go with whoever responds fastest and communicates clearly. Without a CRM and follow-up system, you're losing repair jobs and the repeat oil change, tire, and maintenance revenue that follows.",
    noFollowup:
      "Auto service is a repeat business — the customer who chose you for a repair is worth many visits over time. Without follow-up, they go wherever is most convenient when the next issue comes up.",
    manualFollowup:
      "Auto shop customers need consistent communication to build loyalty. Manual follow-up works when it's slow — but on a busy day, new leads and pending estimates don't get the attention they need.",
    reviewsIndividual:
      "Most people pick an auto shop based on Google reviews. A shop with 200+ recent reviews wins the search click before your phone ever rings — and earns the repeat visit after a good experience.",
    estimateFollowup:
      "Customers who got a repair estimate and went quiet often just need a follow-up to bring them back in. Chasing those estimates within a few days recovers jobs most shops never pursue.",
    reactivation:
      "Customers due for oil changes, tire rotations, or inspections are your most predictable revenue. A simple reminder sequence brings them back before they default to a competitor's shop.",
  },

  'Med Spa / Aesthetics': {
    patternA:
      "Aesthetic treatments are high-consideration purchases — clients compare multiple providers over days or weeks before booking. Without fast follow-up and a CRM to stay in contact during that window, you lose clients to providers who nurture the relationship.",
    noFollowup:
      "New inquiries about aesthetic treatments go cold quickly. Clients in this space are comparison shopping and will book the provider who responds promptly, professionally, and shows they understand what the client is looking for.",
    manualFollowup:
      "Aesthetics clients are deliberate buyers who often need several touchpoints before committing. Manual follow-up can't reliably handle the volume, timing, or personalization that converts these leads consistently.",
    slowResponse: (speed) =>
      `Aesthetics clients are making high-consideration decisions and comparing multiple providers. ${speed === 'next_day' ? 'A next-day response' : 'Inconsistent response times'} often mean they've already booked elsewhere by the time you follow up.`,
    reviewsPatternD:
      "No reviews or testimonials visible on your site, your Google profile needs attention, and reviews aren't collected consistently. Aesthetic clients almost always research a provider's reviews before booking — a weak profile costs you inquiries before they even make contact.",
    reviewsIndividual:
      "Most clients read 10+ reviews before booking an aesthetic treatment. A strong, recent review profile is often the deciding factor between your practice and a competitor's — especially for first-time clients.",
    estimateFollowup:
      "Clients who inquired about a treatment and went quiet are often still deciding. A thoughtful follow-up sequence — not pushy, just informative — converts a meaningful percentage of those prospects.",
    reactivation:
      "Repeat treatments — touch-ups, follow-up sessions, and new services — are the core of aesthetics revenue. Clients who haven't returned in 6+ months need a personal, value-driven outreach to bring them back.",
  },

  'Fitness Studio': {
    patternA:
      "New member inquiries are highest-intent in the moment — that motivation fades fast. Without immediate follow-up and a CRM to track prospects, you miss the window when they're most ready to commit and end up chasing cold leads.",
    noFollowup:
      "Fitness inquiries require fast, warm follow-up. A prospect who doesn't hear back within an hour often joins the next gym that responds — frequently a larger chain with automated systems already in place.",
    manualFollowup:
      "Fitness decisions are emotional and time-sensitive. Manual follow-up means your busiest days are exactly when new member leads aren't getting a timely, personal response.",
    slowResponse: (speed) =>
      `Motivation to join a gym is often highest in the moment of inquiry. ${speed === 'next_day' ? 'A next-day response' : 'Inconsistent response times'} mean that window closes and the lead goes to whoever showed up faster.`,
    reviewsIndividual:
      "Most people choose a gym based on Google reviews and peer recommendations. A consistent stream of new reviews keeps you visible for the most valuable local searches and makes new members confident before they walk in.",
    estimateFollowup:
      "Prospects who asked about membership but didn't commit often just need a low-pressure follow-up. A short nurture sequence converts a meaningful share of those conversations into paying members.",
    reactivation:
      "Members who lapsed are far easier to re-engage than cold prospects — they've already paid you and experienced your studio. A targeted win-back sequence with a relevant offer often brings back 10–20% of churned members.",
  },

  'Dental Office': {
    patternA:
      "New patients searching for a dentist typically call 2–3 offices and book with whoever responds first and makes the process easy. Without automated follow-up for missed calls and web inquiries, you're losing new patients before they ever meet your team.",
    noFollowup:
      "A patient who submits a contact form or calls and gets voicemail is likely to call the next dental office on their list. Without a follow-up system, those new patients are gone before you even know you missed them.",
    manualFollowup:
      "Dental patients expect quick, professional responses. Manual follow-up tied to staff availability means inquiries that come in after hours or during a busy schedule don't get the attention that converts them into patients.",
    slowResponse: (speed) =>
      `New dental patients are often calling multiple offices simultaneously. ${speed === 'next_day' ? 'A next-day response' : 'Irregular response times'} frequently mean the patient has already booked with another practice before you follow up.`,
    reviewsPatternD:
      "No reviews or testimonials visible on your site, your Google profile needs attention, and reviews aren't collected consistently. New patients almost always check Google reviews before choosing a dentist — a weak profile costs you patients who never even call.",
    reviewsIndividual:
      "New patients almost always check Google reviews before choosing a dentist. Even a small gap in review volume compared to nearby practices can cost you multiple new patient appointments every week.",
    estimateFollowup:
      "Treatment plans that aren't followed up on often just needed a convenient prompt to move forward. A simple outreach sequence at 3 and 7 days recovers a meaningful share of patients who weren't ready to commit on the day of consultation.",
    reactivation:
      "Patients who haven't been in for a cleaning or recall appointment in 12+ months are your easiest re-engagements — they just need a prompt. An automated recall sequence is one of the highest-ROI systems a dental office can run.",
  },

  'Clinic / Healthcare': {
    patternA:
      "Patients who can't quickly reach a clinic or receive prompt confirmation often move on to urgent care or the next provider in their search results. Slow or inconsistent follow-up translates directly to empty appointment slots and lost patient relationships.",
    noFollowup:
      "Healthcare inquiries are often urgent or time-sensitive. A patient who doesn't get a timely response will find another provider — and may not return even if you follow up days later.",
    manualFollowup:
      "Clinic follow-up affects both patient outcomes and practice revenue. Manual outreach tied to staff bandwidth means some patients fall through the cracks during busy periods — exactly when your capacity to serve them is already strained.",
    reviewsIndividual:
      "Patients consistently cite reviews as the top factor in choosing a healthcare provider. A practice with a strong, recent review profile wins the search click before patients even look at your website.",
    reactivation:
      "Patients who haven't had an appointment in 12+ months represent both a care gap and a revenue opportunity. A proactive outreach campaign brings them back in and strengthens long-term patient relationships.",
  },

  'Real Estate': {
    patternA:
      "Real estate leads have a narrow window — buyers and sellers often interview multiple agents simultaneously and commit quickly. Without immediate follow-up and a CRM to manage the relationship, you lose listings and buyer agreements before a real conversation begins.",
    noFollowup:
      "In real estate, the agent who responds first and follows through most consistently wins the relationship. Without a system to respond to new inquiries within minutes, you're losing buyers and sellers to agents with automated outreach already in place.",
    manualFollowup:
      "Real estate success depends on consistent relationship nurturing over weeks or months. Manual follow-up works when business is slow — but when you're managing active transactions, new leads don't get the attention they need to stay engaged.",
    slowResponse: (speed) =>
      `Buyers and sellers in real estate are frequently working with multiple agents at once. ${speed === 'next_day' ? 'A next-day response' : 'Slow or inconsistent response times'} often mean the relationship is already established with someone else by the time you follow up.`,
    reviewsIndividual:
      "Most buyers and sellers research agents extensively before making contact. A strong review profile with specific transaction stories — neighborhoods, property types, timelines — is often what moves someone from researching to calling you directly.",
    estimateFollowup:
      "Real estate leads that go quiet after an initial conversation often just need a well-timed follow-up. A nurture sequence keeps you top of mind until the prospect is ready to move forward — which could be weeks or months later.",
    reactivation:
      "Past clients are your best source of referrals and repeat transactions. An annual check-in — a market update, an anniversary of their purchase — keeps the relationship active and positions you as the obvious call when they're ready to make a move.",
  },

  'Restaurant / Food Service': {
    patternA:
      "Restaurant inquiries about events, catering, and reservations need fast confirmation — a slow response sends the booking to a competitor who answered in minutes. Without a system to track prospects, you miss large-ticket events and the repeat business that follows.",
    noFollowup:
      "Event and catering inquiries are time-sensitive — the customer is planning ahead and comparing multiple venues. Without fast follow-up, you lose bookings to restaurants that respond the same day.",
    manualFollowup:
      "Event and catering leads require timely, professional responses to compete. Manual outreach tied to a busy front-of-house schedule means high-value event bookings don't get the fast reply that closes them.",
    slowResponse: (speed) =>
      `Event and catering inquiries are often competitive — prospects contact multiple venues simultaneously. ${speed === 'next_day' ? 'A next-day response' : 'Slow response times'} frequently mean the booking is gone before you even see the message.`,
    reviewsPatternD:
      "Restaurant discovery is driven almost entirely by Google ratings and recent reviews. Without consistent review collection and an active profile, you're invisible to customers actively searching for dining options — even if your food and service are excellent.",
    reviewsIndividual:
      "Most dining decisions start with a quick Google search, and the restaurant with the most recent, high-quality reviews wins the click. Not asking for reviews after a great meal is leaving your best marketing on the table.",
    estimateFollowup:
      "Catering and event inquiries that go quiet often just needed a follow-up to close. A simple 2-day check-in after your initial response converts a meaningful share of prospects who were still deciding.",
    reactivation:
      "Repeat diners and regulars drive the steady revenue that every restaurant depends on. A targeted offer or personal update to past guests brings them back and builds the loyal base that makes the business resilient.",
  },
}

export function getIndustryCopy(industry: string): IndustryLeakCopy {
  const overrides = COPY[industry] ?? {}
  return { ...DEFAULT, ...overrides }
}
