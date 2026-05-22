'use client'

import { usePathname } from 'next/navigation'
import Header from './layout/Header'
import Footer from './layout/Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isApp = pathname?.startsWith('/dashboard')
  const isAuth = pathname === '/login' || pathname === '/signup'
  const showMarketing = !isApp && !isAuth

  return (
    <>
      {showMarketing && <Header />}
      {children}
      {showMarketing && <Footer />}
    </>
  )
}
