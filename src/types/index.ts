export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface Store {
  id: string
  merchant_id: string
  name: string
  street: string
  city: string
  state: string
  zip_code: string
  phone: string
  timezone: string
  is_active: boolean
  created_at: string
  updated_at: string
  // joined aggregates
  product_count?: number
  order_count?: number
}

export interface Product {
  id: string
  store_id: string
  merchant_id: string
  name: string
  description: string | null
  price: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  store_id: string
  merchant_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  status: OrderStatus
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  created_at: string
}

export interface OrderStats {
  total_orders: number
  pending: number
  confirmed: number
  preparing: number
  ready: number
  delivered: number
  cancelled: number
  total_revenue: number
}

export type StoreInsert = Omit<Store, 'id' | 'merchant_id' | 'created_at' | 'updated_at' | 'product_count' | 'order_count'>
export type StoreUpdate = Partial<StoreInsert>
export type ProductInsert = Omit<Product, 'id' | 'merchant_id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<Omit<ProductInsert, 'store_id'>>

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
  'America/Sao_Paulo',
]
