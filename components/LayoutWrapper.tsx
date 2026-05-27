'use client'

import { usePathname } from 'next/navigation'
import Header from './layout/Header'
import Footer from './layout/Footer'
import AnalyticsInit from './analytics/AnalyticsInit'
import OpeWidget from './chat/OpeWidget'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isApp = pathname?.startsWith('/dashboard')
  const isAuth = pathname === '/login' || pathname === '/signup'
  const showMarketing = !isApp && !isAuth

  return (
    <>
      <AnalyticsInit />
      {showMarketing && <Header />}
      {children}
      {showMarketing && <Footer />}
      {showMarketing && <OpeWidget />}
    </>
  )
}
