import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Phone,
  Star,
  FileText,
  RefreshCw,
} from 'lucide-react'

const trendPoints = [28, 22, 35, 30, 42, 38, 55, 50, 62, 58, 70, 74]

function MiniChart() {
  const w = 220
  const h = 60
  const max = Math.max(...trendPoints)
  const min = Math.min(...trendPoints)
  const pad = 4
  const pts = trendPoints
    .map((v, i) => {
      const x = pad + (i / (trendPoints.length - 1)) * (w - pad * 2)
      const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  const fillPts = `${pad},${h} ${pts} ${w - pad},${h}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-hidden="true">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#chartGrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* last dot */}
      <circle
        cx={w - pad}
        cy={h - pad - ((trendPoints[trendPoints.length - 1] - min) / (max - min)) * (h - pad * 2)}
        r="3"
        fill="#2563EB"
      />
    </svg>
  )
}

const activity = [
  { icon: Phone,      label: 'Missed call recovered',    time: '2m ago',  color: 'text-op-green' },
  { icon: Star,       label: 'Review request sent',      time: '14m ago', color: 'text-op-blue'  },
  { icon: FileText,   label: 'Estimate follow-up sent',  time: '1h ago',  color: 'text-op-amber' },
  { icon: RefreshCw,  label: 'Customer reactivated',     time: '3h ago',  color: 'text-op-green' },
  { icon: Bell,       label: 'Invoice reminder sent',    time: '5h ago',  color: 'text-op-muted' },
]

export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none" aria-label="Revenue Autopilot dashboard preview">

      {/* Main dashboard card */}
      <div className="bg-white rounded-2xl border border-op-border shadow-[0_8px_40px_rgba(0,0,0,0.10)] overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-op-border bg-op-bg">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-op-green" />
            <span className="text-xs font-semibold font-inter text-op-navy">Revenue Autopilot</span>
          </div>
          <span className="text-[10px] text-op-muted font-inter">May 1 – May 20, 2025</span>
        </div>

        <div className="p-4">
          {/* Stat cards row */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">

            {/* Leak Found */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} className="text-op-amber" />
                <span className="text-[10px] font-semibold text-op-amber uppercase tracking-wide">Revenue Leak Found</span>
              </div>
              <p className="text-xl font-bold font-manrope text-op-navy">$7,450</p>
              <p className="text-[10px] text-op-muted mt-0.5">Estimated opportunity</p>
            </div>

            {/* Recovered */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} className="text-op-green" />
                <span className="text-[10px] font-semibold text-op-green uppercase tracking-wide">Recovered Revenue</span>
              </div>
              <p className="text-xl font-bold font-manrope text-op-navy">$21,680</p>
              <p className="text-[10px] text-op-muted mt-0.5">This month</p>
            </div>

            {/* Autopilot Active */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={12} className="text-op-blue" />
                <span className="text-[10px] font-semibold text-op-blue uppercase tracking-wide">Autopilot Active</span>
              </div>
              <p className="text-xl font-bold font-manrope text-op-navy">12</p>
              <p className="text-[10px] text-op-muted mt-0.5">Systems running</p>
            </div>

            {/* Needs Attention */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Bell size={12} className="text-op-red" />
                <span className="text-[10px] font-semibold text-op-red uppercase tracking-wide">Needs Attention</span>
              </div>
              <p className="text-xl font-bold font-manrope text-op-navy">3</p>
              <p className="text-[10px] text-op-muted mt-0.5">Items to review</p>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold font-manrope text-op-navy">Revenue Trend</span>
              <span className="text-[10px] text-op-green font-semibold flex items-center gap-0.5">
                <TrendingUp size={10} /> +18.4%
              </span>
            </div>
            <MiniChart />
          </div>

          {/* Recent Activity */}
          <div>
            <span className="text-xs font-semibold font-manrope text-op-navy block mb-2">Recent Activity</span>
            <ul className="flex flex-col gap-1.5">
              {activity.map(({ icon: Icon, label, time, color }) => (
                <li key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={12} className={color} />
                    <span className="text-[11px] text-op-body font-inter">{label}</span>
                  </div>
                  <span className="text-[10px] text-op-muted">{time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Floating score badge */}
      <div className="absolute -top-3 -right-3 bg-op-navy text-white rounded-xl shadow-lg px-3 py-2 flex flex-col items-center">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-white/60">Leak Score</span>
        <span className="text-lg font-bold font-manrope leading-none">68</span>
        <span className="text-[9px] text-white/60">/100</span>
      </div>
    </div>
  )
}
