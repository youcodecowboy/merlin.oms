import type { InventoryItem, SKU, Status1, Status2 } from '@/lib/types'
import { eventLogger } from './logging'
import { findOptimalBin } from './bin-validation'

interface StatusUpdateParams {
  itemId: string
  status1?: Status1
  status2?: Status2
  location?: string
}

interface CreateItemParams {
  sku: SKU
  status1: Status1
  status2: Status2
  location: string
  metadata?: Record<string, any>
}

export async function updateInventoryStatus({
  itemId,
  status1,
  status2,
  location
}: StatusUpdateParams): Promise<void> {
  try {
    // Get current item state
    const currentItem = await getInventoryItem(itemId)
    if (!currentItem) throw new Error('Item not found')

    // Validate status transition
    if (status1) {
      validateStatus1Transition(currentItem.status1, status1)
    }
    if (status2) {
      validateStatus2Transition(currentItem.status2, status2)
    }

    // Update item
    const updates: Partial<InventoryItem> = {
      ...(status1 && { status1 }),
      ...(status2 && { status2 }),
      ...(location && { location }),
      updated_at: new Date().toISOString()
    }

    // Log status change
    await eventLogger.logStatusChange({
      entityId: itemId,
      entityType: 'unit',
      previousStatus: currentItem.status1,
      newStatus: status1 || currentItem.status1,
      triggerEvent: 'manual_update',
      relatedIds: [currentItem.order_id].filter(Boolean)
    })

    // If location changed, log location change
    if (location && location !== currentItem.location) {
      await eventLogger.logLocationChange({
        unitId: itemId,
        sourceLocation: currentItem.location,
        targetLocation: location,
        operatorId: 'system' // or current user
      })
    }

  } catch (error) {
    console.error('Failed to update inventory status:', error)
    throw error
  }
}

export async function createInventoryItem(params: CreateItemParams): Promise<InventoryItem> {
  try {
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      sku: params.sku,
      status1: params.status1,
      status2: params.status2,
      location: params.location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Log item creation
    await eventLogger.logEvent({
      event_type: 'UNIT_CREATED',
      event_id: crypto.randomUUID(),
      timestamp: new Date(),
      actor_id: 'system',
      metadata: {
        item_id: newItem.id,
        sku: newItem.sku,
        initial_status1: newItem.status1,
        initial_status2: newItem.status2,
        initial_location: newItem.location
      }
    })

    return newItem
  } catch (error) {
    console.error('Failed to create inventory item:', error)
    throw error
  }
}

export async function moveInventoryItem(
  itemId: string,
  targetLocation: string
): Promise<void> {
  try {
    const item = await getInventoryItem(itemId)
    if (!item) throw new Error('Item not found')

    // Validate move is allowed
    validateMoveAllowed(item)

    // If moving to bin, find optimal bin
    if (targetLocation.startsWith('BIN-')) {
      const bins = await getBins() // You'll need to implement this
      const optimalBin = await findOptimalBin(item, bins)
      if (!optimalBin) throw new Error('No suitable bin found')
      targetLocation = optimalBin.id
    }

    // Update location
    await updateInventoryStatus({
      itemId,
      location: targetLocation
    })

  } catch (error) {
    console.error('Failed to move inventory item:', error)
    throw error
  }
}

// Validation functions
function validateStatus1Transition(current: Status1, next: Status1): boolean {
  const validTransitions: Record<Status1, Status1[]> = {
    'PRODUCTION': ['STOCK'],
    'STOCK': ['WASH'],
    'WASH': ['QC'],
    'QC': ['FINISHING'],
    'FINISHING': ['PACKED'],
    'PACKED': ['STOCK'] // If returned/rejected
  }

  if (!validTransitions[current]?.includes(next)) {
    throw new Error(`Invalid status1 transition from ${current} to ${next}`)
  }

  return true
}

function validateStatus2Transition(current: Status2, next: Status2): boolean {
  const validTransitions: Record<Status2, Status2[]> = {
    'UNCOMMITTED': ['COMMITTED', 'ASSIGNED'],
    'COMMITTED': ['ASSIGNED', 'UNCOMMITTED'],
    'ASSIGNED': ['UNCOMMITTED'] // If order cancelled/rejected
  }

  if (!validTransitions[current]?.includes(next)) {
    throw new Error(`Invalid status2 transition from ${current} to ${next}`)
  }

  return true
}

function validateMoveAllowed(item: InventoryItem): boolean {
  // Add your business rules for when items can be moved
  const immobileStatuses: Status1[] = ['WASH', 'QC', 'FINISHING']
  
  if (immobileStatuses.includes(item.status1)) {
    throw new Error(`Cannot move item in ${item.status1} status`)
  }

  if (item.status2 === 'ASSIGNED') {
    throw new Error('Cannot move assigned items')
  }

  return true
}

// Helper function to get inventory item - implement based on your data layer
async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  // Implementation depends on your data layer
  return null
}

// Helper function to get bins - implement based on your data layer
async function getBins(): Promise<any[]> {
  // Implementation depends on your data layer
  return []
} 