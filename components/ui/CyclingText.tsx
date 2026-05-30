'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface CyclingTextProps {
  words: string[]
  interval?: number
  className?: string
  wordClassName?: string
}

export default function CyclingText({
  words,
  interval = 2200,
  className = '',
  wordClassName = '',
}: CyclingTextProps) {
  const [index, setIndex] = useState(0)
  const stable = useMemo(() => words, [])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setTimeout(() => {
      setIndex((i) => (i === stable.length - 1 ? 0 : i + 1))
    }, interval)
    return () => clearTimeout(id)
  }, [index, interval, stable])

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      // Reserve space for the longest word so layout doesn't shift
      style={{ minWidth: `${Math.max(...stable.map((w) => w.length))}ch` }}
    >
      {stable.map((word, i) => (
        <motion.span
          key={word}
          className={`absolute ${wordClassName}`}
          initial={{ opacity: 0, y: -24 }}
          transition={{ type: 'spring', stiffness: 55, damping: 14 }}
          animate={
            index === i
              ? { y: 0,   opacity: 1 }
              : { y: index > i ? -32 : 32, opacity: 0 }
          }
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
