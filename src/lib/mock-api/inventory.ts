import { nanoid } from 'nanoid'
import type { InventoryItem, TimelineStage, Order } from '../schema'
import { createItemId } from '@/lib/utils/id'
import { createMockInventoryEvent } from './events'
import { updateMockOrder, getMockOrder } from './orders'
import { createMockRequest } from './requests'
import { eventTracker } from '@/lib/services/event-tracking'
import { 
  trackInventoryCreation,
  trackInventoryStatusChange,
  trackInventoryLocationChange,
  trackInventoryCommitment
} from '@/lib/services/inventory-tracking'

// Initialize inventory storage
const STORAGE_KEY = 'mockInventoryItems'

// Load persisted data or use defaults
const loadPersistedData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load inventory:', error)
    return []
  }
}

// Initialize with persisted data
let mockInventoryItems: InventoryItem[] = loadPersistedData()

// Helper to save to localStorage
function persistInventory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInventoryItems))
  } catch (error) {
    console.error('Failed to persist inventory:', error)
  }
}

const DEFAULT_TIMELINE: TimelineStage[] = [
  { 
    stage: 'PATTERN', 
    status: 'PENDING'
  },
  { 
    stage: 'CUTTING', 
    status: 'PENDING'
  },
  { 
    stage: 'SEWING', 
    status: 'PENDING'
  },
  { 
    stage: 'WASHING', 
    status: 'PENDING'
  },
  { 
    stage: 'QC', 
    status: 'PENDING'
  },
  { 
    stage: 'FINISHING', 
    status: 'PENDING'
  },
  { 
    stage: 'PACKING', 
    status: 'PENDING'
  }
]

export async function getMockInventoryItems(): Promise<InventoryItem[]> {
  return mockInventoryItems
}

export async function createMockInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
  const item: InventoryItem = {
    id: createItemId(),
    sku: data.sku!,
    status1: data.status1 || 'STOCK',
    status2: data.status2 || 'UNCOMMITTED',
    batch_id: data.batch_id || 'manual inventory',
    location: data.location || '',
    production_date: data.production_date || new Date().toISOString(),
    production_batch: data.production_batch || '',
    active_stage: data.active_stage || '',
    timeline: data.timeline || [...DEFAULT_TIMELINE],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Track creation event
  await trackInventoryCreation(item)

  mockInventoryItems.push(item)
  persistInventory()

  return item
}

export async function updateMockInventoryItem(
  itemId: string,
  updates: Partial<InventoryItem>,
  reason?: string
): Promise<InventoryItem> {
  const oldItem = mockInventoryItems.find(i => i.id === itemId)
  if (!oldItem) throw new Error('Item not found')

  const updatedItem = { ...oldItem, ...updates, updated_at: new Date().toISOString() }

  // Track status changes
  if (oldItem.status1 !== updatedItem.status1 || oldItem.status2 !== updatedItem.status2) {
    await trackInventoryStatusChange(
      updatedItem,
      oldItem.status1,
      oldItem.status2,
      reason
    )
  }

  // Track location changes
  if (oldItem.location !== updatedItem.location) {
    await trackInventoryLocationChange(
      updatedItem,
      oldItem.location || '',
      reason
    )
  }

  mockInventoryItems = mockInventoryItems.map(item =>
    item.id === itemId ? updatedItem : item
  )
  persistInventory()

  return updatedItem
}

// Add this new function for committing inventory to orders
export async function commitInventoryToOrder(
  item: InventoryItem,
  orderId: string
): Promise<InventoryItem> {
  console.log('Committing inventory to order:', { item, orderId })

  // Get order first to include in events
  const order = await getMockOrder(orderId)
  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  // Update item status based on its current status1
  const newStatus2 = item.status1 === 'STOCK' ? 'ASSIGNED' : 'COMMITTED'
  
  const updatedItem = await updateMockInventoryItem({
    ...item,
    status2: newStatus2,
    order_id: orderId,
    updated_at: new Date().toISOString()
  })

  // Create commit event with detailed information
  await createMockInventoryEvent({
    inventory_item_id: item.id,
    event_name: 'COMMITTED_TO_ORDER',
    event_description: `Item committed to order #${order.number}`,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    metadata: {
      order_id: orderId,
      order_number: order.number,
      previous_status: item.status2,
      new_status: newStatus2,
      item_status1: item.status1,
      item_location: item.location,
      customer_name: order.customer.name
    }
  })

  // Update order item status and create wash request if needed
  await updateMockOrder(orderId, (order) => ({
    items: order.items.map(orderItem => {
      if (orderItem.sku === item.sku && orderItem.status === 'PENDING') {
        // Create events array if it doesn't exist
        const events = orderItem.events || []
        
        // Add commitment event
        events.push({
          id: nanoid(),
          order_item_id: orderItem.id || nanoid(),
          event_type: 'INVENTORY_COMMITTED',
          description: `Inventory item ${item.id} committed from ${item.status1}`,
          timestamp: new Date().toISOString(),
          metadata: {
            inventory_item_id: item.id,
            previous_status: orderItem.status,
            new_status: item.status1 === 'STOCK' ? 'PENDING_WASH' : 'COMMITTED',
            inventory_status1: item.status1,
            inventory_location: item.location
          }
        })

        // Create wash request only for STOCK items that are now ASSIGNED
        if (item.status1 === 'STOCK') {
          createMockRequest({
            request_type: 'WASH_REQUEST',
            status: 'PENDING',
            priority: 'MEDIUM',
            inventory_item: updatedItem,
            metadata: {
              target_wash: orderItem.wash,
              order_id: orderId,
              order_number: order.number,
              notes: `Wash request for order #${order.number}`
            }
          }).then(request => {
            // Add wash request event to both order item and inventory item
            const washEvent = {
              id: nanoid(),
              event_type: 'WASH_REQUEST_CREATED',
              description: `Wash request ${request.id} created for target wash: ${orderItem.wash}`,
              timestamp: new Date().toISOString(),
              metadata: {
                request_id: request.id,
                target_wash: orderItem.wash,
                order_number: order.number,
                inventory_item_id: item.id
              }
            }

            // Add to order item events
            events.push({
              ...washEvent,
              order_item_id: orderItem.id || nanoid()
            })

            // Add to inventory item events
            createMockInventoryEvent({
              inventory_item_id: item.id,
              event_name: 'WASH_REQUEST_CREATED',
              event_description: washEvent.description,
              status: 'COMPLETED',
              timestamp: washEvent.timestamp,
              metadata: washEvent.metadata
            })
          })
        }

        return {
          ...orderItem,
          status: item.status1 === 'STOCK' ? 'PENDING_WASH' : 'COMMITTED',
          inventory_item: updatedItem,
          events
        }
      }
      return orderItem
    })
  }))

  return updatedItem
}

// Export for testing
export { mockInventoryItems }