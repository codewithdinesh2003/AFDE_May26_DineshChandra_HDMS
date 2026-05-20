import { createContext, useContext, useState, useCallback } from 'react'
import {
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

const TYPE_STYLES = {
  success: {
    wrap: 'bg-green-50 border-l-4 border-green-600',
    icon: IconCircleCheck,
    iconClass: 'text-green-600',
    text: 'text-green-800',
  },
  error: {
    wrap: 'bg-red-50 border-l-4 border-red-600',
    icon: IconCircleX,
    iconClass: 'text-red-600',
    text: 'text-red-800',
  },
  info: {
    wrap: 'bg-blue-50 border-l-4 border-blue-600',
    icon: IconInfoCircle,
    iconClass: 'text-blue-600',
    text: 'text-blue-800',
  },
}

function ToastItem({ toast, onRemove }) {
  const s = TYPE_STYLES[toast.type] || TYPE_STYLES.info
  const Icon = s.icon
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg w-80 toast-enter ${s.wrap}`}>
      <Icon size={18} className={`shrink-0 mt-0.5 ${s.iconClass}`} />
      <p className={`text-sm font-medium flex-1 ${s.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-600 shrink-0"
      >
        <IconX size={15} />
      </button>
    </div>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }].slice(-3))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}
