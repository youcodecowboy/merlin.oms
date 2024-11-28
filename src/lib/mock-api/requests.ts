import { nanoid } from 'nanoid'
import type { 
  Request, 
  RequestStep, 
  InventoryItem, 
  Status1, 
  Status2 
} from '../types'
import { mockDB, createEvent } from '../mock-db/store'
import { validateStatus1Transition } from '../utils/validation'

// Request Type Definitions
export type RequestType = 
  | 'WASH_REQUEST'
  | 'MOVE_REQUEST'
  | 'PATTERN_REQUEST'
  | 'QR_ACTIVATION'
  | 'CUTTING_REQUEST'
  | 'QC_REQUEST'
  | 'FINISHING_REQUEST'
  | 'PACKING_REQUEST'

export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

// Request Creation
interface CreateRequestParams {
  type: RequestType
  priority?: Priority
  inventory_item?: InventoryItem
  metadata?: Record<string, any>
}

export async function createRequest(params: CreateRequestParams): Promise<Request> {
  // Get steps for this request type
  const steps = getRequestSteps(params.type)
  
  const request: Request = {
    id: `REQ-${nanoid(6)}`,
    type: params.type,
    status: 'PENDING',
    priority: params.priority || 'MEDIUM',
    steps,
    inventory_item: params.inventory_item,
    metadata: params.metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Log request creation
  await createEvent({
    event_type: 'REQUEST_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      request_id: request.id,
      request_type: request.type,
      priority: request.priority,
      item_id: params.inventory_item?.id
    }
  })

  mockDB.requests.push(request)
  return request
}

export async function createMockRequest(params: CreateRequestParams): Promise<Request> {
  const request = await createRequest(params)
  
  // Log request creation
  await createEvent({
    event_type: 'REQUEST_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      request_id: request.id,
      request_type: request.type,
      priority: request.priority,
      item_id: params.inventory_item?.id
    }
  })

  return request
}

// Step Management
interface StepUpdateParams {
  stepId: number
  status: 'pending' | 'in_progress' | 'completed'
  metadata?: Record<string, any>
}

export async function updateRequestSteps(
  requestId: string,
  updates: StepUpdateParams[]
): Promise<Request> {
  const request = mockDB.requests.find(r => r.id === requestId)
  if (!request) throw new Error('Request not found')

  // Validate step updates
  validateStepUpdates(request, updates)

  // Update steps
  const updatedSteps = request.steps.map(step => {
    const update = updates.find(u => u.stepId === step.id)
    if (update) {
      return {
        ...step,
        status: update.status,
        metadata: { ...step.metadata, ...update.metadata }
      }
    }
    return step
  })

  // Check if all steps are complete
  const allComplete = updatedSteps.every(step => step.status === 'completed')
  const newStatus = allComplete ? 'COMPLETED' : request.status

  // Update request
  const updatedRequest = {
    ...request,
    steps: updatedSteps,
    status: newStatus,
    updated_at: new Date().toISOString()
  }

  // Log step updates
  await createEvent({
    event_type: 'REQUEST_STEPS_UPDATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      request_id: requestId,
      updates,
      all_complete: allComplete,
      new_status: newStatus
    }
  })

  // If completed, trigger next actions
  if (allComplete) {
    await handleRequestCompletion(updatedRequest)
  }

  // Update in storage
  mockDB.requests = mockDB.requests.map(r =>
    r.id === requestId ? updatedRequest : r
  )

  return updatedRequest
}

// Request Completion Handler
async function handleRequestCompletion(request: Request): Promise<void> {
  const { type, inventory_item } = request
  if (!inventory_item) return

  switch (type) {
    case 'WASH_REQUEST':
      await handleWashCompletion(inventory_item)
      break
    case 'QC_REQUEST':
      await handleQCCompletion(inventory_item)
      break
    case 'PATTERN_REQUEST':
      await handlePatternCompletion(request)
      break
    // Add other request type handlers...
  }
}

// Helper Functions
function getRequestSteps(type: RequestType): RequestStep[] {
  switch (type) {
    case 'WASH_REQUEST':
      return [
        {
          id: 1,
          title: 'Find Unit',
          description: 'Locate and scan unit in current location',
          status: 'pending',
          requiresScan: true
        },
        {
          id: 2,
          title: 'Transport to Wash Bin',
          description: 'Transport to assigned wash bin',
          status: 'pending',
          requiresScan: true
        },
        {
          id: 3,
          title: 'Confirm Placement',
          description: 'Place unit in bin and confirm',
          status: 'pending',
          requiresScan: true
        }
      ]
    // Add other request type steps...
    default:
      return []
  }
}

function validateStepUpdates(request: Request, updates: StepUpdateParams[]): void {
  // Ensure steps exist
  updates.forEach(update => {
    const stepExists = request.steps.some(step => step.id === update.stepId)
    if (!stepExists) {
      throw new Error(`Step ${update.stepId} not found in request ${request.id}`)
    }
  })

  // Validate step order
  const currentStep = getCurrentStep(request)
  updates.forEach(update => {
    if (update.stepId < currentStep) {
      throw new Error('Cannot update completed steps')
    }
  })
}

function getCurrentStep(request: Request): number {
  const lastCompleted = request.steps
    .filter(step => step.status === 'completed')
    .map(step => step.id)
    .sort((a, b) => b - a)[0]

  return lastCompleted ? lastCompleted + 1 : 1
}

// Completion Handlers
async function handleWashCompletion(item: InventoryItem): Promise<void> {
  // Update item status
  await updateItemStatus(item.id, {
    status1: 'QC' as Status1,
    location: 'QC_AREA'
  })

  // Generate QC request
  await createRequest({
    type: 'QC_REQUEST',
    priority: 'HIGH',
    inventory_item: item,
    metadata: {
      previous_status: 'WASH',
      notes: 'Post-wash QC check required'
    }
  })
}

// Add other completion handlers...

interface RequestFilters {
  type?: RequestType
  status?: RequestStatus
  priority?: Priority
  inventory_item_id?: string
}

export async function getMockRequests(filters?: RequestFilters): Promise<Request[]> {
  let requests = mockDB.requests

  if (filters) {
    requests = requests.filter(request => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true
        if (key === 'inventory_item_id') {
          return request.inventory_item?.id === value
        }
        return request[key as keyof Request] === value
      })
    })
  }

  // Log request retrieval
  await createEvent({
    event_type: 'REQUESTS_RETRIEVED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      filters,
      count: requests.length
    }
  })

  return requests
}

// Add Pattern Request Types
export type PatternRequestMetadata = {
  universal_sku: SKU
  target_sku: SKU
  quantity: number
  order_id?: string
  priority?: Priority
}

export async function createMockPatternRequest(params: {
  metadata: PatternRequestMetadata
}): Promise<Request> {
  const request = await createRequest({
    type: 'PATTERN_REQUEST',
    priority: params.metadata.priority || 'MEDIUM',
    metadata: params.metadata
  })

  // Log pattern request creation
  await createEvent({
    event_type: 'PATTERN_REQUEST_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      request_id: request.id,
      universal_sku: params.metadata.universal_sku,
      target_sku: params.metadata.target_sku,
      quantity: params.metadata.quantity,
      order_id: params.metadata.order_id
    }
  })

  return request
}

export type { Request, RequestStep, CreateRequestParams, StepUpdateParams }