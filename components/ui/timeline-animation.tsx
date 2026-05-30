'use client'

import { type ElementType, type RefObject } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TimelineContentProps {
  /** HTML element or component to render as */
  as?: ElementType
  /** Stagger index — higher = appears later */
  animationNum: number
  /** Ref to the scroll container that triggers all children */
  timelineRef: RefObject<HTMLElement | null>
  /** Optional framer-motion variants override */
  customVariants?: Variants
  className?: string
  children: React.ReactNode
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: -20, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.35, duration: 0.5, ease: 'easeOut' },
  }),
}

export function TimelineContent({
  as: _as,          // retained for API compat but layout handled by motion.div wrapper
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  const inView = useInView(timelineRef as RefObject<Element>, {
    once: true,
    margin: '-80px 0px',
  })

  const variants = customVariants ?? defaultVariants

  return (
    <motion.div
      className={cn(className)}
      custom={animationNum}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
