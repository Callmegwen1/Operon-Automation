import Link from 'next/link'
import Image from 'next/image'

const productLinks = [
  { label: 'Revenue Autopilot',    href: '/revenue-autopilot' },
  { label: 'Revenue Leak Scanner', href: '/scanner' },
  { label: 'How It Works',         href: '/how-it-works' },
  { label: 'Pricing',              href: '/pricing' },
]

const companyLinks = [
  { label: 'About',           href: '/about' },
  { label: 'Services',        href: '/services' },
  { label: 'Contact',         href: '/contact' },
  { label: 'Privacy Policy',  href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'SMS Terms',       href: '/sms-terms' },
]

export default function Footer() {
  return (
    <footer className="bg-op-navy text-white">
      <div className="container-wide py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logos/logo-dark.png"
              alt="Operon Automation"
              width={150}
              height={38}
              className="h-9 w-auto"
            />
          </Link>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-4">
            Revenue recovery systems for small businesses. Find and fix the leaks costing you customers.
          </p>
          <p className="text-xs text-white/30 font-inter">Made in Wichita, KS</p>
          <p className="mt-2 text-xs text-white/30">
            &copy; {new Date().getFullYear()} Operon Automation.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-xs font-semibold font-inter text-white/40 mb-4 uppercase tracking-widest">
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
          <h3 className="text-xs font-semibold font-inter text-white/40 mb-4 uppercase tracking-widest">
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
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-wide py-4">
          <p className="text-xs text-white/30">
            Revenue Leak Scores are informational only. Operon does not guarantee specific financial results.
          </p>
        </div>
      </div>
    </footer>
  )
}
