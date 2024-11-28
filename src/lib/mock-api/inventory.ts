import { nanoid } from 'nanoid'
import type { InventoryItem, SKU, Status1, Status2 } from '../types'
import { mockDB, createEvent } from '../mock-db/store'
import { validateStatus1Transition, validateStatus2Transition } from '../utils/validation'

// Initialize inventory storage
const STORAGE_KEY = 'mockInventoryItems'

interface CreateInventoryParams {
  sku: SKU
  status1?: Status1
  status2?: Status2
  location?: string
  batch_id?: string
  production_date?: string
  metadata?: Record<string, any>
}

export async function createMockInventoryItem(params: CreateInventoryParams): Promise<InventoryItem> {
  const item: InventoryItem = {
    id: `INV-${nanoid(6)}`,
    sku: params.sku,
    status1: params.status1 || 'STOCK',
    status2: params.status2 || 'UNCOMMITTED',
    location: params.location || '',
    batch_id: params.batch_id,
    production_date: params.production_date || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Log creation event
  await createEvent({
    event_type: 'INVENTORY_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      item_id: item.id,
      sku: item.sku,
      initial_status1: item.status1,
      initial_status2: item.status2,
      location: item.location
    }
  })

  mockDB.inventory_items.push(item)
  return item
}

interface UpdateInventoryParams {
  status1?: Status1
  status2?: Status2
  location?: string
  order_id?: string
  metadata?: Record<string, any>
}

export async function updateMockInventoryItem(
  itemId: string,
  updates: UpdateInventoryParams
): Promise<InventoryItem> {
  const item = mockDB.inventory_items.find(i => i.id === itemId)
  if (!item) throw new Error('Item not found')

  // Validate status transitions
  if (updates.status1) {
    validateStatus1Transition(item.status1, updates.status1)
  }
  if (updates.status2) {
    validateStatus2Transition(item.status2, updates.status2)
  }

  const oldItem = { ...item }

  // Update item
  const updatedItem = {
    ...item,
    ...updates,
    updated_at: new Date().toISOString()
  }

  // Log status changes
  if (updates.status1 || updates.status2) {
    await createEvent({
      event_type: 'STATUS_CHANGE',
      timestamp: new Date(),
      actor_id: 'system',
      metadata: {
        item_id: item.id,
        previous_status1: oldItem.status1,
        new_status1: updates.status1 || oldItem.status1,
        previous_status2: oldItem.status2,
        new_status2: updates.status2 || oldItem.status2,
        order_id: updates.order_id
      }
    })
  }

  // Log location changes
  if (updates.location && updates.location !== item.location) {
    await createEvent({
      event_type: 'LOCATION_CHANGE',
      timestamp: new Date(),
      actor_id: 'system',
      metadata: {
        item_id: item.id,
        previous_location: item.location,
        new_location: updates.location,
        reason: updates.metadata?.locationChangeReason
      }
    })
  }

  // Update in storage
  mockDB.inventory_items = mockDB.inventory_items.map(i =>
    i.id === itemId ? updatedItem : i
  )

  return updatedItem
}

export async function getMockInventoryItems(filters?: {
  status1?: Status1
  status2?: Status2
  location?: string
  sku?: SKU
}): Promise<InventoryItem[]> {
  let items = mockDB.inventory_items

  if (filters) {
    items = items.filter(item => {
      return Object.entries(filters).every(([key, value]) => 
        !value || item[key as keyof InventoryItem] === value
      )
    })
  }

  return items
}

export async function findMatchingInventory(params: {
  sku: SKU
  type: 'exact' | 'universal'
  status2?: Status2
}): Promise<InventoryItem[]> {
  const { sku, type, status2 } = params
  const [style, waist, shape, length, wash] = sku.split('-')

  let matches = mockDB.inventory_items

  // Filter by status2 if provided
  if (status2) {
    matches = matches.filter(item => item.status2 === status2)
  }

  if (type === 'exact') {
    // Exact match - all components must match exactly
    matches = matches.filter(item => item.sku === sku)
  } else {
    // Universal match - follow wash group rules and length requirements
    matches = matches.filter(item => {
      const [itemStyle, itemWaist, itemShape, itemLength, itemWash] = item.sku.split('-')
      
      // Style, waist, and shape must match exactly
      if (itemStyle !== style || itemWaist !== waist || itemShape !== shape) {
        return false
      }

      // Item length must be >= target length
      if (parseInt(itemLength) < parseInt(length)) {
        return false
      }

      // Check wash group compatibility
      if (['STA', 'IND'].includes(wash)) {
        return itemWash === 'RAW'
      }
      if (['ONX', 'JAG'].includes(wash)) {
        return itemWash === 'BRW'
      }

      return false
    })
  }

  // Log search event
  await createEvent({
    event_type: 'SKU_SEARCH',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      search_sku: sku,
      search_type: type,
      status2,
      matches_found: matches.length,
      matching_skus: matches.map(m => m.sku)
    }
  })

  return matches
}

export async function commitInventoryToOrder(
  itemId: string,
  orderId: string
): Promise<InventoryItem> {
  const item = mockDB.inventory_items.find(i => i.id === itemId)
  if (!item) throw new Error('Item not found')

  // Validate item can be committed
  if (item.status2 !== 'UNCOMMITTED') {
    throw new Error(`Item ${itemId} cannot be committed - current status: ${item.status2}`)
  }

  // Update item
  const updatedItem = await updateMockInventoryItem(itemId, {
    status2: 'COMMITTED',
    order_id: orderId,
    metadata: {
      commitment_time: new Date().toISOString()
    }
  })

  // Log commitment
  await createEvent({
    event_type: 'INVENTORY_COMMITTED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      item_id: itemId,
      order_id: orderId,
      previous_status: item.status2,
      new_status: 'COMMITTED'
    }
  })

  return updatedItem
}