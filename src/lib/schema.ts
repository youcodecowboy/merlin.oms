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

// Define Priority type
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

// Pending Production Schema
export interface PendingProduction {
  id: string
  sku: string
  quantity: number
  priority: Priority
  status: 'PENDING' | 'ACCEPTED'
  batch_id?: string
  order_id?: string
  customer_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Export types
export type ZodRequest = z.infer<typeof patternRequestSchema>
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

// Batch Schema
export interface Batch {
  id: string
  pending_request_id: string
  batch_number: number
  total_quantity: number
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED'
  notes?: string
  created_at: string
  updated_at: string
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

export type InventoryStatus1 = 
  | 'STOCK'              // Initial status
  | 'PRODUCTION'         // During production
  | 'WASH_REQUEST'       // During wash request
  | 'WASH'              // After wash completion
  | 'QC'                // During QC
  | 'FINISHING'         // During finishing
  | 'COMPLETE'          // Final status

export interface InventoryItem {
  id: string
  sku: string
  status1: InventoryStatus1
  status2: InventoryStatus2
  location?: string
  batch_id?: string
  production_batch?: string
  production_date?: string
  timeline?: TimelineEntry[]
  active_stage?: string
  active_request?: {
    id: string
    type: RequestType
    status: string
    created_at: string
  }
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
export type RequestType = 
  | 'WASH_REQUEST'
  | 'QC_REQUEST'
  | 'FINISHING_REQUEST'
  | 'MOVE_REQUEST'
  | 'STOCK_REQUEST'
  | 'PATTERN_REQUEST'

export type InventoryStatus2 = 
  | 'UNCOMMITTED' 
  | 'COMMITTED' 
  | 'ASSIGNED'

export interface OrderItem {
  sku: string
  style: string
  waist: number
  shape: string
  inseam: number
  wash: string
  hem: 'SND' | 'RAW' | 'ORL' | 'HRL'
  quantity: number
  status: 'PENDING' | 'COMMITTED' | 'PENDING_WASH' | 'PENDING_PRODUCTION'
  inventory_item?: InventoryItem
  requests?: Request[]
  events?: OrderItemEvent[]
  waitlist_position?: number
  waitlist_sku?: string
}

export interface Order {
  id: string
  number: number
  customer_id: string
  status: string
  customer: Customer             
  items: OrderItem[]
  requests: Request[]           
  events: OrderEvent[]          
  created_at: string
  updated_at: string
  waitlist_entries?: WaitlistEntry[]
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
export interface RequestStep {
  number: number
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  metadata?: Record<string, any>
}

export interface Request {
  id: string
  request_type: RequestType
  status: Status
  priority: Priority
  assigned_team?: string
  assigned_to?: string
  assigned_at?: string
  
  // Link to related entities
  inventory_item?: InventoryItem  // Full item object instead of just ID
  order?: Order                   // Full order object instead of just ID
  customer?: Customer            // Full customer object
  
  // Request details
  steps?: RequestStep[]
  events?: RequestEvent[]
  metadata?: {
    sku?: string
    location?: string
    [key: string]: any
  }
  notes?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  number: number
  status: string
  customer: Customer             // Full customer object
  items: OrderItem[]
  requests: Request[]           // All requests related to this order
  events: OrderEvent[]          // Order-level events
  created_at: string
  updated_at: string
  waitlist_entries?: WaitlistEntry[]
}

export interface OrderItem {
  sku: string
  style: string
  waist: number
  shape: string
  inseam: number
  wash: string
  hem: 'SND' | 'RAW' | 'ORL' | 'HRL'
  quantity: number
  status: 'PENDING' | 'COMMITTED' | 'PENDING_WASH' | 'PENDING_PRODUCTION'
  inventory_item?: InventoryItem  // Full item object when committed
  requests?: Request[]           // Requests specific to this item
  events?: OrderItemEvent[]      // Item-level events
  waitlist_position?: number
  waitlist_sku?: string
}

export interface TimelineStage {
  stage: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  requestId?: string
  completedAt?: string
  metadata?: {
    request_type?: RequestType
    completed_by?: string
    notes?: string
  }
}

export interface OrderEvent {
  id: string
  order_id: string
  event_type: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface OrderItemEvent {
  id: string
  order_item_id: string
  event_type: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface WaitlistEntry {
  id: string
  order_id: string
  order_number: number
  sku: string           // The specific SKU requested
  raw_sku: string       // The universal/production SKU
  quantity: number
  priority: Priority
  created_at: string
  position: number      // Position in waitlist for this SKU
}

// Add this to your schema
export interface ProductionBatch {
  id: string
  batch_number: number
  sku: string
  quantity: number
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED'
  created_at: string
  updated_at: string
  notes?: string
  order_id?: string
  customer_id?: string
}