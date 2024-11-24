import { supabase } from '@/lib/supabase'
import type { PendingProduction } from '@/lib/schema'

export async function createPendingProduction(data: {
  sku: string
  quantity: number
  priority: string
  notes?: string
}): Promise<PendingProduction> {
  const { data: request, error } = await supabase
    .from('pending_production')
    .insert({
      sku: data.sku,
      quantity: data.quantity,
      priority: data.priority,
      notes: data.notes
    })
    .select()
    .single()

  if (error) throw error
  return request
}