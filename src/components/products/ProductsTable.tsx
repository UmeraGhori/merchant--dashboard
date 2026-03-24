'use client'

import { useState } from 'react'
import { Pencil, Trash2, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import EditProductDialog from './EditProductDialog'
import { deleteProduct, updateProduct } from '@/app/actions/products'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  storeId: string
}

export default function ProductsTable({ products, storeId }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteProduct(storeId, deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const toggleAvailability = async (product: Product) => {
    await updateProduct(storeId, product.id, { is_available: !product.is_available })
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Package className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No products yet</h3>
        <p className="text-muted-foreground text-sm">Add your first product to start receiving orders.</p>
      </div>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50">
              {['Product', 'Price', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-sm">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{product.description}</p>
                  )}
                </td>
                <td className="px-4 py-3.5 font-semibold text-sm">{formatCurrency(Number(product.price))}</td>
                <td className="px-4 py-3.5">
                  <button onClick={() => toggleAvailability(product)} title="Click to toggle" className="cursor-pointer">
                    <Badge variant={product.is_available ? 'success' : 'muted'}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end gap-1">
                    <EditProductDialog storeId={storeId} product={product}>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </EditProductDialog>
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive hover:bg-red-50"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
