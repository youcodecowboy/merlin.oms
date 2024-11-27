import { nanoid } from 'nanoid'
import type { PendingProduction } from '@/lib/schema'

// Storage key
const STORAGE_KEY = 'pendingProductionRequests'

// Load persisted data
let pendingRequests: PendingProduction[] = (() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
})()

// Helper to persist data
const persistData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingRequests))
}

export async function createPendingRequest(data: {
  sku: string
  quantity: number
  priority: string
  order_id?: string
  customer_id?: string
  notes?: string
}): Promise<PendingProduction> {
  const request: PendingProduction = {
    id: nanoid(),
    sku: data.sku,
    quantity: data.quantity,
    priority: data.priority,
    status: 'PENDING',
    order_id: data.order_id,
    customer_id: data.customer_id,
    notes: data.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  pendingRequests.push(request)
  persistData()

  return request
}

export async function getPendingRequests(): Promise<PendingProduction[]> {
  return pendingRequests.filter(r => r.status === 'PENDING')
}

export async function updatePendingRequest(
  requestId: string, 
  updates: Partial<PendingProduction>
): Promise<PendingProduction> {
  const request = pendingRequests.find(r => r.id === requestId)
  if (!request) throw new Error('Production request not found')

  const updatedRequest = {
    ...request,
    ...updates,
    updated_at: new Date().toISOString()
  }

  pendingRequests = pendingRequests.map(r => 
    r.id === requestId ? updatedRequest : r
  )
  persistData()

  return updatedRequest
}

// Export for testing
export { pendingRequests } 