import type { InventoryItem } from '@/lib/schema'

export interface SKUComponents {
  style: string    // e.g., "ST" (Straight)
  waist: number    // e.g., 28
  shape: string    // e.g., "X" (Regular)
  inseam: number   // e.g., 30
  wash: string     // e.g., "IND" (Indigo)
}

// Define universal wash mappings
export const UNIVERSAL_WASH_MAP = {
  'IND': 'RAW', // Indigo can use Raw
  'STA': 'RAW', // Stone can use Raw
  'ONX': 'BRW', // Onyx can use Brown
  'JAG': 'BRW'  // Jaguar can use Brown
} as const

export function parseSKU(sku: string) {
  const parts = sku.split('-')
  if (parts.length !== 5) return null
  
  const [style, waist, shape, inseam, wash] = parts
  if (!style || !waist || !shape || !inseam || !wash) return null
  
  return {
    style,
    waist: parseInt(waist),
    shape,
    inseam: parseInt(inseam),
    wash
  }
}

export function getUniversalSKU(sku: string) {
  const parsed = parseSKU(sku)
  if (!parsed) return null
  return `${parsed.style}-${parsed.waist}-${parsed.shape}-${parsed.inseam}-${parsed.wash}`
}

export function isExactSKUMatch(sku1: string, sku2: string) {
  if (!sku1 || !sku2) return false
  return sku1 === sku2
}

export function isUniversalSKUMatch(orderSKU: string, inventorySKU: string) {
  if (!orderSKU || !inventorySKU) return false
  
  const orderParsed = parseSKU(orderSKU)
  const inventoryParsed = parseSKU(inventorySKU)
  
  if (!orderParsed || !inventoryParsed) return false
  
  return (
    orderParsed.style === inventoryParsed.style &&
    orderParsed.waist === inventoryParsed.waist &&
    orderParsed.shape === inventoryParsed.shape &&
    orderParsed.inseam === inventoryParsed.inseam &&
    orderParsed.wash === inventoryParsed.wash
  )
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
  if (!style || !waist || !wash || !inseam || !hem) return false
  
  return (
    style in SKU_STYLES &&
    !isNaN(parseInt(waist, 10)) &&
    wash in SKU_WASHES &&
    !isNaN(parseInt(inseam, 10)) &&
    hem in SKU_HEMS
  )
}

export function convertToRawSku(sku: string): string {
  const [style, waist, shape, inseam, wash] = sku.split('-')
  
  // Determine base wash type
  let baseWash = 'RAW'
  if (['ONX', 'JAG'].includes(wash)) {
    baseWash = 'BRW'  // Black Raw for dark washes
  }
  // else RAW for light washes (IND, STA)

  // Always use 36 inch inseam for production
  return [style, waist, shape, '36', baseWash].join('-')
}

export function isExtendedSku(sku: string): boolean {
  const [style, waist, shape, inseam, wash] = sku.split('-')
  return wash !== 'RAW' // If it's not RAW, it's an extended SKU
}

// Helper to check if a raw SKU can be used for an extended SKU
export function canUseForSku(rawSku: string, targetSku: string): boolean {
  const [rawStyle, rawWaist, rawShape, rawInseam, rawWash] = rawSku.split('-')
  const [targetStyle, targetWaist, targetShape, targetInseam] = targetSku.split('-')

  // Check if raw SKU is actually RAW or BRW
  if (rawWash !== 'RAW' && rawWash !== 'BRW') {
    return false
  }

  // Basic requirements
  const basicMatch = (
    rawStyle === targetStyle &&
    rawWaist === targetWaist &&
    rawShape === targetShape
  )

  if (!basicMatch) return false

  // Inseam requirement - raw inseam must be >= target inseam
  const rawInseamNum = parseInt(rawInseam)
  const targetInseamNum = parseInt(targetInseam)

  if (isNaN(rawInseamNum) || isNaN(targetInseamNum)) {
    return false
  }

  return rawInseamNum >= targetInseamNum
} 