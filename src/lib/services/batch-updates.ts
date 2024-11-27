import type { InventoryItem, InventoryEvent } from '@/lib/schema'
import { updateMockInventoryItem } from '@/lib/mock-api/inventory'
import { createMockInventoryEvent } from '@/lib/mock-api/events'
import { handleLocationChange } from './production-flow'

interface BatchUpdateOptions {
  location?: string
  status1?: string
  status2?: string
  active_stage?: string
  notes?: string
}

export async function batchUpdateByBin(
  binLocation: string, 
  updates: BatchUpdateOptions,
  userId: string
): Promise<{
  updatedItems: InventoryItem[]
  totalUpdated: number
  errors: Array<{ sku: string; error: string }>
}> {
  const errors: Array<{ sku: string; error: string }> = []
  const updatedItems: InventoryItem[] = []
  
  // Get all items in the bin
  const items = await getMockInventoryItems()
  const binItems = items.filter(item => item.location === binLocation)
  
  // Create batch event for tracking
  const batchId = `BATCH-${nanoid()}`
  const timestamp = new Date().toISOString()

  // Process each item
  for (const item of binItems) {
    try {
      // Create event for the update
      const event = await createMockInventoryEvent({
        inventory_item_id: item.id,
        event_name: 'BATCH_UPDATE',
        event_description: `Batch update from ${binLocation}`,
        status: 'COMPLETED',
        timestamp,
        metadata: {
          batch_id: batchId,
          previous_location: item.location,
          previous_status1: item.status1,
          previous_status2: item.status2,
          previous_stage: item.active_stage,
          updates,
          updated_by: userId
        }
      })

      // If location is changing, handle special location change logic
      let updatedItem = item
      if (updates.location && updates.location !== item.location) {
        updatedItem = await handleLocationChange(item, updates.location)
      }

      // Apply other updates
      updatedItem = await updateMockInventoryItem({
        ...updatedItem,
        ...(updates.status1 && { status1: updates.status1 }),
        ...(updates.status2 && { status2: updates.status2 }),
        ...(updates.active_stage && { active_stage: updates.active_stage }),
        events: [...(updatedItem.events || []), event],
        updated_at: timestamp
      })

      updatedItems.push(updatedItem)

    } catch (error) {
      console.error(`Failed to update item ${item.sku}:`, error)
      errors.push({ 
        sku: item.sku, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  return {
    updatedItems,
    totalUpdated: updatedItems.length,
    errors
  }
}

// Helper to validate bin location
export function validateBinLocation(location: string): boolean {
  // Add your bin location validation logic
  return /^(BIN|WBIN|RACK)-\d+-Z\d+-\d{4}$/.test(location)
}

// Helper to get items in a bin
export async function getItemsInBin(binLocation: string): Promise<InventoryItem[]> {
  const items = await getMockInventoryItems()
  return items.filter(item => item.location === binLocation)
} 