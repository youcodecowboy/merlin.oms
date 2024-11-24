import { supabase } from '@/lib/supabase'
import type { Order, OrderItem } from '@/lib/schema'
import { AppError } from '@/lib/errors'

const MAX_RETRIES = 3
const INITIAL_ORDER_NUMBER = 1000

export class OrderRepository {
  async getMaxOrderNumber(): Promise<number> {
    const { data, error } = await supabase
      .from('orders')
      .select('number')
      .order('number', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No records found
        return INITIAL_ORDER_NUMBER - 1
      }
      throw new AppError('DATABASE_ERROR', 'Failed to get max order number', 500, error)
    }

    return data.number
  }

  async createOrderWithRetry(data: {
    customer_id: string
    order_status: string
    order_items: OrderItem[]
  }, retryCount = 0): Promise<Order> {
    try {
      // Get current max order number
      const maxNumber = await this.getMaxOrderNumber()
      const nextNumber = maxNumber + 1

      // Create order with next number
      const order = await this.createOrder({
        ...data,
        number: nextNumber
      })

      return order
    } catch (error: any) {
      // If unique constraint violation and not exceeded max retries
      if (error.code === '23505' && retryCount < MAX_RETRIES) {
        return this.createOrderWithRetry(data, retryCount + 1)
      }
      throw error
    }
  }

  async createOrder(data: {
    customer_id: string
    number: number
    order_status: string
    order_items: OrderItem[]
  }): Promise<Order> {
    // Start a Supabase transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: data.customer_id,
        number: data.number,
        order_status: data.order_status
      })
      .select()
      .single()

    if (orderError) {
      throw new AppError('DATABASE_ERROR', 'Failed to create order', 500, orderError)
    }

    // Create order items
    const orderItems = data.order_items.map(item => ({
      order_id: order.id,
      ...item
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Attempt to rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      throw new AppError('DATABASE_ERROR', 'Failed to create order items', 500, itemsError)
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      throw new AppError('DATABASE_ERROR', 'Failed to fetch complete order', 500, fetchError)
    }

    return completeOrder
  }

  async findAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError('DATABASE_ERROR', 'Failed to fetch orders', 500, error)
    }

    return data
  }
}