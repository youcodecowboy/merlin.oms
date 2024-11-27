// Base types that mirror our future Supabase tables
export interface DBInventoryItem {
  id: string
  current_sku: string
  target_sku: string
  status1: 'PRODUCTION' | 'STOCK'
  status2: 'COMMITTED' | 'UNCOMMITTED' | 'ASSIGNED'
  batch_id?: string
  location?: string
  order_id?: string
  created_at: string
  updated_at: string
  metadata?: {
    wash_type?: string
    customer_id?: string
    order_number?: string
    production_batch?: string
    production_date?: string
  }
}

// Define wash types and their mappings
export const SKU_TRANSFORMATIONS = {
  'STR': { wash: 'STA', name: 'STARDUST' },
  'IND': { wash: 'IND', name: 'INDIGO' },
  'ONX': { wash: 'ONX', name: 'ONYX' },
  'JAG': { wash: 'JAG', name: 'JAGGER' }
} as const

// Helper to get wash type from SKUs
export function getWashTypeFromSkus(currentSku: string, targetSku: string) {
  // Extract the wash code from the target SKU (e.g., 'ST-32-X-32-STR' -> 'STR')
  const washCode = targetSku.split('-').pop()
  
  if (!washCode || !SKU_TRANSFORMATIONS[washCode as keyof typeof SKU_TRANSFORMATIONS]) {
    throw new Error(`Invalid wash code in SKU: ${targetSku}`)
  }

  return SKU_TRANSFORMATIONS[washCode as keyof typeof SKU_TRANSFORMATIONS]
}

export interface DBRequest {
  id: string
  item_id: string
  request_type: string
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface DBEvent {
  id: string
  item_id: string
  event_type: string
  classifier: string
  metadata: Record<string, any>
  created_at: string
  related_events?: string[]
}

export interface DBOrder {
  id: string
  number: string
  customer_id: string
  status: string
  created_at: string
  updated_at: string
}

export interface DBCustomer {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
} 