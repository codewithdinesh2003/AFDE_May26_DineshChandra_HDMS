import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  IconTicket,
  IconCircleDot,
  IconClock,
  IconCircleCheck,
  IconTrendingUp,
  IconArrowRight,
  IconDatabase,
  IconChartBar,
} from '@tabler/icons-react'
import { getAllTickets, getPipelineStatus } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import { relativeTime, formatTicketId } from '../utils/helpers'

const CAT_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500',
]

const PRIORITY_DOT = {
  Critical: 'bg-red-500',
  High:     'bg-orange-400',
  Medium:   'bg-yellow-400',
  Low:      'bg-emerald-400',
}
const PRIORITY_BAR = {
  Critical: 'bg-red-500',
  High:     'bg-orange-400',
  Medium:   'bg-yellow-400',
  Low:      'bg-emerald-400',
}
const STATUS_DOT = {
  Open:        'bg-blue-500',
  'In Progress':'bg-amber-500',
  Resolved:    'bg-emerald-500',
  Closed:      'bg-slate-400',
}

export default function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [pipeline, setPipeline] = useState(null)

  useEffect(() => {
    const minDelay = new Promise((r) => setTimeout(r, 400))
    Promise.all([getAllTickets(), getPipelineStatus()]).then(([ticketsRes, pipelineRes]) => {
      if (ticketsRes.data) setTickets(ticketsRes.data)
      if (pipelineRes.data) setPipeline(pipelineRes.data)
      minDelay.then(() => setLoading(false))
    })
  }, [])

  const total      = tickets.length
  const open       = tickets.filter((t) => t.status === 'Open').length
  const inProgress = tickets.filter((t) => t.status === 'In Progress').length
  const resolved   = tickets.filter((t) => t.status === 'Resolved').length

  const categoryMap = tickets.reduce((acc, t) => {
    acc[t.issue_category] = (acc[t.issue_category] || 0) + 1
    return acc
  }, {})
  const categories  = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
  const maxCat      = categories[0]?.[1] || 1

  const priorityCounts = ['Critical', 'High', 'Medium', 'Low'].map((p) => ({
    label: p,
    count: tickets.filter((t) => t.priority === p).length,
  }))

  const statCards = [
    {
      label: 'Total Tickets', value: total,
      accent: 'border-l-indigo-500', iconBg: 'bg-indigo-50',
      icon: <IconTicket size={20} className="text-indigo-600" />, trend: true,
    },
    {
      label: 'Open', value: open,
      accent: 'border-l-blue-500', iconBg: 'bg-blue-50',
      icon: <IconCircleDot size={20} className="text-blue-600" />,
    },
    {
      label: 'In Progress', value: inProgress,
      accent: 'border-l-amber-500', iconBg: 'bg-amber-50',
      icon: <IconClock size={20} className="text-amber-600" />,
    },
    {
      label: 'Resolved', value: resolved,
      accent: 'border-l-emerald-500', iconBg: 'bg-emerald-50',
      icon: <IconCircleCheck size={20} className="text-emerald-600" />,
    },
  ]

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <div className="skeleton-shimmer h-7 w-64 rounded" />
          <div className="skeleton-shimmer h-4 w-96 rounded mt-2" />
        </div>
        <SkeletonLoader variant="stat-cards" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3"><SkeletonLoader variant="card" /></div>
          <div className="lg:col-span-2"><SkeletonLoader variant="card" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Good morning, Admin 👋</h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening with your support queue today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, accent, iconBg, icon, trend }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border border-slate-200 p-5 border-l-4 ${accent} shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-[32px] font-bold text-slate-900 leading-none mt-1">{value}</p>
                {trend && (
                  <div className="flex items-center gap-1 mt-2">
                    <IconTrendingUp size={13} className="text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-medium">+12% from last week</span>
                  </div>
                )}
              </div>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row — recent tickets + category distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent tickets */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Recent Tickets</h2>
            <Link
              to="/tickets"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              View all <IconArrowRight size={13} />
            </Link>
          </div>

          {tickets.length === 0 ? (
            <EmptyState title="No tickets yet" description="Create a ticket to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-5 py-3 text-left">Ticket</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 6).map((t) => (
                    <tr
                      key={t.ticket_id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Link to={`/tickets/${t.ticket_id}`}>
                          <span className="text-sm font-semibold text-blue-600 font-mono">
                            {formatTicketId(t.ticket_id)}
                          </span>
                          <span className="block text-xs text-slate-400 mt-0.5">{t.employee_name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{t.issue_category}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-400">{relativeTime(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category bar chart */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Ticket Distribution</h2>
          </div>
          <div className="p-5">
            {categories.length === 0 ? (
              <EmptyState title="No data" description="Tickets will appear here." />
            ) : (
              <div className="space-y-4">
                {categories.map(([cat, count], i) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-600 truncate max-w-[150px]">{cat}</span>
                      <span className="text-xs font-semibold text-slate-700 ml-2">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${CAT_COLORS[i % CAT_COLORS.length]}`}
                        style={{ width: `${(count / maxCat) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Pipeline Status */}
      {pipeline && (
        <div className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <IconDatabase size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Data Pipeline Status</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {pipeline.is_healthy ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-600 font-medium">Pipeline healthy</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-xs text-amber-600 font-medium">ETL not yet run</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide">Last Run</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {pipeline.run_at ?? '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide">Rows Loaded</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {pipeline.rows_loaded.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide">Duplicates Removed</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {pipeline.duplicates_removed.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide">Source Rows</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {pipeline.rows_extracted.toLocaleString()}
                </p>
              </div>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <IconChartBar size={15} />
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom row — priority breakdown + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Priority Breakdown</h2>
          {total === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No ticket data</p>
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-px">
                {priorityCounts.map(({ label, count }) => {
                  const pct = total > 0 ? (count / total) * 100 : 0
                  if (pct === 0) return null
                  return (
                    <div
                      key={label}
                      className={`${PRIORITY_BAR[label]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                      title={`${label}: ${count}`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-4">
                {priorityCounts.map(({ label, count }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[label]}`} />
                    <span className="text-xs text-slate-600">
                      {label} <span className="font-semibold text-slate-800">({count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent activity */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h2>
          {tickets.length === 0 ? (
            <EmptyState title="No activity" description="Activity will appear here." />
          ) : (
            <div className="space-y-1">
              {tickets.slice(0, 5).map((t, idx) => (
                <div key={t.ticket_id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center shrink-0 mt-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[t.status] || 'bg-blue-500'}`}
                    />
                    {idx < 4 && <span className="w-px flex-1 bg-slate-100 mt-1 mb-1 min-h-[16px]" />}
                  </div>
                  <div className="pb-3 flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      Ticket{' '}
                      <Link
                        to={`/tickets/${t.ticket_id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {formatTicketId(t.ticket_id)}
                      </Link>{' '}
                      {t.status === 'Open' ? (
                        <>opened by <span className="font-medium">{t.employee_name}</span></>
                      ) : (
                        <>marked <span className="font-medium">{t.status}</span></>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{relativeTime(t.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
