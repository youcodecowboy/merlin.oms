import { useState, useEffect } from 'react'
import { mockDB } from '@/lib/mock-db/store'
import type { DBInventoryItem, DBOrder, DBCustomer, DBRequest } from '@/lib/schema/database'

interface UseInventoryItemDataReturn {
  item: DBInventoryItem | null
  order: DBOrder | null
  customer: DBCustomer | null
  activeRequest: DBRequest | null
  events: any[] // We'll type this properly later
  loading: boolean
  error: string | null
}

export function useInventoryItemData(itemId: string | undefined): UseInventoryItemDataReturn {
  const [item, setItem] = useState<DBInventoryItem | null>(null)
  const [order, setOrder] = useState<DBOrder | null>(null)
  const [customer, setCustomer] = useState<DBCustomer | null>(null)
  const [activeRequest, setActiveRequest] = useState<DBRequest | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) return

      try {
        setLoading(true)
        setError(null)

        // Get item
        const foundItem = mockDB.inventory_items.find(i => i.id === itemId)
        if (!foundItem) {
          throw new Error('Item not found')
        }
        setItem(foundItem)

        // If item is assigned, get order and customer
        if (foundItem.status2 === 'ASSIGNED' && foundItem.order_id) {
          const foundOrder = mockDB.orders.find(o => o.id === foundItem.order_id)
          if (foundOrder) {
            setOrder(foundOrder)
            
            // Get customer
            const foundCustomer = mockDB.customers.find(c => c.id === foundOrder.customer_id)
            if (foundCustomer) {
              setCustomer(foundCustomer)
            }
          }
        }

        // Get active request
        const foundRequest = mockDB.requests.find(r => 
          r.item_id === itemId && 
          (r.status === 'PENDING' || r.status === 'IN_PROGRESS')
        )
        setActiveRequest(foundRequest || null)

        // Get events
        const itemEvents = mockDB.events.filter(e => e.item_id === itemId)
        setEvents(itemEvents)

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load item data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [itemId])

  return {
    item,
    order,
    customer,
    activeRequest,
    events,
    loading,
    error
  }
} 