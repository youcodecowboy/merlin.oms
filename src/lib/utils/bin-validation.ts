import type { Bin, InventoryItem } from '@/lib/types'
import { eventLogger } from './logging'

interface BinValidationResult {
  valid: boolean
  error?: string
}

interface BinCapacityCheck {
  currentCount: number
  maxCapacity: number
  skuGroups: Record<string, number>
}

export async function validateBinAvailability(bins: Bin[]): Promise<BinValidationResult> {
  // Must have at least one active bin
  if (!bins.length) {
    return {
      valid: false,
      error: "No active bins available. Please create a bin first."
    }
  }

  // Check if any bins have capacity
  const hasCapacity = bins.some(bin => !isBinFull(bin))
  if (!hasCapacity) {
    return {
      valid: false,
      error: "All bins are at capacity. Please create a new bin."
    }
  }

  return { valid: true }
}

export async function findOptimalBin(
  item: InventoryItem,
  bins: Bin[]
): Promise<Bin | null> {
  // 1. Look for existing bin with same SKU
  const sameSKUBin = bins.find(bin => 
    !isBinFull(bin) && hasSameSKU(bin, item.sku)
  )
  if (sameSKUBin) {
    await logBinSelection(sameSKUBin, item, 'same_sku')
    return sameSKUBin
  }

  // 2. Look for empty bin
  const emptyBin = bins.find(bin => isEmpty(bin))
  if (emptyBin) {
    await logBinSelection(emptyBin, item, 'empty')
    return emptyBin
  }

  // 3. Find bin with most available space (last resort)
  const availableBins = bins.filter(bin => !isBinFull(bin))
  if (availableBins.length) {
    const optimalBin = availableBins.reduce((prev, curr) => 
      getAvailableSpace(curr) > getAvailableSpace(prev) ? curr : prev
    )
    await logBinSelection(optimalBin, item, 'space_available')
    return optimalBin
  }

  return null
}

function isBinFull(bin: Bin): boolean {
  return bin.current_count >= bin.max_capacity
}

function isEmpty(bin: Bin): boolean {
  return bin.current_count === 0
}

function hasSameSKU(bin: Bin, sku: string): boolean {
  return bin.sku_groups && Object.keys(bin.sku_groups).includes(sku)
}

function getAvailableSpace(bin: Bin): number {
  return bin.max_capacity - bin.current_count
}

async function logBinSelection(bin: Bin, item: InventoryItem, reason: string) {
  await eventLogger.logEvent({
    event_type: 'BIN_UPDATE',
    event_id: crypto.randomUUID(),
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      bin_id: bin.id,
      item_id: item.id,
      selection_reason: reason,
      available_space: getAvailableSpace(bin)
    }
  })
} 