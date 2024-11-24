import { Request, Response, NextFunction } from 'express'
import { OrderService } from '@/services/orders.service'
import { validateRequest } from '@/lib/validation/middleware'
import { createOrderSchema } from '@/lib/validation/schemas'
import { logger } from '@/utils/logger'

export class OrderController {
  constructor(private orderService: OrderService) {}

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await createOrderSchema.parseAsync(req.body)
      const order = await this.orderService.createOrder(validatedData)

      logger.info('Order created successfully', {
        orderId: order.id,
        customerId: order.customer_id,
        items: order.items?.length
      })

      res.status(201).json(order)
    } catch (error) {
      next(error)
    }
  }

  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await this.orderService.getOrders()
      res.json(orders)
    } catch (error) {
      next(error)
    }
  }
}