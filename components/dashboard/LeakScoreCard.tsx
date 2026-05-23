import { AlertTriangle, TrendingUp } from 'lucide-react'

const leaks = [
  { label: 'Lead Follow-Up Speed',  score: 38, color: 'bg-red-400'    },
  { label: 'Review System',         score: 55, color: 'bg-op-amber'   },
  { label: 'Estimate Recovery',     score: 31, color: 'bg-red-400'    },
  { label: 'Customer Reactivation', score: 24, color: 'bg-red-400'    },
  { label: 'Invoice Collection',    score: 70, color: 'bg-op-amber'   },
  { label: 'Ad Source Tracking',    score: 62, color: 'bg-yellow-400' },
]

const overall = 48

export default function LeakScoreCard() {
  return (
    <div
      className="relative w-full max-w-xl mx-auto select-none"
      aria-label="Revenue Leak Score preview"
    >
      <div className="bg-white rounded-2xl border border-op-border shadow-[0_24px_80px_rgba(0,0,0,0.13)] overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-op-border bg-op-bg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-op-amber" />
            <span className="text-xs font-semibold font-inter text-op-navy">Revenue Leak Score</span>
          </div>
          <span className="text-[10px] text-op-muted font-inter">Rivera Home Services</span>
        </div>

        <div className="p-5">

          {/* Score hero */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative shrink-0">
              {/* Circular progress ring */}
              <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                <circle cx="40" cy="40" r="33" fill="none" stroke="#E2E8F0" strokeWidth="7" />
                <circle
                  cx="40" cy="40" r="33"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 33}`}
                  strokeDashoffset={`${2 * Math.PI * 33 * (1 - overall / 100)}`}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold font-manrope text-op-navy leading-none">{overall}</span>
                <span className="text-[9px] text-op-muted">/100</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-op-amber uppercase tracking-wide mb-1">High Risk</p>
              <p className="text-sm font-bold font-manrope text-op-navy mb-1">$14,200 at risk / mo</p>
              <p className="text-[11px] text-op-muted leading-relaxed">
                4 of 6 categories need attention.
              </p>
            </div>
          </div>

          {/* Category bars */}
          <div className="flex flex-col gap-3">
            {leaks.map(({ label, score, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-op-body">{label}</span>
                  <span
                    className={`text-[10px] font-semibold ${
                      score < 45 ? 'text-red-500' : score < 65 ? 'text-op-amber' : 'text-op-green'
                    }`}
                  >
                    {score < 45 ? 'High leak' : score < 65 ? 'Watch' : 'OK'}
                  </span>
                </div>
                <div className="w-full bg-op-border rounded-full h-1.5">
                  <div
                    className={`${color} h-1.5 rounded-full transition-all`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Top recommendation */}
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <TrendingUp size={14} className="text-op-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-op-amber mb-0.5">Top fix — biggest impact</p>
              <p className="text-[11px] text-op-body leading-relaxed">
                Activate Lead Follow-Up Agent → estimated +$6,800 / mo recovered
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating "sample" label */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-op-border rounded-full px-3 py-1 shadow-sm">
        <span className="text-[10px] text-op-muted font-inter">Sample score — yours in 2 min</span>
      </div>
    </div>
  )
}
