import { 
  SKUComponents, 
  SKUMatchResult,
  washCompatibilityMap,
  IncompatibleWashError,
  UniversalSKUError
} from './types'
import { parseSKU } from './parser'
import { buildSKU } from './builder'
import { useProductionStore } from '@/lib/stores/productionStore'
import { useProductionLogger } from '@/lib/stores/productionLogger'

export function findSKUMatch(
  orderSKU: string,
  orderId?: string,
  orderNumber?: number,
  customerName?: string
): SKUMatchResult {
  const logger = useProductionLogger.getState()
  
  // Log search attempt
  logger.addLog({
    type: 'SKU_SEARCH',
    details: {
      sku: orderSKU,
      orderId,
      orderNumber,
      message: `Starting inventory search for SKU: ${orderSKU}`
    }
  })

  const orderComponents = parseSKU(orderSKU)
  if (!orderComponents) {
    return {
      matched: false,
      type: 'NONE',
      message: 'Invalid SKU format',
      productionRequired: false
    }
  }

  // Try exact match first
  const exactMatch = findExactMatch(orderComponents)
  if (exactMatch) {
    logger.addLog({
      type: 'SKU_MATCH',
      details: {
        sku: orderSKU,
        matchType: 'EXACT',
        itemId: exactMatch.id,
        message: 'Found exact SKU match'
      }
    })

    return {
      matched: true,
      type: 'EXACT',
      item: exactMatch,
      message: 'Exact SKU match found'
    }
  }

  // Try universal match
  const universalMatch = findUniversalMatch(orderComponents)
  if (universalMatch) {
    logger.addLog({
      type: 'SKU_MATCH',
      details: {
        sku: orderSKU,
        matchType: 'UNIVERSAL',
        itemId: universalMatch.id,
        message: `Found universal match: ${universalMatch.sku}`
      }
    })

    return {
      matched: true,
      type: 'UNIVERSAL',
      item: universalMatch,
      message: `Universal match found: ${universalMatch.sku}`
    }
  }

  // Create production request with universal SKU
  const universalSku = createUniversalSKU(orderComponents)
  
  // Add production request
  useProductionStore.getState().addRequest({
    sku: orderSKU,
    universalSku,
    quantity: 1,
    priority: orderId ? 'HIGH' : 'MEDIUM',
    status: 'PENDING',
    orderId,
    orderNumber,
    customerName,
    notes: orderId ? `Required for Order #${orderNumber}` : undefined
  })

  logger.addLog({
    type: 'PRODUCTION_REQUEST',
    details: {
      sku: orderSKU,
      universalSku,
      orderId,
      orderNumber,
      message: `Created production request for universal SKU: ${universalSku}`
    }
  })

  return {
    matched: false,
    type: 'NONE',
    message: `No matching inventory found for SKU: ${orderSKU}. Production request created.`,
    productionRequired: true,
    universalSku
  }
}

function findExactMatch(components: SKUComponents) {
  // Mock inventory check - replace with actual inventory lookup
  return null
}

function findUniversalMatch(orderComponents: SKUComponents) {
  // Mock inventory check - replace with actual inventory lookup
  return null
}

export function createUniversalSKU(components: SKUComponents): string {
  // Create universal SKU with maximum flexibility
  const universalComponents = {
    ...components,
    inseam: 36, // Maximum inseam
    wash: getUniversalWash(components.wash)
  }

  return buildSKU(universalComponents)
}

function getUniversalWash(wash: string): string {
  // Find the most flexible wash option that can be processed into the target wash
  for (const [source, targets] of Object.entries(washCompatibilityMap)) {
    if (targets.includes(wash)) {
      return source
    }
  }
  throw new UniversalSKUError(`No universal wash found for: ${wash}`)
}

export function isWashCompatible(sourceWash: string, targetWash: string): boolean {
  // If washes are the same, they're compatible
  if (sourceWash === targetWash) return true

  // Check if source wash can be processed into target wash
  const compatibleWashes = washCompatibilityMap[sourceWash]
  if (!compatibleWashes) {
    throw new IncompatibleWashError(targetWash, sourceWash)
  }

  return compatibleWashes.includes(targetWash)
}
export function buildSKU(style: string, waist: number, shape: string, inseam: number, wash: string): string {
    return `${style}-${waist}-${shape}-${inseam}-${wash}`;
}
export function parseSKU(sku) {
  const [style, waist, shape, inseam, wash] = sku.split('-');
  return { style, waist, shape, inseam, wash };
}
export function getUniversalSKU(sku) {
  const { style, waist, shape } = parseSKU(sku);

  // Universal wash rules:
  let universalWash;
  if (style === 'ONX' || style === 'JAG') {
    universalWash = 'BRW'; // Black raw wash for ONX and JAG
  } else {
    universalWash = 'RAW'; // Raw wash for IND and STA
  }

  // Universal inseam:
  const universalInseam = '36'; // Default universal inseam

  // Construct the universal SKU
  return `${style}-${waist}-${shape}-${universalInseam}-${universalWash}`;
}

export function canConvertToSKU(sourceSKU, targetSKU) {
  const source = parseSKU(sourceSKU);
  const target = parseSKU(targetSKU);

  // Ensure style, waist, and shape are identical
  if (
    source.style !== target.style ||
    source.waist !== target.waist ||
    source.shape !== target.shape
  ) {
    return false;
  }

  // Inseam: source inseam must be greater than or equal to the target inseam
  if (parseInt(source.inseam, 10) < parseInt(target.inseam, 10)) {
    return false;
  }

  // Wash: source wash must be convertible to target wash
  if (source.wash === 'RAW' && ['STA', 'IND'].includes(target.wash)) {
    return true;
  }
  if (source.wash === 'BRW' && target.wash === 'ONX') {
    return true;
  }

  // If none of the above conditions are met, the conversion is not possible
  return false;
}