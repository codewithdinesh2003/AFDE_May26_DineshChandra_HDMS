import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllTickets } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

function StatCard({ label, value, icon, colorClass }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data))
      .catch(() => setError('Failed to load tickets'))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  }

  const recentTickets = [...tickets].slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of helpdesk activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Tickets"
          value={counts.total}
          colorClass="text-gray-700"
          icon={
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Open"
          value={counts.open}
          colorClass="text-blue-600"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="In Progress"
          value={counts.inProgress}
          colorClass="text-amber-600"
          icon={
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        />
        <StatCard
          label="Resolved"
          value={counts.resolved}
          colorClass="text-green-600"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No tickets yet. Create your first ticket.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-mono text-gray-500">#{ticket.ticket_id}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{ticket.employee_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{ticket.issue_category}</td>
                    <td className="px-6 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
