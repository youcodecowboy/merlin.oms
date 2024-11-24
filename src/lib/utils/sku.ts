import type { InventoryItem } from '@/lib/schema'

export interface SKUComponents {
  style: string    // e.g., "ST" (Straight)
  waist: number    // e.g., 28
  shape: string    // e.g., "X" (Regular)
  inseam: number   // e.g., 30
  wash: string     // e.g., "IND" (Indigo)
}

// Define universal wash mappings
const UNIVERSAL_WASH_MAP = {
  'IND': 'RAW', // Indigo can use Raw
  'STA': 'RAW', // Stone can use Raw
  'ONX': 'BRW', // Onyx can use Brown
  'JAG': 'BRW'  // Jaguar can use Brown
} as const

export function parseSKU(sku: string): SKUComponents | null {
  const parts = sku.split('-')
  if (parts.length !== 5) return null

  const [style, waist, shape, inseam, wash] = parts
  
  return {
    style,
    waist: parseInt(waist),
    shape,
    inseam: parseInt(inseam),
    wash
  }
}

export function isExactSKUMatch(orderSKU: string, inventorySKU: string): boolean {
  const order = parseSKU(orderSKU)
  const inventory = parseSKU(inventorySKU)
  
  if (!order || !inventory) return false

  return (
    order.style === inventory.style &&
    order.waist === inventory.waist &&
    order.shape === inventory.shape &&
    order.inseam === inventory.inseam &&
    order.wash === inventory.wash
  )
}

export function isUniversalSKUMatch(orderSKU: string, inventorySKU: string): boolean {
  const order = parseSKU(orderSKU)
  const inventory = parseSKU(inventorySKU)
  
  if (!order || !inventory) return false

  // Style, waist, and shape must match exactly
  if (
    order.style !== inventory.style ||
    order.waist !== inventory.waist ||
    order.shape !== inventory.shape
  ) {
    return false
  }

  // Inventory inseam must be greater than or equal to order inseam
  if (inventory.inseam < order.inseam) {
    return false
  }

  // Check if inventory wash is the universal wash for the ordered wash
  const universalWash = UNIVERSAL_WASH_MAP[order.wash as keyof typeof UNIVERSAL_WASH_MAP]
  return inventory.wash === universalWash
}

export function findMatchingInventory(
  orderSKU: string, 
  inventoryItems: InventoryItem[]
): { exact: InventoryItem[], universal: InventoryItem[] } {
  const uncommittedItems = inventoryItems.filter(item => 
    item.status2 === 'UNCOMMITTED'
  )

  return {
    exact: uncommittedItems.filter(item => isExactSKUMatch(orderSKU, item.sku)),
    universal: uncommittedItems.filter(item => isUniversalSKUMatch(orderSKU, item.sku))
  }
}

export function getUniversalSKU(sku: string): string | null {
  const components = parseSKU(sku)
  if (!components) return null

  const universalWash = UNIVERSAL_WASH_MAP[components.wash as keyof typeof UNIVERSAL_WASH_MAP]
  if (!universalWash) return null

  return `${components.style}-${components.waist}-${components.shape}-36-${universalWash}`
}

// Constants for SKU components
export const SKU_STYLES = {
  ST: 'Straight',
  SL: 'Slim',
  RL: 'Relaxed',
  SK: 'Skinny',
  // ... other styles
} as const

export const SKU_WASHES = {
  IND: 'Indigo',
  RAW: 'Raw',
  STN: 'Stone',
  BLK: 'Black',
  // ... other washes
} as const

export const SKU_HEMS = {
  RWH: 'Raw Hem',
  STH: 'Standard Hem',
  CHN: 'Chain Stitch',
  // ... other hem types
} as const

// Validation functions
export function isValidSKU(sku: string): boolean {
  const parts = sku.split('-')
  if (parts.length !== 5) return false

  const [style, waist, wash, inseam, hem] = parts
  
  return (
    style in SKU_STYLES &&
    !isNaN(parseInt(waist)) &&
    wash in SKU_WASHES &&
    !isNaN(parseInt(inseam)) &&
    hem in SKU_HEMS
  )
} 