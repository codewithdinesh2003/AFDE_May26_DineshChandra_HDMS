import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import TicketList from './pages/TicketList'
import CreateTicket from './pages/CreateTicket'
import TicketDetail from './pages/TicketDetail'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/tickets"      element={<TicketList />} />
            <Route path="/tickets/new"  element={<CreateTicket />} />
            <Route path="/tickets/:id"  element={<TicketDetail />} />
            <Route path="/categories"   element={<Categories />} />
            <Route path="/reports"      element={<Reports />} />
            <Route path="/analytics"    element={<Analytics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
