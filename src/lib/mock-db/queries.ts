import { mockDB, updateInventoryItem, addEvent, addRequest } from './store'
import type { 
  DBInventoryItem, 
  DBRequest, 
  DBEvent,
  DBOrder,
  DBCustomer 
} from '../schema/database'

// Simulate network delay for realistic behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Query functions that mirror future Supabase queries
export async function getInventoryItem(id: string): Promise<DBInventoryItem | null> {
  await delay(100) // Simulate network delay
  const item = mockDB.inventory_items.find(i => i.id === id)
  return item || null
}

export async function getItemWithRelations(id: string) {
  const item = await getInventoryItem(id)
  if (!item) return null

  // Get active request
  const activeRequest = mockDB.requests.find(r => 
    r.item_id === id && 
    (r.status === 'PENDING' || r.status === 'IN_PROGRESS')
  )

  // Get order and customer if assigned
  let order = null
  let customer = null
  if (item.order_id) {
    order = mockDB.orders.find(o => o.id === item.order_id)
    if (order?.customer_id) {
      customer = mockDB.customers.find(c => c.id === order.customer_id)
    }
  }

  return {
    ...item,
    active_request: activeRequest || null,
    order,
    customer
  }
}

export async function getItemRequests(itemId: string): Promise<DBRequest[]> {
  await delay(100)
  return mockDB.requests.filter(r => r.item_id === itemId)
}

export async function getItemEvents(itemId: string): Promise<DBEvent[]> {
  await delay(100)
  return mockDB.events
    .filter(e => e.item_id === itemId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function createEvent(event: Omit<DBEvent, 'id' | 'created_at'>) {
  await delay(100)
  return addEvent(event)
}

export async function createRequest(request: Omit<DBRequest, 'id' | 'created_at' | 'updated_at'>) {
  await delay(100)
  return addRequest(request)
}

export async function updateItem(
  id: string, 
  updates: Partial<DBInventoryItem>
) {
  await delay(100)
  updateInventoryItem({ id, ...updates })
  return getInventoryItem(id)
} 