import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import OrdersTable from '@/components/orders/OrdersTable'
import OrderStats from '@/components/orders/OrderStats'
import OrderFilterTabs from '@/components/orders/OrderFilterTabs'
import type { OrderStatus } from '@/types'

interface Props {
  params: { storeId: string }
  searchParams: { status?: string }
}

export default async function OrdersPage({ params, searchParams }: Props) {
  const supabase = createClient()
  const currentStatus = searchParams.status as OrderStatus | undefined

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', params.storeId)
    .single()

  if (!store) notFound()

  // Filtered orders for display
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('store_id', params.storeId)
    .order('created_at', { ascending: false })

  if (currentStatus) {
    query = query.eq('status', currentStatus)
  }

  const { data: orders } = await query

  // Unfiltered for stats + counts
  const { data: allOrders } = await supabase
    .from('orders')
    .select('status, total_amount')
    .eq('store_id', params.storeId)

  // Counts for tabs
  const counts: Record<string, number> = {}
  for (const o of allOrders ?? []) {
    counts[o.status] = (counts[o.status] ?? 0) + 1
  }

  const stats = {
    total_orders: allOrders?.length ?? 0,
    pending: counts['pending'] ?? 0,
    confirmed: counts['confirmed'] ?? 0,
    preparing: counts['preparing'] ?? 0,
    ready: counts['ready'] ?? 0,
    delivered: counts['delivered'] ?? 0,
    cancelled: counts['cancelled'] ?? 0,
    total_revenue: allOrders
      ?.filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0,
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/stores" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Stores
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{store.name}</span>
        <span>/</span>
        <span>Orders</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{store.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/stores/${params.storeId}/products`}>
            <Package className="h-4 w-4 mr-2" /> Products
          </Link>
        </Button>
      </div>

      <OrderStats stats={stats} />

      {/* Client component — no page reload */}
      <OrderFilterTabs
        currentStatus={currentStatus}
        counts={counts}
        basePath={`/stores/${params.storeId}/orders`}
      />

      <OrdersTable
        orders={orders ?? []}
        storeId={params.storeId}
        currentStatus={currentStatus}
        hideFilterTabs
      />
    </div>
  )
}
