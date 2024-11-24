import { supabase } from './supabase'
import QRCode from 'qrcode'
import type { 
  Product, 
  Customer, 
  Order, 
  OrderItem,
  PendingProduction,
  ProductionRequest,
  Batch,
  InventoryItem,
  InventoryEvent
} from './schema'

// SKU Management
export function parseSKU(sku: string): { style: string; waist: number; shape: string; inseam: number; wash: string; } | null {
  const parts = sku.split('-')
  if (parts.length !== 5) return null

  const [style, waistStr, shape, inseamStr, wash] = parts
  const waist = parseInt(waistStr)
  const inseam = parseInt(inseamStr)

  if (isNaN(waist) || isNaN(inseam)) return null

  return {
    style,
    waist,
    shape,
    inseam,
    wash
  }
}

export function buildSKU(components: { style: string; waist: number; shape: string; inseam: number; wash: string }): string {
  return `${components.style}-${components.waist}-${components.shape}-${components.inseam}-${components.wash}`
}

export function getHemAdjustment(hem: 'RWH' | 'STH' | 'ORL' | 'HRL'): number {
  switch (hem) {
    case 'RWH': return 0
    case 'STH': return 0
    case 'ORL': return 2
    case 'HRL': return 4
    default: return 0
  }
}

// Orders
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

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

export async function createOrder(data: {
  customer_id: string
  number: number
  order_status: string
  items: OrderItem[]
}): Promise<Order> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: data.customer_id,
      number: data.number,
      order_status: data.order_status
    })
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = data.items.map(item => ({
    order_id: order.id,
    ...item
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  const { data: completeOrder, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .eq('id', order.id)
    .single()

  if (fetchError) throw fetchError
  return completeOrder
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

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

// Products
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Production Management
export async function getPendingProduction(): Promise<PendingProduction[]> {
  const { data, error } = await supabase
    .from('pending_production')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

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

export async function getActiveProduction(): Promise<ProductionRequest[]> {
  const { data, error } = await supabase
    .from('production')
    .select(`
      *,
      batch:batches(
        pending_request:pending_production(*)
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function moveToNextStage(id: string): Promise<string> {
  const stages = ['CUTTING', 'SEWING', 'WASHING', 'FINISHING', 'QC', 'READY']
  
  const { data: current, error: fetchError } = await supabase
    .from('production')
    .select('current_stage')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const currentIndex = stages.indexOf(current.current_stage)
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    throw new Error('Cannot move to next stage')
  }

  const nextStage = stages[currentIndex + 1]

  const { error: updateError } = await supabase
    .from('production')
    .update({ current_stage: nextStage })
    .eq('id', id)

  if (updateError) throw updateError
  return nextStage
}

// Batches
export async function getBatches(params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}): Promise<{ items: Batch[]; total: number }> {
  const { data, error, count } = await supabase
    .from('batches')
    .select(`
      *,
      pending_request:pending_production(*)
    `, { count: 'exact' })
    .order(params.sortBy, { ascending: params.sortOrder === 'asc' })
    .range(
      (params.page - 1) * params.pageSize,
      params.page * params.pageSize - 1
    )

  if (error) throw error
  return {
    items: data || [],
    total: count || 0
  }
}

export async function getBatchDetails(id: string): Promise<{
  batch: Batch & { qr_codes: string[] }
  items: InventoryItem[]
}> {
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select(`
      *,
      pending_request:pending_production(*)
    `)
    .eq('id', id)
    .single()

  if (batchError) throw batchError

  const { data: items, error: itemsError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('batch_id', id)

  if (itemsError) throw itemsError

  return {
    batch: {
      ...batch,
      qr_codes: items?.map(item => item.qr_code).filter(Boolean) || []
    },
    items: items || []
  }
}

export async function updateBatchStatus(id: string, status: 'COMPLETED'): Promise<void> {
  const { error } = await supabase
    .from('batches')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

// Inventory
export async function getInventoryItems(params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  status1?: string
  status2?: string
  search?: string
}): Promise<{ items: InventoryItem[]; total: number }> {
  let query = supabase
    .from('inventory_items')
    .select('*', { count: 'exact' })

  if (params.status1) {
    query = query.eq('status1', params.status1)
  }

  if (params.status2) {
    query = query.eq('status2', params.status2)
  }

  if (params.search) {
    query = query.or(`sku.ilike.%${params.search}%,product_id.eq.${params.search}`)
  }

  const { data, error, count } = await query
    .order(params.sortBy, { ascending: params.sortOrder === 'asc' })
    .range(
      (params.page - 1) * params.pageSize,
      params.page * params.pageSize - 1
    )

  if (error) throw error
  return {
    items: data || [],
    total: count || 0
  }
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

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

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data: updated, error } = await supabase
    .from('inventory_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}

// Events
export async function getInventoryEvents(itemId: string): Promise<InventoryEvent[]> {
  const { data, error } = await supabase
    .from('inventory_events')
    .select('*')
    .eq('inventory_item_id', itemId)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data
}

export async function logQRCodeDownload(itemId: string, item: InventoryItem): Promise<void> {
  const { error } = await supabase
    .from('inventory_events')
    .insert({
      inventory_item_id: itemId,
      event_name: 'QR Code Downloaded',
      event_description: 'QR code for this inventory item was downloaded',
      status: 'COMPLETED',
      metadata: {
        sku: item.sku,
        batch_id: item.batch_id
      }
    })

  if (error) throw error
}