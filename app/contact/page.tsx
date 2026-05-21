import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Operon Automation',
  description:
    'Get in touch with Operon Automation. Request setup help, ask about Revenue Autopilot, or reach out about custom automation and marketing systems.',
}

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-op-navy text-white py-14">
        <div className="container-wide max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-manrope mb-5">
            Let's talk about your business.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Whether you want to start with Revenue Autopilot, need custom automation, or just have questions — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="section-pad bg-op-bg">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">

            {/* Left: form */}
            <div>
              <div className="bg-white rounded-2xl border border-op-border shadow-card p-6 sm:p-8">
                <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Send us a message</h2>
                <p className="text-sm text-op-muted mb-6">We typically respond within one business day.</p>
                <ContactForm />
              </div>
            </div>

            {/* Right: info */}
            <div className="flex flex-col gap-6 justify-start">
              <div>
                <h3 className="font-bold font-manrope text-op-navy mb-3">Ways to work with Operon</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Revenue Autopilot', desc: 'Self-serve software. Start with the free scanner today.', href: '/scanner', cta: 'Scan Free' },
                    { label: 'Operon Services', desc: 'Custom automation and marketing systems, done for you.', href: '/services', cta: 'See Services' },
                    { label: 'Questions / Support', desc: 'Not sure which option is right? Send us a note.', href: null, cta: null },
                  ].map(({ label, desc, href, cta }) => (
                    <div key={label} className="card py-4">
                      <p className="font-semibold text-op-navy text-sm mb-1">{label}</p>
                      <p className="text-xs text-op-muted mb-2">{desc}</p>
                      {href && cta && (
                        <Link href={href} className="text-xs font-semibold text-op-blue hover:underline">
                          {cta} →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-op-navy text-white rounded-xl p-5">
                <p className="text-sm font-semibold mb-2">Want to start faster?</p>
                <p className="text-xs text-white/60 mb-4">
                  The Revenue Leak Scanner is the fastest way to understand where your business is losing customers — and what to fix first.
                </p>
                <Link href="/scanner" className="inline-flex items-center gap-2 bg-op-blue text-white font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                  Scan My Business Free <ArrowRight size={13} />
                </Link>
              </div>

              <div className="text-sm text-op-muted">
                <p className="font-semibold text-op-navy mb-1">Email</p>
                <p>hello@operonauto.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
