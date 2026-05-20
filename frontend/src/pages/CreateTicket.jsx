import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  IconSend, IconInfoCircle, IconPaperclip,
  IconShield, IconAlertTriangle, IconAlertCircle, IconCircleCheck,
} from '@tabler/icons-react'
import { createTicket } from '../services/api'
import { useToast } from '../contexts/ToastContext'

const CATEGORIES = [
  'VPN Issue', 'Password Reset', 'Software Installation',
  'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request',
]

const PRIORITY_CARDS = [
  {
    value: 'Low',
    icon: IconCircleCheck,
    iconClass: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    desc: 'Minor issues, not time-sensitive',
  },
  {
    value: 'Medium',
    icon: IconAlertCircle,
    iconClass: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    desc: 'Moderate impact, needs attention',
  },
  {
    value: 'High',
    icon: IconAlertTriangle,
    iconClass: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: 'Significant impact on productivity',
  },
  {
    value: 'Critical',
    icon: IconShield,
    iconClass: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    desc: 'Blocking — requires immediate action',
  },
]

const CATEGORY_GUIDE = [
  { name: 'VPN Issue',             desc: 'Cannot connect to company VPN or remote access problems.' },
  { name: 'Password Reset',        desc: 'Forgot or expired passwords for any company system.' },
  { name: 'Software Installation', desc: 'New software needed or existing software not working.' },
  { name: 'Laptop Issue',          desc: 'Hardware faults, slow performance, boot problems.' },
  { name: 'Email Access',          desc: 'Cannot send/receive email or Outlook configuration.' },
  { name: 'Network Connectivity',  desc: 'No internet, slow network, Wi-Fi issues.' },
  { name: 'Hardware Request',      desc: 'Request for new equipment — mouse, keyboard, monitor.' },
]

const INIT = { employee_name: '', department: '', email: '', issue_category: '', priority: '', description: '' }

export default function CreateTicket() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [form,       setForm]       = useState(INIT)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const MAX_DESC = 500

  const validate = () => {
    const e = {}
    if (!form.employee_name.trim()) e.employee_name = 'Employee name is required'
    if (!form.department.trim())    e.department    = 'Department is required'
    if (!form.issue_category)       e.issue_category = 'Please select a category'
    if (!form.priority)             e.priority      = 'Please select a priority'
    if (!form.description.trim())   e.description   = 'Description is required'
    else if (form.description.trim().length < 10)
                                    e.description   = 'Description must be at least 10 characters'
    return e
  }

  const touch = (field) => {
    const e = validate()
    setErrors((prev) => ({ ...prev, [field]: e[field] || '' }))
  }

  const onChange = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    const payload = { ...form }
    delete payload.email  // not in backend schema
    const { error } = await createTicket(payload)
    setSubmitting(false)
    if (error) { addToast(error, 'error'); return }
    addToast('Ticket submitted successfully!', 'success')
    setTimeout(() => navigate('/tickets'), 800)
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => onChange(key, e.target.value),
    onBlur: () => touch(key),
    className: `input-field ${errors[key] ? 'input-error' : ''}`,
  })

  const isValid = !Object.keys(validate()).length

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ─── Form (65%) ─── */}
        <div className="lg:col-span-2 card p-7">
          <div className="mb-5 pb-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Create Support Ticket</h2>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the details below to submit a new IT support request.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Requester Information */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Requester Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="Full name" {...field('employee_name')} />
                  {errors.employee_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.employee_name}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="e.g. Engineering, HR" {...field('department')} />
                    {errors.department && (
                      <p className="mt-1 text-xs text-red-500">{errors.department}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Email <span className="text-slate-300">(optional)</span></label>
                    <input type="email" placeholder="work@company.com" {...field('email')} />
                  </div>
                </div>
              </div>
            </section>

            {/* Issue Details */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Issue Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    Issue Category <span className="text-red-500">*</span>
                  </label>
                  <select {...field('issue_category')}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.issue_category && (
                    <p className="mt-1 text-xs text-red-500">{errors.issue_category}</p>
                  )}
                </div>

                {/* Priority radio cards */}
                <div>
                  <label className="label">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRIORITY_CARDS.map(({ value, icon: Icon, iconClass, bg, border, desc }) => {
                      const active = form.priority === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onChange('priority', value)}
                          className={[
                            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer',
                            active
                              ? `${bg} border-blue-500 ring-2 ring-blue-200`
                              : `bg-white ${border} hover:${bg}`,
                          ].join(' ')}
                        >
                          <Icon size={22} className={iconClass} />
                          <span className="text-sm font-semibold text-slate-800">{value}</span>
                          <span className="text-[10px] text-slate-500 leading-tight">{desc}</span>
                        </button>
                      )
                    })}
                  </div>
                  {errors.priority && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.priority}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="label">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={5}
                      placeholder="Describe the issue in detail..."
                      maxLength={MAX_DESC}
                      value={form.description}
                      onChange={(e) => onChange('description', e.target.value)}
                      onBlur={() => touch('description')}
                      className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
                    />
                    <span className="absolute bottom-2 right-3 text-[11px] text-slate-400">
                      {form.description.length}/{MAX_DESC}
                    </span>
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Additional */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Additional
              </h3>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 opacity-60 cursor-not-allowed">
                <IconPaperclip size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500">Attach files</span>
                <span className="ml-auto text-[10px] font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
            </section>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Link to="/tickets" className="btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <><IconSend size={15} /> Submit Ticket</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Help panel (35%) ─── */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <IconInfoCircle size={18} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-800">Need help?</h3>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Category Guide
              </p>
              <div className="space-y-2">
                {CATEGORY_GUIDE.map(({ name, desc }) => (
                  <div key={name}>
                    <p className="text-xs font-medium text-slate-700">{name}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Priority Guide
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200">
                    <th className="text-left py-1 font-medium">Level</th>
                    <th className="text-left py-1 font-medium">Use when...</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { p: 'Critical', when: 'System down, total blockage' },
                    { p: 'High',     when: 'Major impact on work' },
                    { p: 'Medium',   when: 'Slows work but workaround exists' },
                    { p: 'Low',      when: 'Cosmetic or nice-to-have' },
                  ].map(({ p, when }) => (
                    <tr key={p}>
                      <td className="py-1.5 font-medium text-slate-700">{p}</td>
                      <td className="py-1.5 text-slate-500">{when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Contact IT Directly
              </p>
              <a
                href="mailto:it-support@company.com"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                it-support@company.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
