import { 
  SKUComponents, 
  SKUMatchResult,
  washCompatibilityMap,
  IncompatibleWashError,
  UniversalSKUError,
  NoInventoryAvailableError,
  MockInventoryItem,
  PendingProductionRequest
} from '../types'
import { mockStore, updateStore, addNotification } from '../store'
import { parseSKU, buildSKU } from '@/lib/sku'

export async function findAndCommitInventory(
  orderSKU: string,
  orderId: string,
  quantity: number = 1
): Promise<SKUMatchResult> {
  try {
    // Parse order SKU
    const orderComponents = parseSKU(orderSKU)
    if (!orderComponents) {
      throw new Error(`Invalid SKU format: ${orderSKU}`)
    }

    const committedItems: MockInventoryItem[] = []
    let remainingQuantity = quantity

    // Try to find and commit exact matches first
    while (remainingQuantity > 0) {
      const exactMatch = await findExactMatch(orderComponents)
      if (exactMatch) {
        const committedItem = await commitInventoryItem(exactMatch, orderId)
        committedItems.push(committedItem)
        remainingQuantity--
        continue
      }

      // If no exact match, try universal match
      const universalMatch = await findUniversalMatch(orderComponents)
      if (universalMatch) {
        const committedItem = await commitInventoryItem(universalMatch, orderId)
        committedItems.push(committedItem)
        remainingQuantity--
        continue
      }

      // If no matches found, break the loop
      break
    }

    // If we committed any items
    if (committedItems.length > 0) {
      const allCommitted = committedItems.length === quantity
      
      // Create production request for remaining quantity if needed
      let productionRequest: PendingProductionRequest | undefined
      if (remainingQuantity > 0) {
        productionRequest = await createOrUpdatePendingProduction(
          orderComponents,
          orderId,
          remainingQuantity
        )
      }

      return {
        matched: true,
        type: allCommitted ? 'EXACT' : 'PARTIALLY_ASSIGNED',
        items: committedItems,
        message: allCommitted 
          ? `Successfully committed ${quantity} units`
          : `Committed ${committedItems.length} units, ${remainingQuantity} units pending production`,
        productionRequest,
        universalSku: buildUniversalSKU(orderComponents)
      }
    }

    // If no items were committed, create production request for all units
    const universalSku = buildUniversalSKU(orderComponents)
    const productionRequest = await createOrUpdatePendingProduction(
      orderComponents,
      orderId,
      quantity
    )

    return {
      matched: false,
      type: 'PRODUCTION',
      productionRequest,
      message: `Created production request for ${quantity} units`,
      universalSku
    }

  } catch (error) {
    console.error('Error in findAndCommitInventory:', error)
    throw error instanceof NoInventoryAvailableError ? error :
          new NoInventoryAvailableError(orderSKU)
  }
}

function buildUniversalSKU(components: SKUComponents): string {
  return buildSKU({
    ...components,
    inseam: 36, // Maximum inseam
    wash: getUniversalWash(components.wash)
  })
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

async function findExactMatch(components: SKUComponents): Promise<MockInventoryItem | undefined> {
  const sku = buildSKU(components)
  return mockStore.inventory.find(item => 
    item.sku === sku && 
    item.status2 === 'UNCOMMITTED'
  )
}

async function findUniversalMatch(orderComponents: SKUComponents): Promise<MockInventoryItem | undefined> {
  const potentialMatches = mockStore.inventory.filter(item => {
    if (item.status2 !== 'UNCOMMITTED') return false

    try {
      const itemComponents = parseSKU(item.sku)
      if (!itemComponents) return false

      // Check immutable components
      if (itemComponents.style !== orderComponents.style) return false
      if (itemComponents.waist !== orderComponents.waist) return false
      if (itemComponents.shape !== orderComponents.shape) return false

      // Check flexible components
      if (itemComponents.inseam < orderComponents.inseam) return false
      if (!isWashCompatible(itemComponents.wash, orderComponents.wash)) return false

      return true
    } catch (error) {
      console.error('Error parsing SKU during universal match:', { 
        error, 
        sku: item.sku 
      })
      return false
    }
  })

  // Sort matches by closest inseam to minimize waste
  potentialMatches.sort((a, b) => {
    const aComponents = parseSKU(a.sku)
    const bComponents = parseSKU(b.sku)
    if (!aComponents || !bComponents) return 0
    const aDiff = Math.abs(aComponents.inseam - orderComponents.inseam)
    const bDiff = Math.abs(bComponents.inseam - orderComponents.inseam)
    return aDiff - bDiff
  })

  return potentialMatches[0]
}

async function commitInventoryItem(item: MockInventoryItem, orderId: string): Promise<MockInventoryItem> {
  const updatedItem = {
    ...item,
    status2: 'COMMITTED' as const,
    orderId,
    updated_at: new Date().toISOString()
  }

  // Update store
  const inventory = mockStore.inventory.map(i =>
    i.id === item.id ? updatedItem : i
  )
  updateStore({ inventory })

  return updatedItem
}

async function createOrUpdatePendingProduction(
  components: SKUComponents,
  orderId: string,
  quantity: number
): Promise<PendingProductionRequest> {
  const timestamp = new Date().toISOString()
  const universalSku = buildUniversalSKU(components)

  // Check for existing pending production request with same SKU and order
  const existingRequest = mockStore.pendingProduction.find(req => 
    req.sku === universalSku && req.orderId === orderId
  )

  if (existingRequest) {
    // Update existing request
    const updatedRequest = {
      ...existingRequest,
      quantity: existingRequest.quantity + quantity,
      updated_at: timestamp
    }

    // Update store
    const pendingProduction = mockStore.pendingProduction.map(req =>
      req.id === existingRequest.id ? updatedRequest : req
    )
    updateStore({ pendingProduction })

    addNotification(
      'PRODUCTION_REQUEST',
      `Updated production request: ${quantity} additional units added for ${universalSku}`
    )

    return updatedRequest
  }

  // Create new production request
  const newRequest: PendingProductionRequest = {
    id: crypto.randomUUID(),
    sku: universalSku,
    quantity,
    priority: 'MEDIUM',
    orderId,
    requestedDate: timestamp,
    status: 'PENDING',
    created_at: timestamp,
    updated_at: timestamp
  }

  // Update store
  const pendingProduction = [...mockStore.pendingProduction, newRequest]
  updateStore({ pendingProduction })

  addNotification(
    'PRODUCTION_REQUEST',
    `New production request created for ${quantity} units of ${universalSku}`
  )

  return newRequest
}

export function isWashCompatible(sourceWash: string, targetWash: string): boolean {
  // If washes are the same, they're compatible
  if (sourceWash === targetWash) return true

  // Check if source wash can be processed into target wash
  const compatibleWashes = washCompatibilityMap[sourceWash]
  if (!compatibleWashes) {
    throw new IncompatibleWashError(`Wash ${sourceWash} cannot be processed into ${targetWash}`)
  }

  return compatibleWashes.includes(targetWash)
}