'use client'

import { motion } from 'framer-motion'

function drop(delay: number) {
  return {
    animate: {
      y:       [0, 0, 32],
      opacity: [1, 1, 0],
    },
    transition: {
      duration:    2.6,
      delay,
      repeat:      Infinity,
      repeatDelay: 1.0,
      ease:        'easeIn' as const,
      times:       [0, 0.25, 1],
    },
  }
}

export default function DripDrop() {
  return (
    <svg
      className="absolute left-0 w-full pointer-events-none overflow-visible"
      style={{ top: 'calc(100% - 2px)' }}
      viewBox="0 0 154 50"
      fill="none"
      aria-hidden="true"
    >
      {/* Small drop — detaching, leftmost */}
      <motion.g {...drop(0.9)}>
        <path
          d="M18,0 C19.2,3.6 24,6 24,12 A6,6 0 0 1 12,12 C12,6 16.8,3.6 18,0 Z"
          fill="#D4622A" fillOpacity="0.55"
        />
        <ellipse cx="15" cy="4.5" rx="1.5" ry="2" fill="white" fillOpacity="0.42"
          transform="rotate(-20 15 4.5)" />
      </motion.g>

      {/* Medium drop — mid-fall */}
      <motion.g {...drop(0.0)}>
        <path
          d="M68,0 C69.8,5.1 77,8.5 77,17 A9,9 0 0 1 59,17 C59,8.5 66.2,5.1 68,0 Z"
          fill="#D4622A" fillOpacity="0.82"
        />
        <ellipse cx="64" cy="6.5" rx="2.5" ry="3.5" fill="white" fillOpacity="0.38"
          transform="rotate(-20 64 6.5)" />
      </motion.g>

      {/* Large drop — nearly at impact */}
      <motion.g {...drop(0.45)}>
        <path
          d="M128,0 C130.4,7.2 140,12 140,24 A12,12 0 0 1 116,24 C116,12 125.6,7.2 128,0 Z"
          fill="#D4622A" fillOpacity="0.95"
        />
        <ellipse cx="124" cy="9.5" rx="3.5" ry="5" fill="white" fillOpacity="0.35"
          transform="rotate(-20 124 9.5)" />
      </motion.g>
    </svg>
  )
}
