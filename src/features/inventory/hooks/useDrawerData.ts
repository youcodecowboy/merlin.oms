import { useState, useEffect } from 'react'
import type { InventoryItem, Request } from '@/lib/schema'
import { getInventoryItem } from '@/lib/functions/inventory/getInventoryItem'
import { getInventoryEvents } from '@/lib/functions/events/getInventoryEvents'
import { getMockInventoryItems } from '@/lib/mock-api/inventory'
import { mockEvents } from '@/lib/mock-api/events'
import { useToast } from '@/components/ui/use-toast'

export function useDrawerData(itemId: string | undefined) {
  const [activeRequest, setActiveRequest] = useState<Request | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    if (!itemId) return

    try {
      setLoading(true)
      
      // Get the inventory items from your mock data
      const items = await getMockInventoryItems()
      const item = items.find(i => i.id === itemId)
      
      if (!item) {
        throw new Error('Item not found')
      }

      // Get active request from the item
      setActiveRequest(item.active_request || null)

      // Get events from your mock data
      const itemEvents = mockEvents.filter(e => e.item_id === itemId)
      setEvents(itemEvents || [])

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data'
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
    fetchData()
  }, [itemId])

  return {
    activeRequest,
    events,
    loading,
    error,
    refresh: fetchData
  }
} 