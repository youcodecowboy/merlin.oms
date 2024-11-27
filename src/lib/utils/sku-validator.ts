// SKU Format: ST-32-X-34-RAW
// Parts:    [Style]-[Waist]-[Shape]-[Length]-[Finish]

interface ParsedSku {
  style: string    // ST
  waist: string    // 32
  shape: string    // X
  length: string   // 34
  finish: string   // RAW
}

export function parseSku(sku: string): ParsedSku | null {
  const parts = sku.split('-')
  if (parts.length !== 5) {
    return null
  }

  const [style, waist, shape, length, finish] = parts

  if (!style || !waist || !shape || !length || !finish) {
    return null
  }

  return {
    style,
    waist,
    shape,
    length,
    finish
  }
}

export function validateSkuPair(currentSku: string, targetSku: string): boolean {
  const current = parseSku(currentSku)
  const target = parseSku(targetSku)

  if (!current || !target) return false

  // Only validate style, waist, and shape
  // Length can be different (will be cut down)
  return (
    current.style === target.style &&   // Style must match
    current.waist === target.waist &&   // Waist must match
    current.shape === target.shape      // Shape must match
    // Don't validate length as it can change
  )
}

export function createTargetSku(currentSku: string, targetFinish: string): string | null {
  const parsed = parseSku(currentSku)
  if (!parsed) return null
  
  // Keep same components but change finish
  return `${parsed.style}-${parsed.waist}-${parsed.shape}-${parsed.length}-${targetFinish}`
} 