import { mockStore, updateStore } from '../store'
import { findAndCommitInventory } from './matcher'
import type { Order, OrderItem } from '@/lib/schema'

interface CommitResult {
  orderId: string
  orderNumber: number
  success: boolean
  items: {
    sku: string
    committed: number
    required: number
    status: string
  }[]
  message: string
}

export async function processUncommittedOrders(): Promise<CommitResult[]> {
  const results: CommitResult[] = []
  
  // Get all pending orders
  const pendingOrders = mockStore.orders.filter(order => 
    order.order_status === 'PENDING' || 
    order.order_status === 'PARTIALLY_COMMITTED'
  )

  console.log(`Processing ${pendingOrders.length} pending orders...`)

  for (const order of pendingOrders) {
    const result = await processOrder(order)
    results.push(result)
  }

  return results
}

async function processOrder(order: Order): Promise<CommitResult> {
  const result: CommitResult = {
    orderId: order.id!,
    orderNumber: order.number,
    success: false,
    items: [],
    message: ''
  }

  // Process each pending item in the order
  for (const item of order.items || []) {
    if (item.status === 'COMMITTED') {
      result.items.push({
        sku: item.sku,
        committed: item.quantity,
        required: item.quantity,
        status: 'ALREADY_COMMITTED'
      })
      continue
    }

    try {
      // Process each unit in the item's quantity
      let committedUnits = 0
      for (let i = 0; i < item.quantity; i++) {
        const commitResult = await findAndCommitInventory(
          item.sku,
          order.id!,
          1 // Process one unit at a time
        )

        if (commitResult.type === 'EXACT' || commitResult.type === 'UNIVERSAL') {
          committedUnits++
        }
      }

      // Update item status based on committed units
      const allCommitted = committedUnits === item.quantity
      const partiallyCommitted = committedUnits > 0
      
      item.status = allCommitted ? 'COMMITTED' :
                    partiallyCommitted ? 'PARTIALLY_COMMITTED' :
                    'PENDING_PRODUCTION'

      result.items.push({
        sku: item.sku,
        committed: committedUnits,
        required: item.quantity,
        status: item.status
      })

    } catch (error) {
      console.error(`Failed to process item ${item.sku} for order ${order.number}:`, error)
      result.items.push({
        sku: item.sku,
        committed: 0,
        required: item.quantity,
        status: 'ERROR'
      })
    }
  }

  // Update order status
  const allCommitted = order.items?.every(item => item.status === 'COMMITTED')
  const anyCommitted = order.items?.some(item => 
    item.status === 'COMMITTED' || item.status === 'PARTIALLY_COMMITTED'
  )
  
  order.order_status = allCommitted ? 'COMMITTED' :
                       anyCommitted ? 'PARTIALLY_COMMITTED' :
                       'PENDING'
  order.updated_at = new Date().toISOString()

  // Update order in store
  const orders = mockStore.orders.map(o => 
    o.id === order.id ? order : o
  )
  updateStore({ orders })

  // Set result status
  result.success = allCommitted || anyCommitted
  result.message = allCommitted ? 
    'All items committed successfully' :
    anyCommitted ?
    'Some items committed, others pending production' :
    'No items could be committed'

  return result
}