import { z } from 'zod'
import type { Request, Order, InventoryItem } from '../schema'
import type { Status1, Status2 } from '../types'

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

// ID format validation
export const isValidItemId = (id: string) => {
  // 5-character alphanumeric ID
  return /^[0-9A-Z]{5}$/.test(id)
}

export const isValidRequestId = (id: string) => {
  // Format: TYPE-XXXXX (e.g., WASH-A12B3)
  return /^[A-Z]+-[0-9A-Z]{5}$/.test(id)
}

// URL validation
export const isValidInventoryUrl = (url: string) => {
  const match = url.match(/^\/inv\/([0-9A-Z]{5})$/)
  return match ? isValidItemId(match[1]) : false
}

export const isValidRequestUrl = (url: string) => {
  const match = url.match(/^\/requests\/([A-Z]+-[0-9A-Z]{5})$/)
  return match ? isValidRequestId(match[1]) : false
}

// Navigation helper
export const getIdFromUrl = (url: string) => {
  const parts = url.split('/')
  return parts[parts.length - 1]
}

// Status1 transition map
const validStatus1Transitions: Record<Status1, Status1[]> = {
  'PRODUCTION': ['STOCK'],
  'STOCK': ['WASH', 'PRODUCTION'],
  'WASH': ['QC'],
  'QC': ['FINISHING', 'WASH'], // Can go back to wash if QC fails
  'FINISHING': ['PACKED'],
  'PACKED': []
}

// Status2 transition map
const validStatus2Transitions: Record<Status2, Status2[]> = {
  'UNCOMMITTED': ['COMMITTED', 'ASSIGNED'],
  'COMMITTED': ['ASSIGNED', 'UNCOMMITTED'],
  'ASSIGNED': ['UNCOMMITTED'] // Can be unassigned if order cancelled
}

// Status1 validation
export function validateStatus1Transition(current: Status1, next: Status1): boolean {
  const validNextStates = validStatus1Transitions[current]
  if (!validNextStates) {
    throw new Error(`Invalid current status: ${current}`)
  }
  if (!validNextStates.includes(next)) {
    throw new Error(`Invalid transition from ${current} to ${next}. Valid transitions are: ${validNextStates.join(', ')}`)
  }
  return true
}

// Status2 validation
export function validateStatus2Transition(current: Status2, next: Status2): boolean {
  const validNextStates = validStatus2Transitions[current]
  if (!validNextStates) {
    throw new Error(`Invalid current status: ${current}`)
  }
  if (!validNextStates.includes(next)) {
    throw new Error(`Invalid transition from ${current} to ${next}. Valid transitions are: ${validNextStates.join(', ')}`)
  }
  return true
}

// Export validation maps for testing
export const __testing = {
  validStatus1Transitions,
  validStatus2Transitions
}

// Export type guards
export function isStatus1(status: string): status is Status1 {
  return ['PRODUCTION', 'STOCK', 'WASH', 'QC', 'FINISHING', 'PACKED'].includes(status)
}

export function isStatus2(status: string): status is Status2 {
  return ['UNCOMMITTED', 'COMMITTED', 'ASSIGNED'].includes(status)
}

// Export validation checker
export function validateExports() {
  const exports = {
    validateStatus1Transition,
    validateStatus2Transition,
    isStatus1,
    isStatus2,
    requestSchema,
    orderSchema,
    __testing
  }

  const requiredExports = [
    'validateStatus1Transition',
    'validateStatus2Transition',
    'isStatus1',
    'isStatus2'
  ]

  const missingExports = requiredExports.filter(
    exp => !(exp in exports)
  )

  if (missingExports.length > 0) {
    throw new Error(`Missing required exports in validation.ts: ${missingExports.join(', ')}`)
  }
}

// Run validation check in development only
if (process.env.NODE_ENV === 'development') {
  try {
    validateExports()
  } catch (error) {
    console.error('Export validation failed:', error)
  }
} 