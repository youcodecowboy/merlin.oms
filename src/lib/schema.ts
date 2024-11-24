import { z } from 'zod'

// Enums and Constants
export const hemOptions = ['RWH', 'STH', 'ORL', 'HRL'] as const
export const requestTypes = [
  'WASH_REQUEST',
  'STOCK_REQUEST', 
  'CUTTING_REQUEST',
  'PATTERN_REQUEST',
  'FINISHING_REQUEST',
  'PACKING_REQUEST',
  'MOVE_REQUEST',
  'REMAKE_REQUEST'
] as const
export const requestStatus = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
export const priorityLevels = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export const eventStatus = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const
export const eventPriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

// Base Schemas
export const uuidSchema = z.string().uuid()
export const timestampSchema = z.string().datetime()

// Pattern Details Schema
const patternDetailsSchema = z.object({
  style: z.string(),
  quantity: z.number(),
  measurements: z.object({
    waist: z.number(),
    hip: z.number(),
    thigh: z.number(),
    knee: z.number(),
    ankle: z.number(),
    inseam: z.number()
  }),
  notes: z.string().optional(),
  reference_images: z.array(z.string())
})

// Customer Schema
const customerSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string()
})

// Pattern Request Schema
export const patternRequestSchema = z.object({
  id: z.string(),
  request_type: z.literal('PATTERN_REQUEST'),
  status: z.enum(requestStatus),
  priority: z.enum(priorityLevels),
  created_at: z.string(),
  updated_at: z.string(),
  customer_id: z.string(),
  inventory_item_id: z.string().optional(),
  customer: customerSchema,
  pattern_details: patternDetailsSchema,
  batch_id: z.string().optional(),
  production_batch_id: z.string().optional()
})

// Pending Production Schema
export const pendingProductionSchema = z.object({
  id: z.string(),
  sku: z.string(),
  quantity: z.number(),
  priority: z.enum(priorityLevels),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED']).default('PENDING'),
  created_at: z.string(),
  updated_at: z.string()
})

// Export types
export type Request = z.infer<typeof patternRequestSchema>
export type PendingProduction = z.infer<typeof pendingProductionSchema>

// Event Schema
export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  event_name: z.string().min(1),
  event_description: z.string().optional(),
  assigned_to: z.string(),
  team: z.string(),
  status: z.enum(eventStatus),
  priority: z.enum(eventPriority),
  completed_at: z.string().nullable(),
  metadata: z.record(z.any()).optional(),
  created_at: timestampSchema.optional()
})

// Order Schema
export const orderSchema = z.object({
  id: z.string().uuid().optional(),
  customer_id: z.string(),
  number: z.number().int().min(1000),
  order_status: z.string(),
  items: z.array(z.object({
    sku: z.string(),
    style: z.string(),
    waist: z.number(),
    shape: z.string(),
    inseam: z.number(),
    wash: z.string(),
    hem: z.enum(hemOptions),
    quantity: z.number().int().min(1)
  })),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional()
})

// Additional Types
export interface Customer {
  id?: string
  email: string
  name?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  price?: number
  created_at: string
  updated_at: string
}

export interface Batch {
  id?: string
  pending_request_id: string
  batch_number: number
  total_quantity: number
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED'
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ProductionRequest {
  id?: string
  sku: string
  current_stage: 'CUTTING' | 'SEWING' | 'WASHING' | 'FINISHING' | 'QC' | 'READY'
  notes?: string
  batch_id: string
  created_at?: string
  updated_at?: string
}

export interface InventoryItem {
  id?: string
  product_id?: string
  sku: string
  status1: string
  status2: string
  qr_code?: string
  batch_id?: string
  created_at?: string
  updated_at?: string
}

export interface InventoryEvent {
  id?: string
  inventory_item_id: string
  event_name: string
  event_description?: string
  status: 'PENDING' | 'COMPLETED'
  timestamp: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
export type RequestType = 
  | 'WASH_REQUEST' 
  | 'PATTERN_REQUEST' 
  | 'STOCK_REQUEST' 
  | 'CUTTING_REQUEST'
  | 'FINISHING_REQUEST'
  | 'PACKING_REQUEST'
  | 'MOVE_REQUEST'
  | 'REMAKE_REQUEST'

export type InventoryStatus1 = 'STOCK' | 'PRODUCTION'
export type InventoryStatus2 = 'COMMITTED' | 'UNCOMMITTED'

export interface OrderItem {
  sku: string
  style: string
  waist: number
  shape: string
  inseam: number
  wash: string
  hem: 'SND' | 'RAW' | 'ORL' | 'HRL'
  quantity: number
  status?: 'PENDING' | 'COMMITTED' | 'PARTIALLY_COMMITTED' | 'PENDING_PRODUCTION'
  inventory_items?: string[]
  baseInseam?: number
}

export interface Order {
  id?: string
  number: number
  customer_id: string
  customer?: {
    id: string
    email: string
    name: string
  }
  order_status: string
  items: OrderItem[]
  created_at?: string
  updated_at?: string
}

export interface Team {
  id: string
  name: string
  code: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  team_id: string
  role: 'LEAD' | 'MEMBER'
  created_at?: string
  updated_at?: string
}

export interface RequestEvent {
  id?: string
  request_id: string
  event_type: 'CREATED' | 'ASSIGNED' | 'UPDATED' | 'COMPLETED'
  description: string
  user_id?: string
  metadata?: Record<string, any>
  created_at: string
}

// Update Request type to include team assignments
export interface Request {
  id?: string
  request_type: RequestType
  status: Status
  priority: Priority
  assigned_team?: string
  assigned_to?: string
  assigned_at?: string
  metadata?: Record<string, any>
  events?: RequestEvent[]
  created_at: string
  updated_at: string
}