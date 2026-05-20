import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconTicket,
  IconPlus,
  IconTag,
  IconChartBar,
  IconUser,
  IconBell,
  IconSearch,
  IconSettings,
  IconMenu2,
  IconChevronRight,
} from '@tabler/icons-react'
import { getAllTickets } from '../services/api'

const NAV = [
  {
    label: 'MAIN MENU',
    items: [
      { to: '/dashboard', icon: IconLayoutDashboard, label: 'Dashboard' },
      { to: '/tickets',   icon: IconTicket,          label: 'All Tickets', badge: true },
      { to: '/tickets/new', icon: IconPlus,          label: 'Create Ticket' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/categories', icon: IconTag,      label: 'Categories' },
      { to: '/reports',    icon: IconChartBar, label: 'Reports' },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { to: '/profile', icon: IconUser, label: 'Profile' },
    ],
  },
]

const BREADCRUMB = {
  '/dashboard':    'Dashboard',
  '/tickets':      'All Tickets',
  '/tickets/new':  'Create Ticket',
  '/categories':   'Categories',
  '/reports':      'Reports',
  '/profile':      'Profile',
}

function getBreadcrumb(pathname) {
  if (/^\/tickets\/\d+$/.test(pathname)) return 'Ticket Detail'
  return BREADCRUMB[pathname] ?? pathname.replace('/', '')
}

export default function AppLayout() {
  const location = useLocation()
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openCount, setOpenCount] = useState(0)

  useEffect(() => {
    getAllTickets().then(({ data }) => {
      if (data) setOpenCount(data.filter((t) => t.status === 'Open').length)
    })
  }, [location.pathname])

  const crumb = getBreadcrumb(location.pathname)

  const SidebarNav = (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
      {NAV.map(({ label, items }) => (
        <div key={label}>
          {expanded && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1.5">
              {label}
            </p>
          )}
          {items.map(({ to, icon: Icon, label: itemLabel, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/tickets'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  'relative flex items-center gap-3 py-2.5 rounded-lg mb-0.5 border-l-[3px] transition-all duration-150',
                  expanded ? 'px-3' : 'px-0 justify-center',
                  isActive
                    ? 'border-blue-500 bg-blue-600/10 text-white'
                    : 'border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200',
                ].join(' ')
              }
            >
              <Icon size={18} className="shrink-0" />
              {expanded && (
                <>
                  <span className="text-sm font-medium flex-1 truncate">{itemLabel}</span>
                  {badge && openCount > 0 && (
                    <span className="text-[11px] font-semibold bg-blue-600 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                      {openCount}
                    </span>
                  )}
                </>
              )}
              {!expanded && badge && openCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )

  const UserCard = (
    <div className={`p-3 border-t border-slate-700/60 ${!expanded ? 'flex justify-center' : ''}`}>
      {expanded ? (
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-700/50 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center shrink-0">
            <span className="text-blue-200 text-xs font-semibold">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Admin User</p>
            <p className="text-slate-400 text-xs truncate">Support Admin</p>
          </div>
          <IconSettings size={14} className="text-slate-500 group-hover:text-slate-300 shrink-0" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500">
          <span className="text-blue-200 text-xs font-semibold">AD</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-slate-900 transition-all duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          expanded ? 'w-64' : 'w-[64px]',
        ].join(' ')}
      >
        {/* Logo */}
        <div
          className={[
            'flex items-center h-16 px-4 border-b border-slate-700/60 shrink-0',
            !expanded ? 'justify-center' : 'gap-3',
          ].join(' ')}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <IconTicket size={16} className="text-white" />
          </div>
          {expanded && (
            <div>
              <p className="text-white text-[15px] font-semibold leading-tight">HelpDesk</p>
              <p className="text-slate-400 text-[11px] leading-tight">HDMS v1.0</p>
            </div>
          )}
        </div>

        {SidebarNav}
        {UserCard}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <IconMenu2 size={20} />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <IconMenu2 size={20} />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm select-none">
              <span className="text-slate-400">HelpDesk</span>
              <IconChevronRight size={13} className="text-slate-300" />
              <span className="text-slate-700 font-medium">{crumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
              <IconSearch size={18} />
            </button>
            <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
              <IconBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="ml-1 w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <span className="text-blue-200 text-xs font-semibold">AD</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
