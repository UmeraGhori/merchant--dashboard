import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, ArrowLeft, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductsTable from '@/components/products/ProductsTable'
import CreateProductDialog from '@/components/products/CreateProductDialog'

interface Props {
  params: { storeId: string }
}

export default async function ProductsPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', params.storeId)
    .single()

  if (!store) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', params.storeId)
    .order('created_at', { ascending: false })

  const availableCount = (products ?? []).filter(p => p.is_available).length

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
        <span>Products</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <Badge variant={store.is_active ? 'success' : 'muted'}>
              {store.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {(products ?? []).length} total · <span className="text-green-600 font-medium">{availableCount} available</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/stores/${params.storeId}/orders`}>
              <ShoppingBag className="h-4 w-4 mr-2" /> Orders
            </Link>
          </Button>
          <CreateProductDialog storeId={params.storeId}>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </CreateProductDialog>
        </div>
      </div>

      <ProductsTable products={products ?? []} storeId={params.storeId} />
    </div>
  )
}
