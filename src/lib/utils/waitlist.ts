import type { Order, SKU } from '@/lib/types'

interface WaitlistParams {
  order: Order
  sku: SKU
  position: 'start' | 'end'
}

export async function addToWaitlist(params: WaitlistParams): Promise<void> {
  const { order, sku, position } = params

  // Add to waitlist
  await addOrderToWaitlist({
    orderId: order.id,
    sku,
    position,
    timestamp: new Date()
  })

  // Log waitlist event
  await logWaitlistEvent({
    orderId: order.id,
    sku,
    position,
    timestamp: new Date()
  })
} 