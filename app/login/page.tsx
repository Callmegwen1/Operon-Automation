import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Login | Operon Automation',
  description: 'Revenue Autopilot dashboard access. Coming soon.',
  robots: 'noindex',
}

export default function LoginPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-op-bg flex items-center justify-center py-16">
      <div className="max-w-sm w-full mx-auto px-4 text-center">
        <Link href="/" className="inline-block mb-8">
          <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto mx-auto" />
        </Link>

        <div className="card">
          <div className="w-14 h-14 rounded-xl bg-op-bg flex items-center justify-center mx-auto mb-5">
            <Lock size={24} className="text-op-navy" />
          </div>

          <h1 className="text-2xl font-bold font-manrope text-op-navy mb-3">Dashboard Coming Soon</h1>
          <p className="text-sm text-op-muted leading-relaxed mb-8">
            Revenue Autopilot dashboard access is launching soon. Join the early access list to be notified first.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/scanner" className="btn-primary w-full justify-center">
              Scan My Business Free <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="btn-secondary w-full justify-center">
              Join Early Access
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-op-muted">
          Already have an account?{' '}
          <span className="text-op-muted/60">Login will be available at launch.</span>
        </p>
      </div>
    </section>
  )
}
