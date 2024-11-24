import { useState, useCallback } from 'react'
import { useToast } from "@/components/ui/use-toast"

interface UseAsyncActionOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  {
    onSuccess,
    onError,
    successMessage,
    errorMessage = "An error occurred. Please try again."
  }: UseAsyncActionOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      try {
        setLoading(true)
        const result = await action(...args)
        
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage
          })
        }
        
        onSuccess?.()
        return result
      } catch (error) {
        console.error('Action failed:', error)
        
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : errorMessage,
          variant: "destructive"
        })
        
        onError?.(error instanceof Error ? error : new Error(errorMessage))
        throw error
      } finally {
        setLoading(false)
      }
    },
    [action, onSuccess, onError, successMessage, errorMessage]
  )

  return {
    execute,
    loading
  }
}