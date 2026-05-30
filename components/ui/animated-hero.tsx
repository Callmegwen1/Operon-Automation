'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MoveRight, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0)

  // Revenue-recovery flavored cycling words
  const titles = useMemo(
    () => ['leaking', 'at risk', 'recoverable', 'being lost', 'fixable'],
    [],
  )

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1))
    }, 2200)
    return () => clearTimeout(id)
  }, [titleNumber, titles])

  return (
    <div className="w-full">
      <div className="container-wide mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">

          {/* Eyebrow badge */}
          <div>
            <Button variant="secondary" size="sm" className="gap-3 font-jakarta text-xs">
              Read how it works <MoveRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Headline + cycling word */}
          <div className="flex gap-4 flex-col">
            <h1 className="font-fraunces font-black max-w-2xl tracking-tight text-center text-op-ink"
                style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05 }}>
              <span>Your revenue is</span>
              {/* Cycling word row */}
              <span className="relative flex w-full justify-center overflow-hidden
                               text-center md:pb-4 md:pt-1"
                    style={{ height: 'clamp(52px, 7vw, 88px)' }}>
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-black text-op-accent italic"
                    initial={{ opacity: 0, y: -80 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 16 }}
                    animate={
                      titleNumber === index
                        ? { y: 0,   opacity: 1 }
                        : { y: titleNumber > index ? -120 : 120, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-base md:text-lg leading-relaxed text-op-muted
                          max-w-2xl text-center font-jakarta mx-auto">
              Operon scans your business for revenue leaks — missed leads, cold
              follow-up, weak reviews — and fixes them automatically. Most owners
              recover their first missed opportunity within a week.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-row gap-3 flex-wrap justify-center">
            <Button size="lg" variant="outline" className="gap-3" asChild>
              <Link href="/contact">
                Talk to us <PhoneCall className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" className="gap-3" asChild>
              <Link href="/scanner">
                Scan my business free <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Hero }
