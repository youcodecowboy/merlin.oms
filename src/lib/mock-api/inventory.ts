import { nanoid } from 'nanoid'
import type { InventoryItem } from '@/lib/schema'

// Initialize with default data
const defaultInventoryItems: InventoryItem[] = []

// Load persisted inventory data or use defaults
const loadPersistedData = () => {
  try {
    const savedInventoryItems = localStorage.getItem('mockInventoryItems')
    return savedInventoryItems ? JSON.parse(savedInventoryItems) : defaultInventoryItems
  } catch (error) {
    console.error('Failed to load inventory data:', error)
    return defaultInventoryItems
  }
}

// Initialize mock data
let mockInventoryItems: InventoryItem[] = loadPersistedData()

// Helper function to persist data
const persistData = () => {
  try {
    localStorage.setItem('mockInventoryItems', JSON.stringify(mockInventoryItems))
  } catch (error) {
    console.error('Failed to persist inventory data:', error)
  }
}

export async function createMockInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
  const item: InventoryItem = {
    id: `inv_${nanoid()}`,
    sku: data.sku!,
    status1: data.status1 || 'STOCK',
    status2: data.status2 || 'UNCOMMITTED',
    qr_code: data.qr_code || `qr_${nanoid()}`,
    batch_id: data.batch_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  mockInventoryItems.push(item)
  persistData()
  return item
}

export async function getMockInventoryItems(): Promise<InventoryItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockInventoryItems || []
}

export async function getMockInventoryItemById(id: string): Promise<InventoryItem | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockInventoryItems.find(item => item.id === id)
}

export async function updateMockInventoryItem(
  id: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem> {
  const index = mockInventoryItems.findIndex(item => item.id === id)
  if (index === -1) throw new Error('Inventory item not found')

  const updatedItem: InventoryItem = {
    ...mockInventoryItems[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  mockInventoryItems[index] = updatedItem
  persistData()
  return updatedItem
}

export async function deleteMockInventoryItem(id: string): Promise<boolean> {
  const index = mockInventoryItems.findIndex(item => item.id === id)
  if (index === -1) return false

  mockInventoryItems.splice(index, 1)
  persistData()
  return true
}

export async function getMockInventoryItemsByBatch(batchId: string): Promise<InventoryItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockInventoryItems.filter(item => item.batch_id === batchId) || []
}

export async function handleInventoryQRScan(qrCode: string): Promise<InventoryItem | null> {
  const item = mockInventoryItems.find(item => item.qr_code === qrCode)
  return item || null
}

export async function addMockInventoryItems(items: Partial<InventoryItem>[]): Promise<InventoryItem[]> {
  const newItems = await Promise.all(
    items.map(item => createMockInventoryItem(item))
  )
  return newItems
}

export async function getMockInventoryEvents(itemId: string): Promise<any[]> {
  // Mock implementation - replace with actual events data structure
  return []
}

// Export the mock data and types
export { mockInventoryItems }
export type { InventoryItem }