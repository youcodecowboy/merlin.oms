import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'
import type { InventoryItem } from '@/lib/schema'

export async function addInventoryItems(data: {
  product_id?: string
  sku: string
  quantity: number
  status1: string
  status2: string
}): Promise<InventoryItem[]> {
  const items = await Promise.all(
    Array.from({ length: data.quantity }, async () => {
      const qrCode = await QRCode.toDataURL(Math.random().toString(36).substring(7))
      return {
        product_id: data.product_id,
        sku: data.sku,
        status1: data.status1,
        status2: data.status2,
        qr_code: qrCode
      }
    })
  )

  const { data: newItems, error } = await supabase
    .from('inventory_items')
    .insert(items)
    .select()

  if (error) throw error
  return newItems
}