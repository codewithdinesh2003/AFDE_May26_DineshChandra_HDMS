import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTicket, updateTicket, deleteTicket } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: '', resolution_notes: '' })
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    getTicket(id)
      .then((res) => {
        setTicket(res.data)
        setUpdateForm({
          status: res.data.status,
          resolution_notes: res.data.resolution_notes || '',
        })
      })
      .catch(() => setError('Ticket not found or failed to load.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setUpdateMsg('')
    setUpdateError('')
    try {
      const res = await updateTicket(id, updateForm)
      setTicket(res.data)
      setUpdateMsg('Ticket updated successfully.')
    } catch {
      setUpdateError('Failed to update ticket.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ticket #${id}? This cannot be undone.`)) return
    try {
      await deleteTicket(id)
      navigate('/tickets')
    } catch {
      alert('Failed to delete ticket.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
        <Link to="/tickets" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800">
          ← Back to All Tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Tickets
        </Link>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete Ticket
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-mono text-gray-400">Ticket #{ticket.ticket_id}</span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{ticket.issue_category}</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</dt>
            <dd className="mt-1 text-gray-900">{ticket.employee_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</dt>
            <dd className="mt-1 text-gray-900">{ticket.department}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</dt>
            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">{ticket.description}</dd>
          </div>
          {ticket.resolution_notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resolution Notes</dt>
              <dd className="mt-1 text-gray-900 whitespace-pre-wrap">{ticket.resolution_notes}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(ticket.created_at).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Edit Ticket</h2>

        {updateMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
            {updateMsg}
          </div>
        )}
        {updateError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {updateError}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={updateForm.status}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
            <textarea
              value={updateForm.resolution_notes}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, resolution_notes: e.target.value }))}
              rows={3}
              placeholder="Add resolution details or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? 'Updating...' : 'Update Ticket'}
          </button>
        </form>
      </div>
    </div>
  )
}
