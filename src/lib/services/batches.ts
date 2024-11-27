import { nanoid } from 'nanoid'

// Simple batch type
export interface ProductionBatch {
  id: string
  sku: string
  quantity: number
  status: 'PENDING' | 'PATTERN_REQUESTED' | 'CUTTING' | 'COMPLETED'
  created_at: string
  updated_at: string
}

// Use a new storage key
const STORAGE_KEY = 'throne-production-batches'

// In-memory storage
let productionBatches: ProductionBatch[] = (() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
})()

// Helper to persist
const persistBatches = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productionBatches))
}

export const createBatch = (data: {
  sku: string
  quantity: number
  status?: ProductionBatch['status']
}): ProductionBatch => {
  const batch: ProductionBatch = {
    id: `batch_${nanoid(8)}`,
    sku: data.sku,
    quantity: data.quantity,
    status: data.status || 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  productionBatches.push(batch)
  persistBatches()
  return batch
}

export const getBatches = (): ProductionBatch[] => {
  return productionBatches
}

export const updateBatch = async (
  batchId: string, 
  updates: Partial<ProductionBatch>
): Promise<ProductionBatch> => {
  const batch = productionBatches.find(b => b.id === batchId)
  if (!batch) {
    throw new Error(`Batch not found: ${batchId}`)
  }

  const updatedBatch = {
    ...batch,
    ...updates,
    updated_at: new Date().toISOString()
  }

  productionBatches = productionBatches.map(b => 
    b.id === batchId ? updatedBatch : b
  )
  persistBatches()

  return updatedBatch
}

export const clearBatches = () => {
  productionBatches = []
  localStorage.removeItem(STORAGE_KEY)
} 