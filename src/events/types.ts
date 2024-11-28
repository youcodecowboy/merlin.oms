import type { SKU, Order, InventoryItem, Bin } from '@/lib/types'

export type EventType = 
  // Inventory Events
  | 'INVENTORY_CREATED'
  | 'INVENTORY_UPDATED'
  | 'STATUS_CHANGE'
  | 'LOCATION_CHANGE'
  
  // Order Events
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_ASSIGNED'
  
  // Request Events
  | 'REQUEST_CREATED'
  | 'REQUEST_UPDATED'
  | 'REQUEST_COMPLETED'
  | 'REQUEST_FAILED'
  | 'REQUEST_STEPS_UPDATED'
  
  // Bin Events
  | 'BIN_CREATED'
  | 'BIN_UPDATED'
  | 'BIN_ASSIGNMENT'
  | 'BIN_CAPACITY_CHECK'
  
  // QR Events
  | 'QR_SCAN'
  | 'QR_ACTIVATION'
  | 'QR_ERROR'
  
  // System Events
  | 'SYSTEM_ERROR'
  | 'DATA_VALIDATION_ERROR'
  | 'STATE_TRANSITION_ERROR'

export interface BaseEventLog {
  event_id: string
  event_type: EventType
  timestamp: Date
  actor_id: string
  metadata: Record<string, any>
}

export interface InventoryEventLog extends BaseEventLog {
  event_type: 'INVENTORY_CREATED' | 'INVENTORY_UPDATED' | 'STATUS_CHANGE' | 'LOCATION_CHANGE'
  item_id: string
  sku: SKU
  previous_state?: Partial<InventoryItem>
  new_state?: Partial<InventoryItem>
}

export interface OrderEventLog extends BaseEventLog {
  event_type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_STATUS_CHANGED' | 'ORDER_ASSIGNED'
  order_id: string
  customer_id: string
  previous_state?: Partial<Order>
  new_state?: Partial<Order>
}

export interface RequestEventLog extends BaseEventLog {
  event_type: 'REQUEST_CREATED' | 'REQUEST_UPDATED' | 'REQUEST_COMPLETED' | 'REQUEST_FAILED' | 'REQUEST_STEPS_UPDATED'
  request_id: string
  request_type: string
  item_id?: string
  order_id?: string
}

export interface BinEventLog extends BaseEventLog {
  event_type: 'BIN_CREATED' | 'BIN_UPDATED' | 'BIN_ASSIGNMENT' | 'BIN_CAPACITY_CHECK'
  bin_id: string
  previous_state?: Partial<Bin>
  new_state?: Partial<Bin>
}

export type EventLog = 
  | InventoryEventLog
  | OrderEventLog
  | RequestEventLog
  | BinEventLog
  | BaseEventLog 