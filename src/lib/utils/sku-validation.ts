// Helper to validate SKUs for production
export function isValidProductionSku(sku: string): boolean {
  // Check if SKU is in correct format
  const parts = sku.split('-')
  if (parts.length !== 5) return false

  const [style, waist, shape, inseam, wash] = parts

  // Validate wash is RAW or BRW
  if (wash !== 'RAW' && wash !== 'BRW') {
    console.warn(`Invalid wash type for production SKU: ${wash}. Must be RAW or BRW`)
    return false
  }

  return true
}

// Helper to get error message
export function getSkuValidationError(sku: string): string {
  const parts = sku.split('-')
  if (parts.length !== 5) {
    return 'Invalid SKU format'
  }

  const [style, waist, shape, inseam, wash] = parts
  if (wash !== 'RAW' && wash !== 'BRW') {
    return 'Production requests must use RAW or BRW SKUs'
  }

  return ''
} 