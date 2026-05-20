const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

const VARIANTS = {
  Open:         { bg: 'bg-blue-50 text-blue-700',    dot: 'bg-blue-500' },
  'In Progress':{ bg: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-500' },
  Resolved:     { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Closed:       { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

export default function StatusBadge({ status, size = 'md' }) {
  const v = VARIANTS[status] ?? { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${SIZES[size]} ${v.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`} />
      {status}
    </span>
  )
}
