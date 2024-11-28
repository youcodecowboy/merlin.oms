import type { InventoryItem, Bin, Order, SKU, Status1, Status2 } from '../types'

// Event interface
interface Event {
  id: string
  event_type: string
  timestamp: Date
  actor_id: string
  metadata: Record<string, any>
}

// Request Step Types
export interface RequestStep {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  requiresScan?: boolean
}

export interface StepUpdate {
  stepId: number
  status: RequestStep['status']
  metadata?: Record<string, any>
}

// Initialize store
const store = {
  inventory_items: [] as InventoryItem[],
  bins: [] as Bin[],
  events: [] as Event[],
  requests: [] as any[],
  orders: [] as Order[]
}

// Export store instance
export const mockDB = store

// Event Management
export function createEvent(params: Omit<Event, 'id'>): Event {
  const event = {
    id: crypto.randomUUID(),
    ...params
  }
  store.events.push(event)
  persistState()
  return event
}

export function getEvents(filters?: Partial<Event>): Event[] {
  let events = store.events
  if (filters) {
    events = events.filter(event => {
      return Object.entries(filters).every(([key, value]) => 
        event[key as keyof Event] === value
      )
    })
  }
  return events
}

// State persistence
const STORAGE_KEY = 'mockDBState'

export function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDB))
  } catch (error) {
    console.error('Failed to persist state:', error)
  }
}

export function loadPersistedState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      Object.assign(mockDB, parsed)
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error)
  }
}

// Auto-load persisted state
loadPersistedState()

// CRUD Operations
export function addInventoryItem(item: InventoryItem) {
  store.inventory_items.push(item)
  persistState()
}

export function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
  const index = store.inventory_items.findIndex(item => item.id === id)
  if (index !== -1) {
    store.inventory_items[index] = {
      ...store.inventory_items[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    persistState()
  }
}

export function getInventoryItem(id: string): InventoryItem | undefined {
  return store.inventory_items.find(item => item.id === id)
}

export function addBin(bin: Bin) {
  store.bins.push(bin)
  persistState()
}

export function updateBin(id: string, updates: Partial<Bin>) {
  const index = store.bins.findIndex(bin => bin.id === id)
  if (index !== -1) {
    store.bins[index] = {
      ...store.bins[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    persistState()
  }
}

export function getBin(id: string): Bin | undefined {
  return store.bins.find(bin => bin.id === id)
}

// Request Step Management
export async function updateRequestSteps(
  requestId: string,
  updates: StepUpdate[]
): Promise<void> {
  const request = store.requests.find(r => r.id === requestId)
  if (!request) throw new Error('Request not found')

  // Validate step updates
  validateStepUpdates(request, updates)

  // Update steps
  const updatedSteps = request.steps.map(step => {
    const update = updates.find(u => u.stepId === step.id)
    if (update) {
      return {
        ...step,
        status: update.status,
        metadata: { ...step.metadata, ...update.metadata }
      }
    }
    return step
  })

  // Check if all steps are complete
  const allComplete = updatedSteps.every(step => step.status === 'completed')
  const newStatus = allComplete ? 'COMPLETED' : request.status

  // Update request
  const updatedRequest = {
    ...request,
    steps: updatedSteps,
    status: newStatus,
    updated_at: new Date().toISOString()
  }

  // Log step updates
  await createEvent({
    event_type: 'REQUEST_STEPS_UPDATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      request_id: requestId,
      updates,
      all_complete: allComplete,
      new_status: newStatus
    }
  })

  // Update in storage
  store.requests = store.requests.map(r =>
    r.id === requestId ? updatedRequest : r
  )

  persistState()
}

// Helper function for step validation
function validateStepUpdates(request: any, updates: StepUpdate[]): void {
  // Ensure steps exist
  updates.forEach(update => {
    const stepExists = request.steps.some((step: any) => step.id === update.stepId)
    if (!stepExists) {
      throw new Error(`Step ${update.stepId} not found in request ${request.id}`)
    }
  })

  // Validate step order
  const currentStep = getCurrentStep(request)
  updates.forEach(update => {
    if (update.stepId < currentStep) {
      throw new Error('Cannot update completed steps')
    }
  })
}

function getCurrentStep(request: any): number {
  const lastCompleted = request.steps
    .filter((step: any) => step.status === 'completed')
    .map((step: any) => step.id)
    .sort((a: number, b: number) => b - a)[0]

  return lastCompleted ? lastCompleted + 1 : 1
}

// Test Data Generation
export function createHanSoloOrder(): Order {
  const order: Order = {
    id: `ORD-${nanoid(6)}`,
    customer_id: 'SOLO-001',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      target_sku: 'ST-32-X-32-IND',
      quantity: 1,
      priority: 'HIGH',
      customer_name: 'Han Solo',
      shipping_address: 'Millennium Falcon, Docking Bay 94, Mos Eisley, Tatooine'
    }
  }

  // Add to store
  store.orders.push(order)
  
  // Log creation
  createEvent({
    event_type: 'TEST_ORDER_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      order_id: order.id,
      customer: 'Han Solo',
      test_data: true
    }
  })

  return order
}

export function createLukeSkywalkerOrder(): Order {
  const order: Order = {
    id: `ORD-${nanoid(6)}`,
    customer_id: 'SKYW-001',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      target_sku: 'ST-30-S-30-STA',
      quantity: 1,
      priority: 'MEDIUM',
      customer_name: 'Luke Skywalker',
      shipping_address: 'Lars Homestead, Great Chott Salt Flat, Tatooine'
    }
  }

  // Add to store
  store.orders.push(order)
  
  // Log creation
  createEvent({
    event_type: 'TEST_ORDER_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      order_id: order.id,
      customer: 'Luke Skywalker',
      test_data: true
    }
  })

  return order
}

export function clearTestData(): void {
  // Clear all test data from store
  store.orders = store.orders.filter(order => !order.metadata?.test_data)
  store.inventory_items = store.inventory_items.filter(item => !item.metadata?.test_data)
  store.requests = store.requests.filter(request => !request.metadata?.test_data)
  store.events = store.events.filter(event => !event.metadata?.test_data)

  // Log cleanup
  createEvent({
    event_type: 'TEST_DATA_CLEARED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      cleared_at: new Date().toISOString()
    }
  })

  // Persist changes
  persistState()
}

// Add after the test data generation functions

interface CreateInventoryParams {
  sku: SKU
  status1?: Status1
  status2?: Status2
  location?: string
  metadata?: Record<string, any>
}

export function createInventoryItem(params: CreateInventoryParams): InventoryItem {
  const item: InventoryItem = {
    id: `INV-${nanoid(6)}`,
    sku: params.sku,
    status1: params.status1 || 'STOCK',
    status2: params.status2 || 'UNCOMMITTED',
    location: params.location || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Add to store
  store.inventory_items.push(item)

  // Log creation
  createEvent({
    event_type: 'INVENTORY_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      item_id: item.id,
      sku: item.sku,
      initial_status1: item.status1,
      initial_status2: item.status2,
      location: item.location,
      test_data: params.metadata?.test_data || false
    }
  })

  // Persist changes
  persistState()

  return item
}

export function createRandomInventoryItem(): InventoryItem {
  // Generate random SKU components
  const styles = ['ST', 'MT', 'LT']
  const waists = ['28', '30', '32', '34', '36']
  const shapes = ['S', 'R', 'X']
  const lengths = ['30', '32', '34', '36']
  const washes = ['RAW', 'BRW', 'STA', 'IND', 'ONX', 'JAG']

  const randomSKU = [
    styles[Math.floor(Math.random() * styles.length)],
    waists[Math.floor(Math.random() * waists.length)],
    shapes[Math.floor(Math.random() * shapes.length)],
    lengths[Math.floor(Math.random() * lengths.length)],
    washes[Math.floor(Math.random() * washes.length)]
  ].join('-')

  // Create inventory item with random SKU
  const item = createInventoryItem({
    sku: randomSKU,
    status1: 'STOCK',
    status2: 'UNCOMMITTED',
    location: 'STORAGE',
    metadata: {
      test_data: true,
      generated: 'random'
    }
  })

  // Log random item creation
  createEvent({
    event_type: 'RANDOM_ITEM_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      item_id: item.id,
      sku: item.sku,
      test_data: true
    }
  })

  return item
}

export function createRandomOrder(): Order {
  // Generate random customer details
  const customers = [
    { id: 'SOLO-001', name: 'Han Solo' },
    { id: 'SKYW-001', name: 'Luke Skywalker' },
    { id: 'ORGA-001', name: 'Leia Organa' },
    { id: 'CALA-001', name: 'Lando Calrissian' }
  ]
  const customer = customers[Math.floor(Math.random() * customers.length)]

  // Generate random SKU components
  const styles = ['ST', 'MT', 'LT']
  const waists = ['28', '30', '32', '34', '36']
  const shapes = ['S', 'R', 'X']
  const lengths = ['30', '32', '34', '36']
  const washes = ['STA', 'IND', 'ONX', 'JAG']

  const randomSKU = [
    styles[Math.floor(Math.random() * styles.length)],
    waists[Math.floor(Math.random() * waists.length)],
    shapes[Math.floor(Math.random() * shapes.length)],
    lengths[Math.floor(Math.random() * lengths.length)],
    washes[Math.floor(Math.random() * washes.length)]
  ].join('-')

  // Create order
  const order: Order = {
    id: `ORD-${nanoid(6)}`,
    customer_id: customer.id,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      target_sku: randomSKU,
      quantity: 1,
      priority: 'MEDIUM',
      customer_name: customer.name,
      test_data: true,
      generated: 'random'
    }
  }

  // Add to store
  store.orders.push(order)

  // Log creation
  createEvent({
    event_type: 'RANDOM_ORDER_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      order_id: order.id,
      customer_id: customer.id,
      customer_name: customer.name,
      target_sku: randomSKU,
      test_data: true
    }
  })

  return order
}

// Add after other test data generation functions

export function createTestQCRequest(): Request {
  // Create a test inventory item first
  const item = createRandomInventoryItem()
  
  // Create QC request
  const request: Request = {
    id: `REQ-${nanoid(6)}`,
    type: 'QC_REQUEST',
    status: 'PENDING',
    priority: 'HIGH',
    steps: [
      {
        id: 1,
        title: 'Initial Inspection',
        description: 'Perform visual inspection of item',
        status: 'pending',
        requiresScan: true
      },
      {
        id: 2,
        title: 'Measurements',
        description: 'Take and record all measurements',
        status: 'pending',
        requiresScan: false
      },
      {
        id: 3,
        title: 'Quality Check',
        description: 'Verify all quality standards are met',
        status: 'pending',
        requiresScan: false
      }
    ],
    inventory_item: item,
    metadata: {
      test_data: true,
      previous_status: 'WASH',
      notes: 'Test QC request for development'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Add to store
  store.requests.push(request)

  // Log creation
  createEvent({
    event_type: 'TEST_REQUEST_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      request_id: request.id,
      request_type: request.type,
      item_id: item.id,
      test_data: true
    }
  })

  return request
}

export function createTestWashRequest(): Request {
  // Create a test inventory item first
  const item = createRandomInventoryItem()
  
  // Create wash request
  const request: Request = {
    id: `REQ-${nanoid(6)}`,
    type: 'WASH_REQUEST',
    status: 'PENDING',
    priority: 'HIGH',
    steps: [
      {
        id: 1,
        title: 'Find Unit',
        description: 'Locate and scan unit in current location',
        status: 'pending',
        requiresScan: true
      },
      {
        id: 2,
        title: 'Transport to Wash Bin',
        description: 'Transport to assigned wash bin',
        status: 'pending',
        requiresScan: true
      },
      {
        id: 3,
        title: 'Confirm Placement',
        description: 'Place unit in bin and confirm',
        status: 'pending',
        requiresScan: true
      }
    ],
    inventory_item: item,
    metadata: {
      test_data: true,
      target_wash: 'IND',
      wash_bin: 'WASH-BIN-001',
      notes: 'Test wash request for development'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Add to store
  store.requests.push(request)

  // Log creation
  createEvent({
    event_type: 'TEST_REQUEST_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      request_id: request.id,
      request_type: request.type,
      item_id: item.id,
      target_wash: request.metadata.target_wash,
      test_data: true
    }
  })

  return request
}

// Add after other test data functions

export async function resetMockData(): Promise<void> {
  // Clear all data
  store.orders = []
  store.inventory_items = []
  store.requests = []
  store.events = []
  store.bins = []

  // Create test data
  const order1 = createHanSoloOrder()
  const order2 = createLukeSkywalkerOrder()
  
  // Create some test inventory items
  for (let i = 0; i < 5; i++) {
    createRandomInventoryItem()
  }

  // Create test requests
  const qcRequest = createTestQCRequest()
  const washRequest = createTestWashRequest()

  // Log reset event
  await createEvent({
    event_type: 'MOCK_DATA_RESET',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      orders_created: [order1.id, order2.id],
      inventory_count: 5,
      requests_created: [qcRequest.id, washRequest.id],
      reset_time: new Date().toISOString()
    }
  })

  // Persist changes
  persistState()
}

// Add after other functions

interface BinAssignmentResult {
  bin: Bin
  location: string
  reason: string
}

export async function assignItemToBin(
  item: InventoryItem,
  bin: Bin
): Promise<BinAssignmentResult> {
  // 1. Validate bin capacity
  if (bin.current_count >= bin.max_capacity) {
    throw new Error('Bin is at capacity')
  }

  // 2. Update bin counts and SKU groups
  const updatedBin = {
    ...bin,
    current_count: bin.current_count + 1,
    sku_groups: {
      ...bin.sku_groups,
      [item.sku]: (bin.sku_groups[item.sku] || 0) + 1
    },
    updated_at: new Date().toISOString()
  }

  // 3. Update bin in storage
  store.bins = store.bins.map(b =>
    b.id === bin.id ? updatedBin : b
  )

  // 4. Update item location
  const updatedItem = {
    ...item,
    location: bin.id,
    updated_at: new Date().toISOString()
  }

  store.inventory_items = store.inventory_items.map(i =>
    i.id === item.id ? updatedItem : i
  )

  // 5. Log assignment
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

  // 6. Persist changes
  persistState()

  return {
    bin: updatedBin,
    location: bin.id,
    reason: `Assigned to ${bin.zone} bin ${bin.name}`
  }
}

// Update export registry
export type { BinAssignmentResult }

// Add some test events if none exist
if (store.events.length === 0) {
  createEvent({
    event_type: 'SYSTEM_STARTUP',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      version: '1.0.0',
      environment: process.env.NODE_ENV
    }
  })

  createEvent({
    event_type: 'TEST_DATA_CREATED',
    timestamp: new Date(),
    actor_id: 'system',
    metadata: {
      test_type: 'initial_setup',
      data_count: 1
    }
  })
} 