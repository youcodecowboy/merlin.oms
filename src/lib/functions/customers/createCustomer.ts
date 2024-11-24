import { supabase } from '@/lib/supabase'
import type { Customer } from '@/lib/schema'

export async function createCustomer(data: {
  email: string
  name?: string
  phone?: string
}): Promise<Customer> {
  const { data: customer, error } = await supabase
    .from('customers')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return customer
}