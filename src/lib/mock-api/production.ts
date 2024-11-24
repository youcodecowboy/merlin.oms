import { nanoid } from 'nanoid'
import type { PendingProduction } from '@/lib/schema'
import { createMockPatternRequest } from './requests'
import { createMockInventoryItem } from './inventory'

export interface ProductionBatch {
  id: string
  sku: string
  quantity: number
  qr_codes: string[]
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  created_at: string
  updated_at?: string
  notes?: string
}

// Initialize mock data with default values
const defaultPendingProduction: PendingProduction[] = [
  {
    id: 'pp_001',
    sku: 'ST-32-X-32-IND',
    quantity: 25,
    priority: 'HIGH',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Load persisted data or use defaults
const loadPersistedData = () => {
  try {
    const savedPendingProduction = localStorage.getItem('mockPendingProduction')
    const savedProductionBatches = localStorage.getItem('mockProductionBatches')

    return {
      pendingProduction: savedPendingProduction ? 
        JSON.parse(savedPendingProduction) : defaultPendingProduction,
      productionBatches: savedProductionBatches ? 
        JSON.parse(savedProductionBatches) : []
    }
  } catch (error) {
    console.error('Failed to load persisted data:', error)
    return {
      pendingProduction: defaultPendingProduction,
      productionBatches: []
    }
  }
}

// Initialize with persisted or default data
const { pendingProduction: mockPendingProduction, productionBatches: mockProductionBatches } = loadPersistedData()

// Helper function to persist data
const persistData = () => {
  try {
    localStorage.setItem('mockPendingProduction', JSON.stringify(mockPendingProduction))
    localStorage.setItem('mockProductionBatches', JSON.stringify(mockProductionBatches))
  } catch (error) {
    console.error('Failed to persist data:', error)
  }
}

// API Functions
export async function getMockPendingProduction(): Promise<PendingProduction[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockPendingProduction
}

export async function getMockProductionBatches(): Promise<ProductionBatch[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockProductionBatches
}

export async function createMockPendingProduction(data: Partial<PendingProduction>): Promise<PendingProduction> {
  const newProduction: PendingProduction = {
    id: `pp_${nanoid()}`,
    sku: data.sku!,
    quantity: data.quantity!,
    priority: data.priority || 'MEDIUM',
    status: 'PENDING',
    notes: data.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  mockPendingProduction.push(newProduction)
  persistData()
  return newProduction
}

export async function acceptMockProductionRequest(id: string): Promise<{ 
  success: boolean;
  batchId?: string;
  patternRequestId?: string;
}> {
  console.log('Starting production request acceptance:', id)
  const request = mockPendingProduction.find(p => p.id === id)
  if (!request) {
    throw new Error('Production request not found')
  }

  try {
    // 1. Create a production batch with QR codes
    const batchId = `batch_${nanoid()}`
    const qrCodes = Array.from({ length: request.quantity }, () => `qr_${nanoid()}`)
    console.log(`Generated ${qrCodes.length} QR codes for batch ${batchId}`)

    const batch: ProductionBatch = {
      id: batchId,
      sku: request.sku,
      quantity: request.quantity,
      qr_codes: qrCodes,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      notes: request.notes
    }
    mockProductionBatches.push(batch)
    console.log('Created production batch:', batch)

    // 2. Create inventory items with PRODUCTION status
    console.log('Creating inventory items...')
    const inventoryPromises = qrCodes.map((qrCode, index) => 
      createMockInventoryItem({
        sku: request.sku,
        status1: 'PRODUCTION',
        status2: 'UNCOMMITTED',
        qr_code: qrCode,
        batch_id: batchId,
        line_item: index + 1
      })
    )
    const inventoryItems = await Promise.all(inventoryPromises)
    console.log(`Created ${inventoryItems.length} inventory items`)

    // 3. Create pattern request
    console.log('Creating pattern request...')
    const patternRequest = await createMockPatternRequest({
      sku: request.sku,
      quantity: request.quantity,
      priority: request.priority,
      batch_id: batchId,
      production_batch_id: batchId, // Link to production batch
      notes: request.notes
    })
    console.log('Created pattern request:', patternRequest)

    // 4. Remove from pending production
    const index = mockPendingProduction.findIndex(p => p.id === id)
    if (index !== -1) {
      mockPendingProduction.splice(index, 1)
      console.log('Removed request from pending production')
    }

    // 5. Persist all changes
    persistData()
    console.log('All changes persisted')

    // 6. Generate QR code PDF (mock)
    console.log('QR codes ready for printing:', qrCodes)

    return {
      success: true,
      batchId: batch.id,
      patternRequestId: patternRequest.id
    }
  } catch (error) {
    console.error('Failed to accept production request:', error)
    throw error
  }
}

export async function updateMockProductionBatch(
  id: string,
  updates: Partial<ProductionBatch>
): Promise<ProductionBatch> {
  const index = mockProductionBatches.findIndex(b => b.id === id)
  if (index === -1) throw new Error('Batch not found')

  mockProductionBatches[index] = {
    ...mockProductionBatches[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  persistData()
  return mockProductionBatches[index]
}

// Export mock data for testing
export { mockPendingProduction, mockProductionBatches }