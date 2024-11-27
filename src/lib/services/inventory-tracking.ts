import { eventTracker } from './event-tracking'
import type { InventoryItem, Order } from '@/lib/schema'

export async function trackInventoryCreation(item: InventoryItem) {
  return eventTracker.createEvent(
    'INVENTORY',
    'INVENTORY_CREATED',
    {
      item_id: item.id,
      item_sku: item.sku,
      status1: item.status1,
      status2: item.status2,
      location: item.location,
      batch_id: item.batch_id,
      production_batch: item.production_batch,
      timestamp: new Date().toISOString(),
      notes: `Created inventory item ${item.sku}`
    },
    undefined,
    {
      classifier: 'creation'
    }
  )
}

export async function trackInventoryStatusChange(
  item: InventoryItem,
  previousStatus1: string,
  previousStatus2: string,
  reason?: string
) {
  return eventTracker.createEvent(
    'INVENTORY',
    'INVENTORY_UPDATED',
    {
      item_id: item.id,
      item_sku: item.sku,
      previous_status: `${previousStatus1}/${previousStatus2}`,
      new_status: `${item.status1}/${item.status2}`,
      location: item.location,
      batch_id: item.batch_id,
      timestamp: new Date().toISOString(),
      notes: reason || `Status changed from ${previousStatus1}/${previousStatus2} to ${item.status1}/${item.status2}`
    },
    undefined,
    {
      classifier: 'update'
    }
  )
}

export async function trackInventoryLocationChange(
  item: InventoryItem,
  previousLocation: string,
  reason?: string
) {
  return eventTracker.createEvent(
    'LOCATION',
    'LOCATION_MOVED',
    {
      item_id: item.id,
      item_sku: item.sku,
      previous_location: previousLocation,
      new_location: item.location,
      timestamp: new Date().toISOString(),
      notes: reason || `Moved from ${previousLocation} to ${item.location}`
    },
    undefined,
    {
      classifier: 'movement'
    }
  )
}

export async function trackInventoryCommitment(
  item: InventoryItem,
  order: Order,
  reason?: string
) {
  return eventTracker.createEvent(
    'INVENTORY',
    'INVENTORY_COMMITTED',
    {
      item_id: item.id,
      item_sku: item.sku,
      order_id: order.id,
      order_number: order.number,
      status1: item.status1,
      status2: item.status2,
      location: item.location,
      timestamp: new Date().toISOString(),
      notes: reason || `Committed to order ${order.number}`
    },
    undefined,
    {
      classifier: 'update'
    }
  )
}

export async function trackQualityCheck(
  item: InventoryItem,
  result: 'PASS' | 'FAIL',
  details: {
    qc_type: string
    defect_type?: string
    severity?: string
    notes?: string
  }
) {
  return eventTracker.createEvent(
    'QUALITY',
    result === 'PASS' ? 'QC_PASSED' : 'QC_FAILED',
    {
      item_id: item.id,
      item_sku: item.sku,
      qc_type: details.qc_type,
      result,
      defect_type: details.defect_type,
      severity: details.severity,
      timestamp: new Date().toISOString(),
      notes: details.notes || `QC ${result}: ${details.qc_type}`
    },
    undefined,
    {
      classifier: result === 'PASS' ? 'completion' : 'error'
    }
  )
} 