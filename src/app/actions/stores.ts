'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { StoreInsert, StoreUpdate } from '@/types'

export async function createStore(data: StoreInsert) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: store, error } = await supabase
    .from('stores')
    .insert({ ...data, merchant_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/stores')
  return { store }
}

export async function updateStore(id: string, data: StoreUpdate) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: store, error } = await supabase
    .from('stores')
    .update(data)
    .eq('id', id)
    .eq('merchant_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/stores', 'layout')
  revalidatePath('/stores')
  return { store }
}

export async function deactivateStore(id: string) {
  return updateStore(id, { is_active: false })
}

export async function activateStore(id: string) {
  return updateStore(id, { is_active: true })
}

export async function deleteStore(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id)
    .eq('merchant_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/stores')
  return { success: true }
}
