import { supabase } from '@/lib/supabase'
import type { Request } from '@/lib/schema'

export async function getRequests(params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  status?: string
  priority?: string
  assignedTo?: string
}): Promise<{ items: Request[]; total: number }> {
  let query = supabase
    .from('requests')
    .select(`
      *,
      inventory_item:inventory_items(*),
      batch:batches(*)
    `, { count: 'exact' })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.priority) {
    query = query.eq('priority', params.priority)
  }

  if (params.assignedTo) {
    query = query.eq('assigned_to', params.assignedTo)
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