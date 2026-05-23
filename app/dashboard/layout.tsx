import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import PendingScanSync from '@/components/dashboard/PendingScanSync'

export const metadata = {
  title: 'Dashboard | Operon Automation',
  robots: 'noindex',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-op-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        <PendingScanSync />
        {children}
      </div>
    </div>
  )
}
