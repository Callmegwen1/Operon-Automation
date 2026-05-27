'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { captureUtmsFromUrl, track } from '@/lib/analytics'

function AnalyticsInitInner() {
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  // Capture UTMs whenever URL query changes (covers first load + paid ad clicks)
  useEffect(() => {
    captureUtmsFromUrl()
  }, [searchParams])

  // Track page views on route changes
  useEffect(() => {
    track('page_view')
  }, [pathname])

  return null
}

// useSearchParams requires Suspense boundary
export default function AnalyticsInit() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInitInner />
    </Suspense>
  )
}
