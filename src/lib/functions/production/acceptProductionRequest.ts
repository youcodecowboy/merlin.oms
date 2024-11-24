import { supabase } from '@/lib/supabase'

export async function acceptProductionRequest(id: string, data: {
  sku: string
  quantity: number
}): Promise<void> {
  // Create batch
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .insert({
      pending_request_id: id,
      total_quantity: data.quantity
    })
    .select()
    .single()

  if (batchError) throw batchError

  // Create production items
  const productionItems = Array.from({ length: data.quantity }, () => ({
    sku: data.sku,
    batch_id: batch.id
  }))

  const { error: productionError } = await supabase
    .from('production')
    .insert(productionItems)

  if (productionError) throw productionError

  // Update pending request status
  const { error: updateError } = await supabase
    .from('pending_production')
    .update({ status: 'ACCEPTED' })
    .eq('id', id)

  if (updateError) throw updateError
}