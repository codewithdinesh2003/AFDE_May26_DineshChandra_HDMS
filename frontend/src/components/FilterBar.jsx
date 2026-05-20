import { useState } from 'react'

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
const CATEGORIES = [
  'VPN Issue',
  'Password Reset',
  'Software Installation',
  'Laptop Issue',
  'Email Access',
  'Network Connectivity',
  'Hardware Request',
]
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export default function FilterBar({ filters, onFilter }) {
  const [local, setLocal] = useState(filters)

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...local, [name]: value }
    setLocal(updated)
    onFilter(updated)
  }

  const handleReset = () => {
    const reset = { keyword: '', status: '', category: '', priority: '' }
    setLocal(reset)
    onFilter(reset)
  }

  const hasActiveFilter = Object.values(local).some((v) => v)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            name="keyword"
            value={local.keyword}
            onChange={handleChange}
            placeholder="Name, department, description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            name="status"
            value={local.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[170px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            name="category"
            value={local.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[130px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
          <select
            name="priority"
            value={local.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {hasActiveFilter && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
