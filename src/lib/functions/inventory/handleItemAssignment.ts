import { mockDB, addRequest } from '@/lib/mock-db/store'
import type { DBInventoryItem, DBRequest } from '@/lib/schema/database'

export async function handleItemAssignment(itemId: string, orderId: string) {
  try {
    // Find the item
    const item = mockDB.inventory_items.find(i => i.id === itemId)
    if (!item) throw new Error('Item not found')

    // Update item status
    item.status2 = 'ASSIGNED'
    item.order_id = orderId
    item.updated_at = new Date().toISOString()

    // If item is STOCK and now ASSIGNED, create wash request
    if (item.status1 === 'STOCK' && item.status2 === 'ASSIGNED') {
      const washRequest: Omit<DBRequest, 'id' | 'created_at' | 'updated_at'> = {
        item_id: itemId,
        request_type: 'WASHING',
        status: 'PENDING',
        priority: 'MEDIUM', // Could be determined by order priority
        metadata: {
          order_id: orderId,
          source: 'auto_assignment'
        }
      }

      // Add the wash request
      const newRequest = addRequest(washRequest)
      console.log('Created wash request:', newRequest)
    }

    return item
  } catch (error) {
    console.error('Error handling item assignment:', error)
    throw error
  }
} 