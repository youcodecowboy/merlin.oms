import type { Bin } from "@/lib/schema/bins"
import type { DBInventoryItem } from "@/lib/schema/database"

interface BinAssignmentResult {
  success: boolean
  binId?: string
  error?: string
}

export function findOptimalBin(
  item: DBInventoryItem,
  availableBins: Bin[],
): BinAssignmentResult {
  // Filter out full bins
  const binsWithSpace = availableBins.filter(bin => 
    bin.current_items < bin.capacity
  )

  if (binsWithSpace.length === 0) {
    return {
      success: false,
      error: 'No bins available with space'
    }
  }

  // First, try to find a bin with the same SKU
  const binsWithSameSku = binsWithSpace.filter(bin => {
    const binItems = bin.items.map(itemId => 
      mockDB.inventory_items.find(i => i.id === itemId)
    )
    return binItems.some(i => i?.current_sku === item.current_sku)
  })

  if (binsWithSameSku.length > 0) {
    // Sort by available space (ascending) to fill bins efficiently
    const sortedBins = [...binsWithSameSku].sort((a, b) => 
      (b.capacity - b.current_items) - (a.capacity - a.current_items)
    )
    return {
      success: true,
      binId: sortedBins[0].id
    }
  }

  // If no bins with same SKU, find the emptiest bin
  const sortedBySpace = [...binsWithSpace].sort((a, b) => 
    (b.capacity - b.current_items) - (a.capacity - a.current_items)
  )

  return {
    success: true,
    binId: sortedBySpace[0].id
  }
}

export function assignItemToBin(
  item: DBInventoryItem,
  binId: string
): BinAssignmentResult {
  const bin = mockDB.bins?.find(b => b.id === binId)
  
  if (!bin) {
    return {
      success: false,
      error: 'Bin not found'
    }
  }

  if (bin.current_items >= bin.capacity) {
    return {
      success: false,
      error: 'Bin is full'
    }
  }

  // Update bin
  bin.items.push(item.id)
  bin.current_items += 1

  // Update item location
  const itemIndex = mockDB.inventory_items.findIndex(i => i.id === item.id)
  if (itemIndex > -1) {
    mockDB.inventory_items[itemIndex] = {
      ...mockDB.inventory_items[itemIndex],
      location: `BIN-${binId}`,
      updated_at: new Date().toISOString()
    }
  }

  // Create event for bin assignment
  createEvent({
    event_type: 'ITEM_ASSIGNED_TO_BIN',
    item_id: item.id,
    metadata: {
      bin_id: binId,
      previous_location: item.location,
      new_location: `BIN-${binId}`,
      bin_capacity: bin.capacity,
      bin_current_items: bin.current_items
    }
  })

  return {
    success: true,
    binId
  }
}

// Helper to automatically assign an item to the best available bin
export function autoAssignItemToBin(
  item: DBInventoryItem
): BinAssignmentResult {
  const availableBins = mockDB.bins || []
  
  // Find the optimal bin
  const { success, binId, error } = findOptimalBin(item, availableBins)
  
  if (!success || !binId) {
    return { success: false, error: error || 'No suitable bin found' }
  }

  // Assign to the chosen bin
  return assignItemToBin(item, binId)
} 