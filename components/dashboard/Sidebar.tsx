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
  Mail,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const AGENTS_HREF = '/dashboard/agents'
const LAST_SEEN_KEY = 'operon_agents_last_seen'

const navItems = [
  { href: '/dashboard',                  icon: LayoutDashboard, label: 'Overview'        },
  { href: '/dashboard/command',          icon: Radar,           label: 'Command Center'  },
  { href: AGENTS_HREF,                   icon: Bot,             label: 'Agents'          },
  { href: '/dashboard/contacts',         icon: Users,           label: 'Contacts'        },
  { href: '/dashboard/scans',            icon: History,         label: 'Scans'           },
  { href: '/dashboard/deliverability',   icon: Mail,            label: 'Email Health'    },
  { href: '/dashboard/admin/analytics',  icon: BarChart2,       label: 'Analytics'       },
  { href: '/dashboard/profile',          icon: User,            label: 'Profile'         },
]

function SidebarContent({
  onClose,
  agentBadge,
  contactsBadge,
}: {
  onClose?: () => void
  agentBadge: number
  contactsBadge: number
}) {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full bg-op-dark">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <Link href="/dashboard" className="inline-block focus-ring rounded-lg" onClick={onClose}>
          <Image
            src="/logos/logo-dark.png"
            alt="Operon"
            width={120}
            height={30}
            className="h-7 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Dashboard navigation">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active     = pathname === href
          const isAgents   = href === AGENTS_HREF
          const isContacts = href === '/dashboard/contacts'

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                          font-jakarta transition-all duration-150 group relative
                          ${active
                            ? 'bg-op-accent text-white'
                            : 'text-white/50 hover:text-white hover:bg-white/6'
                          }`}
            >
              <Icon size={15} className={active ? 'text-white' : 'text-white/40 group-hover:text-white/70'} />
              <span className="flex-1">{label}</span>

              {isAgents && agentBadge > 0 && !active && (
                <span className="w-2 h-2 rounded-full bg-op-forest shrink-0" aria-hidden="true" />
              )}
              {isContacts && contactsBadge > 0 && !active && (
                <span className="min-w-[18px] h-[18px] bg-op-amber text-white text-[10px]
                                 font-bold rounded-full flex items-center justify-center px-1 shrink-0">
                  {contactsBadge > 9 ? '9+' : contactsBadge}
                </span>
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
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold
                     font-jakarta text-op-accent bg-op-accent/10 hover:bg-op-accent/18
                     border border-op-accent/20 transition-all"
        >
          <Zap size={14} />
          Scan My Business
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-white/[0.07]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     font-jakarta text-white/30 hover:text-white/70 hover:bg-white/5
                     transition-all w-full"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen]               = useState(false)
  const [agentBadge, setAgentBadge]   = useState(0)
  const [contactsBadge, setContactsBadge] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const lastSeen = localStorage.getItem(LAST_SEEN_KEY)
      const since = lastSeen ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [{ count: activityCount }, { count: newLeadsCount }] = await Promise.all([
        supabase.from('agent_activity').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).gt('created_at', since),
        supabase.from('contacts').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).eq('status', 'new'),
      ])

      setAgentBadge(activityCount ?? 0)
      setContactsBadge(newLeadsCount ?? 0)
    }
    load()
  }, [])

  useEffect(() => {
    if (pathname === AGENTS_HREF) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString())
      setAgentBadge(0)
    }
    if (pathname === '/dashboard/contacts') {
      setContactsBadge(0)
    }
  }, [pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent agentBadge={agentBadge} contactsBadge={contactsBadge} />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-op-dark border border-white/10
                   rounded-xl flex items-center justify-center shadow-card"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
      >
        {open
          ? <X size={18} className="text-white/70" />
          : <Menu size={18} className="text-white/70" />
        }
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed left-0 top-0 h-full w-56 z-50"
            >
              <SidebarContent
                agentBadge={agentBadge}
                contactsBadge={contactsBadge}
                onClose={() => setOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
