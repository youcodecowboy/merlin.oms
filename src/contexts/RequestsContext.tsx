import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMockRequests } from '@/lib/mock-api/requests'
import type { Request } from '@/lib/schema'

interface RequestsContextType {
  requests: Request[]
  refreshRequests: () => Promise<void>
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined)

export function RequestsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<Request[]>([])

  const refreshRequests = async () => {
    const data = await getMockRequests()
    setRequests(data)
  }

  useEffect(() => {
    refreshRequests()
  }, [])

  return (
    <RequestsContext.Provider value={{ requests, refreshRequests }}>
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