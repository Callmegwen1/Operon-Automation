import type { Metadata } from 'next'
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import PostHogProvider from '@/components/analytics/PostHogProvider'
import MetaPixel from '@/components/analytics/MetaPixel'
import { Analytics } from '@vercel/analytics/react'

// Instrument Serif: contemporary editorial serif — clean confidence without
// Fraunces's optical quirks. Excellent italics for accent moments.
const fraunces = Instrument_Serif({
  subsets:  ['latin'],
  variable: '--font-fraunces',
  display:  'swap',
  weight:   '400',
  style:    ['normal', 'italic'],
})

const jakarta = DM_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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
  icons: {
    icon:             '/icon.png',
    shortcut:         '/icon.png',
    apple:            '/icon.png',
  },
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         'https://operonauto.com',
    siteName:    'Operon Automation',
    title:       'Operon Automation | Revenue Recovery Systems for Small Businesses',
    description: 'Find and fix the leaks costing your business customers. Automation, marketing, and revenue recovery systems for small businesses.',
    images: [{ url: '/images/hero-hvac.png', width: 1280, height: 853, alt: 'Operon Dashboard' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Operon Automation | Revenue Recovery for Small Businesses',
    description: 'Find and fix the leaks costing your business customers.',
    images:      ['/images/hero-hvac.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
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
