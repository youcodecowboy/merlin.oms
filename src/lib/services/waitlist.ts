import type { Order, OrderItem, WaitlistEntry, InventoryItem } from '../schema'
import { nanoid } from 'nanoid'
import { convertToRawSku, isExtendedSku } from '../utils/sku'

// In-memory waitlist storage
let waitlistEntries: WaitlistEntry[] = []

export async function addToWaitlist(
  order: Order,
  orderItem: OrderItem,
  priority: Priority = 'MEDIUM'
): Promise<WaitlistEntry> {
  const rawSku = convertToRawSku(orderItem.sku)
  
  // Get current position for this SKU
  const currentEntries = waitlistEntries.filter(
    entry => entry.raw_sku === rawSku
  )
  
  const entry: WaitlistEntry = {
    id: nanoid(),
    order_id: order.id,
    order_number: order.number,
    sku: orderItem.sku,
    raw_sku: rawSku,
    quantity: orderItem.quantity,
    priority,
    created_at: new Date().toISOString(),
    position: currentEntries.length + 1
  }

  waitlistEntries.push(entry)
  
  // Update order item with waitlist info
  orderItem.waitlist_position = entry.position
  orderItem.waitlist_sku = rawSku

  return entry
}

export async function removeFromWaitlist(orderId: string, sku: string): Promise<void> {
  try {
    // Get current waitlist
    const entries = await getWaitlistEntries()
    
    // Remove the entry
    const updatedEntries = entries.filter(entry => 
      !(entry.order_id === orderId && entry.sku === sku)
    )
    
    // Update positions for remaining entries with same SKU
    const sameSkuEntries = updatedEntries.filter(e => e.sku === sku)
    sameSkuEntries.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    sameSkuEntries.forEach((entry, index) => {
      entry.position = index + 1
    })

    // Save updated waitlist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
  } catch (error) {
    console.error('Failed to remove from waitlist:', error)
    throw error
  }
}

export async function findAvailableInventory(
  orderItem: OrderItem,
  inventoryItems: InventoryItem[]
): Promise<InventoryItem | null> {
  // First try exact SKU match
  const exactMatch = inventoryItems.find(item => 
    item.sku === orderItem.sku &&
    item.status2 === 'UNCOMMITTED'
  )
  if (exactMatch) return exactMatch

  // Then try extended SKU matches
  if (isExtendedSku(orderItem.sku)) {
    const baseItems = inventoryItems.filter(item => 
      item.status2 === 'UNCOMMITTED' &&
      canUseForSku(item.sku, orderItem.sku)
    )
    
    if (baseItems.length > 0) {
      // Return the oldest item first
      return baseItems.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0]
    }
  }

  return null
}

// Helper to check if a raw SKU can be used for an extended SKU
function canUseForSku(rawSku: string, targetSku: string): boolean {
  const [rawStyle, rawWaist, rawShape, rawInseam] = rawSku.split('-')
  const [targetStyle, targetWaist, targetShape, targetInseam] = targetSku.split('-')

  return (
    rawStyle === targetStyle &&
    rawWaist === targetWaist &&
    rawShape === targetShape &&
    parseInt(rawInseam) >= parseInt(targetInseam)
  )
}

export async function getWaitlistForSku(sku: string): Promise<WaitlistEntry[]> {
  const rawSku = convertToRawSku(sku)
  return waitlistEntries
    .filter(entry => entry.raw_sku === rawSku)
    .sort((a, b) => a.position - b.position)
}

export async function processWaitlist(item: InventoryItem): Promise<void> {
  const waitlist = await getWaitlistForSku(item.sku)
  
  if (waitlist.length === 0) return

  // Get the first waiting order
  const nextEntry = waitlist[0]
  
  // Commit item to order
  await commitInventoryToOrder(item, nextEntry.order_id)
  
  // Remove from waitlist
  await removeFromWaitlist(nextEntry.order_id, nextEntry.sku)
} 