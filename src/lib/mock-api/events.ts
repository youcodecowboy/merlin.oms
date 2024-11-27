import { nanoid } from 'nanoid'
import type { InventoryEvent } from '../schema'

// Initialize events storage
const STORAGE_KEY = 'mockInventoryEvents'
let mockEvents: InventoryEvent[] = (() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
})()

// Helper to save to localStorage
function persistEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockEvents))
}

export async function getMockInventoryEvents(inventoryId: string): Promise<InventoryEvent[]> {
  return mockEvents.filter(event => event.inventory_item_id === inventoryId)
}

export async function createMockInventoryEvent(data: {
  inventory_item_id: string
  event_name: string
  event_description?: string
  status: 'PENDING' | 'COMPLETED'
  timestamp: string
  metadata?: Record<string, any>
}): Promise<InventoryEvent> {
  const event: InventoryEvent = {
    id: nanoid(),
    inventory_item_id: data.inventory_item_id,
    event_name: data.event_name,
    event_description: data.event_description,
    status: data.status,
    timestamp: data.timestamp,
    metadata: data.metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  mockEvents.push(event)
  persistEvents()

  return event
}

export async function logStatusChange(
  item: InventoryItem,
  previousStatus: string,
  newStatus: string,
  metadata?: Record<string, any>
) {
  return createMockInventoryEvent({
    inventory_item_id: item.id,
    event_name: 'STATUS_CHANGED',
    event_description: `Status changed from ${previousStatus} to ${newStatus}`,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    metadata: {
      previous_status: previousStatus,
      new_status: newStatus,
      order_id: item.order_id,
      ...metadata
    }
  })
}

// Export for testing
export { mockEvents }