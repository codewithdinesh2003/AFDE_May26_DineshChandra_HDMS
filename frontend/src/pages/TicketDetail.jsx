import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  IconChevronLeft, IconCircleCheck, IconUserPlus, IconX, IconTrash,
  IconClock, IconSend, IconMessageCircle,
} from '@tabler/icons-react'
import { getTicket, updateTicket, deleteTicket } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import SkeletonLoader from '../components/SkeletonLoader'
import ConfirmDialog from '../components/ConfirmDialog'
import { relativeTime, formatTicketId, getSLAInfo, getInitials } from '../utils/helpers'

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

function SLATimer({ createdAt, status }) {
  const [info, setInfo] = useState(() => getSLAInfo(createdAt))

  useEffect(() => {
    if (status === 'Resolved' || status === 'Closed') return
    const id = setInterval(() => setInfo(getSLAInfo(createdAt)), 60_000)
    return () => clearInterval(id)
  }, [createdAt, status])

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <IconClock size={16} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800">SLA Timer</h3>
        {info.breach && (
          <span className="ml-auto text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            SLA Breached
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${info.color} mb-1`}>{info.label}</p>
      <p className="text-xs text-slate-400 mb-3">SLA target: 8 hours</p>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${info.barColor}`}
          style={{ width: `${info.pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1.5 text-right">{Math.round(info.pct)}% of SLA used</p>
    </div>
  )
}

function ActivityFeed({ ticket }) {
  const [comment, setComment] = useState('')
  const { addToast } = useToast()

  const timeline = [
    {
      id: 'created',
      dot: 'bg-blue-500',
      text: `Ticket opened by ${ticket.employee_name}`,
      time: ticket.created_at,
    },
    ...(ticket.status !== 'Open'
      ? [{
          id: 'status',
          dot: ticket.status === 'Resolved' ? 'bg-emerald-500'
             : ticket.status === 'Closed'   ? 'bg-slate-400'
             : 'bg-amber-500',
          text: `Status changed to ${ticket.status}`,
          time: ticket.created_at,
        }]
      : []),
  ]

  const handleComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    addToast('Comment feature coming soon', 'info')
    setComment('')
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <IconMessageCircle size={16} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800">Activity &amp; Comments</h3>
      </div>
      <div className="p-5 space-y-1">
        {timeline.map((item, idx) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
              {idx < timeline.length - 1 && (
                <span className="w-px flex-1 bg-slate-100 mt-1 mb-1 min-h-[20px]" />
              )}
            </div>
            <div className="pb-3 flex-1">
              <p className="text-sm text-slate-700">{item.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{relativeTime(item.time)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5">
        <form onSubmit={handleComment} className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-blue-200 text-[10px] font-semibold">AD</span>
          </div>
          <div className="flex-1">
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="input-field resize-none text-sm"
            />
            <button type="submit" className="btn-primary mt-2 text-xs py-1.5 px-3">
              <IconSend size={13} /> Add Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TicketDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { addToast } = useToast()

  const [ticket,    setTicket]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: '', resolution_notes: '' })
  const [saving,    setSaving]    = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [showDel,   setShowDel]   = useState(false)

  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, 400))
    getTicket(id).then(({ data, error: e }) => {
      if (e) { setError(e); min.then(() => setLoading(false)); return }
      setTicket(data)
      setUpdateForm({ status: data.status, resolution_notes: data.resolution_notes || '' })
      min.then(() => setLoading(false))
    })
  }, [id])

  const handleUpdate = async (evt) => {
    evt.preventDefault()
    setSaving(true)
    const { data, error: err } = await updateTicket(id, updateForm)
    setSaving(false)
    if (err) { addToast(err, 'error'); return }
    setTicket(data)
    setLastSaved(new Date())
    addToast('Ticket updated', 'success')
  }

  const doDelete = async () => {
    const { error: err } = await deleteTicket(id)
    if (err) { addToast(err, 'error'); return }
    addToast('Ticket deleted', 'success')
    navigate('/tickets')
  }

  const quickStatus = async (status) => {
    const { data, error: err } = await updateTicket(id, { status })
    if (err) { addToast(err, 'error'); return }
    setTicket(data)
    setUpdateForm((p) => ({ ...p, status }))
    addToast(`Marked ${status}`, 'success')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <SkeletonLoader variant="card" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
          <div className="space-y-4">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="card p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <Link to="/tickets" className="btn-ghost">← Back to All Tickets</Link>
        </div>
      </div>
    )
  }

  const showResolutionNotes = updateForm.status === 'Resolved' || updateForm.status === 'Closed'

  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/tickets" className="hover:text-blue-600 flex items-center gap-1">
          <IconChevronLeft size={14} /> All Tickets
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{formatTicketId(ticket.ticket_id)}</span>
      </div>

      {/* Ticket header card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-blue-600 font-mono">
                {formatTicketId(ticket.ticket_id)}
              </span>
              <StatusBadge status={ticket.status} size="lg" />
              <PriorityBadge priority={ticket.priority} size="lg" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">{ticket.issue_category}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Created by <span className="font-medium text-slate-700">{ticket.employee_name}</span>
              {' '}•{' '}{ticket.department}
              {' '}•{' '}{relativeTime(ticket.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {ticket.status !== 'Resolved' && (
              <button
                onClick={() => quickStatus('Resolved')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <IconCircleCheck size={14} /> Mark Resolved
              </button>
            )}
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <IconUserPlus size={14} /> Assign
            </button>
            {ticket.status !== 'Closed' && (
              <button
                onClick={() => quickStatus('Closed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <IconX size={14} /> Close Ticket
              </button>
            )}
            <button
              onClick={() => setShowDel(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <IconTrash size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Body: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left — description + activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
          <ActivityFeed ticket={ticket} />
        </div>

        {/* Right — details + update + SLA */}
        <div className="space-y-4">
          {/* Ticket details */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Ticket Details</h3>
            </div>
            <dl className="divide-y divide-slate-100">
              {[
                ['Ticket ID',   formatTicketId(ticket.ticket_id)],
                ['Employee',    ticket.employee_name],
                ['Department',  ticket.department],
                ['Category',    ticket.issue_category],
                ['Created',     new Date(ticket.created_at).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between px-5 py-2.5 gap-4">
                  <dt className="text-xs text-slate-400 font-medium shrink-0">{label}</dt>
                  <dd className="text-xs text-slate-700 font-medium text-right">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-2.5">
                <dt className="text-xs text-slate-400 font-medium">Priority</dt>
                <dd><PriorityBadge priority={ticket.priority} size="sm" /></dd>
              </div>
              <div className="flex items-center justify-between px-5 py-2.5">
                <dt className="text-xs text-slate-400 font-medium">Status</dt>
                <dd><StatusBadge status={ticket.status} size="sm" /></dd>
              </div>
            </dl>
          </div>

          {/* Update status */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Update Status</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm((p) => ({ ...p, status: e.target.value }))}
                className="input-field"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {showResolutionNotes && (
                <textarea
                  rows={3}
                  placeholder="Resolution notes..."
                  value={updateForm.resolution_notes}
                  onChange={(e) => setUpdateForm((p) => ({ ...p, resolution_notes: e.target.value }))}
                  className="input-field resize-none text-sm"
                />
              )}

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Save Changes'}
              </button>

              {lastSaved && (
                <p className="text-xs text-slate-400 text-center">
                  Last saved {relativeTime(lastSaved)}
                </p>
              )}
            </form>
          </div>

          {/* SLA timer */}
          <SLATimer createdAt={ticket.created_at} status={ticket.status} />
        </div>
      </div>

      <ConfirmDialog
        open={showDel}
        title={`Delete ${formatTicketId(ticket.ticket_id)}?`}
        description="This ticket will be permanently removed and cannot be recovered."
        confirmLabel="Delete Ticket"
        onConfirm={doDelete}
        onCancel={() => setShowDel(false)}
      />
    </div>
  )
}
