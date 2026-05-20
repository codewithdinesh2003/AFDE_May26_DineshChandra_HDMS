export default function StatusBadge({ status }) {
  const styles = {
    Open: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Resolved: 'bg-green-100 text-green-700',
    Closed: 'bg-gray-100 text-gray-600',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}
