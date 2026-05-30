'use client'

import { type ElementType, type RefObject } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

// framer-motion v12 has strict Easing union types that reject plain strings
// like 'easeOut' when inferred inside a function return. We accept a loose
// Record here and cast to Variants internally so callers don't get type errors.
type LooseVariants = Record<string, unknown>

interface TimelineContentProps {
  as?: ElementType
  animationNum: number
  timelineRef: RefObject<HTMLElement | null>
  customVariants?: LooseVariants
  className?: string
  children: React.ReactNode
}

const defaultVariants: LooseVariants = {
  hidden: { opacity: 0, y: -20, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function TimelineContent({
  as: _as,
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

  const variants = (customVariants ?? defaultVariants) as Variants

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
