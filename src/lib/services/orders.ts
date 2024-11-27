import type { Order, OrderItem } from '@/lib/schema'
import { findAvailableInventory, addToWaitlist } from './waitlist'
import { createProductionRequest, createPendingRequest } from './production-flow'
import { convertToRawSku } from '@/lib/utils/sku'

export async function processOrderItem(order: Order, item: OrderItem) {
  // First try to find available inventory
  const availableItem = await findAvailableInventory(item)

  if (availableItem) {
    // Commit inventory if available
    await commitInventoryToOrder(availableItem, order.id)
    return {
      success: true,
      message: 'Committed existing inventory',
      item: availableItem
    }
  }

  // No inventory available - create production request and add to waitlist
  const rawSku = convertToRawSku(item.sku)
  
  // Add to waitlist first
  const waitlistEntry = await addToWaitlist(order, item, 'MEDIUM')
  
  // Create production request if this is first in waitlist
  if (waitlistEntry.position === 1) {
    // Create pending production request
    await createPendingRequest({
      sku: rawSku,
      quantity: item.quantity,
      priority: 'MEDIUM',
      order_id: order.id,
      customer_id: order.customer.id,
      notes: `Order #${order.number} - Position 1 in waitlist`
    })
  }

  return {
    success: true,
    message: 'Added to waitlist and production queue',
    waitlistEntry
  }
}

export async function processNewOrder(order: Order) {
  const results = []

  for (const item of order.items) {
    // First try to find available inventory
    const inventoryItems = await getMockInventoryItems()
    const availableItem = await findAvailableInventory(item, inventoryItems)

    if (availableItem) {
      // Commit inventory if available
      await commitInventoryToOrder(availableItem, order.id)
      results.push({
        success: true,
        message: 'Committed existing inventory',
        item: availableItem
      })
    } else {
      // No inventory available - create production request and add to waitlist
      const rawSku = convertToRawSku(item.sku)
      
      // Add to waitlist first
      const waitlistEntry = await addToWaitlist(order, item, 'MEDIUM')
      
      // Create production request if this is first in waitlist
      if (waitlistEntry.position === 1) {
        await createProductionRequest({
          sku: rawSku,
          quantity: item.quantity,
          priority: 'MEDIUM',
          order_id: order.id,
          customer_id: order.customer.id,
          notes: `Order #${order.number} - Position 1 in waitlist`
        })
      }

      results.push({
        success: true,
        message: 'Added to waitlist and production queue',
        waitlistEntry
      })
    }
  }

  // Update order status based on results
  const allCommitted = results.every(r => r.item)
  const newStatus = allCommitted ? 'COMMITTED' : 'PRODUCTION'

  await updateOrderStatus(order.id, newStatus)

  return {
    success: true,
    message: `Order processed - Status: ${newStatus}`,
    results
  }
} 