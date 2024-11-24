import { supabase } from '@/lib/supabase'
import type { Request } from '@/lib/schema'

export async function createRequest(data: {
  request_type: string
  request_name: string
  request_description?: string
  assigned_to: string
  role: string
  priority: string
  deadline?: string
  inventory_item_id?: string
  batch_id?: string
  steps: {
    title: string
    description: string
    type: string
    order: number
  }[]
}): Promise<Request> {
  const { data: request, error } = await supabase
    .from('requests')
    .insert({
      request_type: data.request_type,
      request_name: data.request_name,
      request_description: data.request_description,
      assigned_to: data.assigned_to,
      role: data.role,
      status: 'PENDING',
      priority: data.priority,
      deadline: data.deadline,
      inventory_item_id: data.inventory_item_id,
      batch_id: data.batch_id,
      steps: data.steps
    })
    .select(`
      *,
      inventory_item:inventory_items(*),
      batch:batches(*)
    `)
    .single()

  if (error) throw error
  return request
}