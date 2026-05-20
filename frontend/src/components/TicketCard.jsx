import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

export default function TicketCard({ ticket }) {
  const formattedDate = new Date(ticket.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">#{ticket.ticket_id}</span>
            <span className="text-xs text-gray-400">{ticket.issue_category}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">{ticket.employee_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{ticket.department}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ticket.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">{formattedDate}</span>
        <Link
          to={`/tickets/${ticket.ticket_id}`}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}
