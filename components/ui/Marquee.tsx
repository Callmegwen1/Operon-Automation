'use client'

import { type ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
  direction?: 'left' | 'right'
  speed?: 'slow' | 'normal' | 'fast'
}

const speeds = { slow: '60s', normal: '40s', fast: '24s' }

export default function Marquee({
  children,
  className = '',
  itemClassName = '',
  direction = 'left',
  speed = 'normal',
}: MarqueeProps) {
  const duration = speeds[speed]
  const animName = direction === 'left' ? 'marquee-left' : 'marquee-right'

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <div
        className="flex w-max"
        style={{
          animation: `${animName} ${duration} linear infinite`,
          gap: '3rem',
        }}
      >
        {/* Render twice for seamless loop */}
        {[0, 1].map((pass) =>
          children.map((child, i) => (
            <div key={`${pass}-${i}`} className={`shrink-0 ${itemClassName}`}>
              {child}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
