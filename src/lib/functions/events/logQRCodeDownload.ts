import { supabase } from '@/lib/supabase'
import type { InventoryItem } from '@/lib/schema'

export async function logQRCodeDownload(
  itemId: string, 
  item: InventoryItem
): Promise<void> {
  const { error } = await supabase
    .from('inventory_events')
    .insert({
      inventory_item_id: itemId,
      event_name: 'QR Code Downloaded',
      event_description: 'QR code for this inventory item was downloaded',
      status: 'COMPLETED',
      metadata: {
        sku: item.sku,
        batch_id: item.batch_id
      }
    })

  if (error) throw error
}