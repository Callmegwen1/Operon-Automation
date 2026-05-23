import type { Metadata } from 'next'
import EmbedForm from './EmbedForm'

export const metadata: Metadata = {
  robots: 'noindex',
}

export default function FormPage({ params, searchParams }: {
  params: { userId: string }
  searchParams: { title?: string; business?: string; color?: string }
}) {
  const { userId } = params
  const title    = searchParams.title    ?? 'Get in Touch'
  const business = searchParams.business ?? ''
  const color    = `#${(searchParams.color ?? '1A2E4A').replace('#', '')}`

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <EmbedForm userId={userId} title={title} business={business} color={color} />
    </div>
  )
}
