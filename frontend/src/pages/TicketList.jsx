import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllTickets, deleteTicket, searchTickets } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import FilterBar from '../components/FilterBar'

export default function TicketList() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ keyword: '', status: '', category: '', priority: '' })

  const fetchTickets = useCallback(async (activeFilters) => {
    setLoading(true)
    setError(null)
    try {
      const hasFilter = Object.values(activeFilters).some((v) => v)
      const res = hasFilter
        ? await searchTickets(activeFilters)
        : await getAllTickets()
      setTickets(res.data)
    } catch {
      setError('Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets(filters)
  }, [])

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
    fetchTickets(newFilters)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete ticket #${id}?`)) return
    try {
      await deleteTicket(id)
      setTickets((prev) => prev.filter((t) => t.ticket_id !== id))
    } catch {
      alert('Failed to delete ticket.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link
          to="/create"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Ticket
        </Link>
      </div>

      <FilterBar filters={filters} onFilter={handleFilter} />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm text-center py-16">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 text-sm">No tickets found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono text-gray-500">#{ticket.ticket_id}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{ticket.employee_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{ticket.department}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{ticket.issue_category}</td>
                    <td className="px-5 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(ticket.ticket_id)}
                          className="text-xs font-medium text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
