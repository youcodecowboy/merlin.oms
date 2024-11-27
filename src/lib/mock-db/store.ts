import { saveToStorage, loadFromStorage } from '@/lib/utils/storage'
import { getWashTypeFromSkus, SKU_TRANSFORMATIONS } from '@/lib/schema/database'
import type { 
  DBInventoryItem, 
  DBRequest, 
  DBEvent,
  DBOrder,
  DBCustomer 
} from '@/lib/schema/database'
import { EventType, OrderStatus, ORDER_STATUS_FLOW } from '@/lib/schema/events'
import { 
  EventMetadata, 
  EventType, 
  DBEvent 
} from '@/lib/schema/events'
import {
  OrderStatus,
  ItemStatus1,
  ItemStatus2,
  LocationType,
  validateStatusTransition,
  validateLocationForStatus,
  STATUS_LOCATIONS
} from '@/lib/schema/status'
import { generateUniqueInventoryId } from '@/lib/utils/id-generator'
import { findOptimalBin, assignItemToBin } from '@/lib/utils/bin-assignment'
import { validateInventoryCreation } from '@/lib/utils/validators'

// Define valid locations for each status
const STATUS_LOCATIONS: Record<ItemStatus1, LocationType[]> = {
  'PRODUCTION': ['PRODUCTION_FLOOR'],
  'STOCK': ['WAREHOUSE'],
  'WASH': ['WASH-STA', 'WASH-IND', 'WASH-ONX', 'WASH-JAG'],
  'QC': ['QC_STATION'],
  'FINISH': ['FINISHING'],
  'PACKING': ['PACKING'],
  'FULFILLMENT': ['SHIPPING'],
  'FULFILLED': ['SHIPPING']
}

// Initial mock data
const INITIAL_MOCK_DATA = {
  inventory_items: [
    // ... existing inventory items ...
  ],
  orders: [],
  customers: [],
  requests: [],
  events: [],
  bins: []
}

// Initialize store with data from storage or defaults
export const mockDB = loadFromStorage() || structuredClone(INITIAL_MOCK_DATA)

// Single persistState function definition
function persistState() {
  try {
    saveToStorage(mockDB)
  } catch (error) {
    console.error('Failed to persist state:', error)
    throw error
  }
}

// Single definition of createWashRequestForItem
function createWashRequestForItem(item: DBInventoryItem) {
  try {
    console.log('Creating wash request for item:', item)
    
    // Get wash type from SKUs
    const washType = getWashTypeFromSkus(item.current_sku, item.target_sku)
    console.log('Determined wash type:', washType)
    
    const washLocation = `WASH-${washType.wash}` as LocationType
    console.log('Wash location:', washLocation)

    // Validate location before proceeding
    const validLocations = STATUS_LOCATIONS['WASH']
    if (!validLocations.includes(washLocation)) {
      throw new Error(`Invalid wash location: ${washLocation}. Valid locations are: ${validLocations.join(', ')}`)
    }

    // Create wash request
    const washRequest: DBRequest = {
      id: `req-${Date.now()}`,
      item_id: item.id,
      request_type: 'WASHING',
      status: 'PENDING',
      priority: 'HIGH',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        order_id: item.order_id,
        order_number: item.metadata?.order_number,
        wash_type: washType.wash,
        assigned_bin: washLocation,
        steps: [
          {
            id: '1',
            title: 'Scan Item',
            description: `Scan ${item.current_sku} to begin wash process`,
            status: 'IN_PROGRESS',
            completed_at: null
          },
          {
            id: '2',
            title: 'Scan Wash Bin',
            description: `Place unit in bin: ${washType.name}`,
            status: 'PENDING',
            completed_at: null
          },
          {
            id: '3',
            title: 'Confirm',
            description: `Verify item placement in ${washType.name} wash bin`,
            status: 'PENDING',
            completed_at: null
          }
        ]
      }
    }

    // Update item status and location directly
    const itemIndex = mockDB.inventory_items.findIndex(i => i.id === item.id)
    if (itemIndex === -1) {
      throw new Error('Item not found')
    }

    mockDB.inventory_items[itemIndex] = {
      ...mockDB.inventory_items[itemIndex],
      status1: 'WASH',
      location: washLocation,
      updated_at: new Date().toISOString()
    }

    // Add request to mockDB
    mockDB.requests.push(washRequest)

    // Create event for wash request creation
    createEvent({
      event_type: 'WASH_REQUEST_CREATED',
      item_id: item.id,
      order_id: item.order_id,
      metadata: {
        request_id: washRequest.id,
        wash_type: washType.wash,
        target_bin: washType.name,
        current_sku: item.current_sku,
        target_sku: item.target_sku,
        previous_location: item.location,
        new_location: washLocation
      }
    })

    persistState()
    console.log('Successfully created wash request')
    return { success: true, request: washRequest }
  } catch (error) {
    console.error('Failed to create wash request:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create wash request'
    }
  }
}

// Update the updateInventoryItem function to handle wash request creation
export function updateInventoryItem(item: Partial<DBInventoryItem> & { id: string }) {
  const index = mockDB.inventory_items.findIndex(i => i.id === item.id)
  if (index > -1) {
    const oldItem = mockDB.inventory_items[index]
    const newItem = {
      ...oldItem,
      ...item,
      updated_at: new Date().toISOString()
    }

    // Check if item has become STOCK and ASSIGNED
    if (
      newItem.status1 === 'STOCK' && 
      newItem.status2 === 'ASSIGNED' && 
      (oldItem.status2 !== 'ASSIGNED' || oldItem.status1 !== 'STOCK')
    ) {
      // Create wash request
      createWashRequestForItem(newItem)
    }

    // Update item
    mockDB.inventory_items[index] = newItem
    persistState()
  }
}

// Enhanced event creation with full metadata tracking
function createEvent(data: {
  event_type: EventType
  item_id?: string
  order_id?: string
  metadata: EventMetadata
}) {
  try {
    // Gather additional context based on IDs
    let enrichedMetadata = { ...data.metadata }

    // Enrich with item data if item_id exists
    if (data.item_id) {
      const item = mockDB.inventory_items.find(i => i.id === data.item_id)
      if (item) {
        enrichedMetadata = {
          ...enrichedMetadata,
          current_sku: item.current_sku,
          target_sku: item.target_sku,
          item_status1: item.status1,
          item_status2: item.status2,
          item_location: item.location,
          batch_id: item.batch_id
        }
      }
    }

    // Enrich with order data if order_id exists
    if (data.order_id) {
      const order = mockDB.orders.find(o => o.id === data.order_id)
      if (order) {
        enrichedMetadata = {
          ...enrichedMetadata,
          order_number: order.number,
          order_status: order.status,
          customer_id: order.customer_id,
          customer_name: order.customer_name
        }

        // Add customer data if available
        const customer = mockDB.customers.find(c => c.id === order.customer_id)
        if (customer) {
          enrichedMetadata = {
            ...enrichedMetadata,
            customer_email: customer.email,
            customer_tags: customer.tags
          }
        }
      }
    }

    // Create event with enriched metadata
    const event: DBEvent = {
      id: `evt-${Date.now()}`,
      event_type: data.event_type,
      item_id: data.item_id,
      order_id: data.order_id,
      created_at: new Date().toISOString(),
      created_by: 'SYSTEM', // Could be replaced with actual user in real app
      metadata: enrichedMetadata
    }

    // Add event to store
    mockDB.events.push(event)
    persistState()

    // Handle status updates based on event type
    handleEventStatusUpdates(event)

    return event
  } catch (error) {
    console.error('Failed to create event:', error)
    throw error
  }
}

// Handle status updates based on events
function handleEventStatusUpdates(event: DBEvent) {
  switch (event.event_type) {
    case 'WASH_REQUEST_CREATED':
      if (event.order_id) {
        updateOrderStatus(event.order_id, 'WASH_REQUEST')
      }
      if (event.item_id) {
        updateItemStatus(event.item_id, 'WASH', event.metadata.bin_location as LocationType)
      }
      break;

    case 'WASH_COMPLETED':
      if (event.order_id) {
        updateOrderStatus(event.order_id, 'QC_PENDING')
      }
      if (event.item_id) {
        updateItemStatus(event.item_id, 'QC', 'QC_STATION')
      }
      break;

    // Add more status update handlers
  }
}

// Update item status with validation
export function updateItemStatus(
  itemId: string, 
  status1: ItemStatus1, 
  location: LocationType
) {
  const validLocations = STATUS_LOCATIONS[status1]
  if (!validLocations.includes(location)) {
    throw new Error(`Invalid location ${location} for status ${status1}. Valid locations are: ${validLocations.join(', ')}`)
  }

  const itemIndex = mockDB.inventory_items.findIndex(i => i.id === itemId)
  if (itemIndex === -1) return

  const item = mockDB.inventory_items[itemIndex]

  // Update item
  mockDB.inventory_items[itemIndex] = {
    ...item,
    status1,
    location,
    updated_at: new Date().toISOString()
  }

  // Create status change event
  createEvent({
    event_type: 'ITEM_STATUS_CHANGED',
    item_id: itemId,
    order_id: item.order_id,
    metadata: {
      previous_status: item.status1,
      new_status: status1,
      previous_location: item.location,
      new_location: location,
      reason: 'Status update based on workflow'
    }
  })

  persistState()
}

// Update order status with validation
function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const orderIndex = mockDB.orders.findIndex(o => o.id === orderId)
  if (orderIndex === -1) return

  const order = mockDB.orders[orderIndex]
  const statusValidation = validateStatusTransition(order.status, newStatus)

  if (!statusValidation.valid) {
    throw new Error(statusValidation.error)
  }

  // Update order
  mockDB.orders[orderIndex] = {
    ...order,
    status: newStatus,
    updated_at: new Date().toISOString()
  }

  // Create status change event
  createEvent({
    event_type: 'ORDER_STATUS_CHANGED',
    order_id: orderId,
    metadata: {
      previous_status: order.status,
      new_status: newStatus,
      reason: 'Status update based on workflow'
    }
  })

  persistState()
}

// Update createHanSoloOrder to include events
export function createHanSoloOrder() {
  try {
    // Create customer
    const customer = {
      id: `cust-${Date.now()}`,
      name: 'Han Solo',
      email: 'han.solo@falcon.com',
      tags: ['VIP', 'PILOT'],
      created_at: new Date().toISOString()
    }
    mockDB.customers.push(customer)

    // Create order
    const order = {
      id: `order-${Date.now()}`,
      number: `ORD-${Math.floor(Math.random() * 10000)}`,
      customer_id: customer.id,
      customer_name: customer.name,
      status: 'PROCESSING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        priority: 'HIGH',
        notes: 'Special handling required'
      }
    }
    mockDB.orders.push(order)

    // Create inventory item - start in STOCK status
    const item = {
      id: `inv-${Date.now()}`,
      current_sku: 'ST-32-X-36-RAW',
      target_sku: 'ST-32-X-32-STR',
      status1: 'STOCK', // Start as STOCK
      status2: 'ASSIGNED',
      batch_id: `BATCH-${Date.now()}`,
      location: 'WAREHOUSE', // Start in WAREHOUSE
      order_id: order.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        customer_id: customer.id,
        order_number: order.number
      }
    }
    mockDB.inventory_items.push(item)

    // Create initial event
    createEvent({
      event_type: 'ORDER_CREATED',
      item_id: item.id,
      order_id: order.id,
      metadata: {
        customer_name: customer.name,
        order_number: order.number
      }
    })

    // Now create the wash request which will handle the status change
    const washRequest = createWashRequestForItem(item)
    if (!washRequest.success) {
      throw new Error(washRequest.error || 'Failed to create wash request')
    }

    persistState()
    return { customer, order, item }
  } catch (error) {
    console.error('Failed to create Han Solo order:', error)
    throw error
  }
}

export function resetMockData() {
  Object.assign(mockDB, structuredClone(INITIAL_MOCK_DATA))
  persistState()
}

export function createTestWashRequest() {
  try {
    // Find an available STOCK item
    const availableItem = mockDB.inventory_items.find(item => 
      item.status1 === 'STOCK' && 
      item.status2 === 'UNCOMMITTED' &&
      (item.current_sku.endsWith('RAW') || item.current_sku.endsWith('BRW'))
    )

    if (!availableItem) {
      throw new Error('No available stock items')
    }

    // Create customer and order
    const customer = {
      id: `cust-${Date.now()}`,
      name: 'Test Customer',
      email: `customer-${Date.now()}@test.com`,
      created_at: new Date().toISOString()
    }
    mockDB.customers.push(customer)

    const order = {
      id: `order-${Date.now()}`,
      number: `ORD-${Math.floor(Math.random() * 10000)}`,
      customer_id: customer.id,
      customer_name: customer.name,
      status: 'PROCESSING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockDB.orders.push(order)

    // Update item status and link to order
    const updatedItem = {
      ...availableItem,
      status2: 'ASSIGNED',
      order_id: order.id,
      updated_at: new Date().toISOString()
    }

    // Update item in inventory
    const itemIndex = mockDB.inventory_items.findIndex(i => i.id === availableItem.id)
    if (itemIndex > -1) {
      mockDB.inventory_items[itemIndex] = updatedItem
    }

    // Create wash request
    const washRequest = {
      id: `req-${Date.now()}`,
      item_id: updatedItem.id,
      request_type: 'WASHING',
      status: 'PENDING',
      priority: 'HIGH',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        order_id: order.id,
        order_number: order.number,
        customer_id: customer.id,
        customer_name: customer.name,
        wash_type: 'STA',
        assigned_bin: 'WASH-STA',
        steps: [
          {
            id: '1',
            title: 'Scan Item',
            description: `Scan ${updatedItem.current_sku} to begin wash process`,
            status: 'IN_PROGRESS',
            completed_at: null
          },
          {
            id: '2',
            title: 'Scan Wash Bin',
            description: 'Place unit in bin: STARDUST',
            status: 'PENDING',
            completed_at: null
          },
          {
            id: '3',
            title: 'Confirm',
            description: 'Verify item placement in STARDUST wash bin',
            status: 'PENDING',
            completed_at: null
          }
        ]
      }
    }

    // Add request
    mockDB.requests.push(washRequest)

    // Persist all changes
    persistState()

    return { 
      item: updatedItem, 
      request: washRequest,
      order,
      customer
    }

  } catch (error) {
    console.error('Failed to create test wash request:', error)
    throw error
  }
}

// Update step completion to include event
export function updateRequestSteps(requestId: string, steps: any[]) {
  const requestIndex = mockDB.requests.findIndex(r => r.id === requestId)
  if (requestIndex > -1) {
    const request = mockDB.requests[requestIndex]
    
    // Find newly completed step
    const completedStep = steps.find(s => 
      s.completed_at && 
      !request.metadata?.steps?.find(oldStep => oldStep.id === s.id)?.completed_at
    )

    if (completedStep) {
      // Create event for step completion
      createEvent({
        event_type: 'WASH_STEP_COMPLETED',
        item_id: request.item_id,
        order_id: request.metadata?.order_id,
        metadata: {
          request_id: request.id,
          step_id: completedStep.id,
          step_title: completedStep.title,
          wash_type: request.metadata?.wash_type,
          target_bin: request.metadata?.assigned_bin
        }
      })
    }

    // Update request
    mockDB.requests[requestIndex] = {
      ...request,
      metadata: {
        ...request.metadata,
        steps
      },
      updated_at: new Date().toISOString()
    }

    persistState()
  }
}

export function createInventoryItem() {
  try {
    // Validate before creating
    const validation = validateInventoryCreation(
      { current_sku: 'ST-32-X-36-RAW' }, // Add initial item data here
      mockDB.bins || []
    )

    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const existingIds = mockDB.inventory_items.map(item => item.id)
    const newId = generateUniqueInventoryId(existingIds)

    const newItem = {
      id: newId,
      current_sku: 'ST-32-X-36-RAW',
      target_sku: 'ST-32-X-32-STR',
      status1: 'STOCK',
      status2: 'UNCOMMITTED',
      batch_id: `BATCH-${Date.now()}`,
      location: 'RECEIVING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        production_batch: `BATCH-${Date.now()}`
      }
    }

    // Try to find an optimal bin first
    const binAssignment = findOptimalBin(newItem, mockDB.bins || [])
    if (!binAssignment.success) {
      throw new Error(binAssignment.error || 'No suitable bin available')
    }

    // Add to inventory items
    mockDB.inventory_items.push(newItem)

    // Create item creation event
    createEvent({
      event_type: 'ITEM_CREATED',
      item_id: newId,
      metadata: {
        sku: newItem.current_sku,
        location: newItem.location
      }
    })

    // Assign to bin
    const assignResult = assignItemToBin(newItem, binAssignment.binId)
    if (!assignResult.success) {
      throw new Error(assignResult.error || 'Failed to assign item to bin')
    }

    // Create bin assignment event
    createEvent({
      event_type: 'ITEM_AUTO_ASSIGNED_TO_BIN',
      item_id: newId,
      metadata: {
        bin_id: binAssignment.binId,
        previous_location: 'RECEIVING',
        new_location: `BIN-${binAssignment.binId}`,
        assignment_type: 'AUTOMATIC'
      }
    })

    persistState()
    return newItem
  } catch (error) {
    console.error('Failed to create inventory item:', error)
    throw error
  }
}

// Update bin assignment logic to be more sophisticated
export function findOptimalBin(item: DBInventoryItem, availableBins: Bin[]): BinAssignmentResult {
  try {
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

    // First priority: Find bins with same SKU to keep similar items together
    const binsWithSameSku = binsWithSpace.filter(bin => {
      const binItems = mockDB.inventory_items.filter(i => bin.items.includes(i.id))
      return binItems.some(i => i.current_sku === item.current_sku)
    })

    if (binsWithSameSku.length > 0) {
      // Sort by available space (ascending) to fill bins efficiently
      const sortedBins = [...binsWithSameSku].sort((a, b) => 
        (a.capacity - a.current_items) - (b.capacity - b.current_items)
      )
      return {
        success: true,
        binId: sortedBins[0].id
      }
    }

    // Second priority: Find bins in the same zone based on item type
    const zoneForSku = determineZoneForSku(item.current_sku)
    const binsInZone = binsWithSpace.filter(bin => bin.zone === zoneForSku)

    if (binsInZone.length > 0) {
      // Sort by available space (ascending)
      const sortedZoneBins = [...binsInZone].sort((a, b) => 
        (a.capacity - a.current_items) - (b.capacity - b.current_items)
      )
      return {
        success: true,
        binId: sortedZoneBins[0].id
      }
    }

    // Last resort: Use any bin with available space
    const sortedBySpace = [...binsWithSpace].sort((a, b) => 
      (a.capacity - a.current_items) - (b.capacity - b.current_items)
    )

    return {
      success: true,
      binId: sortedBySpace[0].id
    }
  } catch (error) {
    console.error('Failed to find optimal bin:', error)
    return {
      success: false,
      error: 'Failed to find suitable bin'
    }
  }
}

// Helper function to determine appropriate zone based on SKU
function determineZoneForSku(sku: string): string {
  // Add your SKU-to-zone mapping logic here
  // Example:
  if (sku.includes('RAW')) return '1'
  if (sku.includes('STR')) return '2'
  return '3' // Default zone
}

// Update request completion to include event
export function completeWashRequest(request: DBRequest) {
  try {
    // Find and update item location
    const itemIndex = mockDB.inventory_items.findIndex(i => i.id === request.item_id)
    if (itemIndex > -1) {
      mockDB.inventory_items[itemIndex] = {
        ...mockDB.inventory_items[itemIndex],
        location: request.metadata?.assigned_bin,
        updated_at: new Date().toISOString()
      }

      // Create event for wash completion
      createEvent({
        event_type: 'WASH_COMPLETED',
        item_id: request.item_id,
        order_id: request.metadata?.order_id,
        metadata: {
          request_id: request.id,
          wash_type: request.metadata?.wash_type,
          final_bin: request.metadata?.assigned_bin,
          steps_completed: request.metadata?.steps?.length || 0,
          completion_time: new Date().toISOString()
        }
      })
    }

    // Remove request
    const requestIndex = mockDB.requests.findIndex(r => r.id === request.id)
    if (requestIndex > -1) {
      mockDB.requests.splice(requestIndex, 1)
    }

    persistState()
  } catch (error) {
    console.error('Failed to complete wash request:', error)
    throw error
  }
}

export function assignItemToBin(item: DBInventoryItem, binId: string) {
  try {
    // Find the bin
    const binIndex = mockDB.bins.findIndex(b => b.id === binId)
    if (binIndex === -1) {
      throw new Error('Bin not found')
    }

    const bin = mockDB.bins[binIndex]

    // Check capacity
    if (bin.current_items >= bin.capacity) {
      throw new Error('Bin is at capacity')
    }

    // Update bin
    mockDB.bins[binIndex] = {
      ...bin,
      items: [...bin.items, item.id],
      current_items: bin.current_items + 1
    }

    // Update item location
    const itemIndex = mockDB.inventory_items.findIndex(i => i.id === item.id)
    if (itemIndex === -1) {
      throw new Error('Item not found')
    }

    mockDB.inventory_items[itemIndex] = {
      ...mockDB.inventory_items[itemIndex],
      location: `BIN-${binId}`,
      updated_at: new Date().toISOString()
    }

    // Create event for bin assignment
    const event = {
      id: `evt-${Date.now()}`,
      event_type: 'ITEM_ASSIGNED_TO_BIN',
      item_id: item.id,
      created_at: new Date().toISOString(),
      metadata: {
        bin_id: binId,
        previous_location: item.location,
        new_location: `BIN-${binId}`,
        bin_capacity: bin.capacity,
        bin_current_items: bin.current_items + 1
      }
    }
    mockDB.events.push(event)

    // Persist changes
    persistState()

    return { success: true }
  } catch (error) {
    console.error('Failed to assign item to bin:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to assign item to bin' 
    }
  }
}

// Helper function to get bin contents
export function getBinContents(binId: string) {
  const bin = mockDB.bins.find(b => b.id === binId)
  if (!bin) return []

  return mockDB.inventory_items.filter(item => 
    bin.items.includes(item.id)
  )
}

// Make sure bins are initialized in mockDB
if (!mockDB.bins) {
  mockDB.bins = []
}

// Helper to generate random SKUs
function getRandomSku() {
  const sizes = ['32', '34', '36']
  const styles = ['RAW', 'STR', 'IND', 'ONX', 'JAG']
  const size = sizes[Math.floor(Math.random() * sizes.length)]
  const style = styles[Math.floor(Math.random() * styles.length)]
  return `ST-${size}-X-${size}-${style}`
}

// Helper to generate random customer
function generateRandomCustomer() {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  return {
    id: `cust-${Date.now()}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    tags: ['CUSTOMER'],
    created_at: new Date().toISOString()
  }
}

export function createRandomOrder() {
  try {
    // Create customer
    const customer = generateRandomCustomer()
    mockDB.customers.push(customer)

    // Create order
    const order = {
      id: `order-${Date.now()}`,
      number: `ORD-${Math.floor(Math.random() * 10000)}`,
      customer_id: customer.id,
      customer_name: customer.name,
      status: 'PROCESSING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        priority: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
        notes: 'Random order generated'
      }
    }
    mockDB.orders.push(order)

    // Create inventory item
    const currentSku = getRandomSku()
    const targetSku = getRandomSku()
    
    const item = {
      id: `inv-${Date.now()}`,
      current_sku: currentSku,
      target_sku: targetSku,
      status1: 'STOCK',
      status2: 'ASSIGNED',
      batch_id: `BATCH-${Date.now()}`,
      location: 'WAREHOUSE',
      order_id: order.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        customer_id: customer.id,
        order_number: order.number
      }
    }
    mockDB.inventory_items.push(item)

    // Create wash request
    const washRequest = createWashRequestForItem(item)
    if (!washRequest.success) {
      throw new Error(washRequest.error || 'Failed to create wash request')
    }

    // Create event for order creation
    createEvent({
      event_type: 'ORDER_CREATED',
      item_id: item.id,
      order_id: order.id,
      metadata: {
        customer_name: customer.name,
        order_number: order.number
      }
    })

    persistState()
    return { customer, order, item }
  } catch (error) {
    console.error('Failed to create random order:', error)
    throw error
  }
} 