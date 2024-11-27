import { getWaitlistForSku } from './waitlist'
import { getMockInventoryItems, commitInventoryToOrder } from '@/lib/mock-api/inventory'
import { createMockInventoryEvent } from '@/lib/mock-api/events'
import type { InventoryItem, WaitlistEntry } from '@/lib/schema'

export async function processWaitlistForNewItems(items: InventoryItem[]) {
  // Group items by SKU
  const itemsBySku = items.reduce((acc, item) => {
    acc[item.sku] = [...(acc[item.sku] || []), item]
    return acc
  }, {} as Record<string, InventoryItem[]>)

  // Process each SKU group
  for (const [sku, skuItems] of Object.entries(itemsBySku)) {
    try {
      // Get waitlist entries for this SKU, sorted by creation date
      const waitlistEntries = await getWaitlistForSku(sku)
      if (!waitlistEntries.length) continue // Skip if no waitlist entries

      waitlistEntries.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      // Get uncommitted items
      const uncommittedItems = skuItems.filter(item => 
        item.status1 === 'PRODUCTION' && 
        item.status2 === 'UNCOMMITTED'
      )

      // Match items to waitlist entries
      for (let i = 0; i < Math.min(waitlistEntries.length, uncommittedItems.length); i++) {
        const item = uncommittedItems[i]
        const entry = waitlistEntries[i]

        if (!item || !entry) continue

        try {
          // Commit item to order
          await commitInventoryToOrder(item, entry.order_id)

          // Create events
          await createMockInventoryEvent({
            inventory_item_id: item.id,
            event_name: 'WAITLIST_MATCHED',
            event_description: `Matched to waitlist entry #${entry.position} for order ${entry.order_number}`,
            status: 'COMPLETED',
            timestamp: new Date().toISOString(),
            metadata: {
              waitlist_entry_id: entry.id,
              order_id: entry.order_id,
              waitlist_position: entry.position
            }
          })

          // Don't remove from waitlist - keep for activation order
          // await removeFromWaitlist(entry.order_id, entry.sku) // Remove this line
        } catch (error) {
          console.error('Error processing waitlist entry:', error)
          continue // Continue with next entry even if one fails
        }
      }
    } catch (error) {
      console.error('Error processing SKU:', sku, error)
      continue // Continue with next SKU even if one fails
    }
  }
} 