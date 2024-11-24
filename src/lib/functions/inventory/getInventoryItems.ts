import { supabase } from '@/lib/supabase'
import type { InventoryItem } from '@/lib/schema'

export async function getInventoryItems(params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  status1?: string
  status2?: string
  search?: string
}): Promise<{ items: InventoryItem[]; total: number }> {
  let query = supabase
    .from('inventory_items')
    .select('*', { count: 'exact' })

  if (params.status1) {
    query = query.eq('status1', params.status1)
  }

  if (params.status2) {
    query = query.eq('status2', params.status2)
  }

  if (params.search) {
    query = query.or(`sku.ilike.%${params.search}%,product_id.eq.${params.search}`)
  }

  const { data, error, count } = await query
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