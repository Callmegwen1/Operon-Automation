'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  suffix?: string
  duration?: number
  className?: string
  style?: CSSProperties
}

export default function AnimatedCounter({
  value,
  suffix = '',
  duration = 1400,
  className = '',
  style,
}: Props) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * value))
            if (progress < 1) requestAnimationFrame(tick)
            else setCount(value)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className} style={style}>
      {count}
      {suffix}
    </span>
  )
}
