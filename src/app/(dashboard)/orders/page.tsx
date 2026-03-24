import { createClient } from '@/lib/supabase/server'
import { ShoppingBag } from 'lucide-react'
import OrdersTable from '@/components/orders/OrdersTable'
import OrderFilterTabs from '@/components/orders/OrderFilterTabs'
import type { OrderStatus } from '@/types'

interface Props {
  searchParams: { status?: string }
}

export default async function AllOrdersPage({ searchParams }: Props) {
  const supabase = createClient()
  const currentStatus = searchParams.status as OrderStatus | undefined

  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .order('created_at', { ascending: false })

  // Filtered orders for display
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (currentStatus) {
    query = query.eq('status', currentStatus)
  }

  const { data: orders } = await query

  // Unfiltered for counts
  const { data: allOrders } = await supabase
    .from('orders')
    .select('status, store_id')

  // Build counts map for tabs
  const counts: Record<string, number> = {}
  for (const o of allOrders ?? []) {
    counts[o.status] = (counts[o.status] ?? 0) + 1
  }

  const totalOrders = allOrders?.length ?? 0
  const pendingCount = counts['pending'] ?? 0

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
          <p className="text-muted-foreground mt-1">
            {currentStatus
              ? `Showing ${currentStatus} orders across ${stores?.length ?? 0} stores`
              : `${totalOrders} orders across ${stores?.length ?? 0} stores`
            }
            {!currentStatus && pendingCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">· {pendingCount} pending</span>
            )}
          </p>
        </div>
      </div>

      {/* Client component — no page reload on filter change */}
      <OrderFilterTabs
        currentStatus={currentStatus}
        counts={counts}
        basePath="/orders"
      />

      {(orders ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No orders found</h3>
          <p className="text-muted-foreground text-sm">
            {currentStatus
              ? `No ${currentStatus} orders across any of your stores.`
              : 'Orders will appear here when customers place them.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {(stores ?? []).map(store => {
            const storeOrders = (orders ?? []).filter(o => o.store_id === store.id)
            if (storeOrders.length === 0) return null
            return (
              <div key={store.id}>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-slate-700">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  {store.name}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({storeOrders.length} order{storeOrders.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <OrdersTable
                  orders={storeOrders}
                  storeId={store.id}
                  currentStatus={currentStatus}
                  hideFilterTabs
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
