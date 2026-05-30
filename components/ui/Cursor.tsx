'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [visible, setVisible]   = useState(false)
  const [hovering, setHovering] = useState(false)

  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)

  // Soft lag so the ring trails just slightly behind the cursor
  const x = useSpring(rawX, { stiffness: 180, damping: 22, mass: 0.6 })
  const y = useSpring(rawY, { stiffness: 180, damping: 22, mass: 0.6 })

  useEffect(() => {
    // Only on pointer-fine (desktop mouse) devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove  = (e: MouseEvent) => { rawX.set(e.clientX); rawY.set(e.clientY); setVisible(true) }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const trackHover = () => {
      document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
        el.addEventListener('mouseenter', () => setHovering(true))
        el.addEventListener('mouseleave', () => setHovering(false))
      })
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    trackHover()
    const obs = new MutationObserver(trackHover)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      obs.disconnect()
    }
  }, [rawX, rawY])

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        opacity: visible ? 1 : 0,
        // Native cursor remains visible — this is just a halo
      }}
      animate={{
        width:       hovering ? 40 : 28,
        height:      hovering ? 40 : 28,
        borderColor: hovering ? 'rgba(212,98,42,0.7)' : 'rgba(212,98,42,0.35)',
        borderWidth: hovering ? '1.5px' : '1px',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    />
  )
}
