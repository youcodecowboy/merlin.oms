import { mockStore, updateStore } from '../store'
import { 
  MockInventoryItem,
  AssignmentResult,
  OrderNotFoundError,
  PendingProductionRequest
} from './types'
import { parseSKU, buildSKU } from '@/lib/sku'
import { isWashCompatible } from '@/lib/sku/matcher'

export async function assignInventoryToOrder(
  sku: string, 
  orderId: string,
  quantity: number = 1
): Promise<AssignmentResult> {
  // Verify order exists
  const order = mockStore.orders.find(o => o.id === orderId)
  if (!order) {
    throw new OrderNotFoundError(orderId)
  }

  // Parse order SKU for matching
  const orderComponents = parseSKU(sku)
  if (!orderComponents) {
    throw new Error(`Invalid SKU format: ${sku}`)
  }

  // Find available inventory items
  const availableItems = mockStore.inventory.filter(item => {
    // Must be uncommitted stock
    if (item.status1 !== 'STOCK' || item.status2 !== 'UNCOMMITTED') {
      return false
    }

    // Parse item SKU
    const itemComponents = parseSKU(item.sku)
    if (!itemComponents) return false

    // Check compatibility
    return (
      // Exact match
      item.sku === sku ||
      // Or universal match
      (
        itemComponents.style === orderComponents.style &&
        itemComponents.waist === orderComponents.waist &&
        itemComponents.shape === orderComponents.shape &&
        itemComponents.inseam >= orderComponents.inseam &&
        isWashCompatible(itemComponents.wash, orderComponents.wash)
      )
    )
  }).slice(0, quantity)

  // If no items available, create production request
  if (availableItems.length === 0) {
    const productionRequest = createPendingProduction(sku, quantity, orderId)
    
    return {
      success: true,
      type: 'PRODUCTION_REQUESTED',
      productionRequest,
      message: `No available stock for SKU ${sku}. Added to production queue.`
    }
  }

  // Update inventory items
  const updatedInventory = mockStore.inventory.map(item => {
    const matchingItem = availableItems.find(available => available.id === item.id)
    if (matchingItem) {
      return {
        ...item,
        status2: 'COMMITTED',
        orderId,
        updated_at: new Date().toISOString()
      }
    }
    return item
  })

  // Update order status
  const orderItem = order.items.find(item => item.sku === sku)
  if (orderItem) {
    orderItem.status = availableItems.length >= quantity ? 'COMMITTED' : 'PARTIALLY_COMMITTED'
  }

  // Check if all order items are committed
  const allItemsCommitted = order.items.every(item => 
    item.status === 'COMMITTED' || item.status === 'PARTIALLY_COMMITTED'
  )

  if (allItemsCommitted) {
    order.order_status = order.items.every(item => item.status === 'COMMITTED') 
      ? 'COMMITTED' 
      : 'PARTIALLY_COMMITTED'
    order.updated_at = new Date().toISOString()
  }

  // Update store
  updateStore({ 
    inventory: updatedInventory,
    orders: mockStore.orders.map(o => o.id === order.id ? order : o)
  })

  // Create production request for remaining quantity if needed
  let productionRequest: PendingProductionRequest | undefined
  if (availableItems.length < quantity) {
    const remainingQuantity = quantity - availableItems.length
    productionRequest = createPendingProduction(sku, remainingQuantity, orderId)
  }

  return {
    success: true,
    type: productionRequest ? 'PARTIALLY_ASSIGNED' : 'ASSIGNED',
    items: availableItems,
    productionRequest,
    message: productionRequest
      ? `Assigned ${availableItems.length} items and created production request for remaining ${quantity - availableItems.length} units`
      : `Successfully assigned ${quantity} items to order ${orderId}`
  }
}

function createPendingProduction(
  sku: string,
  quantity: number,
  orderId: string
): PendingProductionRequest {
  const timestamp = new Date().toISOString()
  
  const request: PendingProductionRequest = {
    id: crypto.randomUUID(),
    sku,
    quantity,
    priority: 'MEDIUM',
    orderId,
    requestedDate: timestamp,
    status: 'PENDING',
    created_at: timestamp,
    updated_at: timestamp
  }

  // Update store
  updateStore({
    pendingProduction: [...mockStore.pendingProduction, request]
  })

  return request
}