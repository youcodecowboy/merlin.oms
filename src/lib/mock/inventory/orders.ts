import { mockStore, updateStore, addToStore, findInventoryItemById } from '../store'
import { updateCommitments } from './commitments'
import { MockOrder } from './types'

export function placeOrder(order: Omit<MockOrder, 'status' | 'created_at' | 'updated_at'>): MockOrder {
  const timestamp = new Date().toISOString()
  
  // Create new order
  const newOrder: MockOrder = {
    ...order,
    status: 'PENDING',
    created_at: timestamp,
    updated_at: timestamp
  }

  // Update commitments for each item
  order.items.forEach(item => {
    updateCommitments(item.sku, item.quantity)
  })

  // Update store
  const orders = [...mockStore.orders, newOrder]
  updateStore({ orders })

  return newOrder
}