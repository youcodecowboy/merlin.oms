import { useState, useEffect } from 'react'
import type { Request } from '@/lib/schema'
import { getInventoryItem } from '@/lib/functions/inventory/getInventoryItem'
import { useToast } from '@/components/ui/use-toast'

export function useActiveRequest(itemId: string) {
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchActiveRequest = async () => {
    try {
      setLoading(true)
      setError(null)

      const item = await getInventoryItem(itemId)
      if (!item) {
        throw new Error('Item not found')
      }

      // Find active request
      const activeRequest = item.requests?.find(req => 
        req.status === 'PENDING' || req.status === 'IN_PROGRESS'
      ) || null

      setRequest(activeRequest)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load active request'
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
      fetchActiveRequest()
    }
  }, [itemId])

  return {
    request,
    loading,
    error,
    refresh: fetchActiveRequest
  }
} 