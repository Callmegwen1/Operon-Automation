import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Page Not Found | Operon Automation',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16 text-center">
      <Link href="/" className="mb-10">
        <Image src="/logos/logo-light.png" alt="Operon Automation" width={140} height={36} className="h-8 w-auto" />
      </Link>

      <p className="text-xs font-bold text-op-navy/40 uppercase tracking-widest mb-3">404</p>
      <h1 className="text-3xl font-bold font-manrope text-op-navy mb-3">Page not found</h1>
      <p className="text-sm text-op-muted mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/dashboard" className="btn-primary text-sm">
          Go to Dashboard <ArrowRight size={14} />
        </Link>
        <Link href="/" className="btn-secondary text-sm">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
