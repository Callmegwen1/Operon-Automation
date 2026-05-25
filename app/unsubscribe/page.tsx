import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Unsubscribed | Operon Automation',
  robots: 'noindex',
}

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status ?? 'done'
  const isError = status === 'error' || status === 'invalid'

  return (
    <div className="min-h-screen bg-op-bg flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8">
        <Image src="/logos/logo-light.png" alt="Operon Automation" width={150} height={38} className="h-9 w-auto" />
      </Link>

      <div className="w-full max-w-sm card text-center">
        {isError ? (
          <>
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-op-amber" />
            </div>
            <h1 className="text-xl font-bold font-manrope text-op-navy mb-2">Something went wrong</h1>
            <p className="text-sm text-op-muted mb-5">
              We couldn&apos;t process your request. If you&apos;d like to be removed from our mailing list,
              please email us at{' '}
              <a href="mailto:ceo@operonauto.com" className="text-op-navy font-semibold hover:underline">
                ceo@operonauto.com
              </a>
              {' '}and we&apos;ll take care of it right away.
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} className="text-op-green" />
            </div>
            <h1 className="text-xl font-bold font-manrope text-op-navy mb-2">You&apos;ve been unsubscribed</h1>
            <p className="text-sm text-op-muted mb-5">
              You won&apos;t receive any more follow-up emails from this business.
              If this was a mistake, simply reply to the last email you received.
            </p>
          </>
        )}
        <Link href="/" className="text-sm text-op-muted hover:text-op-navy transition-colors">
          ← Back to Operon
        </Link>
      </div>
    </div>
  )
}
