'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  Bot,
  Users,
  History,
  Radar,
  BarChart2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const AGENTS_HREF = '/dashboard/agents'
const LAST_SEEN_KEY = 'operon_agents_last_seen'

const navItems = [
  { href: '/dashboard',                      icon: LayoutDashboard, label: 'Overview'        },
  { href: '/dashboard/command',              icon: Radar,           label: 'Command Center'  },
  { href: AGENTS_HREF,                       icon: Bot,             label: 'Agents'          },
  { href: '/dashboard/contacts',             icon: Users,           label: 'Contacts'        },
  { href: '/dashboard/scans',                icon: History,         label: 'Scans'           },
  { href: '/dashboard/admin/analytics',      icon: BarChart2,       label: 'Analytics'       },
  { href: '/dashboard/profile',              icon: User,            label: 'Profile'         },
]

function SidebarContent({ onClose, agentBadge }: { onClose?: () => void; agentBadge: number }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-op-border">
        <Link href="/dashboard" className="inline-block">
          <Image src="/logos/logo-light.png" alt="Operon" width={130} height={32} className="h-8 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          const isAgents = href === AGENTS_HREF
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-op-navy text-white shadow-sm'
                  : 'text-op-body hover:bg-op-bg hover:text-op-navy'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {isAgents && agentBadge > 0 && !active && (
                <span className="w-2 h-2 rounded-full bg-op-green shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Scan CTA */}
      <div className="px-3 pb-3">
        <Link
          href="/scanner"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-op-navy bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <Zap size={15} />
          Scan My Business
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-op-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-op-muted hover:text-op-red hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [agentBadge, setAgentBadge] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const lastSeen = localStorage.getItem(LAST_SEEN_KEY)
      const since = lastSeen ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { count } = await supabase
        .from('agent_activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', since)

      setAgentBadge(count ?? 0)
    }
    load()
  }, [])

  // Mark agents as seen when user visits /dashboard/agents
  useEffect(() => {
    if (pathname === AGENTS_HREF) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString())
      setAgentBadge(0)
    }
  }, [pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-op-border bg-white flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent agentBadge={agentBadge} />
      </aside>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-op-border rounded-lg flex items-center justify-center shadow-sm"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 h-full w-56 bg-white z-50 border-r border-op-border">
            <SidebarContent agentBadge={agentBadge} onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
