'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types'

export async function updateOrderStatus(storeId: string, orderId: string, status: OrderStatus) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: order, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('merchant_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/stores/${storeId}/orders`)
  return { order }
}
