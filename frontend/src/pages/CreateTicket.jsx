import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../services/api'

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

export default function CreateTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    employee_name: '',
    department: '',
    issue_category: '',
    priority: '',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const validate = () => {
    const errs = {}
    if (!form.employee_name.trim()) errs.employee_name = 'Employee name is required'
    if (!form.department.trim()) errs.department = 'Department is required'
    if (!form.issue_category) errs.issue_category = 'Please select a category'
    if (!form.priority) errs.priority = 'Please select a priority'
    if (!form.description.trim()) errs.description = 'Description is required'
    else if (form.description.trim().length < 10)
      errs.description = 'Description must be at least 10 characters'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    try {
      await createTicket(form)
      setSuccessMsg('Ticket submitted successfully! Redirecting...')
      setTimeout(() => navigate('/tickets'), 1500)
    } catch {
      setErrorMsg('Failed to submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
        <p className="text-sm text-gray-500 mt-1">Fill out the form to submit a new helpdesk request</p>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employee_name"
            value={form.employee_name}
            onChange={handleChange}
            placeholder="Enter full name"
            className={inputClass('employee_name')}
          />
          {errors.employee_name && (
            <p className="mt-1 text-xs text-red-500">{errors.employee_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="e.g. Engineering, HR, Finance"
            className={inputClass('department')}
          />
          {errors.department && (
            <p className="mt-1 text-xs text-red-500">{errors.department}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Category <span className="text-red-500">*</span>
            </label>
            <select
              name="issue_category"
              value={form.issue_category}
              onChange={handleChange}
              className={inputClass('issue_category')}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.issue_category && (
              <p className="mt-1 text-xs text-red-500">{errors.issue_category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={inputClass('priority')}
            >
              <option value="">Select priority</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.priority && (
              <p className="mt-1 text-xs text-red-500">{errors.priority}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the issue in detail (min. 10 characters)"
            className={inputClass('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
