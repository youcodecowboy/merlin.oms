import { useState, useEffect } from 'react'
import type { Request } from '../types'
import { getInventoryRequests } from '@/lib/functions/inventory/getInventoryRequests'
import { useToast } from '@/components/ui/use-toast'

export function useInventoryRequests(itemId: string) {
  const [allRequests, setAllRequests] = useState<Request[]>([])
  const [activeRequest, setActiveRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const requests = await getInventoryRequests(itemId)
      if (!requests) {
        setAllRequests([])
        setActiveRequest(null)
        return
      }

      setAllRequests(requests)

      // Find the active request
      const active = requests.find(req => 
        req.status === 'PENDING' || req.status === 'IN_PROGRESS'
      )
      setActiveRequest(active || null)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load requests'
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
      fetchRequests()
    }
  }, [itemId])

  return {
    activeRequest,
    allRequests,
    loading,
    error,
    refresh: fetchRequests
  }
} 