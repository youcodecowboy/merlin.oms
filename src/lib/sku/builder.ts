import { SKUComponents, skuComponentsSchema } from './types'

export function buildSKU(components: SKUComponents): string {
  // Validate components
  const result = skuComponentsSchema.safeParse(components)
  if (!result.success) {
    throw new Error(`Invalid SKU components: ${result.error.message}`)
  }

  // Format each component
  const style = components.style.toUpperCase()
  const waist = components.waist.toString().padStart(2, '0')
  const shape = components.shape.toUpperCase()
  const inseam = components.inseam.toString().padStart(2, '0')
  const wash = components.wash.toUpperCase()

  return `${style}-${waist}-${shape}-${inseam}-${wash}`
}