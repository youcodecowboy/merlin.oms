import { delay } from '../utils'
import type { Batch, InventoryItem } from '../schema'
import mockDb from '@/data/mock-db.json'

export async function getMockBatches(params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}): Promise<{ items: Batch[]; total: number }> {
  await delay()

  let items = [...mockDb.batches]

  // Apply sorting
  items.sort((a, b) => {
    const aValue = a[params.sortBy as keyof Batch]
    const bValue = b[params.sortBy as keyof Batch]
    if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Apply pagination
  const start = (params.page - 1) * params.pageSize
  const paginatedItems = items.slice(start, start + params.pageSize)

  return {
    items: paginatedItems,
    total: items.length
  }
}

export async function getMockBatchDetails(id: string): Promise<{
  batch: Batch & { qr_codes: string[] }
  items: InventoryItem[]
}> {
  await delay()

  const batch = mockDb.batches.find(b => b.id === id)
  if (!batch) throw new Error('Batch not found')

  const items = mockDb.inventory.filter(item => item.batch_id === id)

  return {
    batch: {
      ...batch,
      qr_codes: items.map(item => item.qr_code).filter(Boolean) as string[]
    },
    items
  }
}

export async function updateMockBatchStatus(id: string, status: 'COMPLETED'): Promise<void> {
  await delay()

  const index = mockDb.batches.findIndex(batch => batch.id === id)
  if (index === -1) throw new Error('Batch not found')

  // Update batch status
  mockDb.batches[index] = {
    ...mockDb.batches[index],
    status,
    updated_at: new Date().toISOString()
  }

  // If batch is completed, update all associated inventory items
  if (status === 'COMPLETED') {
    mockDb.inventory = mockDb.inventory.map(item => {
      if (item.batch_id === id) {
        return {
          ...item,
          status1: 'STOCK',
          status2: 'UNCOMMITTED',
          updated_at: new Date().toISOString()
        }
      }
      return item
    })
  }
}

export async function updateMockBatch(id: string, data: Partial<Batch>): Promise<Batch> {
  await delay()

  const index = mockDb.batches.findIndex(batch => batch.id === id)
  if (index === -1) throw new Error('Batch not found')

  mockDb.batches[index] = {
    ...mockDb.batches[index],
    ...data,
    updated_at: new Date().toISOString()
  }

  return mockDb.batches[index]
}

// src/lib/mock-api/batches.ts

export async function deleteMockBatch(batchId) {
  console.log(`Mock API: Deleting batch with ID: ${batchId}`);
  // Simulate deletion logic here
}