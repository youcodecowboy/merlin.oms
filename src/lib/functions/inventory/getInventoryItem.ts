import { supabase } from '@/lib/supabase'
import type { InventoryItem } from '@/lib/schema'

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}