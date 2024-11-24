import { z } from 'zod'
import type { Request, Order, InventoryItem } from '../schema'

export const requestSchema = z.object({
  request_name: z.string().min(1),
  request_description: z.string(),
  request_type: z.enum([
    'WASH_REQUEST',
    'PATTERN_REQUEST',
    'STOCK_REQUEST',
    'CUTTING_REQUEST',
    'FINISHING_REQUEST',
    'PACKING_REQUEST',
    'MOVE_REQUEST',
    'REMAKE_REQUEST'
  ]),
  assigned_to: z.string(),
  role: z.string(),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  deadline: z.string().optional()
})

export const orderItemSchema = z.object({
  style: z.string(),
  shape: z.string(),
  sku: z.string(),
  waist: z.number(),
  inseam: z.number(),
  wash: z.string(),
  hem: z.enum(['RWH', 'STH', 'ORL', 'HRL']),
  quantity: z.number().positive()
})

export const orderSchema = z.object({
  number: z.number(),
  customer_id: z.string(),
  order_status: z.string(),
  items: z.array(orderItemSchema)
})

export function validateRequest(data: unknown): Request {
  return requestSchema.parse(data)
}

export function validateOrder(data: unknown): Order {
  return orderSchema.parse(data)
} 