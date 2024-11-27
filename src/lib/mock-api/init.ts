import { nanoid } from 'nanoid'
import type { InventoryItem } from '../schema'

// Initialize mock data storage
const STORAGE_KEY = 'mockInventoryData'

// Helper to save to localStorage
function persistData(data: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Create initial mock data
function createInitialMockData(): InventoryItem[] {
  return [
    {
      id: nanoid(),
      sku: 'ST-24-X-30-STA',
      status1: 'STOCK',
      status2: 'UNCOMMITTED',
      batch_id: 'batch_123',
      location: 'BIN-1-Z1-1011',
      fabric_code: 'DEN-14.5-IND',
      original_sku: 'ST-24-X-30-RAW',
      production_date: '2024-01-15',
      production_batch: 'PROD-2024-001',
      active_stage: 'STOCK',
      quantity: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Add more mock items as needed
  ]
}

// Export the initialization function
export function initializeMockData() {
  // Check if data already exists
  const existingData = localStorage.getItem(STORAGE_KEY)
  if (!existingData) {
    // Create and persist initial data
    const initialData = createInitialMockData()
    persistData(initialData)
  }
}

// Export helper functions
export function getMockData(): InventoryItem[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function clearMockData() {
  localStorage.removeItem(STORAGE_KEY)
} 