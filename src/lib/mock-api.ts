export * from './mock-api/inventory'
export * from './mock-api/orders'
export * from './mock-api/requests'
export * from './mock-api/production'
export * from './mock-api/batches'
export * from './mock-api/events'
export * from './mock-api/products'
export * from './mock-api/customers'

export type { 
  Order,
  Product,
  Customer,
  InventoryItem,
  InventoryEvent,
  PendingProduction,
  ProductionRequest,
  Batch,
  Request
} from './schema'

import { InventoryItem } from './schema'
import { getMockInventoryItems, createMockInventoryItem, updateMockInventoryItem } from './mock-api/inventory'

export async function handleInventoryQRScan(qrData: string): Promise<InventoryItem> {
  try {
    const scannedItem = JSON.parse(qrData) as InventoryItem
    
    // Log QR scan event
    await eventLogger.logQREvent({
      unitId: scannedItem.id,
      eventType: 'activation',
      location: scannedItem.location,
      operatorId: getCurrentOperator(), // Need to implement
      resultingAction: determineNextAction(scannedItem) // Need to implement
    })

    // Check waitlist and determine action
    const hasWaitlistedOrders = await checkWaitlist(scannedItem.sku)
    if (hasWaitlistedOrders) {
      return handleWaitlistedItem(scannedItem)
    } else {
      return handleStorageItem(scannedItem)
    }
  } catch (error) {
    // Log error event
    await eventLogger.logEvent({
      event_type: 'QR_SCAN_ERROR',
      event_id: crypto.randomUUID(),
      timestamp: new Date(),
      actor_id: 'system',
      metadata: { error: error.message }
    })
    throw error
  }
}