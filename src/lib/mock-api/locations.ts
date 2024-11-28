import { nanoid } from 'nanoid'
import type { InventoryItem, Bin, Location } from '../types'
import { mockDB, createEvent } from '../mock-db/store'

// Bin Types
type BinType = 'STORAGE' | 'WASH' | 'QC' | 'PACKING'
type BinStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

interface BinAssignmentResult {
  bin: Bin
  location: string
  reason: string
}

export async function assignToBin(
  item: InventoryItem,
  binType: BinType
): Promise<BinAssignmentResult> {
  // 1. Get available bins of the specified type
  const availableBins = await getAvailableBins(binType)
  if (!availableBins.length) {
    throw new Error(`No available ${binType} bins`)
  }

  // 2. Find optimal bin based on SKU grouping rules
  const optimalBin = await findOptimalBin(item, availableBins)
  if (!optimalBin) {
    throw new Error('No suitable bin found for item')
  }

  // 3. Validate bin capacity
  await validateBinCapacity(optimalBin)

  // 4. Update bin and item
  const result = await assignItemToBin(item, optimalBin)

  return result
}

async function getAvailableBins(type: BinType): Promise<Bin[]> {
  return mockDB.bins.filter(bin => {
    return (
      bin.zone === type &&
      bin.status === 'ACTIVE' &&
      bin.current_count < bin.max_capacity
    )
  })
}

async function findOptimalBin(item: InventoryItem, bins: Bin[]): Promise<Bin | null> {
  // 1. First, look for bins with the same SKU
  const sameSKUBin = bins.find(bin => {
    return (
      bin.sku_groups[item.sku] &&
      bin.current_count < bin.max_capacity
    )
  })
  
  if (sameSKUBin) {
    await logBinSelection(sameSKUBin, item, 'same_sku')
    return sameSKUBin
  }

  // 2. Then, look for empty bins
  const emptyBin = bins.find(bin => bin.current_count === 0)
  if (emptyBin) {
    await logBinSelection(emptyBin, item, 'empty_bin')
    return emptyBin
  }

  // 3. Finally, find bin with most available space
  const sortedBins = [...bins].sort((a, b) => {
    const aSpace = a.max_capacity - a.current_count
    const bSpace = b.max_capacity - b.current_count
    return bSpace - aSpace
  })

  if (sortedBins[0]) {
    await logBinSelection(sortedBins[0], item, 'most_space')
    return sortedBins[0]
  }

  return null
}

async function validateBinCapacity(bin: Bin): Promise<void> {
  if (bin.current_count >= bin.max_capacity) {
    throw new Error('Bin is at capacity')
  }

  // Log capacity check
  await createEvent({
    event_type: 'BIN_CAPACITY_CHECK',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      bin_id: bin.id,
      current_count: bin.current_count,
      max_capacity: bin.max_capacity,
      available_space: bin.max_capacity - bin.current_count
    }
  })
}

async function assignItemToBin(
  item: InventoryItem,
  bin: Bin
): Promise<BinAssignmentResult> {
  // 1. Update bin counts and SKU groups
  const updatedBin = {
    ...bin,
    current_count: bin.current_count + 1,
    sku_groups: {
      ...bin.sku_groups,
      [item.sku]: (bin.sku_groups[item.sku] || 0) + 1
    },
    updated_at: new Date().toISOString()
  }

  // 2. Update bin in storage
  mockDB.bins = mockDB.bins.map(b =>
    b.id === bin.id ? updatedBin : b
  )

  // 3. Log assignment
  await createEvent({
    event_type: 'BIN_ASSIGNMENT',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      bin_id: bin.id,
      item_id: item.id,
      previous_location: item.location,
      new_location: bin.id,
      sku: item.sku
    }
  })

  return {
    bin: updatedBin,
    location: bin.id,
    reason: `Assigned to ${bin.zone} bin ${bin.name}`
  }
}

async function logBinSelection(bin: Bin, item: InventoryItem, reason: string): Promise<void> {
  await createEvent({
    event_type: 'BIN_SELECTION',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      bin_id: bin.id,
      item_id: item.id,
      selection_reason: reason,
      current_count: bin.current_count,
      max_capacity: bin.max_capacity,
      sku_groups: bin.sku_groups
    }
  })
}

// Bin Management
export async function createBin(params: {
  name: string
  zone: string
  max_capacity: number
  status?: BinStatus
}): Promise<Bin> {
  const bin: Bin = {
    id: `BIN-${nanoid(6)}`,
    name: params.name,
    zone: params.zone,
    max_capacity: params.max_capacity,
    current_count: 0,
    sku_groups: {},
    status: params.status || 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Log bin creation
  await createEvent({
    event_type: 'BIN_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      bin_id: bin.id,
      name: bin.name,
      zone: bin.zone,
      max_capacity: bin.max_capacity
    }
  })

  mockDB.bins.push(bin)
  return bin
}

export async function updateBinStatus(
  binId: string,
  status: BinStatus,
  reason?: string
): Promise<Bin> {
  const bin = mockDB.bins.find(b => b.id === binId)
  if (!bin) throw new Error('Bin not found')

  const updatedBin = {
    ...bin,
    status,
    updated_at: new Date().toISOString()
  }

  // Log status change
  await createEvent({
    event_type: 'BIN_STATUS_CHANGE',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      bin_id: bin.id,
      previous_status: bin.status,
      new_status: status,
      reason,
      current_count: bin.current_count
    }
  })

  mockDB.bins = mockDB.bins.map(b =>
    b.id === binId ? updatedBin : b
  )

  return updatedBin
}

export type { BinType, BinStatus, BinAssignmentResult } 