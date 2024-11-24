import { OrderRepository } from '@/repositories/orders.repository'
import { CustomerRepository } from '@/repositories/customers.repository'
import { InventoryRepository } from '@/repositories/inventory.repository'
import { createOrderSchema } from '@/lib/validation/schemas'
import { z } from 'zod'
import { logger } from '@/utils/logger'
import { AppError } from '@/lib/errors'

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private customerRepository: CustomerRepository,
    private inventoryRepository: InventoryRepository
  ) {}

  async createOrder(data: z.infer<typeof createOrderSchema>) {
    // Validate customer exists
    const customer = await this.customerRepository.findById(data.customer_id)
    if (!customer) {
      throw new AppError('CUSTOMER_NOT_FOUND', 'Customer not found', 404)
    }

    // Validate inventory for each item
    for (const item of data.order_items) {
      const inventory = await this.inventoryRepository.checkAvailability(
        item.sku,
        item.quantity
      )

      if (!inventory.available) {
        throw new AppError(
          'INSUFFICIENT_INVENTORY',
          `Insufficient inventory for SKU: ${item.sku}. Available: ${inventory.quantity}`,
          400
        )
      }
    }

    try {
      // Get next order number with retry mechanism
      const order = await this.orderRepository.createOrderWithRetry({
        customer_id: data.customer_id,
        order_status: 'PENDING',
        order_items: data.order_items
      })

      // Update inventory status
      await Promise.all(
        data.order_items.map(item =>
          this.inventoryRepository.commitItems(item.sku, item.quantity)
        )
      )

      logger.info('Order processed successfully', {
        orderId: order.id,
        number: order.number,
        items: order.items?.length
      })

      return order
    } catch (error) {
      logger.error('Failed to create order', { error })
      throw new AppError(
        'ORDER_CREATION_FAILED',
        'Failed to create order',
        500,
        error
      )
    }
  }

  async getOrders() {
    return this.orderRepository.findAll()
  }
}