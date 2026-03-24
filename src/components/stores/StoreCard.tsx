'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Phone, Package, ShoppingBag, MoreVertical, Pencil, PowerOff, Power, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import EditStoreDialog from '@/components/stores/EditStoreDialog'
import { deactivateStore, activateStore, deleteStore } from '@/app/actions/stores'
import type { Store } from '@/types'

export default function StoreCard({ store }: { store: Store }) {
  const [showToggle, setShowToggle] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    if (store.is_active) {
      await deactivateStore(store.id)
    } else {
      await activateStore(store.id)
    }
    setToggling(false)
    setShowToggle(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteStore(store.id)
    setDeleting(false)
    setShowDelete(false)
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className={`h-1 ${store.is_active ? 'bg-blue-500' : 'bg-slate-200'}`} />

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/stores/${store.id}/products`}
                className="font-semibold text-lg hover:text-primary transition-colors truncate block"
              >
                {store.name}
              </Link>
              <Badge variant={store.is_active ? 'success' : 'muted'} className="mt-1">
                {store.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <EditStoreDialog store={store}>
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit store
                  </DropdownMenuItem>
                </EditStoreDialog>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={() => setShowToggle(true)}>
                  {store.is_active ? (
                    <><PowerOff className="h-4 w-4 mr-2 text-amber-500" /> Deactivate</>
                  ) : (
                    <><Power className="h-4 w-4 mr-2 text-green-600" /> Activate</>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setShowDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete store
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{store.street}, {store.city}, {store.state} {store.zip_code}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{store.phone}</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t text-sm">
            <Link href={`/stores/${store.id}/products`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Package className="h-3.5 w-3.5" />
              <span><strong className="text-foreground">{store.product_count ?? 0}</strong> products</span>
            </Link>
            <Link href={`/stores/${store.id}/orders`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span><strong className="text-foreground">{store.order_count ?? 0}</strong> orders</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Activate / Deactivate confirm */}
      <AlertDialog open={showToggle} onOpenChange={setShowToggle}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {store.is_active ? 'Deactivate Store' : 'Activate Store'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {store.is_active
                ? `Are you sure you want to deactivate "${store.name}"? It will no longer be visible to customers.`
                : `Are you sure you want to activate "${store.name}"? It will become visible to customers again.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              disabled={toggling}
              className={store.is_active
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            >
              {toggling
                ? (store.is_active ? 'Deactivating…' : 'Activating…')
                : (store.is_active ? 'Deactivate' : 'Activate')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{store.name}</strong>?
              This will also delete all its products and orders. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
