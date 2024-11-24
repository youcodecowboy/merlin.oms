import { supabase } from '@/lib/supabase'
import type { Batch } from '@/lib/schema'

export async function getBatches(params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}): Promise<{ items: Batch[]; total: number }> {
  const { data, error, count } = await supabase
    .from('batches')
    .select(`
      *,
      pending_request:pending_production(*)
    `, { count: 'exact' })
    .order(params.sortBy, { ascending: params.sortOrder === 'asc' })
    .range(
      (params.page - 1) * params.pageSize,
      params.page * params.pageSize - 1
    )

  if (error) throw error
  return {
    items: data || [],
    total: count || 0
  }
}