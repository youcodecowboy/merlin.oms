import type { OrderStatus } from '@/lib/types'

interface StatusUpdateParams {
  orderId: string
  status: OrderStatus
  metadata?: Record<string, any>
}

export async function updateOrderStatus(params: StatusUpdateParams): Promise<void> {
  const { orderId, status, metadata } = params

  // Update order status
  await updateOrder(orderId, {
    status,
    metadata
  })

  // Log status change
  await logStatusChange({
    orderId,
    newStatus: status,
    metadata,
    timestamp: new Date()
  })
} 