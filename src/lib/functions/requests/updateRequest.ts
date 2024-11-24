import { supabase } from '@/lib/supabase'
import type { Request } from '@/lib/schema'

export async function updateRequest(
  id: string,
  data: Partial<Request>
): Promise<Request> {
  const { data: updated, error } = await supabase
    .from('requests')
    .update(data)
    .eq('id', id)
    .select(`
      *,
      inventory_item:inventory_items(*),
      batch:batches(*)
    `)
    .single()

  if (error) throw error
  return updated
}