import { supabase } from '@/lib/supabase'
import type { Batch, InventoryItem } from '@/lib/schema'

export async function getBatchDetails(id: string): Promise<{
  batch: Batch & { qr_codes: string[] }
  items: InventoryItem[]
}> {
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select(`
      *,
      pending_request:pending_production(*)
    `)
    .eq('id', id)
    .single()

  if (batchError) throw batchError

  const { data: items, error: itemsError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('batch_id', id)

  if (itemsError) throw itemsError

  return {
    batch: {
      ...batch,
      qr_codes: items?.map(item => item.qr_code).filter(Boolean) || []
    },
    items: items || []
  }
}