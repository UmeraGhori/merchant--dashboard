'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import StoreForm, { type StoreFormData } from './StoreForm'
import { updateStore } from '@/app/actions/stores'
import type { Store } from '@/types'

export default function EditStoreDialog({ store, children }: { store: Store; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: StoreFormData) => {
    const result = await updateStore(store.id, data)
    if (!result.error) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Store</DialogTitle>
        </DialogHeader>
        <StoreForm
          defaultValues={{
            name: store.name, street: store.street, city: store.city,
            state: store.state, zip_code: store.zip_code,
            phone: store.phone, timezone: store.timezone,
          }}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
