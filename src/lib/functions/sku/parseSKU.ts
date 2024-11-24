export function parseSKU(sku: string): { 
  style: string
  waist: number
  shape: string
  inseam: number
  wash: string
} | null {
  const parts = sku.split('-')
  if (parts.length !== 5) return null

  const [style, waistStr, shape, inseamStr, wash] = parts
  const waist = parseInt(waistStr)
  const inseam = parseInt(inseamStr)

  if (isNaN(waist) || isNaN(inseam)) return null

  return {
    style,
    waist,
    shape,
    inseam,
    wash
  }
}