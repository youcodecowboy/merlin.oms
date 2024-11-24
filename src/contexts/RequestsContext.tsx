import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMockRequests } from '@/lib/mock-api/requests'
import type { Request } from '@/lib/schema'

interface RequestsContextType {
  requests: Request[]
  loading: boolean
  refresh: () => Promise<void>
  assignRequest: (requestId: string, userId: string) => Promise<void>
  completeRequest: (requestId: string) => Promise<void>
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined)

export function RequestsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      setLoading(true)
      console.log('Loading requests...')
      const result = await getMockRequests()
      console.log('Loaded requests:', result)
      setRequests(result)
    } catch (error) {
      console.error('Failed to load requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const assignRequest = async (requestId: string, userId: string) => {
    // Implementation for assigning requests
  }

  const completeRequest = async (requestId: string) => {
    // Implementation for completing requests
  }

  const value = {
    requests,
    loading,
    refresh: loadRequests,
    assignRequest,
    completeRequest
  }

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  )
}

export function useRequests() {
  const context = useContext(RequestsContext)
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestsProvider')
  }
  return context
} 