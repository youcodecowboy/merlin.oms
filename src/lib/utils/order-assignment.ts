import type { Order, InventoryItem } from '@/lib/types'

interface AssignmentParams {
  order: Order
  item: InventoryItem
  assignmentType: 'direct' | 'universal'
}

export async function handleOrderAssignment(params: AssignmentParams): Promise<void> {
  const { order, item, assignmentType } = params

  // Update item status
  await updateItemStatus(item.id, {
    status2: 'ASSIGNED'
  })

  // Create order-item relationship
  await createOrderItemRelation(order.id, item.id, assignmentType)

  // Log assignment
  await logAssignmentEvent({
    orderId: order.id,
    itemId: item.id,
    assignmentType,
    timestamp: new Date()
  })
} 