function Bone({ className }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-slate-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Bone className="h-4 w-28" />
          <Bone className="h-8 w-16" />
          <Bone className="h-3 w-36" />
        </div>
        <Bone className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  )
}

function TableRowSkeleton({ cols = 8 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <Bone className={`h-4 ${i === 0 ? 'w-5' : i === 1 ? 'w-24' : 'w-full'}`} />
        </td>
      ))}
    </tr>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <Bone className="h-5 w-40" />
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-5/6" />
      <Bone className="h-4 w-3/4" />
    </div>
  )
}

export default function SkeletonLoader({ variant = 'card', rows = 6 }) {
  if (variant === 'stat-cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (variant === 'table-row') {
    return (
      <>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </>
    )
  }

  return <CardSkeleton />
}
