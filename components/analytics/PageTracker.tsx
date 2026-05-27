'use client'

import { useEffect } from 'react'
import { track, type TrackProps } from '@/lib/analytics'

interface Props {
  event: string
  props?: TrackProps
}

// Renders nothing — fires a single analytics event on mount.
// Use this in server-page files that need client-side tracking.
export default function PageTracker({ event, props }: Props) {
  useEffect(() => {
    track(event, props)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
