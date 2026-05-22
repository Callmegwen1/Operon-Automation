'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Revenue Autopilot', href: '/revenue-autopilot' },
  { label: 'Free Scanner',      href: '/scanner' },
  { label: 'Services',          href: '/services' },
  { label: 'Pricing',           href: '/pricing' },
  { label: 'Contact',           href: '/contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-op-border">
      <div className="container-wide flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logos/logo-light.png"
            alt="Operon Automation"
            width={160}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-op-body hover:text-op-navy transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-op-muted hover:text-op-body transition-colors duration-150"
          >
            Login
          </Link>
          <Link href="/scanner" className="btn-primary text-sm px-5 py-2.5">
            Scan Free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="md:hidden p-2 rounded-lg text-op-body hover:bg-op-bg transition-colors"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-op-border">
          <nav className="container-wide py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-op-body hover:text-op-navy py-2.5 px-3 rounded-lg hover:bg-op-bg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-1 border-t border-op-border flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-op-muted py-2.5 px-3 rounded-lg hover:bg-op-bg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/scanner"
                onClick={() => setOpen(false)}
                className="btn-primary w-full justify-center"
              >
                Scan Free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
