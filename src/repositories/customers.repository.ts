import { supabase } from '@/lib/supabase'
import type { Customer } from '@/lib/schema'
import { AppError } from '@/lib/errors'

export class CustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new AppError('DATABASE_ERROR', 'Failed to fetch customer', 500, error)
    }

    return data
  }
}