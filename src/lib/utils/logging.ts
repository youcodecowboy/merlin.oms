import type { Order, SKU, InventoryItem } from '@/lib/types'

type EventType = 
  | 'ORDER_CREATED'
  | 'SKU_SEARCH'
  | 'UNIT_ASSIGNED'
  | 'PRODUCTION_REQUEST'
  | 'PATTERN_EVENT'
  | 'LOCATION_CHANGE'
  | 'BIN_UPDATE'
  | 'STATUS_CHANGE'
  | 'QR_EVENT'
  | 'WASH_REQUEST'
  | 'STEP_COMPLETION'

interface BaseEventLog {
  event_id: string
  event_type: EventType
  timestamp: Date
  actor_id: string
  previous_state?: any
  new_state?: any
  metadata?: Record<string, any>
}

// Order Events
interface OrderEventLog extends BaseEventLog {
  order_id: string
  target_sku?: SKU
  customer_id?: string
  source?: string
}

// SKU Search Events
interface SKUSearchLog extends BaseEventLog {
  target_sku: SKU
  search_type: 'exact' | 'universal'
  results_found: boolean
  matching_skus?: SKU[]
}

// Assignment Events
interface AssignmentLog extends BaseEventLog {
  unit_id: string
  order_id: string
  assignment_type: 'direct' | 'universal'
  previous_status: string
  new_status: string
}

// Production Events
interface ProductionLog extends BaseEventLog {
  universal_sku: SKU
  quantity: number
  waitlist_position?: number
  source_order_ids: string[]
}

// Location Events
interface LocationLog extends BaseEventLog {
  unit_id: string
  source_location: string
  target_location: string
  operator_id: string
  completion_time: Date
}

// Status Events
interface StatusLog extends BaseEventLog {
  entity_id: string
  entity_type: 'order' | 'unit' | 'request'
  previous_status: string
  new_status: string
  trigger_event?: string
  related_ids?: string[]
}

export class EventLogger {
  private async logEvent(event: BaseEventLog) {
    try {
      // Implementation would depend on your data layer
      // Could be database insert, external logging service, etc.
      console.log('Logging event:', event)
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  // Order Events
  async logOrderCreation(order: Order, targetSKU: SKU) {
    await this.logEvent({
      event_id: crypto.randomUUID(),
      event_type: 'ORDER_CREATED',
      timestamp: new Date(),
      actor_id: 'system', // or current user id
      order_id: order.id,
      target_sku: targetSKU,
      customer_id: order.customer_id,
      metadata: {
        order_status: order.status
      }
    })
  }

  // SKU Search Events
  async logSKUSearch(params: {
    targetSKU: SKU,
    searchType: 'exact' | 'universal',
    resultsFound: boolean,
    matchingSKUs?: SKU[]
  }) {
    await this.logEvent({
      event_id: crypto.randomUUID(),
      event_type: 'SKU_SEARCH',
      timestamp: new Date(),
      actor_id: 'system',
      ...params
    })
  }

  // Assignment Events
  async logAssignment(params: {
    unitId: string,
    orderId: string,
    assignmentType: 'direct' | 'universal',
    previousStatus: string,
    newStatus: string
  }) {
    await this.logEvent({
      event_id: crypto.randomUUID(),
      event_type: 'UNIT_ASSIGNED',
      timestamp: new Date(),
      actor_id: 'system',
      ...params
    })
  }

  // Status Change Events
  async logStatusChange(params: {
    entityId: string,
    entityType: 'order' | 'unit' | 'request',
    previousStatus: string,
    newStatus: string,
    triggerEvent?: string,
    relatedIds?: string[]
  }) {
    await this.logEvent({
      event_id: crypto.randomUUID(),
      event_type: 'STATUS_CHANGE',
      timestamp: new Date(),
      actor_id: 'system',
      ...params
    })
  }

  // Location Events
  async logLocationChange(params: {
    unitId: string,
    sourceLocation: string,
    targetLocation: string,
    operatorId: string
  }) {
    await this.logEvent({
      event_id: crypto.randomUUID(),
      event_type: 'LOCATION_CHANGE',
      timestamp: new Date(),
      actor_id: params.operatorId,
      ...params,
      completion_time: new Date()
    })
  }

  // QR Events
  async logQREvent(params: {
    unitId: string,
    eventType: 'generation' | 'activation',
    location?: string,
    operatorId?: string,
    resultingAction?: 'wash' | 'move'
  }) {
    await this.logEvent({
      event_id: crypto.randomUUID(),
      event_type: 'QR_EVENT',
      timestamp: new Date(),
      actor_id: params.operatorId || 'system',
      ...params
    })
  }

  // Step Completion Events
  async logStepCompletion(params: {
    requestId: string,
    stepNumber: number,
    operatorId: string,
    locationUpdates?: Record<string, string>,
    statusChanges?: Record<string, string>
  }) {
    await this.logEvent({
      event_id: crypto.randomUUID(),
      event_type: 'STEP_COMPLETION',
      timestamp: new Date(),
      actor_id: params.operatorId,
      ...params
    })
  }
}

export const eventLogger = new EventLogger() 