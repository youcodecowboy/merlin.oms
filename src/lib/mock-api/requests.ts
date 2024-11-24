import { nanoid } from 'nanoid'
import type { Request, RequestEvent } from '@/lib/schema'

// Initialize with some mock requests
const defaultRequests: Request[] = [
  {
    id: 'req_001',
    request_type: 'STOCK_PULL',
    status: 'PENDING',
    priority: 'HIGH',
    assigned_team: 'warehouse',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      orderId: 'ord_123',
      orderItemSku: 'ST-32-X-32-IND',
      inventoryId: 'inv_456',
      nextRequestType: 'WASH_TRANSFER'
    },
    events: [
      {
        id: 'evt_001',
        request_id: 'req_001',
        event_type: 'CREATED',
        description: 'Request created',
        created_at: new Date().toISOString()
      }
    ]
  }
]

// Load persisted data or use defaults
const loadPersistedData = () => {
  try {
    const savedRequests = localStorage.getItem('mockRequests')
    return savedRequests ? JSON.parse(savedRequests) : defaultRequests
  } catch (error) {
    console.error('Failed to load requests:', error)
    return defaultRequests
  }
}

// Initialize with persisted or default data
let mockRequests = loadPersistedData()

// Helper function to persist data
const persistData = () => {
  try {
    localStorage.setItem('mockRequests', JSON.stringify(mockRequests))
  } catch (error) {
    console.error('Failed to persist requests:', error)
  }
}

// API Functions
export async function getMockRequests(): Promise<Request[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockRequests
}

export async function createMockRequest(data: Partial<Request>): Promise<Request> {
  const request: Request = {
    id: `req_${nanoid()}`,
    request_type: data.request_type!,
    status: data.status || 'PENDING',
    priority: data.priority || 'MEDIUM',
    assigned_team: data.assigned_team,
    metadata: data.metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    events: [
      {
        id: `evt_${nanoid()}`,
        request_id: `req_${nanoid()}`,
        event_type: 'CREATED',
        description: 'Request created',
        created_at: new Date().toISOString()
      }
    ]
  }

  mockRequests.push(request)
  persistData()
  return request
}

// Add the pattern request creation function
export async function createMockPatternRequest(data: {
  sku: string
  quantity: number
  priority: string
  batch_id: string
  production_batch_id: string
  notes?: string
}): Promise<Request> {
  const request: Request = {
    id: `req_${nanoid()}`,
    request_type: 'PATTERN_REQUEST',
    status: 'PENDING',
    priority: data.priority as Request['priority'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assigned_team: 'pattern',
    metadata: {
      sku: data.sku,
      quantity: data.quantity,
      batch_id: data.batch_id,
      production_batch_id: data.production_batch_id,
      notes: data.notes
    },
    events: [
      {
        id: `evt_${nanoid()}`,
        request_id: `req_${nanoid()}`,
        event_type: 'CREATED',
        description: 'Pattern request created',
        created_at: new Date().toISOString()
      }
    ]
  }

  mockRequests.push(request)
  persistData()
  return request
}

export async function updateMockRequest(id: string, updates: Partial<Request>): Promise<Request> {
  const index = mockRequests.findIndex(request => request.id === id)
  if (index === -1) throw new Error('Request not found')

  // Create event for the update
  const event: RequestEvent = {
    id: `evt_${nanoid()}`,
    request_id: id,
    event_type: 'UPDATED',
    description: updates.status === 'COMPLETED' ? 'Request completed' : 'Request updated',
    user_id: updates.assigned_to,
    created_at: new Date().toISOString()
  }

  mockRequests[index] = {
    ...mockRequests[index],
    ...updates,
    updated_at: new Date().toISOString(),
    events: [...(mockRequests[index].events || []), event]
  }

  persistData()
  return mockRequests[index]
}

export async function assignMockRequest(id: string, userId: string): Promise<Request> {
  const request = await updateMockRequest(id, {
    assigned_to: userId,
    status: 'IN_PROGRESS',
    assigned_at: new Date().toISOString()
  })

  // Add assignment event
  const event: RequestEvent = {
    id: `evt_${nanoid()}`,
    request_id: id,
    event_type: 'ASSIGNED',
    description: `Request assigned to ${userId}`,
    user_id: userId,
    created_at: new Date().toISOString()
  }

  request.events = [...(request.events || []), event]
  persistData()

  return request
}

export async function completeMockRequest(id: string): Promise<Request> {
  return updateMockRequest(id, {
    status: 'COMPLETED'
  })
}

// Export for testing
export { mockRequests }