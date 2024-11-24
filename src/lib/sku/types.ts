import { z } from 'zod'

// SKU Components
export interface SKUComponents {
  style: string    // e.g., "ST"
  waist: number    // e.g., 26
  shape: string    // e.g., "X"
  inseam: number   // e.g., 30
  wash: string     // e.g., "RAW"
}

// Wash Compatibility Map
export const washCompatibilityMap: Record<string, string[]> = {
  'RAW': ['RAW', 'STA', 'IND', 'BLK', 'BRW'],
  'STA': ['STA'],
  'IND': ['IND'],
  'BLK': ['BLK'],
  'BRW': ['BRW', 'ONX', 'JAG']
}

// SKU Match Result
export interface SKUMatchResult {
  matched: boolean
  type: 'EXACT' | 'UNIVERSAL' | 'NONE'
  item?: {
    id: string
    sku: string
  }
  message: string
  productionRequired?: boolean
  universalSku?: string
}

// Validation Schema
export const skuComponentsSchema = z.object({
  style: z.string().length(2),
  waist: z.number().int().min(20).max(50),
  shape: z.string().length(1),
  inseam: z.number().int().min(26).max(36),
  wash: z.string().length(3)
})

// Error Types
export class SKUError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'SKUError'
  }
}

export class InvalidSKUError extends SKUError {
  constructor(message: string) {
    super('INVALID_SKU', message)
  }
}

export class IncompatibleWashError extends SKUError {
  constructor(requested: string, available: string) {
    super(
      'INCOMPATIBLE_WASH',
      `Incompatible wash: ${available} cannot be processed into ${requested}`
    )
  }
}

export class UniversalSKUError extends SKUError {
  constructor(message: string) {
    super('UNIVERSAL_SKU_ERROR', message)
  }
}