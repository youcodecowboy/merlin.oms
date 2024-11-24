import express from 'express'
import { OrderController } from '@/controllers/orders.controller'
import { OrderService } from '@/services/orders.service'
import { OrderRepository } from '@/repositories/orders.repository'
import { CustomerRepository } from '@/repositories/customers.repository'
import { InventoryRepository } from '@/repositories/inventory.repository'
import { validateRequest } from '@/lib/validation/middleware'
import { createOrderSchema } from '@/lib/validation/schemas'

const router = express.Router()

// Initialize repositories
const orderRepository = new OrderRepository()
const customerRepository = new CustomerRepository()
const inventoryRepository = new InventoryRepository()

// Initialize service with repositories
const orderService = new OrderService(
  orderRepository,
  customerRepository,
  inventoryRepository
)

// Initialize controller with service
const orderController = new OrderController(orderService)

// Routes
router.get('/', orderController.getOrders)
router.post('/', validateRequest(createOrderSchema), orderController.createOrder)

export default router