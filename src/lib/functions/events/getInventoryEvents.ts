import { supabase } from '@/lib/supabase'
import type { InventoryEvent } from '@/lib/schema'

export async function getInventoryEvents(itemId: string): Promise<InventoryEvent[]> {
  const { data, error } = await supabase
    .from('inventory_events')
    .select('*')
    .eq('inventory_item_id', itemId)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data
}