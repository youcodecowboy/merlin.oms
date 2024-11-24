import { z } from 'zod'

// Base error types
export class InventoryError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message)
    this.name = 'InventoryError'
  }
}

export class NoInventoryAvailableError extends InventoryError {
  constructor(sku: string) {
    super(
      'NO_INVENTORY',
      `No available inventory for SKU: ${sku}`,
      404
    )
  }
}

export class OrderNotFoundError extends InventoryError {
  constructor(orderId: string) {
    super(
      'ORDER_NOT_FOUND',
      `Order not found with ID: ${orderId}`,
      404
    )
  }
}

export class InvalidQuantityError extends InventoryError {
  constructor(message: string) {
    super('INVALID_QUANTITY', message, 400)
  }
}

export class IncompatibleWashError extends InventoryError {
  constructor(message: string) {
    super('INCOMPATIBLE_WASH', message, 400)
  }
}

export class UniversalSKUError extends InventoryError {
  constructor(message: string) {
    super('UNIVERSAL_SKU_ERROR', message, 400)
  }
}

// Wash compatibility mapping
export const washCompatibilityMap: Record<string, string[]> = {
  'RAW': ['RAW', 'STA', 'IND', 'BLK', 'BRW'],
  'STA': ['STA'],
  'IND': ['IND'],
  'BLK': ['BLK'],
  'BRW': ['BRW', 'ONX', 'JAG']
}

// Interface types
export interface SKUComponents {
  style: string
  waist: number
  shape: string
  inseam: number
  wash: string
}

export interface SKUMatchResult {
  matched: boolean
  type: 'EXACT' | 'UNIVERSAL' | 'PRODUCTION' | 'PARTIALLY_ASSIGNED'
  items?: MockInventoryItem[]
  productionRequest?: PendingProductionRequest
  message: string
  universalSku?: string
}

export interface MockInventoryItem {
  id: string
  sku: string
  status1: 'STOCK' | 'PRODUCTION'
  status2: 'UNCOMMITTED' | 'COMMITTED'
  orderId?: string
  updated_at: string
}

export interface PendingProductionRequest {
  id: string
  sku: string
  quantity: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  orderId?: string
  requestedDate: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  created_at: string
  updated_at: string
}

export interface Commitment {
  sku: string
  committedQuantity: number
  uncommittedQuantity: number
  updated_at: string
}