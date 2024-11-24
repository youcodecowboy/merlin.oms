import { v4 as uuidv4 } from 'uuid'
import type { MockInventoryItem, PendingProductionRequest } from './types'
import type { Customer } from '@/lib/schema'
import { processUncommittedOrders } from './inventory/autoCommit'

// Initialize mock data store
export interface MockStore {
  inventory: MockInventoryItem[]
  commitments: Array<{
    sku: string
    committedQuantity: number
    uncommittedQuantity: number
    updated_at: string
  }>
  orders: Array<{
    id: string
    items: Array<{
      sku: string
      quantity: number
      status: string
    }>
    status: string
    created_at: string
    updated_at: string
  }>
  pendingProduction: PendingProductionRequest[]
  notifications: Array<{
    id: string
    type: 'PRODUCTION_REQUEST' | 'STOCK_ALERT'
    message: string
    created_at: string
    read: boolean
  }>
  events: any[]
  production: any[]
  customers: Customer[]
}

// Initialize mock store with sample data
export const mockStore: MockStore = {
  inventory: [],
  commitments: [],
  orders: [],
  pendingProduction: [],
  notifications: [],
  events: [],
  production: [],
  customers: [
    {
      id: uuidv4(),
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phone: '+1 (555) 234-5678',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

// Helper function to update store
export function updateStore(newState: Partial<MockStore>) {
  Object.assign(mockStore, newState)
}

// Add to store functionality
export function addToStore<K extends keyof MockStore>(
  key: K,
  item: MockStore[K] extends Array<infer T> ? T : never
) {
  if (!Array.isArray(mockStore[key])) {
    throw new Error(`Store key ${key} is not an array`)
  }
  
  (mockStore[key] as any[]).push(item)
}

// Helper function to find inventory item by ID
export function findInventoryItemById(id: string) {
  return mockStore.inventory.find(item => item.id === id)
}

// Helper function to update item in store
export function updateInStore<K extends keyof MockStore>(
  key: K,
  id: string,
  updates: Partial<MockStore[K] extends Array<infer T> ? T : never>
) {
  const array = mockStore[key] as any[]
  const index = array.findIndex(item => item.id === id)
  
  if (index === -1) {
    throw new Error(`Item with id ${id} not found in ${key}`)
  }

  array[index] = {
    ...array[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  return array[index]
}

// Helper function to add notification
export function addNotification(type: 'PRODUCTION_REQUEST' | 'STOCK_ALERT', message: string) {
  const notification = {
    id: uuidv4(),
    type,
    message,
    created_at: new Date().toISOString(),
    read: false
  }

  mockStore.notifications = [notification, ...mockStore.notifications]
  return notification
}

// Helper function to create mock order
export async function createMockOrder(data: {
  customer_id: string
  number: number
  items: any[]
  newCustomer?: {
    email: string
    name?: string
    phone?: string
  }
}) {
  const timestamp = new Date().toISOString()

  // Create new customer if provided
  if (data.newCustomer) {
    const newCustomer: Customer = {
      id: uuidv4(),
      ...data.newCustomer,
      created_at: timestamp,
      updated_at: timestamp
    }
    addToStore('customers', newCustomer)
    data.customer_id = newCustomer.id
  }
  
  const order = {
    id: uuidv4(),
    customer_id: data.customer_id,
    number: data.number,
    order_status: 'PENDING',
    items: data.items.map(item => ({
      ...item,
      id: uuidv4(),
      status: 'PENDING'
    })),
    created_at: timestamp,
    updated_at: timestamp,
    customer: data.newCustomer || mockStore.customers.find(c => c.id === data.customer_id)
  }

  // Add order to store
  addToStore('orders', order)

  // Process order items for inventory commitment
  await processUncommittedOrders()

  return order
}