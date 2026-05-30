'use client'

import React from 'react'
import { Radar, IconContainer } from '@/components/ui/radar-effect'
import {
  PhoneIncoming,
  Star,
  FileText,
  Users,
  BarChart2,
  Search,
  Zap,
} from 'lucide-react'

const iconClass = 'h-6 w-6 text-op-accent/80'

export default function RadarFeatures() {
  return (
    <div className="relative flex h-[480px] w-full max-w-3xl mx-auto
                    flex-col items-center justify-center overflow-hidden px-4">

      {/* Row 1 — top icons */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex w-full items-center justify-center
                        space-x-10 md:justify-between md:space-x-0">
          <IconContainer
            text="Lead Recovery"
            delay={0.2}
            icon={<PhoneIncoming className={iconClass} />}
          />
          <IconContainer
            text="Review Growth"
            delay={0.4}
            icon={<Star className={iconClass} />}
          />
          <IconContainer
            text="Revenue Scanner"
            delay={0.3}
            icon={<Search className={iconClass} />}
          />
        </div>
      </div>

      {/* Row 2 — middle icons */}
      <div className="mx-auto w-full max-w-md">
        <div className="flex w-full items-center justify-center
                        space-x-10 md:justify-between md:space-x-0">
          <IconContainer
            text="Estimate Recovery"
            delay={0.5}
            icon={<FileText className={iconClass} />}
          />
          <IconContainer
            text="Reactivation"
            delay={0.8}
            icon={<Users className={iconClass} />}
          />
        </div>
      </div>

      {/* Row 3 — bottom icons */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex w-full items-center justify-center
                        space-x-10 md:justify-between md:space-x-0">
          <IconContainer
            text="Weekly Report"
            delay={0.6}
            icon={<BarChart2 className={iconClass} />}
          />
          <IconContainer
            text="Autopilot"
            delay={0.7}
            icon={<Zap className={iconClass} />}
          />
        </div>
      </div>

      {/* Radar centered in all the icons */}
      <Radar className="absolute -bottom-12" />

      {/* Bottom horizon line */}
      <div className="absolute bottom-0 z-[41] h-px w-full
                      bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
