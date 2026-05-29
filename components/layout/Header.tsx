'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Revenue Autopilot', href: '/revenue-autopilot' },
  { label: 'Free Scanner',      href: '/scanner' },
  { label: 'How It Works',      href: '/how-it-works' },
  { label: 'Pricing',           href: '/pricing' },
]

export default function Header() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-op-bg/95 backdrop-blur-md shadow-[0_1px_0_0_#E4DDD5]'
          : 'bg-op-bg/80 backdrop-blur-sm'
      }`}
    >
      <div className="container-wide flex items-center justify-between h-[68px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 focus-ring rounded-lg">
          <Image
            src="/logos/logo-light.png"
            alt="Operon Automation"
            width={148}
            height={38}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13.5px] font-medium text-op-muted hover:text-op-ink px-3.5 py-2 rounded-lg
                         hover:bg-op-surface-2 transition-all duration-150 focus-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-[13.5px] font-medium text-op-muted hover:text-op-ink px-3.5 py-2 rounded-lg
                       hover:bg-op-surface-2 transition-all duration-150 focus-ring"
          >
            Login
          </Link>
          <Link href="/scanner" className="btn-primary text-[13px] px-5 py-2.5 gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot shrink-0" />
            Scan Free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="md:hidden p-2 rounded-xl text-op-muted hover:text-op-ink hover:bg-op-surface-2
                     transition-colors focus-ring"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-op-border bg-op-bg"
          >
            <nav className="container-wide py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-op-body hover:text-op-ink py-3 px-3 rounded-xl
                             hover:bg-op-surface-2 transition-colors flex items-center justify-between group"
                >
                  {link.label}
                  <ArrowRight size={14} className="text-op-subtle group-hover:text-op-muted transition-colors" />
                </Link>
              ))}
              <div className="pt-3 mt-1 border-t border-op-border flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-op-muted py-3 px-3 rounded-xl hover:bg-op-surface-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/scanner"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot shrink-0" />
                  Scan Free
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
