'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping:   40,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX, transformOrigin: 'left' }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-op-accent z-[9998] pointer-events-none"
      aria-hidden="true"
    />
  )
}
