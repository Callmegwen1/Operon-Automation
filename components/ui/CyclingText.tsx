'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface CyclingTextProps {
  words: string[]
  interval?: number
  /** Applied to the outer wrapper span */
  className?: string
  /** Applied to each animated word span */
  wordClassName?: string
}

export default function CyclingText({
  words,
  interval = 2200,
  className = '',
  wordClassName = '',
}: CyclingTextProps) {
  const [index, setIndex] = useState(0)
  const stable = useMemo(() => words, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setTimeout(() => {
      setIndex((i) => (i === stable.length - 1 ? 0 : i + 1))
    }, interval)
    return () => clearTimeout(id)
  }, [index, interval, stable])

  return (
    /*
     * overflow-hidden clips words entering/exiting.
     * No minWidth — parent controls sizing via className.
     * Each word is absolute so they stack perfectly.
     */
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      {/* Invisible widest word — holds layout width without showing */}
      <span className={`invisible select-none ${wordClassName}`} aria-hidden="true">
        {stable.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>

      {stable.map((word, i) => (
        <motion.span
          key={word}
          className={`absolute inset-0 flex items-center ${wordClassName}`}
          initial={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }}
          animate={
            index === i
              ? { y: 0,   opacity: 1 }
              : { y: index > i ? -28 : 28, opacity: 0 }
          }
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
