import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  IconPlus, IconSearch, IconEye, IconEdit, IconTrash,
  IconChevronLeft, IconChevronRight, IconTicket,
} from '@tabler/icons-react'
import { getAllTickets, deleteTicket, updateTicket, searchTickets } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { relativeTime, formatTicketId, getInitials } from '../utils/helpers'

const STATUSES    = ['Open', 'In Progress', 'Resolved', 'Closed']
const CATEGORIES  = [
  'VPN Issue', 'Password Reset', 'Software Installation',
  'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request',
]
const PRIORITIES  = ['Low', 'Medium', 'High', 'Critical']
const PAGE_SIZES  = [10, 25, 50]

const EMPTY_FILTERS = { keyword: '', status: '', category: '', priority: '', department: '' }

export default function TicketList() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [tickets,     setTickets]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filters,     setFilters]     = useState(EMPTY_FILTERS)
  const [selected,    setSelected]    = useState(new Set())
  const [page,        setPage]        = useState(1)
  const [pageSize,    setPageSize]    = useState(10)
  const [confirmDel,  setConfirmDel]  = useState(null)   // ticket_id or 'bulk'
  const [bulkWorking, setBulkWorking] = useState(false)

  const load = useCallback(async (f) => {
    setLoading(true)
    const hasFilter = Object.values(f).some(Boolean)
    const { data, error } = hasFilter
      ? await searchTickets(f)
      : await getAllTickets()
    if (error) addToast(error, 'error')
    else setTickets(data)
    setLoading(false)
    setPage(1)
    setSelected(new Set())
  }, [addToast])

  useEffect(() => { load(EMPTY_FILTERS) }, [load])

  const handleFilterChange = (key, val) => {
    const next = { ...filters, [key]: val }
    setFilters(next)
    load(next)
  }

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS)
    load(EMPTY_FILTERS)
  }

  const hasFilter = Object.values(filters).some(Boolean)

  // Pagination
  const totalPages     = Math.max(1, Math.ceil(tickets.length / pageSize))
  const paginated      = useMemo(
    () => tickets.slice((page - 1) * pageSize, page * pageSize),
    [tickets, page, pageSize]
  )
  const startIdx       = tickets.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endIdx         = Math.min(page * pageSize, tickets.length)

  // Selection
  const allPageSelected = paginated.length > 0 && paginated.every((t) => selected.has(t.ticket_id))
  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        paginated.forEach((t) => next.delete(t.ticket_id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        paginated.forEach((t) => next.add(t.ticket_id))
        return next
      })
    }
  }
  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Delete single
  const confirmDelete = (id) => setConfirmDel(id)
  const doDelete = async () => {
    if (confirmDel === 'bulk') {
      setBulkWorking(true)
      let failed = 0
      await Promise.all(
        [...selected].map((id) =>
          deleteTicket(id).then(({ error }) => { if (error) failed++ })
        )
      )
      setBulkWorking(false)
      setConfirmDel(null)
      setSelected(new Set())
      if (failed > 0) addToast(`${failed} deletions failed`, 'error')
      else addToast(`${selected.size} ticket(s) deleted`, 'success')
      load(filters)
    } else {
      const { error } = await deleteTicket(confirmDel)
      setConfirmDel(null)
      if (error) { addToast(error, 'error'); return }
      addToast('Ticket deleted', 'success')
      setTickets((prev) => prev.filter((t) => t.ticket_id !== confirmDel))
    }
  }

  // Bulk resolve
  const bulkResolve = async () => {
    setBulkWorking(true)
    await Promise.all([...selected].map((id) => updateTicket(id, { status: 'Resolved' })))
    setBulkWorking(false)
    addToast(`${selected.size} ticket(s) marked Resolved`, 'success')
    setSelected(new Set())
    load(filters)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">All Tickets</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? '...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <IconPlus size={16} /> New Ticket
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            placeholder="Search by employee, description, keyword..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'status',     opts: STATUSES,   label: 'Status' },
            { key: 'category',   opts: CATEGORIES, label: 'Category' },
            { key: 'priority',   opts: PRIORITIES, label: 'Priority' },
            { key: 'department', opts: [],          label: 'Department', freeText: true },
          ].map(({ key, opts, label, freeText }) =>
            freeText ? (
              <input
                key={key}
                type="text"
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                placeholder="Department..."
                className="input-field w-44 py-1.5 text-xs"
              />
            ) : (
              <select
                key={key}
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="input-field w-44 py-1.5 text-xs"
              >
                <option value="">All {label}s</option>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )
          )}
          {hasFilter && (
            <button onClick={resetFilters} className="btn-ghost py-1.5 text-xs">
              Reset Filters
            </button>
          )}
          {!loading && (
            <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {tickets.length} result{tickets.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selected.size} selected</span>
          <span className="text-blue-200">—</span>
          <button
            onClick={bulkResolve}
            disabled={bulkWorking}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Mark Resolved
          </button>
          <button
            onClick={() => setConfirmDel('bulk')}
            disabled={bulkWorking}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Delete
          </button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Export
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <tbody><SkeletonLoader variant="table-row" rows={8} /></tbody>
          </table>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconTicket}
            title="No tickets found"
            description={hasFilter ? 'Try adjusting your filters.' : 'No tickets have been created yet.'}
            action={
              !hasFilter && (
                <Link to="/tickets/new" className="btn-primary">
                  <IconPlus size={15} /> Create First Ticket
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-5 py-3 text-left">Ticket ID</th>
                  <th className="px-5 py-3 text-left">Employee</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Priority</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((t) => (
                  <tr
                    key={t.ticket_id}
                    className={`group hover:bg-slate-50 transition-colors ${
                      selected.has(t.ticket_id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(t.ticket_id)}
                        onChange={() => toggleRow(t.ticket_id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-blue-600 font-mono">
                        {formatTicketId(t.ticket_id)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {getInitials(t.employee_name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t.employee_name}</p>
                          <p className="text-xs text-slate-400">{t.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{t.department}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{t.issue_category}</td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm text-slate-500 cursor-default"
                        title={new Date(t.created_at).toLocaleString()}
                      >
                        {relativeTime(t.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <IconEye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          title="Edit"
                        >
                          <IconEdit size={15} />
                        </button>
                        <button
                          onClick={() => confirmDelete(t.ticket_id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Showing {startIdx}–{endIdx} of {tickets.length} tickets
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                  className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                >
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 rounded hover:bg-slate-100"
                >
                  <IconChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-600 px-1">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 rounded hover:bg-slate-100"
                >
                  <IconChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title={confirmDel === 'bulk' ? `Delete ${selected.size} tickets?` : 'Delete ticket?'}
        description="This action is permanent and cannot be undone."
        confirmLabel="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}
