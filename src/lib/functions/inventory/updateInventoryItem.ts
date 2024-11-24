import { supabase } from '@/lib/supabase'
import type { InventoryItem } from '@/lib/schema'

export async function updateInventoryItem(
  id: string, 
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  const { data: updated, error } = await supabase
    .from('inventory_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}