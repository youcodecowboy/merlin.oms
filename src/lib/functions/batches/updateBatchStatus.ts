import { supabase } from '@/lib/supabase'

export async function updateBatchStatus(id: string, status: 'COMPLETED'): Promise<void> {
  const { error } = await supabase
    .from('batches')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}