import { formatCurrency } from '@/lib/utils'
import type { OrderStats as Stats } from '@/types'

export default function OrderStats({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Total Orders', value: stats.total_orders, color: 'text-foreground' },
    { label: 'Pending',      value: stats.pending,      color: 'text-amber-600' },
    { label: 'In Progress',  value: stats.confirmed + stats.preparing + stats.ready, color: 'text-blue-600' },
    { label: 'Delivered',    value: stats.delivered,    color: 'text-green-600' },
    { label: 'Cancelled',    value: stats.cancelled,    color: 'text-red-500' },
    { label: 'Revenue',      value: formatCurrency(stats.total_revenue), color: 'text-green-600' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {items.map(({ label, value, color }) => (
        <div key={label} className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
