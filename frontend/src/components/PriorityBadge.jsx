const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

const VARIANTS = {
  Critical: { bg: 'bg-red-50 text-red-700',      dot: 'bg-red-500',    pulse: true },
  High:     { bg: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500', pulse: false },
  Medium:   { bg: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500', pulse: false },
  Low:      { bg: 'bg-green-50 text-green-700',   dot: 'bg-green-500',  pulse: false },
}

export default function PriorityBadge({ priority, size = 'md' }) {
  const v = VARIANTS[priority] ?? { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', pulse: false }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${SIZES[size]} ${v.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot} ${v.pulse ? 'pulse-dot' : ''}`} />
      {priority}
    </span>
  )
}
