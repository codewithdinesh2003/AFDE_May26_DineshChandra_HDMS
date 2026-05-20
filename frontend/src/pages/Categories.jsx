import { IconTag, IconCircleDot, IconAlertTriangle, IconClock, IconCircleCheck } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  {
    name: 'VPN Issue',
    icon: '🔒',
    description: 'Remote access and VPN connectivity problems.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    dot: 'bg-blue-500',
  },
  {
    name: 'Password Reset',
    icon: '🔑',
    description: 'Expired, forgotten, or locked account credentials.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    dot: 'bg-indigo-500',
  },
  {
    name: 'Software Installation',
    icon: '💿',
    description: 'New software requests or broken application installs.',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    dot: 'bg-violet-500',
  },
  {
    name: 'Laptop Issue',
    icon: '💻',
    description: 'Hardware faults, slow performance, or boot failures.',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    dot: 'bg-amber-500',
  },
  {
    name: 'Email Access',
    icon: '📧',
    description: 'Outlook sync issues, encryption errors, calendar problems.',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    dot: 'bg-orange-500',
  },
  {
    name: 'Network Connectivity',
    icon: '🌐',
    description: 'Internet outages, Wi-Fi drops, RDP timeouts.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    name: 'Hardware Request',
    icon: '🖥️',
    description: 'New equipment requests — monitors, keyboards, headsets.',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    dot: 'bg-rose-500',
  },
]

export default function Categories() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">
          All supported issue categories handled by the IT helpdesk.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map(({ name, icon, description, color, dot }) => (
          <div
            key={name}
            className={`flex items-start gap-4 p-5 rounded-xl border bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="text-2xl leading-none mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <h3 className="text-sm font-semibold text-slate-800">{name}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              <Link
                to={`/tickets?category=${encodeURIComponent(name)}`}
                className="inline-block mt-3 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                View tickets →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <IconTag size={16} />
          <p className="text-sm">
            Category management (add, rename, archive) is coming in a future release.
          </p>
        </div>
      </div>
    </div>
  )
}
