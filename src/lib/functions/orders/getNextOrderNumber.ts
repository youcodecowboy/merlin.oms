import { supabase } from '@/lib/supabase'

export async function getNextOrderNumber(): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .select('number')
    .order('number', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.number ? data.number + 1 : 1000
}