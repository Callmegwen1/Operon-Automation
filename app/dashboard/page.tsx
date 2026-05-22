import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { generateLeaks } from '@/lib/leaks'

type Impact = 'low' | 'medium' | 'high'

const impactConfig: Record<Impact, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: 'High Impact',   color: 'text-op-red',   bg: 'bg-red-50',   border: 'border-red-200'   },
  medium: { label: 'Medium Impact', color: 'text-op-amber', bg: 'bg-amber-50', border: 'border-amber-200' },
  low:    { label: 'Low Impact',    color: 'text-op-blue',  bg: 'bg-blue-50',  border: 'border-blue-200'  },
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: scan }, { data: business }, { data: dbLeaks }] = await Promise.all([
    supabase.from('scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('businesses').select('*').eq('user_id', user.id).single(),
    supabase.from('leaks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const businessName = business?.name ?? user.user_metadata?.business_name ?? 'your business'
  const leaks = (dbLeaks && dbLeaks.length > 0) ? dbLeaks : (scan ? generateLeaks(scan) : [])
  const openLeaks = leaks.filter((l: { status?: string }) => l.status !== 'fixed')
  const fixedLeaks = leaks.length - openLeaks.length

  // No scan yet — onboarding state
  if (!scan) {
    return (
      <main className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Zap size={28} className="text-op-blue" />
          </div>
          <h1 className="text-2xl font-bold font-manrope text-op-navy mb-2">
            Welcome to Revenue Autopilot
          </h1>
          <p className="text-op-muted mb-6">
            Run your first Revenue Leak Scan to see exactly where your business may be losing
            customers — and what to do about it.
          </p>
          <Link href="/scanner" className="btn-primary">
            Scan My Business Free <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    )
  }

  const scoreColor =
    scan.score >= 75 ? 'text-op-red' : scan.score >= 55 ? 'text-op-amber' : 'text-op-blue'
  const scoreLabel =
    scan.score >= 75 ? 'Critical Risk' : scan.score >= 55 ? 'High Risk' : 'Moderate Risk'

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-manrope text-op-navy">Revenue Dashboard</h1>
          <p className="text-sm text-op-muted mt-0.5">
            {businessName} · Last scanned{' '}
            {new Date(scan.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link href="/scanner" className="btn-secondary text-sm self-start md:self-auto">
          <Zap size={14} /> Re-scan Business
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">
            Revenue Leak Score
          </p>
          <p className={`text-5xl font-bold font-manrope ${scoreColor}`}>
            {scan.score}
            <span className="text-xl text-op-muted font-normal">/100</span>
          </p>
          <p className={`text-xs font-bold mt-2 ${scoreColor}`}>{scoreLabel}</p>
        </div>

        <div className="card text-center">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">
            Open Leaks
          </p>
          <p className="text-5xl font-bold font-manrope text-op-navy">{openLeaks.length}</p>
          <p className="text-xs font-semibold mt-2 text-op-muted">Need attention</p>
        </div>

        <div className="card text-center">
          <p className="text-xs font-semibold text-op-muted uppercase tracking-wide mb-2">
            Resolved
          </p>
          <p className="text-5xl font-bold font-manrope text-op-green">{fixedLeaks}</p>
          <p className="text-xs font-semibold mt-2 text-op-green">Leaks fixed</p>
        </div>
      </div>

      {/* Revenue Leaks */}
      <div>
        <h2 className="text-lg font-bold font-manrope text-op-navy mb-4">Your Revenue Leaks</h2>

        <div className="flex flex-col gap-3">
          {leaks.map((leak: {
            id?: string
            title: string
            description: string
            impact: Impact
            recommended_fix: string
            status?: string
          }, i: number) => {
            const cfg = impactConfig[leak.impact] ?? impactConfig.medium
            const isFixed = leak.status === 'fixed'

            return (
              <div
                key={leak.id ?? i}
                className={`card border ${cfg.border} ${isFixed ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      {isFixed && (
                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-50 text-op-green">
                          Fixed
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-op-navy mb-1">{leak.title}</h3>
                    <p className="text-sm text-op-muted leading-relaxed">{leak.description}</p>

                    {leak.recommended_fix && (
                      <p className="text-sm text-op-body mt-2">
                        <span className="font-semibold text-op-navy">Fix: </span>
                        {leak.recommended_fix}
                      </p>
                    )}
                  </div>

                  {!isFixed && (
                    <div className="shrink-0">
                      <Link
                        href="/contact"
                        className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
                      >
                        Activate Fix <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
