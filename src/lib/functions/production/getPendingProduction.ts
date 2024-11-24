import { supabase } from '@/lib/supabase'
import type { PendingProduction } from '@/lib/schema'

export async function getPendingProduction(): Promise<PendingProduction[]> {
  const { data, error } = await supabase
    .from('pending_production')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}