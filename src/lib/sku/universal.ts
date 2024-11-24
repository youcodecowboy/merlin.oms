import { SKUComponents } from './types'

export function getUniversalSKU(components: SKUComponents): SKUComponents {
  return {
    ...components,
    inseam: 36, // Maximum inseam
    wash: 'RAW' // Most flexible wash option
  }
}

export function canConvertToSKU(
  universalComponents: SKUComponents,
  targetComponents: SKUComponents
): boolean {
  // Check immutable components
  if (universalComponents.style !== targetComponents.style) return false
  if (universalComponents.waist !== targetComponents.waist) return false
  if (universalComponents.shape !== targetComponents.shape) return false

  // Check flexible components
  if (universalComponents.inseam < targetComponents.inseam) return false

  // Check wash compatibility
  const washCompatibility: Record<string, string[]> = {
    'RAW': ['RAW', 'STA', 'IND', 'BLK'],
    'STA': ['STA'],
    'IND': ['IND'],
    'BLK': ['BLK']
  }

  const compatibleWashes = washCompatibility[universalComponents.wash] || []
  return compatibleWashes.includes(targetComponents.wash)
}