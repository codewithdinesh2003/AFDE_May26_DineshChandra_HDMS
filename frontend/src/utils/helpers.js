export function relativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function formatTicketId(id) {
  return `#TK-${String(id).padStart(3, '0')}`
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const SLA_HOURS = 8

export function getSLAInfo(createdAt) {
  const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / 3_600_000
  const pct = Math.min((hoursElapsed / SLA_HOURS) * 100, 100)
  const label =
    hoursElapsed < 1
      ? `${Math.floor(hoursElapsed * 60)}m elapsed`
      : `${hoursElapsed.toFixed(1)}h elapsed`

  if (hoursElapsed >= SLA_HOURS)
    return { pct, label, color: 'text-red-600', barColor: 'bg-red-500', breach: true }
  if (hoursElapsed >= 4)
    return { pct, label, color: 'text-amber-600', barColor: 'bg-amber-500', breach: false }
  return { pct, label, color: 'text-emerald-600', barColor: 'bg-emerald-500', breach: false }
}
