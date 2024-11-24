import { z } from 'zod'

// Base schemas for reuse
export const uuidSchema = z.string().uuid()

export const skuSchema = z.string().min(1, "SKU is required")
  .regex(/^[A-Z]{2}-\d{2}-[A-Z]-\d{2}-[A-Z]{3}$/, "Invalid SKU format")

// Order validation schemas
export const orderItemSchema = z.object({
  sku: skuSchema,
  quantity: z.number().int().positive("Quantity must be a positive integer")
})

export const createOrderSchema = z.object({
  customer_id: uuidSchema,
  number: z.number().int().positive().optional(),
  order_items: z.array(orderItemSchema)
    .min(1, "At least one order item is required")
})

// Inventory validation schemas
export const inventoryStatus1Schema = z.enum(['STOCK', 'PRODUCTION'])
export const inventoryStatus2Schema = z.enum(['COMMITTED', 'UNCOMMITTED'])

export const createInventoryItemSchema = z.object({
  sku: skuSchema,
  status1: inventoryStatus1Schema,
  status2: inventoryStatus2Schema,
  qr_code: z.string().optional(),
  product_id: uuidSchema.optional()
})

// Response schemas for type safety
export const orderResponseSchema = createOrderSchema.extend({
  id: uuidSchema,
  created_at: z.string(),
  updated_at: z.string()
})

export const inventoryItemResponseSchema = createInventoryItemSchema.extend({
  id: uuidSchema,
  created_at: z.string(),
  updated_at: z.string()
})