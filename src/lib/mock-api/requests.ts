import { nanoid } from 'nanoid'
import type { Request, RequestEvent, RequestType, Status, Priority } from '../schema'
import { updateMockInventoryItem } from './inventory'
import { handleRequestCompletion } from '../services/production-flow'
import { TeamType } from '@/lib/schema/accounts'

// Map request types to teams
export const REQUEST_TEAM_MAPPING: Record<RequestType, TeamType> = {
  'WASH_REQUEST': 'WASH',
  'QC_REQUEST': 'QC',
  'FINISHING_REQUEST': 'FINISHING',
  'PATTERN_REQUEST': 'PATTERN',
  'MOVE_REQUEST': 'WASH',  // Warehouse team handles moves too
  'STOCK_REQUEST': 'WASH'  // And stock management
}

// Initialize with some mock requests
const defaultRequests: Request[] = []

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
  const assignedTeam = REQUEST_TEAM_MAPPING[data.request_type!]
  
  const request: Request = {
    id: data.id || `REQ-${nanoid(6)}`,
    request_type: data.request_type!,
    status: data.status || 'PENDING',
    priority: data.priority || 'MEDIUM',
    assigned_team: assignedTeam,  // Auto-assign to appropriate team
    steps: data.steps || [],
    inventory_item: data.inventory_item,
    order: data.order,
    customer: data.customer,
    metadata: data.metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
  const request = await createMockRequest({
    id: `PATTERN-${nanoid(6)}`,
    request_type: 'PATTERN_REQUEST',
    status: 'PENDING',
    priority: data.priority as Priority,
    steps: [
      {
        number: 1,
        title: 'Create Pattern',
        description: `Create pattern for ${data.sku}`,
        status: 'PENDING',
        metadata: {
          sku: data.sku,
          quantity: data.quantity
        }
      },
      {
        number: 2,
        title: 'Review Pattern',
        description: 'Review and approve pattern',
        status: 'PENDING'
      },
      {
        number: 3,
        title: 'Submit for Cutting',
        description: 'Submit approved pattern for cutting',
        status: 'PENDING',
        metadata: {
          batch_id: data.batch_id,
          production_batch_id: data.production_batch_id
        }
      }
    ],
    metadata: {
      sku: data.sku,
      quantity: data.quantity,
      batch_id: data.batch_id,
      production_batch_id: data.production_batch_id,
      notes: data.notes
    }
  })

  return request
}

export async function completeRequest(requestId: string): Promise<Request> {
  const request = mockRequests.find(r => r.id === requestId)
  if (!request) throw new Error('Request not found')
  if (!request.inventory_item) throw new Error('No inventory item linked to request')

  const completionTime = new Date().toISOString()

  // Mark request as completed
  const completedRequest = {
    ...request,
    status: 'COMPLETED' as const,
    steps: request.steps?.map(step => ({
      ...step,
      status: 'COMPLETED' as const
    })),
    updated_at: completionTime
  }

  // Handle the request completion and get next stage info
  const { updatedItem, nextRequest } = await handleRequestCompletion(
    completedRequest,
    request.inventory_item
  )

  // Update request in storage - archive the completed request
  mockRequests = mockRequests.map(r => 
    r.id === requestId ? completedRequest : r
  )

  // Add the new request if one was created
  if (nextRequest) {
    mockRequests.push(nextRequest)
  }

  persistData()

  return completedRequest
}

// Export for testing
export { mockRequests }