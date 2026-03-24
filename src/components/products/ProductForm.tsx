'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  price: z.coerce
    .number({ invalid_type_error: 'Enter a valid price' })
    .positive('Price must be greater than $0')
    .min(0.01, 'Price must be at least $0.01'),
  is_available: z.boolean(),
})
export type ProductFormData = z.infer<typeof productSchema>

interface Props {
  defaultValues?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  submitLabel: string
  onCancel: () => void
}

export default function ProductForm({ defaultValues, onSubmit, submitLabel, onCancel }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { is_available: true, ...defaultValues },
  })

  const isAvailable = watch('is_available')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product name *</Label>
        <Input id="name" placeholder="e.g. Classic Burger" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="What makes this dish special?" rows={3} {...register('description')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price ($) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="e.g. 9.99"
          {...register('price')}
        />
        {errors.price && (
          <p className="text-sm text-destructive">{errors.price.message}</p>
        )}
        <p className="text-xs text-muted-foreground">Minimum price is $0.01</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50">
        <div>
          <p className="text-sm font-medium">Available for ordering</p>
          <p className="text-xs text-muted-foreground">Customers can add this item to their cart</p>
        </div>
        <Switch
          checked={isAvailable}
          onCheckedChange={v => setValue('is_available', v)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
