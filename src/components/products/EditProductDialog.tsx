'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ProductForm, { type ProductFormData } from './ProductForm'
import { updateProduct } from '@/app/actions/products'
import type { Product } from '@/types'

export default function EditProductDialog({ 
  storeId, 
  product, 
  children 
}: { 
  storeId: string
  product: Product
  children: React.ReactNode 
}) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: ProductFormData) => {
    const result = await updateProduct(storeId, product.id, data)
    if (!result.error) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <ProductForm
          defaultValues={{
            name: product.name,
            description: product.description ?? '',
            price: Number(product.price),
            is_available: product.is_available,
          }}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}