import Link from 'next/link'
import Image from 'next/image'

const productLinks = [
  { label: 'Revenue Autopilot', href: '/revenue-autopilot' },
  { label: 'Revenue Leak Scanner', href: '/scanner' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'Contact', href: '/contact' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'SMS Terms', href: '/sms-terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
]

export default function Footer() {
  return (
    <footer className="bg-op-navy text-white">
      <div className="container-wide py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logos/logo-dark.png"
              alt="Operon Automation"
              width={150}
              height={38}
              className="h-9 w-auto"
            />
          </Link>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Automation, marketing, and revenue recovery systems for small businesses. Find and fix the leaks costing your business customers.
          </p>
          <p className="mt-6 text-xs text-white/40">
            &copy; {new Date().getFullYear()} Operon Automation. All rights reserved.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-sm font-semibold font-manrope text-white mb-4 uppercase tracking-wider">
            Product
          </h3>
          <ul className="flex flex-col gap-3">
            {productLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-150"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-sm font-semibold font-manrope text-white mb-4 uppercase tracking-wider">
            Company
          </h3>
          <ul className="flex flex-col gap-3">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-150"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-sm font-semibold font-manrope text-white mb-4 uppercase tracking-wider">
            Legal
          </h3>
          <ul className="flex flex-col gap-3">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-150"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-wide py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            Revenue Leak Scores and estimated opportunities are informational only. Operon does not guarantee specific financial results.
          </p>
          <Link
            href="/scanner"
            className="text-xs font-semibold text-op-blue hover:text-blue-400 transition-colors shrink-0"
          >
            Scan My Business Free &rarr;
          </Link>
        </div>
      </div>
    </footer>
  )
}
