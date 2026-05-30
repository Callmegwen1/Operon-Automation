'use client'

import { usePathname } from 'next/navigation'
import Header from './layout/Header'
import Footer from './layout/Footer'
import AnalyticsInit from './analytics/AnalyticsInit'
import OpeWidget from './chat/OpeWidget'
import Cursor from './ui/Cursor'
import SmoothScroll from './ui/SmoothScroll'
import ScrollProgress from './ui/ScrollProgress'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isApp  = pathname?.startsWith('/dashboard')
  const isAuth = pathname === '/login' || pathname === '/signup'
  const showMarketing = !isApp && !isAuth

  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <Cursor />
      <AnalyticsInit />
      {showMarketing && <Header />}
      {children}
      {showMarketing && <Footer />}
      {!isAuth && <OpeWidget />}
    </>
  )
}
