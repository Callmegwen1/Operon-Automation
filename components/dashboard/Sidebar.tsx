'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Overview'  },
  { href: '/dashboard/agents',   icon: Bot,             label: 'Agents'    },
  { href: '/dashboard/contacts', icon: Users,           label: 'Contacts'  },
  { href: '/dashboard/profile',  icon: User,            label: 'Profile'   },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
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
        <Link href="/" className="inline-block">
          <Image src="/logos/logo-light.png" alt="Operon" width={130} height={32} className="h-8 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-op-blue text-white shadow-sm'
                  : 'text-op-body hover:bg-op-bg hover:text-op-navy'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Scan CTA */}
      <div className="px-3 pb-3">
        <Link
          href="/scanner"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-op-blue bg-blue-50 hover:bg-blue-100 transition-colors"
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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-op-border bg-white flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent />
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
            <SidebarContent onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
