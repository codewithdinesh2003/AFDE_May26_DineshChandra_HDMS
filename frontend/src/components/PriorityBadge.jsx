export default function PriorityBadge({ priority }) {
  const styles = {
    Critical: 'bg-red-100 text-red-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[priority] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {priority}
    </span>
  )
}
