import { useState, useEffect } from 'react'
import { IconChartBar, IconTicket, IconCircleCheck, IconClock, IconTrendingUp } from '@tabler/icons-react'
import { getAllTickets } from '../services/api'
import SkeletonLoader from '../components/SkeletonLoader'

const CATEGORY_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500',
]

const DEPT_COLORS = [
  'bg-sky-500', 'bg-teal-500', 'bg-lime-500',
  'bg-fuchsia-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500',
]

function BarChart({ data, colors, maxVal }) {
  if (!data.length) return <p className="text-sm text-slate-400 py-4 text-center">No data</p>
  return (
    <div className="space-y-3">
      {data.map(([label, count], i) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600 truncate max-w-[180px]">{label}</span>
            <span className="text-xs font-semibold text-slate-700 ml-2">{count}</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors[i % colors.length]}`}
              style={{ width: `${(count / maxVal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, 400))
    getAllTickets().then(({ data }) => {
      if (data) setTickets(data)
      min.then(() => setLoading(false))
    })
  }, [])

  const total      = tickets.length
  const open       = tickets.filter((t) => t.status === 'Open').length
  const inProgress = tickets.filter((t) => t.status === 'In Progress').length
  const resolved   = tickets.filter((t) => t.status === 'Resolved').length
  const closed     = tickets.filter((t) => t.status === 'Closed').length
  const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0

  const categoryMap = tickets.reduce((acc, t) => {
    acc[t.issue_category] = (acc[t.issue_category] || 0) + 1
    return acc
  }, {})
  const categoryData = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
  const maxCat = categoryData[0]?.[1] || 1

  const deptMap = tickets.reduce((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + 1
    return acc
  }, {})
  const deptData = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxDept = deptData[0]?.[1] || 1

  const priorityData = [
    { label: 'Critical', count: tickets.filter((t) => t.priority === 'Critical').length, bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50' },
    { label: 'High',     count: tickets.filter((t) => t.priority === 'High').length,     bar: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Medium',   count: tickets.filter((t) => t.priority === 'Medium').length,   bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
    { label: 'Low',      count: tickets.filter((t) => t.priority === 'Low').length,      bar: 'bg-emerald-400',text: 'text-emerald-700',bg: 'bg-emerald-50' },
  ]

  const statusData = [
    { label: 'Open',        count: open,       color: 'bg-blue-500',    pct: total > 0 ? (open / total) * 100 : 0 },
    { label: 'In Progress', count: inProgress, color: 'bg-amber-400',   pct: total > 0 ? (inProgress / total) * 100 : 0 },
    { label: 'Resolved',    count: resolved,   color: 'bg-emerald-500', pct: total > 0 ? (resolved / total) * 100 : 0 },
    { label: 'Closed',      count: closed,     color: 'bg-slate-400',   pct: total > 0 ? (closed / total) * 100 : 0 },
  ]

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader variant="stat-cards" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Summary statistics and ticket distribution overview.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets',     value: total,          icon: <IconTicket size={18} className="text-indigo-600" />,       bg: 'bg-indigo-50', accent: 'border-l-indigo-500' },
          { label: 'Open / In Progress',value: `${open} / ${inProgress}`, icon: <IconClock size={18} className="text-amber-600" />,  bg: 'bg-amber-50',  accent: 'border-l-amber-500' },
          { label: 'Resolved + Closed', value: resolved + closed,          icon: <IconCircleCheck size={18} className="text-emerald-600" />, bg: 'bg-emerald-50', accent: 'border-l-emerald-500' },
          { label: 'Resolution Rate',   value: `${resolutionRate}%`,       icon: <IconTrendingUp size={18} className="text-blue-600" />, bg: 'bg-blue-50', accent: 'border-l-blue-500' },
        ].map(({ label, value, icon, bg, accent }) => (
          <div key={label} className={`bg-white rounded-xl border border-slate-200 p-5 border-l-4 ${accent} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown + Priority breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Status Breakdown</h2>
          {total === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No ticket data</p>
          ) : (
            <>
              <div className="flex h-4 rounded-full overflow-hidden mb-5 gap-px">
                {statusData.map(({ label, pct, color }) =>
                  pct > 0 ? (
                    <div
                      key={label}
                      className={`${color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                      title={`${label}: ${Math.round(pct)}%`}
                    />
                  ) : null
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {statusData.map(({ label, count, color, pct }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${color}`} />
                    <div>
                      <p className="text-xs font-medium text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400">{count} tickets ({Math.round(pct)}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Priority */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Priority Breakdown</h2>
          {total === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No ticket data</p>
          ) : (
            <div className="space-y-3">
              {priorityData.map(({ label, count, bar, text, bg }) => (
                <div key={label} className={`flex items-center gap-3 p-3 rounded-lg ${bg}`}>
                  <span className={`text-sm font-semibold w-20 ${text}`}>{label}</span>
                  <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar} transition-all duration-500`}
                      style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className={`text-sm font-bold w-6 text-right ${text}`}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category + Department distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Tickets by Category</h2>
          <BarChart data={categoryData} colors={CATEGORY_COLORS} maxVal={maxCat} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Tickets by Department</h2>
          <BarChart data={deptData} colors={DEPT_COLORS} maxVal={maxDept} />
        </div>
      </div>

      <div className="card p-4 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <IconChartBar size={16} />
          <p className="text-sm">Advanced analytics with date range filtering is coming in a future release.</p>
        </div>
      </div>
    </div>
  )
}
