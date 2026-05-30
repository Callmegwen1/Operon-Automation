'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const screens = [
  {
    id: 'overview',
    label: 'Revenue Dashboard',
    desc: 'Your Leak Score, open leaks, and health by category — all in one view.',
    src: '/images/dashboard-overview.png',
    width: 971,
    height: 519,
  },
  {
    id: 'command',
    label: 'Command Center',
    desc: 'Real-time view of every lead, follow-up scheduled, and agent currently running.',
    src: '/images/dashboard-command.png',
    width: 1511,
    height: 806,
  },
  {
    id: 'email',
    label: 'Email Health',
    desc: 'One-click deliverability audit so your emails land in inboxes, not spam.',
    src: '/images/dashboard-email-health.png',
    width: 961,
    height: 519,
  },
]

export default function DashboardShowcase() {
  const [active, setActive] = useState(0)
  const current = screens[active]

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 bg-op-surface-2 rounded-xl p-1
                      border border-op-border w-fit mx-auto lg:mx-0 flex-wrap">
        {screens.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={`relative px-4 py-2 rounded-lg text-xs font-semibold font-jakarta
                        transition-all duration-200 whitespace-nowrap ${
              i === active
                ? 'text-white'
                : 'text-op-muted hover:text-op-ink'
            }`}
          >
            {i === active && (
              <motion.span
                layoutId="screenshot-tab"
                className="absolute inset-0 rounded-lg bg-op-accent"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Screenshot frame */}
      <div className="relative rounded-2xl overflow-hidden border border-op-border
                      shadow-card-lg bg-op-surface">

        {/* Browser chrome bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-op-surface-2
                        border-b border-op-border">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          <div className="flex-1 mx-4 bg-op-border/60 rounded-md h-5 flex items-center
                          px-3 max-w-[200px]">
            <span className="text-[10px] text-op-muted font-jakarta truncate">
              app.operonauto.com
            </span>
          </div>
        </div>

        {/* Screenshot */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={current.src}
              alt={current.label}
              width={current.width}
              height={current.height}
              className="w-full h-auto block"
              quality={92}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={current.id + '-desc'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3 text-xs text-op-muted font-jakarta text-center lg:text-left"
        >
          {current.desc}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
