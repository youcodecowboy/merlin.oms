import { useState, useEffect } from 'react'
import { mockDB } from '@/lib/mock-db/store'
import type { DBOrder, DBCustomer, DBInventoryItem } from '@/lib/schema/database'

interface UseOrderDataReturn {
  order: DBOrder | null
  customer: DBCustomer | null
  items: DBInventoryItem[]
  loading: boolean
  error: string | null
}

export function useOrderData(orderId: string | undefined): UseOrderDataReturn {
  const [order, setOrder] = useState<DBOrder | null>(null)
  const [customer, setCustomer] = useState<DBCustomer | null>(null)
  const [items, setItems] = useState<DBInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return

      try {
        setLoading(true)
        setError(null)

        // Get order
        const foundOrder = mockDB.orders.find(o => o.id === orderId)
        if (!foundOrder) {
          throw new Error('Order not found')
        }
        setOrder(foundOrder)

        // Get customer
        const foundCustomer = mockDB.customers.find(c => c.id === foundOrder.customer_id)
        if (foundCustomer) {
          setCustomer(foundCustomer)
        }

        // Get items
        const orderItems = mockDB.inventory_items.filter(item => item.order_id === orderId)
        setItems(orderItems)

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load order data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [orderId])

  return {
    order,
    customer,
    items,
    loading,
    error
  }
} 