import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

export const metadata: Metadata = {
  title: 'About Operon Automation',
  description:
    'Operon Automation exists to help small businesses use automation without complexity. Simple systems, clear visibility, recovered revenue.',
}

const values = [
  {
    title: 'Simple systems that actually get used',
    desc: 'Complex tools get ignored. Operon is built to be activated and forgotten — systems that run in the background without needing constant attention.',
  },
  {
    title: 'Visibility before advice',
    desc: 'You cannot fix what you cannot see. Operon starts with a clear picture of what is actually leaking before recommending any system.',
  },
  {
    title: 'Automation that feels human',
    desc: 'Every follow-up, every review request, every reminder is designed to feel like it came from a real person — because it should.',
  },
  {
    title: 'Built for owners, not IT teams',
    desc: 'Small business owners do not have developers on staff. Operon is designed to be set up, activated, and run by the person who built the business.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-op-navy text-white section-pad">
        <div className="container-wide max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-widest mb-5 font-inter">About Operon</p>
          <h1 className="text-4xl md:text-5xl font-extrabold font-manrope leading-tight mb-6">
            Simple systems for small businesses that want to operate better.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Operon Automation exists to help small businesses use automation without complexity. The goal is to recover lost opportunities, simplify follow-up, improve visibility, and help owners feel more in control of their business.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-pad bg-white">
        <div className="container-wide max-w-3xl mx-auto">
          <div className="prose prose-base max-w-none">
            <SectionHeader
              eyebrow="Our Mission"
              title="Most businesses don't need more leads."
              titleHighlight="They need fewer leaks."
            />
            <div className="mt-6 flex flex-col gap-5 text-op-body leading-relaxed">
              <p>
                Most small business owners are excellent at what they do. They are skilled tradespeople, healthcare providers, service professionals, and operators who built something real. But the tools available to them were designed for companies ten times their size — enterprise software with enterprise complexity.
              </p>
              <p>
                The result is that most small businesses handle their follow-up manually, miss calls because they're on a job, forget to ask for reviews after great service, and lose track of which ads are actually working. None of these are business failures — they're system gaps.
              </p>
              <p>
                Operon closes those gaps. We don't sell AI hype or promise to transform your business overnight. We build simple, practical systems that run in the background — following up on leads, collecting reviews, reminding customers to pay, and bringing back people who haven't returned in a while.
              </p>
              <p>
                Simple systems. Real results. Your business, running better every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="How We Work"
              title="What we believe about"
              titleHighlight="automation."
              center
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {values.map(({ title, desc }) => (
              <div key={title} className="card-hover">
                <CheckCircle2 size={18} className="text-op-green mb-3" />
                <h3 className="font-semibold font-manrope text-op-navy mb-2">{title}</h3>
                <p className="text-sm text-op-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two sides */}
      <section className="section-pad bg-white">
        <div className="container-wide max-w-3xl mx-auto">
          <SectionHeader
            eyebrow="What We Offer"
            title="Two ways to work with Operon."
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card border-2 border-op-navy">
              <span className="badge-blue mb-4 inline-flex">Revenue Autopilot</span>
              <h3 className="font-bold font-manrope text-op-navy mb-3">The product side.</h3>
              <p className="text-sm text-op-muted leading-relaxed">
                Revenue Autopilot is the software product. It scans your business, produces a Revenue Leak Score, and lets you activate pre-built agents that recover missed leads, grow reviews, chase invoices, and reactivate old customers. Self-serve, fast to start, and built to run in the background.
              </p>
            </div>
            <div className="card border-2 border-op-green">
              <span className="badge-green mb-4 inline-flex">Operon Services</span>
              <h3 className="font-bold font-manrope text-op-navy mb-3">The custom side.</h3>
              <p className="text-sm text-op-muted leading-relaxed">
                Operon Services is for businesses that need something deeper — custom CRM setup, complex workflow automation, marketing system design, and done-for-you implementation. We work directly with you to build what your specific business needs.
              </p>
            </div>
          </div>
          <p className="text-sm text-op-muted mt-6 text-center">
            These are not two separate businesses — they are two ways to work with Operon, depending on what you need.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-op-navy text-white">
        <div className="container-wide text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold font-manrope mb-5">
            Start with a free look at your business.
          </h2>
          <p className="text-lg text-white/70 mb-8">
            The Revenue Leak Scanner shows you exactly where customers may be slipping away — free, in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/scanner" className="inline-flex items-center gap-2 bg-white text-op-navy font-bold px-7 py-4 rounded-lg hover:bg-slate-50 transition-colors">
              Scan My Business Free <ArrowRight size={17} />
            </Link>
            <Link href="/contact" className="btn-outline-white px-7 py-4">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
