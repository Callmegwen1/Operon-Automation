'use client'

import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import React from 'react'

/* ── Concentric circle ────────────────────────────────────────── */
export const Circle = ({
  className,
  children,
  idx,
  ...rest
}: {
  className?: string
  children?: React.ReactNode
  idx: number
  style?: React.CSSProperties
}) => {
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: idx * 0.09, duration: 0.2 }}
      className={twMerge(
        'absolute inset-0 left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full',
        className,
      )}
    />
  )
}

/* ── Radar sweep ─────────────────────────────────────────────── */
export const Radar = ({ className }: { className?: string }) => {
  const circles = new Array(8).fill(1)

  return (
    <div
      className={twMerge(
        'relative flex h-20 w-20 items-center justify-center rounded-full',
        className,
      )}
    >
      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(20deg); }
          to   { transform: rotate(380deg); }
        }
        .animate-radar-spin {
          animation: radar-spin 8s linear infinite;
        }
      `}</style>

      {/* Rotating sweep arm */}
      <div
        style={{ transformOrigin: 'right center' }}
        className="animate-radar-spin absolute right-1/2 top-1/2 z-40 flex
                   h-[5px] w-[400px] items-end justify-center overflow-hidden bg-transparent"
      >
        {/* Terracotta sweep line matching op-accent */}
        <div className="relative z-40 h-[1.5px] w-full bg-gradient-to-r
                        from-transparent via-[#D4622A] to-transparent opacity-80" />
      </div>

      {/* Concentric circles */}
      {circles.map((_, idx) => (
        <Circle
          style={{
            height: `${(idx + 1) * 5}rem`,
            width:  `${(idx + 1) * 5}rem`,
            border: `1px solid rgba(212, 98, 42, ${0.18 - idx * 0.018})`,
          }}
          key={`circle-${idx}`}
          idx={idx}
        />
      ))}
    </div>
  )
}

/* ── Icon container ───────────────────────────────────────────── */
export const IconContainer = ({
  icon,
  text,
  delay,
}: {
  icon?: React.ReactNode
  text?: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: delay ?? 0 }}
      className="relative z-50 flex flex-col items-center justify-center space-y-2"
    >
      {/* Icon badge */}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl
                      border border-white/10 bg-op-dark-2 shadow-[0_0_16px_rgba(212,98,42,0.12)]">
        {icon ?? (
          <svg className="h-6 w-6 text-white/30" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Label */}
      <div className="rounded-lg px-2 py-0.5">
        <p className="text-center text-[10px] font-semibold text-white/40 font-jakarta
                      whitespace-nowrap">
          {text}
        </p>
      </div>
    </motion.div>
  )
}
