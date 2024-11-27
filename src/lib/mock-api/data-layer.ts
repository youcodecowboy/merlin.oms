// Central data store and persistence layer
import type { Order, InventoryItem, Customer, Request } from '../schema'

// Storage keys
const ORDERS_KEY = 'mockOrders'
const INVENTORY_KEY = 'mockInventoryItems'
const REQUESTS_KEY = 'mockRequests'
const EVENTS_KEY = 'mockEvents'

// Load persisted data
let mockOrders = loadData(ORDERS_KEY, [])
let mockInventory = loadData(INVENTORY_KEY, [])
let mockRequests = loadData(REQUESTS_KEY, [])
let mockEvents = loadData(EVENTS_KEY, [])

// Helper to load data
function loadData(key: string, defaultValue: any) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Failed to load ${key}:`, error)
    return defaultValue
  }
}

// Helper to save data
function saveData(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key}:`, error)
  }
}

// Order functions
export function getOrder(id: string) {
  return mockOrders.find((o: any) => o.id === id)
}

export function getAllOrders() {
  return mockOrders
}

export function addOrder(order: any) {
  mockOrders.push(order)
  saveData(ORDERS_KEY, mockOrders)
  return order
}

export function updateOrder(orderId: string, updatedOrder: any) {
  mockOrders = mockOrders.map((order: any) => 
    order.id === orderId ? { ...updatedOrder } : order
  )
  saveData(ORDERS_KEY, mockOrders)
  return updatedOrder
}

// Data access functions with relationship handling
export function getInventoryItem(id: string): InventoryItem | undefined {
  const item = mockInventory.find(item => item.id === id)
  if (!item) return undefined

  // Populate order and customer if they exist
  if (item.order_id) {
    const order = getOrder(item.order_id)
    if (order) {
      item.order = order
      item.customer = order.customer
      item.customer_info = {
        id: order.customer.id,
        name: order.customer.name || 'Unknown',
        email: order.customer.email
      }
    }
  }

  return item
}

export function updateInventoryItem(item: InventoryItem): InventoryItem {
  // Ensure relationships are maintained
  if (item.order_id && !item.customer_info) {
    const order = getOrder(item.order_id)
    if (order?.customer) {
      item.customer = order.customer
      item.customer_info = {
        id: order.customer.id,
        name: order.customer.name || 'Unknown',
        email: order.customer.email
      }
    }
  }

  mockInventory = mockInventory.map(existing => 
    existing.id === item.id ? item : existing
  )
  saveData(INVENTORY_KEY, mockInventory)
  return item
}

export function getAllInventory(): InventoryItem[] {
  // Populate all relationships
  return mockInventory.map(item => {
    if (item.order_id) {
      const order = getOrder(item.order_id)
      if (order) {
        item.order = order
        item.customer = order.customer
        item.customer_info = {
          id: order.customer.id,
          name: order.customer.name || 'Unknown',
          email: order.customer.email
        }
      }
    }
    return item
  })
}

// Clear all data (for testing/reset)
export function clearAllData() {
  Object.values([ORDERS_KEY, INVENTORY_KEY, REQUESTS_KEY, EVENTS_KEY]).forEach(key => localStorage.removeItem(key))
  mockOrders = []
  mockInventory = []
  mockRequests = []
  mockEvents = []
}

// Export for testing
export {
  mockOrders,
  mockInventory,
  mockRequests,
  mockEvents
} 