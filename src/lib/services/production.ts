import { nanoid } from 'nanoid'
import type { ProductionBatch, PendingProduction, InventoryItem, Priority } from '@/lib/schema'
import { createMockInventoryItem } from '@/lib/mock-api/inventory'
import { DEFAULT_TIMELINE } from '@/lib/utils/production-stages'
import { generateBatchQRPdf } from '@/lib/utils/qr-generator'
import { createBatch, getBatches, updateBatch } from './batches'
import { processWaitlistForNewItems } from './waitlist-processor'
import { isValidProductionSku, getSkuValidationError } from '@/lib/utils/sku-validation'
import { createMockRequest } from '@/lib/mock-api/requests'
import { useNotifications } from '@/lib/stores/notifications'
import { eventTracker } from './event-tracking'

// Storage keys
const PENDING_KEY = 'pendingProductionRequests'

// Load persisted data
let pendingRequests: PendingProduction[] = (() => {
  const saved = localStorage.getItem(PENDING_KEY)
  console.log('Loading pending requests from storage:', saved)
  return saved ? JSON.parse(saved) : []
})()

// Helper to persist data
const persistData = () => {
  console.log('Persisting pending requests:', pendingRequests)
  localStorage.setItem(PENDING_KEY, JSON.stringify(pendingRequests))
}

// Create a new pending request
export async function createPendingRequest(data: {
  sku: string
  quantity: number
  priority: Priority
  order_id?: string
  customer_id?: string
  notes?: string
}): Promise<PendingProduction> {
  console.log('Creating production request:', data)

  // Validate SKU
  if (!isValidProductionSku(data.sku)) {
    const error = getSkuValidationError(data.sku)
    console.error('Invalid production SKU:', error)
    throw new Error(error)
  }

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

  // Create event for production request
  await eventTracker.createEvent(
    'PRODUCTION',
    'REQUEST_CREATED',
    {
      item_id: request.id,
      item_sku: request.sku,
      order_id: data.order_id,
      customer_id: data.customer_id,
      quantity: data.quantity,
      priority: data.priority,
      notes: data.notes,
      timestamp: request.created_at
    }
  )

  console.log('New request created:', request)
  pendingRequests.push(request)
  persistData()

  return request
}

// Get all pending requests
export async function getPendingRequests(): Promise<PendingProduction[]> {
  console.log('Getting pending requests:', pendingRequests)
  return pendingRequests.filter(r => r.status === 'PENDING')
}

// Accept a pending request
export async function acceptMockProductionRequest(
  requestId: string,
  batchId: string
): Promise<{ batch: ProductionBatch; items: InventoryItem[]; qrPdfBlob: Blob }> {
  console.log('Accepting request:', requestId)
  
  // Find the pending request
  const request = pendingRequests.find(r => r.id === requestId)
  if (!request) {
    throw new Error('Production request not found')
  }

  // Create a new batch
  const batch = createBatch({
    sku: request.sku,
    quantity: request.quantity,
    status: 'PATTERN_REQUESTED'
  })

  // Create event for batch creation
  const batchEvent = await eventTracker.createEvent(
    'PRODUCTION',
    'BATCH_ASSIGNED',
    {
      item_id: batch.id,
      item_sku: batch.sku,
      quantity: batch.quantity,
      status: batch.status,
      request_id: requestId,
      order_id: request.order_id,
      timestamp: batch.created_at
    }
  )

  // Create pattern request
  const patternRequest = await createMockRequest({
    request_type: 'PATTERN_REQUEST',
    status: 'PENDING',
    priority: request.priority,
    metadata: {
      sku: request.sku,
      quantity: request.quantity,
      batch_id: batch.id,
      order_id: request.order_id,
      notes: `Pattern needed for production batch ${batch.id}`
    },
    steps: [
      {
        number: 1,
        title: 'Create Pattern',
        description: `Create pattern for ${request.sku}`,
        status: 'PENDING'
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
        status: 'PENDING'
      }
    ]
  })

  // Create event for pattern request
  await eventTracker.createEvent(
    'WORKFLOW',
    'REQUEST_CREATED',
    {
      item_id: patternRequest.id,
      item_sku: request.sku,
      request_id: patternRequest.id,
      batch_id: batch.id,
      order_id: request.order_id,
      request_type: 'PATTERN_REQUEST',
      status: 'PENDING',
      timestamp: new Date().toISOString()
    },
    batchEvent.id  // Link to batch event
  )

  // Create inventory items
  const items: InventoryItem[] = []
  for (let i = 0; i < request.quantity; i++) {
    const item = await createMockInventoryItem({
      sku: request.sku,
      status1: 'PRODUCTION',
      status2: 'UNCOMMITTED',
      batch_id: batch.id,
      timeline: [...DEFAULT_TIMELINE],
      active_stage: 'PATTERN',
      production_batch: batch.id,
      production_date: new Date().toISOString()
    })

    // Create event for each inventory item
    await eventTracker.createEvent(
      'INVENTORY',
      'CREATED',
      {
        item_id: item.id,
        item_sku: item.sku,
        batch_id: batch.id,
        status1: item.status1,
        status2: item.status2,
        pattern_request_id: patternRequest.id,
        order_id: request.order_id,
        timestamp: item.production_date
      },
      batchEvent.id  // Link to batch event
    )

    items.push(item)
  }

  // Process waitlist
  await processWaitlistForNewItems(items)

  // Update request status
  pendingRequests = pendingRequests.map(r => 
    r.id === requestId 
      ? { ...r, status: 'ACCEPTED', batch_id: batch.id }
      : r
  )
  persistData()

  // Create notification for pattern team
  const { addNotification } = useNotifications.getState()
  addNotification({
    id: nanoid(),
    title: 'New Pattern Request',
    description: `Pattern needed for ${request.quantity}x ${request.sku}`,
    type: 'REQUEST',
    team: 'PATTERN',
    request: patternRequest,
    timestamp: new Date().toISOString(),
    read: false
  })

  // Generate QR codes
  const qrPdfBlob = await generateBatchQRPdf(items, batch.id)

  return { batch, items, qrPdfBlob }
}

// Get all production batches
export async function getProductionBatches(): Promise<ProductionBatch[]> {
  return getBatches()
}

// Add function to update batch status when creating cutting request
export async function updateBatchToCutting(batchId: string): Promise<void> {
  await updateBatch(batchId, {
    status: 'CUTTING'
  })
}

// Export for testing
export { pendingRequests } 