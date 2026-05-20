import { Link } from 'react-router-dom'
import { IconTicket } from '@tabler/icons-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <IconTicket size={30} className="text-blue-300" />
        </div>
        <h1 className="text-5xl font-bold text-slate-200 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Page not found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="btn-primary inline-flex justify-center w-full"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
