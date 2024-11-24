import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/schema'

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}