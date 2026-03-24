'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ORDER_STATUSES, STATUS_LABELS } from '@/types'
import type { OrderStatus } from '@/types'

interface Props {
  currentStatus?: string
  counts: Record<string, number>
  basePath: string
}

export default function OrderFilterTabs({ currentStatus, counts, basePath }: Props) {
  const router = useRouter()

  const setFilter = (status: string) => {
    const params = status ? `?status=${status}` : ''
    router.push(`${basePath}${params}`, { scroll: false })
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <button
        onClick={() => setFilter('')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          !currentStatus
            ? 'bg-slate-900 text-white'
            : 'bg-white border hover:bg-slate-50 text-muted-foreground'
        }`}
      >
        All
        <span className="ml-1.5 text-xs opacity-60">({total})</span>
      </button>

      {ORDER_STATUSES.map(s => {
        const count = counts[s] ?? 0
        const isActive = currentStatus === s
        return (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'bg-white border hover:bg-slate-50 text-muted-foreground'
            }`}
          >
            {STATUS_LABELS[s]}
            <span className="ml-1.5 text-xs opacity-60">({count})</span>
          </button>
        )
      })}
    </div>
  )
}
