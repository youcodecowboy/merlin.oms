import { nanoid } from 'nanoid'
import type { Order, OrderItem } from '@/lib/schema'
import { eventTracker } from '@/lib/services/event-tracking'

// Storage key
const STORAGE_KEY = 'mockOrders'

// Load persisted orders
let mockOrders: Order[] = (() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
})()

// Helper to persist
const persistOrders = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders))
}

export async function createMockOrder(data: {
  customer: Order['customer']
  items: OrderItem[]
}): Promise<Order> {
  const order: Order = {
    id: nanoid(),
    number: Math.floor(Math.random() * 10000).toString(),
    customer: data.customer,
    items: data.items,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Create order event
  await eventTracker.createEvent(
    'ORDER',
    'CREATED',
    {
      order_id: order.id,
      customer_id: order.customer?.id,
      timestamp: order.created_at,
      status: order.status,
      notes: `Order ${order.number} created with ${order.items.length} items`
    }
  )

  // Create events for each item
  for (const item of order.items) {
    await eventTracker.createEvent(
      'ORDER',
      'ITEM_ADDED',
      {
        order_id: order.id,
        customer_id: order.customer?.id,
        sku: item.sku,
        quantity: item.quantity,
        status: item.status,
        timestamp: order.created_at,
        notes: `Added ${item.sku} to order ${order.number}`
      }
    )
  }

  mockOrders.push(order)
  persistOrders()

  return order
}

export async function updateMockOrder(
  orderId: string, 
  updateFn: (order: Order) => Order
): Promise<Order> {
  const orderIndex = mockOrders.findIndex(o => o.id === orderId)
  if (orderIndex === -1) throw new Error('Order not found')

  const oldOrder = mockOrders[orderIndex]
  if (!oldOrder) throw new Error('Order not found')

  const updatedOrder = updateFn({ ...oldOrder })
  updatedOrder.updated_at = new Date().toISOString()

  // Create update event
  await eventTracker.createEvent(
    'ORDER',
    'UPDATED',
    {
      order_id: updatedOrder.id,
      customer_id: updatedOrder.customer?.id,
      previous_status: oldOrder.status,
      new_status: updatedOrder.status,
      timestamp: updatedOrder.updated_at,
      notes: `Order ${updatedOrder.number} updated`
    }
  )

  // Track status changes
  if (oldOrder.status !== updatedOrder.status) {
    await eventTracker.createEvent(
      'ORDER',
      'STATUS_CHANGED',
      {
        order_id: updatedOrder.id,
        customer_id: updatedOrder.customer?.id,
        previous_status: oldOrder.status,
        new_status: updatedOrder.status,
        timestamp: updatedOrder.updated_at,
        notes: `Order status changed from ${oldOrder.status} to ${updatedOrder.status}`
      }
    )
  }

  // Track item changes
  const oldItems = new Set(oldOrder.items.map(i => i.sku))
  const newItems = new Set(updatedOrder.items.map(i => i.sku))

  // Track removed items
  for (const oldItem of oldOrder.items) {
    if (!newItems.has(oldItem.sku)) {
      await eventTracker.createEvent(
        'ORDER',
        'ITEM_REMOVED',
        {
          order_id: updatedOrder.id,
          customer_id: updatedOrder.customer?.id,
          sku: oldItem.sku,
          quantity: oldItem.quantity,
          timestamp: updatedOrder.updated_at,
          notes: `Removed ${oldItem.sku} from order ${updatedOrder.number}`
        }
      )
    }
  }

  // Track added items
  for (const newItem of updatedOrder.items) {
    if (!oldItems.has(newItem.sku)) {
      await eventTracker.createEvent(
        'ORDER',
        'ITEM_ADDED',
        {
          order_id: updatedOrder.id,
          customer_id: updatedOrder.customer?.id,
          sku: newItem.sku,
          quantity: newItem.quantity,
          status: newItem.status,
          timestamp: updatedOrder.updated_at,
          notes: `Added ${newItem.sku} to order ${updatedOrder.number}`
        }
      )
    }
  }

  mockOrders[orderIndex] = updatedOrder
  persistOrders()

  return updatedOrder
}

export function getMockOrder(orderId: string): Order | undefined {
  return mockOrders.find(o => o.id === orderId)
}

export function getMockOrders(): Order[] {
  return mockOrders
}