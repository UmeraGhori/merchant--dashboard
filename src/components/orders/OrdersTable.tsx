'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { updateOrderStatus } from '@/app/actions/orders'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUSES, STATUS_LABELS } from '@/types'
import type { Order, OrderStatus } from '@/types'

const STATUS_BADGE: Record<OrderStatus, 'warning' | 'info' | 'success' | 'muted' | 'destructive' | 'default'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  delivered: 'muted',
  cancelled: 'destructive',
}

interface Props {
  orders: Order[]
  storeId: string
  currentStatus?: string
  hideFilterTabs?: boolean
}

export default function OrdersTable({ orders, storeId, currentStatus, hideFilterTabs = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    setUpdating(order.id)
    await updateOrderStatus(storeId, order.id, status)
    setUpdating(null)
  }

  const setFilter = (status: string) => {
    const params = status ? `?status=${status}` : ''
    router.push(`${pathname}${params}`)
  }

  return (
    <div>
      {/* Status filter tabs — only shown when not hidden (per-store page) */}
      {!hideFilterTabs && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !currentStatus
                ? 'bg-slate-900 text-white'
                : 'bg-white border hover:bg-slate-50 text-muted-foreground'
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                currentStatus === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border hover:bg-slate-50 text-muted-foreground'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <ShoppingBag className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="font-semibold mb-1">No orders found</h3>
          <p className="text-muted-foreground text-sm">
            {currentStatus ? `No ${currentStatus} orders.` : 'Orders will appear here when customers place them.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              {/* Order header row */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors text-left"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)} · #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE[order.status as OrderStatus]}>
                    {STATUS_LABELS[order.status as OrderStatus]}
                  </Badge>
                  <span className="font-bold text-sm ml-auto mr-4">
                    {formatCurrency(Number(order.total_amount))}
                  </span>
                </div>
                <ChevronDown
                  className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200"
                  style={{ transform: expandedId === order.id ? 'rotate(180deg)' : 'none' }}
                />
              </button>

              {/* Expanded detail */}
              {expandedId === order.id && (
                <div className="border-t bg-slate-50/80 px-5 py-4 space-y-4">
                  {/* Customer info */}
                  <div className="flex gap-6 text-sm text-muted-foreground flex-wrap">
                    {order.customer_email && <span>✉ {order.customer_email}</span>}
                    {order.customer_phone && <span>📞 {order.customer_phone}</span>}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Order Items
                    </p>
                    <div className="space-y-1">
                      {(order.order_items ?? []).map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm py-1.5 border-b last:border-0"
                        >
                          <span>{item.quantity}× {item.product_name}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(item.quantity * Number(item.unit_price))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-2 font-bold text-sm">
                      Total: {formatCurrency(Number(order.total_amount))}
                    </div>
                  </div>

                  {/* Status actions */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex gap-2 flex-wrap pt-1">
                      {ORDER_STATUSES
                        .filter(s => s !== order.status && s !== 'pending')
                        .map(s => (
                          <Button
                            key={s}
                            size="sm"
                            variant={s === 'cancelled' ? 'destructive' : 'outline'}
                            disabled={updating === order.id}
                            onClick={() => handleStatusChange(order, s)}
                          >
                            {updating === order.id ? 'Updating…' : `Mark as ${STATUS_LABELS[s]}`}
                          </Button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
