import { useState, useEffect } from 'react'
import { getInventoryItem } from '@/lib/functions/inventory/getInventoryItem'
import { getInventoryEvents } from '@/lib/functions/events/getInventoryEvents'
import type { InventoryItem } from '../types'
import { useToast } from '@/components/ui/use-toast'

interface UseInventoryItemReturn {
  item: InventoryItem | null
  events: any[] // Replace with proper event type from your schema
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useInventoryItem(itemId: string): UseInventoryItemReturn {
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch item details
      const itemData = await getInventoryItem(itemId)
      if (!itemData) {
        throw new Error('Item not found')
      }
      setItem(itemData)

      // Fetch item events
      const eventsData = await getInventoryEvents(itemId)
      setEvents(eventsData || [])

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load item data'
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
      fetchData()
    }
  }, [itemId])

  return {
    item,
    events,
    loading,
    error,
    refresh: fetchData
  }
} 