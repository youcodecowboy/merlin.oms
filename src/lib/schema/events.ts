export type EventCategory = keyof EventType
export type EventName = EventType[EventCategory]

// Event classifiers for visual grouping
export type EventClassifier = 
  | 'creation'    // New items/orders/requests created (green)
  | 'update'      // Status/data updates (blue)
  | 'movement'    // Location changes (purple)
  | 'request'     // New requests (orange)
  | 'completion'  // Completed tasks/requests (teal)
  | 'scan'        // Scan events (yellow)
  | 'system'      // Automated system actions (gray)
  | 'error'       // Errors/issues (red)

export type EventType =
  // Order Events
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_UPDATED'
  
  // Item Events
  | 'ITEM_CREATED'
  | 'ITEM_STATUS_CHANGED'
  | 'ITEM_LOCATION_CHANGED'
  | 'ITEM_ASSIGNED_TO_ORDER'
  
  // Wash Events
  | 'WASH_REQUEST_CREATED'
  | 'WASH_STEP_COMPLETED'
  | 'WASH_COMPLETED'
  
  // Production Events
  | 'PRODUCTION_STARTED'
  | 'PRODUCTION_COMPLETED'
  
  // QC Events
  | 'QC_STARTED'
  | 'QC_PASSED'
  | 'QC_FAILED'

export interface BaseEventMetadata {
  timestamp: string
  operator: {
    id: string
    type: 'system' | 'user'
    name: string
  }
  classifier: EventClassifier
  notes?: string
}

export interface InventoryEventMetadata extends BaseEventMetadata {
  item_id: string
  item_sku: string
  status1?: string
  status2?: string
  location?: string
  batch_id?: string
  order_id?: string
}

export interface ProductionEventMetadata extends BaseEventMetadata {
  request_id?: string
  batch_id?: string
  sku: string
  quantity: number
  status?: string
  priority?: string
  order_id?: string
  pattern_request_id?: string
  cutting_request_id?: string
  stage?: string
  previous_status?: string
  new_status?: string
}

export interface OrderEventMetadata extends BaseEventMetadata {
  order_id: string
  customer_id?: string
  sku?: string
  quantity?: number
  status?: string
  previous_status?: string
  new_status?: string
  waitlist_position?: number
}

export interface WorkflowEventMetadata extends BaseEventMetadata {
  request_id: string
  request_type: string
  status: string
  previous_status?: string
  new_status?: string
  stage?: string
  step?: string
  related_items?: string[]
}

export interface LocationEventMetadata extends BaseEventMetadata {
  item_id: string
  previous_location?: string
  new_location?: string
  bin?: string
  zone?: string
  reason?: string
}

export interface QualityEventMetadata extends BaseEventMetadata {
  item_id: string
  qc_type: string
  result?: string
  defect_type?: string
  severity?: string
  action_required?: string
}

export interface SystemEventMetadata extends BaseEventMetadata {
  event_type: string
  severity: 'INFO' | 'WARNING' | 'ERROR'
  message: string
  stack_trace?: string
}

export type EventMetadata =
  | InventoryEventMetadata
  | ProductionEventMetadata
  | OrderEventMetadata
  | WorkflowEventMetadata
  | LocationEventMetadata
  | QualityEventMetadata
  | SystemEventMetadata

export interface TrackingEvent {
  id: string
  category: EventCategory
  type: EventName
  metadata: EventMetadata
  parent_event_id?: string
  child_event_ids?: string[]
  related_events?: string[]
  created_at: string
  classifier: EventClassifier
}

export interface EventChain {
  root_event_id: string
  events: TrackingEvent[]
  branches: {
    [key: string]: EventChain
  }
}

export type OrderStatus = 
  | 'CREATED'
  | 'PROCESSING'
  | 'WASH_REQUEST'
  | 'WASHING'
  | 'READY_FOR_QC'
  | 'COMPLETED'

export interface DBEvent {
  id: string
  event_type: EventType
  item_id?: string
  order_id?: string
  created_at: string
  created_by?: string
  metadata: {
    previous_status?: string
    new_status?: string
    location?: string
    wash_type?: string
    order_number?: string
    customer_name?: string
    step_id?: string
    step_title?: string
    [key: string]: any
  }
}

// Define status flow
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus> = {
  'CREATED': 'PROCESSING',
  'PROCESSING': 'WASH_REQUEST',
  'WASH_REQUEST': 'WASHING',
  'WASHING': 'READY_FOR_QC',
  'READY_FOR_QC': 'COMPLETED',
  'COMPLETED': 'COMPLETED'
} 