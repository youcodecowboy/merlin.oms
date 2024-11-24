import { SKUComponents, InvalidSKUError, skuComponentsSchema } from './types'

export function parseSKU(sku: string): SKUComponents {
  const parts = sku.split('-')
  if (parts.length !== 5) {
    throw new InvalidSKUError('Invalid SKU format')
  }

  const [style, waistStr, shape, inseamStr, wash] = parts
  const waist = parseInt(waistStr)
  const inseam = parseInt(inseamStr)

  if (isNaN(waist) || isNaN(inseam)) {
    throw new InvalidSKUError('Invalid numeric values in SKU')
  }

  const components = {
    style,
    waist,
    shape,
    inseam,
    wash
  }

  // Validate using zod schema
  const result = skuComponentsSchema.safeParse(components)
  if (!result.success) {
    throw new InvalidSKUError(result.error.message)
  }

  return components
}

export function buildSKU(components: SKUComponents): string {
  // Validate components
  const result = skuComponentsSchema.safeParse(components)
  if (!result.success) {
    throw new InvalidSKUError(result.error.message)
  }

  return `${components.style}-${components.waist}-${components.shape}-${components.inseam}-${components.wash}`
}