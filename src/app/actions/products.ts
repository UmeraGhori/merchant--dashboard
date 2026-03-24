'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProductInsert, ProductUpdate } from '@/types'

export async function createProduct(storeId: string, data: Omit<ProductInsert, 'store_id'>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify store belongs to merchant (RLS also handles this)
  const { data: store } = await supabase
    .from('stores').select('id').eq('id', storeId).eq('merchant_id', user.id).single()
  if (!store) return { error: 'Store not found' }

  const { data: product, error } = await supabase
    .from('products')
    .insert({ ...data, store_id: storeId, merchant_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/stores/${storeId}/products`)
  return { product }
}

export async function updateProduct(storeId: string, productId: string, data: ProductUpdate) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: product, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', productId)
    .eq('merchant_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/stores/${storeId}/products`)
  return { product }
}

export async function deleteProduct(storeId: string, productId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('merchant_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/stores/${storeId}/products`)
  return { success: true }
}
