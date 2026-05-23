import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateSubScores } from '@/lib/scanner/subscores'
import { History } from 'lucide-react'

interface ScanRow {
  id: string
  score: number
  runs_ads: string
  uses_crm: string
  manual_follow_up: string
  asks_reviews: string
  tracks_lead_source: string
  biggest_problem: string
  created_at: string
}

function riskLabel(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 75) return { label: 'Critical',  color: 'text-op-red',   bg: 'bg-red-50',    border: 'border-red-200'   }
  if (score >= 55) return { label: 'High',      color: 'text-op-amber', bg: 'bg-amber-50',  border: 'border-amber-200' }
  return                   { label: 'Moderate', color: 'text-op-green', bg: 'bg-green-50',  border: 'border-green-200' }
}

function SubScoreBar({ name, score }: { name: string; score: number }) {
  const color = score >= 65 ? 'bg-op-red' : score >= 35 ? 'bg-op-amber' : 'bg-op-green'
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-op-muted">{name}</span>
        <span className="text-xs font-bold text-op-navy">{score}</span>
      </div>
      <div className="h-1.5 bg-op-bg rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default async function ScansPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: scans } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = (scans ?? []) as ScanRow[]

  return (
    <main className="flex-1 p-6 md:p-8 overflow-auto">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-manrope text-op-navy">Scan History</h1>
          <p className="text-sm text-op-muted mt-0.5">{rows.length} scan{rows.length !== 1 ? 's' : ''} recorded</p>
        </div>

        {rows.length === 0 ? (
          <div className="card text-center py-12">
            <History size={32} className="text-op-muted mx-auto mb-3" />
            <p className="font-semibold text-op-navy mb-1">No scans yet</p>
            <p className="text-sm text-op-muted mb-4">Complete a revenue leak scan to see your history here.</p>
            <a href="/scanner" className="btn-primary text-sm mx-auto">
              Scan My Business
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {rows.map((scan, idx) => {
              const risk = riskLabel(scan.score)
              const subScores = calculateSubScores({
                runsAds:          scan.runs_ads,
                usesCrm:          scan.uses_crm,
                manualFollowUp:   scan.manual_follow_up,
                asksReviews:      scan.asks_reviews,
                tracksLeadSource: scan.tracks_lead_source,
              })
              const date = new Date(scan.created_at)
              const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

              return (
                <div key={scan.id} className="card">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-op-navy">{dateStr}</p>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold text-op-green bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-op-muted">{timeStr}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${risk.color} ${risk.bg} ${risk.border}`}>
                        <span className="text-2xl font-black leading-none">{scan.score}</span>
                        <div>
                          <p className="text-[10px] opacity-70 leading-tight">/ 100</p>
                          <p className="leading-tight">{risk.label}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-score bars */}
                  <div className="border-t border-op-border pt-4 grid gap-2.5">
                    {subScores.map((s) => (
                      <SubScoreBar key={s.name} name={s.name} score={s.score} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
