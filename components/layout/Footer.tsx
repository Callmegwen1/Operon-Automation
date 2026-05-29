import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

const productLinks = [
  { label: 'Revenue Autopilot',    href: '/revenue-autopilot' },
  { label: 'Revenue Leak Scanner', href: '/scanner' },
  { label: 'How It Works',         href: '/how-it-works' },
  { label: 'Pricing',              href: '/pricing' },
]

const companyLinks = [
  { label: 'About',            href: '/about' },
  { label: 'Services',         href: '/services' },
  { label: 'Contact',          href: '/contact' },
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-op-dark text-white">

      {/* Main footer content */}
      <div className="container-wide pt-16 pb-12 grid grid-cols-1 sm:grid-cols-12 gap-10">

        {/* Brand — takes 5 cols */}
        <div className="sm:col-span-5">
          <Link href="/" className="inline-block mb-5">
            <Image
              src="/logos/logo-dark.png"
              alt="Operon Automation"
              width={140}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <p className="text-sm text-white/50 leading-relaxed max-w-[280px] mb-6">
            Revenue recovery systems for small businesses. Find and fix the leaks costing you customers.
          </p>

          {/* CTA pill */}
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 bg-op-accent text-white text-xs font-semibold
                       font-jakarta px-4 py-2.5 rounded-xl hover:bg-op-accent-dk transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse-dot" />
            Scan Your Business Free
          </Link>

          <div className="mt-8 pt-6 border-t border-white/8">
            <p className="text-xs text-white/25 font-jakarta">Made in Wichita, KS</p>
            <p className="mt-1 text-xs text-white/25 font-jakarta">
              &copy; {new Date().getFullYear()} Operon Automation. All rights reserved.
            </p>
          </div>
        </div>

        {/* Product links — 3 cols */}
        <div className="sm:col-span-3 sm:col-start-7">
          <h3 className="text-[10px] font-semibold font-jakarta text-white/30 mb-5 uppercase tracking-[0.18em]">
            Product
          </h3>
          <ul className="flex flex-col gap-3">
            {productLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/50 hover:text-white transition-colors duration-150
                             inline-flex items-center gap-1 group"
                >
                  {l.label}
                  <ArrowUpRight
                    size={11}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links — 3 cols */}
        <div className="sm:col-span-3">
          <h3 className="text-[10px] font-semibold font-jakarta text-white/30 mb-5 uppercase tracking-[0.18em]">
            Company
          </h3>
          <ul className="flex flex-col gap-3">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/50 hover:text-white transition-colors duration-150
                             inline-flex items-center gap-1 group"
                >
                  {l.label}
                  <ArrowUpRight
                    size={11}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.07]">
        <div className="container-wide py-4 flex flex-col sm:flex-row items-start sm:items-center
                        justify-between gap-2">
          <p className="text-[11px] text-white/20 font-jakarta">
            Revenue Leak Scores are informational only. Operon does not guarantee specific financial results.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[11px] text-white/20 hover:text-white/50 transition-colors font-jakarta">
              Privacy
            </Link>
            <Link href="/terms" className="text-[11px] text-white/20 hover:text-white/50 transition-colors font-jakarta">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
