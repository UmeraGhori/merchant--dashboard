import { createClient } from '@/lib/supabase/server'
import { Plus, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StoreCard from '@/components/stores/StoreCard'
import CreateStoreDialog from '@/components/stores/CreateStoreDialog'

export default async function StoresPage() {
  const supabase = createClient()

  const { data: stores, error } = await supabase
    .from('stores')
    .select(`
      *,
      product_count:products(count),
      order_count:orders(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  // Flatten Supabase aggregate counts
  const storesWithCounts = (stores ?? []).map(s => ({
    ...s,
    product_count: (s.product_count as any)?.[0]?.count ?? 0,
    order_count: (s.order_count as any)?.[0]?.count ?? 0,
  }))

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Stores</h1>
          <p className="text-muted-foreground mt-1">
            {storesWithCounts.length} store{storesWithCounts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <CreateStoreDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Store
          </Button>
        </CreateStoreDialog>
      </div>

      {storesWithCounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No stores yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Create your first store to start managing products and orders.</p>
          <CreateStoreDialog>
            <Button><Plus className="h-4 w-4 mr-2" /> Create store</Button>
          </CreateStoreDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {storesWithCounts.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  )
}
