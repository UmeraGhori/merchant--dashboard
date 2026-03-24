'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { TIMEZONES } from '@/types'
import type { Store } from '@/types'

export const storeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
  phone: z.string().min(1, 'Phone is required'),
  timezone: z.string().min(1, 'Timezone is required'),
})
export type StoreFormData = z.infer<typeof storeSchema>

interface Props {
  defaultValues?: Partial<StoreFormData>
  onSubmit: (data: StoreFormData) => Promise<void>
  submitLabel: string
  onCancel: () => void
}

export default function StoreForm({ defaultValues, onSubmit, submitLabel, onCancel }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: { timezone: 'America/New_York', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Store name *</Label>
        <Input id="name" placeholder="e.g. Downtown Bites" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Street address *</Label>
        <Input id="street" placeholder="123 Main St" {...register('street')} />
        {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2 col-span-1">
          <Label htmlFor="city">City *</Label>
          <Input id="city" placeholder="New York" {...register('city')} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input id="state" placeholder="NY" {...register('state')} />
          {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_code">ZIP *</Label>
          <Input id="zip_code" placeholder="10001" {...register('zip_code')} />
          {errors.zip_code && <p className="text-sm text-destructive">{errors.zip_code.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" placeholder="+1 212-555-0100" {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Timezone *</Label>
          <Select defaultValue={defaultValues?.timezone ?? 'America/New_York'} onValueChange={v => setValue('timezone', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
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
