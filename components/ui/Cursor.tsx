'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)

  // Dot follows cursor exactly
  const dotX = useSpring(rawX, { stiffness: 1000, damping: 50, mass: 0.1 })
  const dotY = useSpring(rawY, { stiffness: 1000, damping: 50, mass: 0.1 })

  // Ring follows with spring lag
  const ringX = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.5 })
  const ringY = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.5 })

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const enter = () => setVisible(true)
    const leave = () => setVisible(false)
    const down  = () => setClicking(true)
    const up    = () => setClicking(false)

    const trackHover = () => {
      const targets = document.querySelectorAll('a, button, [data-cursor-hover]')
      targets.forEach((el) => {
        el.addEventListener('mouseenter', () => setHovering(true))
        el.addEventListener('mouseleave', () => setHovering(false))
      })
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseenter', enter)
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mousedown', down)
    document.addEventListener('mouseup', up)

    // Re-track on DOM changes
    trackHover()
    const observer = new MutationObserver(trackHover)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseenter', enter)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup', up)
      observer.disconnect()
    }
  }, [rawX, rawY, visible])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-op-accent/60"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        animate={{
          width:  hovering ? 44 : clicking ? 20 : 32,
          height: hovering ? 44 : clicking ? 20 : 32,
          borderColor: hovering ? 'rgba(212,98,42,0.8)' : 'rgba(212,98,42,0.4)',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-op-accent"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        animate={{
          width:  hovering ? 6 : clicking ? 10 : 6,
          height: hovering ? 6 : clicking ? 10 : 6,
          opacity: hovering ? 0.6 : 1,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      />
    </>
  )
}
