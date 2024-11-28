import type { Order, SKU } from '@/lib/types'

interface ProductionRequestParams {
  sku: SKU
  order: Order
  quantity: number
}

export async function createProductionRequest(params: ProductionRequestParams): Promise<void> {
  const { sku, order, quantity } = params

  // Create production request
  const requestId = await createRequest({
    type: 'PRODUCTION',
    sku,
    quantity,
    orderId: order.id,
    timestamp: new Date()
  })

  // Add order to waitlist
  await addToWaitlist({
    order,
    sku,
    position: 'end'
  })

  // Log production request
  await logProductionRequest({
    requestId,
    sku,
    quantity,
    orderId: order.id,
    timestamp: new Date()
  })
} 