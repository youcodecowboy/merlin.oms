import { nanoid } from 'nanoid'
import type { Order, SKU, InventoryItem, OrderStatus } from '../types'
import { mockDB, createEvent } from '../mock-db/store'
import { findMatchingInventory } from './inventory'
import { createRequest } from './requests'
import { addToWaitlist } from '../utils/waitlist'

interface CreateOrderParams {
  customer_id: string
  sku: SKU
  quantity: number
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  metadata?: Record<string, any>
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  // Create order record
  const order: Order = {
    id: `ORD-${nanoid(6)}`,
    customer_id: params.customer_id,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      target_sku: params.sku,
      quantity: params.quantity,
      priority: params.priority || 'MEDIUM',
      ...params.metadata
    }
  }

  // Log order creation
  await createEvent({
    event_type: 'ORDER_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      order_id: order.id,
      customer_id: order.customer_id,
      target_sku: params.sku,
      quantity: params.quantity
    }
  })

  // Add to mockDB
  mockDB.orders.push(order)

  // Process order
  await processOrder(order)

  return order
}

async function processOrder(order: Order): Promise<void> {
  const targetSKU = order.metadata?.target_sku as SKU
  if (!targetSKU) throw new Error('No target SKU specified')

  try {
    // 1. Try exact match with UNCOMMITTED status
    let matches = await findMatchingInventory({
      sku: targetSKU,
      type: 'exact',
      status2: 'UNCOMMITTED'
    })

    // 2. If no exact match, try universal match
    if (!matches.length) {
      matches = await findMatchingInventory({
        sku: targetSKU,
        type: 'universal',
        status2: 'UNCOMMITTED'
      })
    }

    if (matches.length > 0) {
      const match = matches[0]
      
      if (match.status1 === 'STOCK') {
        // Direct assignment
        await handleStockAssignment(order, match)
      } else if (match.status1 === 'PRODUCTION') {
        // Add to waitlist
        await handleProductionWaitlist(order, match)
      }
    } else {
      // No matches - create production request
      await handleProductionRequest(order, targetSKU)
    }

  } catch (error) {
    console.error('Order processing failed:', error)
    await updateOrderStatus(order.id, 'CANCELLED', {
      error: error instanceof Error ? error.message : 'Unknown error',
      failure_time: new Date().toISOString()
    })
  }
}

async function handleStockAssignment(order: Order, item: InventoryItem): Promise<void> {
  // Update item status
  await updateInventoryStatus(item.id, {
    status2: 'ASSIGNED',
    order_id: order.id
  })

  // Update order status
  await updateOrderStatus(order.id, 'PROCESSING', {
    assigned_item: item.id,
    assignment_type: 'direct'
  })

  // Create wash request
  await createRequest({
    type: 'WASH_REQUEST',
    priority: 'HIGH',
    inventory_item: item,
    metadata: {
      order_id: order.id,
      target_wash: order.metadata?.target_sku.split('-')[4] // Extract wash type from SKU
    }
  })
}

async function handleProductionWaitlist(order: Order, item: InventoryItem): Promise<void> {
  // Add to waitlist
  await addToWaitlist({
    order,
    sku: item.sku,
    position: 'end'
  })

  // Update item and order status
  await updateInventoryStatus(item.id, {
    status2: 'COMMITTED',
    order_id: order.id
  })

  await updateOrderStatus(order.id, 'WAITLISTED', {
    committed_item: item.id,
    waitlist_position: await getWaitlistPosition(order.id)
  })
}

async function handleProductionRequest(order: Order, targetSKU: SKU): Promise<void> {
  const universalSKU = getUniversalSKU(targetSKU)
  
  // Create production request
  await createRequest({
    type: 'PATTERN_REQUEST',
    priority: order.metadata?.priority || 'MEDIUM',
    metadata: {
      order_id: order.id,
      universal_sku: universalSKU,
      target_sku: targetSKU,
      quantity: order.metadata?.quantity || 1
    }
  })

  // Update order status
  await updateOrderStatus(order.id, 'PENDING_PRODUCTION', {
    universal_sku: universalSKU,
    production_request_time: new Date().toISOString()
  })
}

// Helper functions
async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  metadata?: Record<string, any>
): Promise<void> {
  const order = mockDB.orders.find(o => o.id === orderId)
  if (!order) throw new Error('Order not found')

  const updatedOrder = {
    ...order,
    status,
    metadata: { ...order.metadata, ...metadata },
    updated_at: new Date().toISOString()
  }

  // Update in mockDB
  mockDB.orders = mockDB.orders.map(o =>
    o.id === orderId ? updatedOrder : o
  )

  // Log status change
  await createEvent({
    event_type: 'ORDER_STATUS_CHANGED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      order_id: orderId,
      previous_status: order.status,
      new_status: status,
      update_metadata: metadata
    }
  })
}

function getUniversalSKU(targetSKU: SKU): SKU {
  const [style, waist, shape, length, wash] = targetSKU.split('-')
  const universalWash = ['STA', 'IND'].includes(wash) ? 'RAW' : 
                       ['ONX', 'JAG'].includes(wash) ? 'BRW' : 
                       wash
  return `${style}-${waist}-${shape}-36-${universalWash}`
}

async function getWaitlistPosition(orderId: string): Promise<number> {
  // Implementation would depend on waitlist data structure
  return 0
}

export type { CreateOrderParams }

export async function createMockOrder(params: CreateOrderParams): Promise<Order> {
  const order = await createOrder(params)
  
  // Log order creation
  await createEvent({
    event_type: 'ORDER_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      order_id: order.id,
      customer_id: order.customer_id,
      target_sku: params.sku,
      quantity: params.quantity
    }
  })

  return order
}

export async function getMockOrder(orderId: string): Promise<Order | null> {
  const order = mockDB.orders.find(o => o.id === orderId)
  if (!order) return null

  // Log order retrieval
  await createEvent({
    event_type: 'ORDER_RETRIEVED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      order_id: orderId,
      status: order.status,
      customer_id: order.customer_id
    }
  })

  return order
}