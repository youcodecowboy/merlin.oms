import { useState, useEffect } from 'react'
import type { Order, Customer } from '@/lib/schema'
import { getInventoryItem } from '@/lib/functions/inventory/getInventoryItem'
import { useToast } from '@/components/ui/use-toast'

export function useOrderData(itemId: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchOrderData = async () => {
    try {
      setLoading(true)
      setError(null)

      const item = await getInventoryItem(itemId)
      if (!item) {
        throw new Error('Item not found')
      }

      // Only fetch order data if item is assigned
      if (item.status2 === 'ASSIGNED' && item.order) {
        setOrder(item.order)
        setCustomer(item.order.customer || null)
      } else {
        setOrder(null)
        setCustomer(null)
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order data'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (itemId) {
      fetchOrderData()
    }
  }, [itemId])

  return {
    order,
    customer,
    loading,
    error,
    refresh: fetchOrderData
  }
} 