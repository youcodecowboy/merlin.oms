import { supabase } from '@/lib/supabase'
import { AppError } from '@/lib/errors'

export class InventoryRepository {
  async checkAvailability(sku: string, quantity: number) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('sku', sku)
      .eq('status2', 'UNCOMMITTED')
      .limit(quantity)

    if (error) {
      throw new AppError('DATABASE_ERROR', 'Failed to check inventory', 500, error)
    }

    return {
      available: data.length >= quantity,
      quantity: data.length
    }
  }

  async commitItems(sku: string, quantity: number) {
    const { error } = await supabase
      .from('inventory_items')
      .update({ status2: 'COMMITTED' })
      .eq('sku', sku)
      .eq('status2', 'UNCOMMITTED')
      .limit(quantity)

    if (error) {
      throw new AppError('DATABASE_ERROR', 'Failed to commit inventory items', 500, error)
    }
  }
}