import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import PostHogProvider from '@/components/analytics/PostHogProvider'
import MetaPixel from '@/components/analytics/MetaPixel'
import { Analytics } from '@vercel/analytics/react'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Operon Automation | Revenue Recovery Systems for Small Businesses',
  description:
    'Operon helps small businesses find and fix revenue leaks with automation, marketing systems, follow-up tools, review automation, and Revenue Autopilot.',
  keywords: [
    'small business automation',
    'revenue recovery software',
    'revenue leak scanner',
    'lead follow-up automation',
    'review automation',
    'marketing automation for small business',
  ],
  metadataBase: new URL('https://operonauto.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://operonauto.com',
    siteName: 'Operon Automation',
    title: 'Operon Automation | Revenue Recovery Systems for Small Businesses',
    description:
      'Find and fix the leaks costing your business customers. Automation, marketing, and revenue recovery systems for small businesses.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <MetaPixel />
        <PostHogProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  )
}
