import { nanoid } from 'nanoid'
import type { Order } from '@/lib/schema'
import { getMockInventoryItems, updateMockInventoryItem } from './inventory'
import { createMockPendingProduction } from './production'
import { isExactSKUMatch, isUniversalSKUMatch, getUniversalSKU } from '@/lib/utils/sku'

// Load persisted data or use defaults
const loadPersistedData = () => {
  try {
    const savedOrders = localStorage.getItem('mockOrders')
    return savedOrders ? JSON.parse(savedOrders) : []
  } catch (error) {
    console.error('Failed to load orders:', error)
    return []
  }
}

// Initialize with persisted or default data
let mockOrders = loadPersistedData()

// Helper function to persist data
const persistData = () => {
  try {
    localStorage.setItem('mockOrders', JSON.stringify(mockOrders))
  } catch (error) {
    console.error('Failed to persist orders:', error)
  }
}

export async function getMockOrders() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockOrders
}

export async function getMockOrder(id: string) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockOrders.find(order => order.id === id)
}

export async function createMockOrder(orderData: Partial<Order>): Promise<Order> {
  console.log('Creating order with data:', orderData) // Debug log

  // 1. Create the order with initial PENDING status
  const order: Order = {
    id: `ord_${nanoid()}`,
    number: Math.floor(Math.random() * 9000) + 1000,
    customer_id: orderData.customer_id!,
    customer: orderData.customer!,
    order_status: 'PENDING',
    items: orderData.items || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  console.log('Initial order object:', order) // Debug log

  // 2. Check inventory for each item
  const inventoryItems = await getMockInventoryItems()
  const itemResults = await Promise.all(order.items.map(async (item) => {
    console.log('Processing order item:', item) // Debug log

    // First, look for exact SKU matches
    const exactMatches = inventoryItems.filter(invItem => 
      isExactSKUMatch(item.sku, invItem.sku) &&
      invItem.status2 === 'UNCOMMITTED'
    )

    if (exactMatches.length >= item.quantity) {
      // We have enough exact matches
      const selectedItems = exactMatches.slice(0, item.quantity)
      await Promise.all(selectedItems.map(invItem =>
        updateMockInventoryItem(invItem.id!, {
          status2: 'COMMITTED',
          order_id: order.id
        })
      ))

      return {
        ...item,
        status: 'COMMITTED',
        inventory_items: selectedItems.map(i => i.id)
      }
    }

    // If no exact matches, look for universal matches
    const universalMatches = inventoryItems.filter(invItem => 
      isUniversalSKUMatch(item.sku, invItem.sku) &&
      invItem.status2 === 'UNCOMMITTED'
    )

    if (universalMatches.length >= item.quantity) {
      // We have enough universal matches
      const selectedItems = universalMatches.slice(0, item.quantity)
      await Promise.all(selectedItems.map(invItem =>
        updateMockInventoryItem(invItem.id!, {
          status2: 'COMMITTED',
          order_id: order.id
        })
      ))

      return {
        ...item,
        status: 'COMMITTED',
        inventory_items: selectedItems.map(i => i.id)
      }
    }

    // If we get here, we need to create a production request
    // Convert to universal SKU for production
    const universalSKU = getUniversalSKU(item.sku)
    if (!universalSKU) {
      throw new Error(`Could not generate universal SKU for ${item.sku}`)
    }

    // Create production request with universal SKU
    await createMockPendingProduction({
      sku: universalSKU,
      quantity: item.quantity,
      priority: 'MEDIUM',
      order_id: order.id
    })

    return {
      ...item,
      status: 'PENDING_PRODUCTION'
    }
  }))

  // 3. Update order status based on items
  const allCommitted = itemResults.every(item => item.status === 'COMMITTED')
  const anyPending = itemResults.some(item => item.status === 'PENDING_PRODUCTION')

  order.items = itemResults
  order.order_status = allCommitted ? 'COMMITTED' : 
    anyPending ? 'PENDING_PRODUCTION' : 'PENDING'

  // 4. Save order and persist
  console.log('Final order to be saved:', order) // Debug log
  mockOrders.push(order)
  persistData()

  return order
}

export async function updateMockOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockOrders.findIndex(order => order.id === id)
  if (index !== -1) {
    mockOrders[index] = {
      ...mockOrders[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    persistData()
    return mockOrders[index]
  }
  return undefined
}

export async function deleteMockOrder(id: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockOrders.findIndex(order => order.id === id)
  if (index !== -1) {
    mockOrders.splice(index, 1)
    persistData()
    return true
  }
  return false
}