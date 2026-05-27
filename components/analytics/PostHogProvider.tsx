'use client'

import { useEffect } from 'react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
    if (!key) return

    import('posthog-js').then(({ default: posthog }) => {
      if ((window as unknown as Record<string, unknown>).posthog) return // already init
      posthog.init(key, {
        api_host:                  host,
        person_profiles:           'identified_only',
        capture_pageview:          false,  // we fire page_view manually
        capture_pageleave:         true,
        autocapture:               false,  // privacy: explicit tracking only
        disable_session_recording: true,
      })
      ;(window as unknown as Record<string, unknown>).posthog = posthog
    })
  }, [])

  return <>{children}</>
}
