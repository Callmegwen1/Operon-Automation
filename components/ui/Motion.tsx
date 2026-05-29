'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const

// ── AnimateIn ─────────────────────────────────────────────────────────────────
// Scroll-triggered fade + slide-up. Fires once when element enters viewport.
interface AnimateInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  once?: boolean
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  duration = 0.65,
  y = 28,
  once = true,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-72px 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  )
}

// ── FadeIn ────────────────────────────────────────────────────────────────────
// Scroll-triggered fade only — no vertical movement.
interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 0.5 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-72px 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

// ── StaggerChildren ───────────────────────────────────────────────────────────
// Wraps direct children and staggers their entrance animations.
interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  y?: number
}

const staggerContainer = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
})

const staggerItem = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
})

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  y = 24,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={staggerItem(y)}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={staggerItem(y)}>{children}</motion.div>
      }
    </motion.div>
  )
}

// ── ScaleIn ───────────────────────────────────────────────────────────────────
// Scale from slightly smaller + fade — great for cards and badges.
interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  )
}

// ── HoverCard ─────────────────────────────────────────────────────────────────
// Subtle lift on hover — wraps any card-style element.
interface HoverCardProps {
  children: ReactNode
  className?: string
}

export function HoverCard({ children, className }: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

// ── MotionSpan ────────────────────────────────────────────────────────────────
// Inline animated span — useful for highlighted words in headlines.
interface MotionSpanProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function MotionSpan({ children, className, delay = 0.15 }: MotionSpanProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.span>
  )
}
