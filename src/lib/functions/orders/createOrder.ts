import { supabase } from '@/lib/supabase'
import type { Order, OrderItem } from '@/lib/schema'

export async function createOrder(data: {
  customer_id: string
  number: number
  order_status: string
  items: OrderItem[]
}): Promise<Order> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: data.customer_id,
      number: data.number,
      order_status: data.order_status
    })
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = data.items.map(item => ({
    order_id: order.id,
    ...item
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  const { data: completeOrder, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .eq('id', order.id)
    .single()

  if (fetchError) throw fetchError
  return completeOrder
}