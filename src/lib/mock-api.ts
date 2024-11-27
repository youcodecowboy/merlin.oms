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
    // Parse the QR data
    const scannedItem = JSON.parse(qrData) as InventoryItem
    
    // Check if item already exists
    const existingItems = await getMockInventoryItems()
    const existingItem = existingItems.find(item => item.id === scannedItem.id)
    
    if (existingItem) {
      // Update existing item
      return updateMockInventoryItem(scannedItem)
    } else {
      // Create new item
      return createMockInventoryItem(scannedItem)
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Invalid QR code data: ${error.message}`)
    }
    throw new Error('Invalid QR code data: Unknown error')
  }
}