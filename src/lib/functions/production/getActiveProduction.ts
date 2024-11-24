import { supabase } from '@/lib/supabase'
import type { ProductionRequest } from '@/lib/schema'

export async function getActiveProduction(): Promise<ProductionRequest[]> {
  const { data, error } = await supabase
    .from('production')
    .select(`
      *,
      batch:batches(
        pending_request:pending_production(*)
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}