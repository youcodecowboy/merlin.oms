import { useState, useEffect } from 'react'
import { getItemWithRelations, getItemEvents, getItemRequests } from '@/lib/mock-db/queries'
import type { DBInventoryItem, DBRequest, DBEvent } from '@/lib/schema/database'

export function useInventoryData(itemId: string | undefined) {
  const [item, setItem] = useState<DBInventoryItem | null>(null)
  const [activeRequest, setActiveRequest] = useState<DBRequest | null>(null)
  const [events, setEvents] = useState<DBEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get item with relations
        const itemData = await getItemWithRelations(itemId)
        if (!itemData) {
          throw new Error('Item not found')
        }

        setItem(itemData)
        setActiveRequest(itemData.active_request)

        // Get events
        const eventData = await getItemEvents(itemId)
        setEvents(eventData)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [itemId])

  return {
    item,
    activeRequest,
    events,
    loading,
    error
  }
} 