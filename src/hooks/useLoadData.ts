import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface UseLoadDataOptions<T> {
  fetchFn: () => Promise<T>
  onError?: (error: Error) => void
  dependencies?: any[]
}

export function useLoadData<T>({ 
  fetchFn, 
  onError,
  dependencies = []
}: UseLoadDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await fetchFn()
        setData(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred')
        setError(error)
        onError?.(error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, dependencies)

  return { data, loading, error, refresh: () => setData(null) }
} 