import { useState, useEffect } from 'react'
import {
  IconTicket,
  IconCircleCheck,
  IconCircleDot,
  IconClock,
  IconTrendingUp,
  IconRefresh,
  IconAlertTriangle,
  IconChartBar,
} from '@tabler/icons-react'
import {
  getAnalyticsSummary,
  getAnalyticsByCategory,
  getAnalyticsByPriority,
  getAnalyticsByDepartment,
  getResolutionTrend,
  getTopIssues,
  runEtlPipeline,
} from '../services/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#f59e0b',
  Low:      '#10b981',
}

const CAT_BARS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500',
]

const CIRCUMFERENCE = 2 * Math.PI * 70   // SVG donut r=70

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function Bone({ cls = '', style }) {
  return <div className={`skeleton-shimmer rounded ${cls}`} style={style} />
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Bone cls="h-7 w-56" />
          <Bone cls="h-4 w-80" />
        </div>
        <Bone cls="h-9 w-28 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-slate-200 space-y-2">
            <Bone cls="h-4 w-28" />
            <Bone cls="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <Bone cls="h-5 w-40" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone cls="h-4 w-28 shrink-0" />
              <Bone cls={`h-5 rounded-full flex-1`} style={{ maxWidth: `${50 + i * 7}%` }} />
              <Bone cls="h-4 w-14 shrink-0" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <Bone cls="h-5 w-40 mb-5" />
          <div className="flex justify-center mb-5">
            <Bone cls="w-48 h-48 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Bone cls="w-3 h-3 rounded-full" />
                <Bone cls="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <Bone cls="h-5 w-64 mb-6" />
        <div className="flex items-end gap-3 h-44">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-1 h-40 w-full">
                <Bone cls="flex-1 rounded-t" style={{ height: `${35 + i * 12}%` }} />
                <Bone cls="flex-1 rounded-t" style={{ height: `${25 + i * 10}%` }} />
              </div>
              <Bone cls="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <Bone cls="h-5 w-48" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50">
              <Bone cls="h-4 w-24" />
              <Bone cls="h-4 w-10" />
              <Bone cls="h-4 w-10" />
              <Bone cls="h-4 w-10" />
              <Bone cls="h-4 flex-1 rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-1">
          <Bone cls="h-5 w-28 mb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="relative flex items-start gap-3 py-3 border-b border-slate-50">
              <Bone cls="h-10 w-8 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Bone cls="h-4 w-40" />
                <Bone cls="h-3 w-32" />
                <Bone cls="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRunEtl, etlRunning }) {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconAlertTriangle size={32} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Analytics Unavailable</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <button
          onClick={onRunEtl}
          disabled={etlRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          <IconRefresh size={16} className={etlRunning ? 'animate-spin' : ''} />
          {etlRunning ? 'Running ETL...' : 'Run ETL Pipeline Now'}
        </button>
      </div>
    </div>
  )
}

// ─── Summary stat cards ───────────────────────────────────────────────────────

function SummaryCards({ summary }) {
  const cards = [
    {
      label: 'Total Tickets',
      value: summary.total_tickets,
      accent: 'border-l-indigo-500',
      iconBg: 'bg-indigo-50',
      icon: <IconTicket size={20} className="text-indigo-600" />,
    },
    {
      label: 'Resolved',
      value: summary.resolved_tickets,
      accent: 'border-l-emerald-500',
      iconBg: 'bg-emerald-50',
      icon: <IconCircleCheck size={20} className="text-emerald-600" />,
    },
    {
      label: 'Open',
      value: summary.open_tickets,
      accent: 'border-l-blue-500',
      iconBg: 'bg-blue-50',
      icon: <IconCircleDot size={20} className="text-blue-600" />,
    },
    {
      label: 'Avg Resolution Time',
      value: `${summary.avg_resolution_days}d`,
      accent: 'border-l-amber-500',
      iconBg: 'bg-amber-50',
      icon: <IconClock size={20} className="text-amber-600" />,
    },
    {
      label: 'Resolution Rate',
      value: `${summary.resolution_rate_percent}%`,
      accent: 'border-l-teal-500',
      iconBg: 'bg-teal-50',
      icon: <IconTrendingUp size={20} className="text-teal-600" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, accent, iconBg, icon }) => (
        <div
          key={label}
          className={`bg-white rounded-xl border border-slate-200 p-5 border-l-4 ${accent} shadow-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
              {icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Category horizontal bar chart ───────────────────────────────────────────

function CategoryBarChart({ categories, animated }) {
  const maxCount = categories[0]?.count || 1
  return (
    <div className="card h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Tickets by Category</h2>
      </div>
      <div className="p-5 space-y-4">
        {categories.map(({ category, count, percentage }, i) => (
          <div key={category} className="flex items-center gap-3">
            <span className="text-[13px] text-slate-700 w-[140px] shrink-0 truncate">{category}</span>
            <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-700 ease-out ${CAT_BARS[i % CAT_BARS.length]}`}
                style={{ width: animated ? `${(count / maxCount) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-[13px] font-semibold text-slate-700 w-[60px] text-right shrink-0">
              {count} <span className="text-slate-400 font-normal text-[11px]">{percentage}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Priority SVG donut chart ─────────────────────────────────────────────────

function PriorityDonut({ priorities }) {
  const total = priorities.reduce((s, p) => s + p.count, 0)

  const segments = priorities.reduce(
    (acc, p) => {
      const len = (p.percentage / 100) * CIRCUMFERENCE
      acc.list.push({ ...p, offset: acc.cum, len })
      acc.cum += len
      return acc
    },
    { list: [], cum: 0 }
  ).list

  return (
    <div className="card h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Priority Distribution</h2>
      </div>
      <div className="p-5 flex flex-col items-center">
        {/* SVG Donut */}
        <div className="relative w-48 h-48">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Track */}
            <circle cx="100" cy="100" r="70" fill="none" stroke="#f1f5f9" strokeWidth="28" />
            {segments.map(({ priority, len, offset }) => (
              <circle
                key={priority}
                cx="100"
                cy="100"
                r="70"
                fill="none"
                strokeWidth="28"
                stroke={PRIORITY_COLORS[priority] || '#94a3b8'}
                strokeDasharray={`${len} ${CIRCUMFERENCE}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-slate-800">{total}</span>
            <span className="text-xs text-slate-500 mt-0.5">tickets</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 w-full space-y-2">
          {priorities.map(({ priority, count, percentage }) => (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[priority] }}
                />
                <span className="text-sm text-slate-700">{priority}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{count}</span>
                <span className="text-xs text-slate-400 w-12 text-right">{percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Resolution trend grouped bar chart ──────────────────────────────────────

function ResolutionTrend({ trend, animated }) {
  const maxVal = Math.max(...trend.flatMap((m) => [m.created, m.resolved]), 1)
  const BAR_MAX_H = 160

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Resolution Trend — Last 6 Months</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-400 shrink-0" />
            <span className="text-xs text-slate-600">Created</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 shrink-0" />
            <span className="text-xs text-slate-600">Resolved</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        {trend.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-slate-400">
            No trend data available
          </div>
        ) : (
          <div className="flex items-end gap-2" style={{ height: `${BAR_MAX_H + 32}px` }}>
            {trend.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div
                  className="flex items-end justify-center gap-1 w-full"
                  style={{ height: `${BAR_MAX_H}px` }}
                >
                  {/* Created bar */}
                  <div className="group relative flex-1 flex items-end justify-center">
                    <div
                      className="w-full bg-blue-400 rounded-t transition-all duration-700 ease-out"
                      style={{
                        height: animated
                          ? `${Math.max((month.created / maxVal) * BAR_MAX_H, 2)}px`
                          : '0px',
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden group-hover:block z-10 pointer-events-none">
                      Created: {month.created}
                    </div>
                  </div>
                  {/* Resolved bar */}
                  <div className="group relative flex-1 flex items-end justify-center">
                    <div
                      className="w-full bg-emerald-400 rounded-t transition-all duration-700 ease-out"
                      style={{
                        height: animated
                          ? `${Math.max((month.resolved / maxVal) * BAR_MAX_H, 2)}px`
                          : '0px',
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden group-hover:block z-10 pointer-events-none">
                      Resolved: {month.resolved}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 text-center truncate w-full px-1">
                  {month.month}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Department performance table ─────────────────────────────────────────────

function rateColor(rate) {
  if (rate >= 70) return 'bg-emerald-500'
  if (rate >= 40) return 'bg-amber-400'
  return 'bg-red-500'
}

function DepartmentTable({ departments }) {
  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Department Performance</h2>
      </div>
      <div className="p-5">
        {/* Header */}
        <div className="grid grid-cols-[1fr_52px_60px_44px_1fr] gap-2 pb-2 mb-1 border-b border-slate-100">
          {['Department', 'Total', 'Resolved', 'Open', 'Resolution Rate'].map((h) => (
            <span key={h} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>
        <div className="space-y-0.5">
          {departments.map(({ department, total, resolved, open, resolution_rate }) => (
            <div
              key={department}
              className="grid grid-cols-[1fr_52px_60px_44px_1fr] gap-2 py-2.5 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-1 px-1 rounded"
            >
              <span className="text-sm font-medium text-slate-700 truncate">{department}</span>
              <span className="text-sm text-slate-600 text-right">{total}</span>
              <span className="text-sm text-emerald-600 font-medium text-right">{resolved}</span>
              <span className="text-sm text-blue-600 text-right">{open}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${rateColor(resolution_rate)}`}
                    style={{ width: `${resolution_rate}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-10 text-right shrink-0">
                  {resolution_rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Top issues ranked list ───────────────────────────────────────────────────

function TopIssues({ issues }) {
  const maxCount = issues[0]?.count || 1
  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Top Issues</h2>
      </div>
      <div className="p-5 space-y-1">
        {issues.map(({ category, count, avg_resolution_days }, i) => (
          <div
            key={category}
            className="relative flex items-start gap-3 py-3 border-b border-slate-50 last:border-0"
          >
            {/* Watermark rank number */}
            <span className="absolute left-0 top-1 text-[48px] font-black text-slate-100 leading-none select-none">
              {i + 1}
            </span>
            <div className="relative pl-10 flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-snug">{category}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {count} tickets &bull; avg {avg_resolution_days} days to resolve
              </p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Analytics page ──────────────────────────────────────────────────────

export default function Analytics() {
  const [summary, setSummary]       = useState(null)
  const [categories, setCategories] = useState([])
  const [priorities, setPriorities] = useState([])
  const [departments, setDepartments] = useState([])
  const [trend, setTrend]           = useState([])
  const [topIssues, setTopIssues]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [etlRunning, setEtlRunning] = useState(false)
  const [animated, setAnimated]     = useState(false)

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (!loading && !error) {
      const t = setTimeout(() => setAnimated(true), 120)
      return () => clearTimeout(t)
    }
  }, [loading, error])

  async function loadAll() {
    setLoading(true)
    setError(null)
    setAnimated(false)

    const [s, c, p, d, t, ti] = await Promise.all([
      getAnalyticsSummary(),
      getAnalyticsByCategory(),
      getAnalyticsByPriority(),
      getAnalyticsByDepartment(),
      getResolutionTrend(),
      getTopIssues(),
    ])

    if (s.error) {
      setError('ETL data not loaded yet — run the pipeline first')
      setLoading(false)
      return
    }

    setSummary(s.data)
    setCategories(c.data || [])
    setPriorities(p.data || [])
    setDepartments(d.data || [])
    setTrend(t.data || [])
    setTopIssues(ti.data || [])
    setLoading(false)
  }

  async function handleRunEtl() {
    setEtlRunning(true)
    const { error: err } = await runEtlPipeline()
    setEtlRunning(false)
    if (!err) await loadAll()
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRunEtl={handleRunEtl} etlRunning={etlRunning} />

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <IconChartBar size={24} className="text-indigo-600" />
            Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Based on {summary.total_tickets} historical tickets imported via ETL pipeline
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {summary.last_imported_at && (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              Last ETL Run: {summary.last_imported_at}
            </span>
          )}
          <button
            onClick={handleRunEtl}
            disabled={etlRunning}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            <IconRefresh size={15} className={etlRunning ? 'animate-spin' : ''} />
            {etlRunning ? 'Running...' : 'Re-run ETL'}
          </button>
        </div>
      </div>

      {/* Row 1 — Summary stat cards */}
      <SummaryCards summary={summary} />

      {/* Row 2 — Category bar chart (60%) + Priority donut (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <CategoryBarChart categories={categories} animated={animated} />
        </div>
        <div className="lg:col-span-2">
          <PriorityDonut priorities={priorities} />
        </div>
      </div>

      {/* Row 3 — Resolution trend (full width) */}
      <ResolutionTrend trend={trend} animated={animated} />

      {/* Row 4 — Department table (50%) + Top issues (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DepartmentTable departments={departments} />
        <TopIssues issues={topIssues} />
      </div>
    </div>
  )
}
