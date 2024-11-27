import { nanoid } from 'nanoid'
import type { InventoryItem, Request, RequestType, RequestStep } from '../schema'
import { createMockRequest } from '../mock-api/requests'
import { updateMockInventoryItem } from '../mock-api/inventory'
import { createMockInventoryEvent } from '../mock-api/events'

interface StageTransition {
  currentStatus: string
  nextStatus: string
  nextRequestType: RequestType | null
  nextStageTitle: string
  conditions?: {
    requireLocation?: string[]
    blockLocation?: string[]
  }
}

const PRODUCTION_FLOW: Record<RequestType, StageTransition> = {
  'WASH_REQUEST': {
    currentStatus: 'WASH',
    nextStatus: 'QC',
    nextRequestType: null,
    nextStageTitle: 'At Laundry Facility',
    conditions: {
      blockLocation: ['LAUNDRY']
    }
  },
  'QC_REQUEST': {
    currentStatus: 'QC',
    nextStatus: 'FINISHING',
    nextRequestType: 'FINISHING_REQUEST',
    nextStageTitle: 'Finishing'
  },
  'FINISHING_REQUEST': {
    currentStatus: 'FINISHING',
    nextStatus: 'COMPLETE',
    nextRequestType: null,
    nextStageTitle: 'Complete'
  }
}

interface ProductionRequestOptions {
  sku: string
  quantity: number
  priority: Priority
  order_id?: string
  customer_id?: string
  due_date?: string
  notes?: string
}

export async function handleLocationChange(
  item: InventoryItem, 
  newLocation: string
): Promise<InventoryItem> {
  if (newLocation === 'LAUNDRY' && item.status1 === 'WASH') {
    const event = await createMockInventoryEvent({
      inventory_item_id: item.id,
      event_name: 'AT_WASH',
      event_description: 'Item sent to laundry facility',
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      metadata: {
        previous_location: item.location,
        new_location: newLocation
      }
    })

    return await updateMockInventoryItem({
      ...item,
      location: newLocation,
      events: [...(item.events || []), event],
      active_stage: 'AT_WASH'
    })
  }

  if (item.location === 'LAUNDRY' && newLocation !== 'LAUNDRY' && item.status1 === 'WASH') {
    const returnEvent = await createMockInventoryEvent({
      inventory_item_id: item.id,
      event_name: 'RETURNED_FROM_WASH',
      event_description: 'Item returned from laundry facility',
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      metadata: {
        previous_location: item.location,
        new_location: newLocation
      }
    })

    const qcRequest = await createMockRequest({
      request_type: 'QC_REQUEST',
      status: 'PENDING',
      priority: 'MEDIUM',
      inventory_item: item,
      steps: getStepsForRequestType('QC_REQUEST', item),
      metadata: {
        returned_from_wash: true,
        previous_location: 'LAUNDRY'
      }
    })

    return await updateMockInventoryItem({
      ...item,
      location: newLocation,
      events: [...(item.events || []), returnEvent],
      requests: [...(item.requests || []), qcRequest],
      active_stage: 'QC'
    })
  }

  return await updateMockInventoryItem({
    ...item,
    location: newLocation
  })
}

export async function handleRequestCompletion(
  request: Request, 
  item: InventoryItem
): Promise<{ updatedItem: InventoryItem, nextRequest: Request | null }> {
  const flow = PRODUCTION_FLOW[request.request_type]
  if (!flow) throw new Error(`Unknown request type: ${request.request_type}`)

  if (flow.conditions) {
    if (flow.conditions.blockLocation?.includes(item.location)) {
      throw new Error(`Cannot complete request while item is at ${item.location}`)
    }
    if (flow.conditions.requireLocation && !flow.conditions.requireLocation.includes(item.location)) {
      throw new Error(`Item must be at one of: ${flow.conditions.requireLocation.join(', ')}`)
    }
  }

  const completionTime = new Date().toISOString()

  // Create completion event
  const event = await createMockInventoryEvent({
    inventory_item_id: item.id,
    event_name: `${request.request_type}_COMPLETED`,
    event_description: `${request.request_type} completed. Moving to ${flow.nextStageTitle}.`,
    status: 'COMPLETED',
    timestamp: completionTime,
    metadata: {
      request_id: request.id,
      previous_status: item.status1,
      new_status: flow.currentStatus,
      next_stage: flow.nextStatus
    }
  })

  // Update item status and timeline
  const updatedItem = await updateMockInventoryItem({
    ...item,
    status1: flow.currentStatus,
    status2: 'ASSIGNED',
    active_stage: flow.nextStatus,
    events: [...(item.events || []), event],
    timeline: item.timeline?.map(stage => {
      if (stage.stage === request.request_type.replace('_REQUEST', '')) {
        return {
          ...stage,
          status: 'COMPLETED',
          completedAt: completionTime,
          requestId: request.id,
          metadata: {
            request_type: request.request_type,
            completed_by: 'system'
          }
        }
      }
      if (stage.stage === flow.nextStatus) {
        return {
          ...stage,
          status: 'IN_PROGRESS'
        }
      }
      return stage
    })
  })

  // Create next request if not complete
  let nextRequest = null
  if (flow.nextRequestType) {
    nextRequest = await createMockRequest({
      id: `${flow.nextRequestType.split('_')[0]}-${nanoid(6)}`,
      request_type: flow.nextRequestType,
      status: 'PENDING',
      priority: request.priority,
      inventory_item: updatedItem,
      order: request.order,
      customer: request.customer,
      steps: getStepsForRequestType(flow.nextRequestType, updatedItem),
      metadata: {
        previous_request: request.id
      }
    })

    // Update item with new request
    await updateMockInventoryItem({
      ...updatedItem,
      requests: [...(updatedItem.requests || []), nextRequest],
      timeline: updatedItem.timeline?.map(stage => 
        stage.stage === flow.nextStatus
          ? { ...stage, requestId: nextRequest.id }
          : stage
      )
    })
  }

  return { updatedItem, nextRequest }
}

export function getStepsForRequestType(type: RequestType, item: InventoryItem): RequestStep[] {
  switch (type) {
    case 'WASH_REQUEST':
      return [
        {
          number: 1,
          title: 'Scan Item',
          description: `Find and scan item ${item.sku} to begin`,
          status: 'PENDING',
          metadata: {
            required_action: 'SCAN',
            scan_type: 'ITEM_QR',
            sku: item.sku,
            location: item.location
          }
        },
        {
          number: 2,
          title: 'Scan Wash Bin',
          description: 'Scan the wash bin QR code to log new location',
          status: 'PENDING',
          metadata: {
            required_action: 'SCAN',
            scan_type: 'BIN_QR',
            required_bin_type: 'WBIN',
            wash_type: item.sku.split('-')[4]
          }
        },
        {
          number: 3,
          title: 'Confirm Actions',
          description: 'Verify item has been moved to correct wash bin',
          status: 'PENDING',
          metadata: {
            required_action: 'CONFIRM',
            confirmation_type: 'MOVE_COMPLETE',
            sku: item.sku
          }
        }
      ]
    case 'QC_REQUEST':
      return [
        {
          number: 1,
          title: 'Scan Item',
          description: `Scan ${item.sku} to begin QC`,
          status: 'PENDING'
        },
        {
          number: 2,
          title: 'Quality Check',
          description: 'Perform quality inspection',
          status: 'PENDING'
        },
        {
          number: 3,
          title: 'Record Measurements',
          description: 'Verify and record post-wash measurements',
          status: 'PENDING'
        }
      ]
    case 'FINISHING_REQUEST':
      return [
        {
          number: 1,
          title: 'Scan Item',
          description: `Scan ${item.sku} to begin finishing`,
          status: 'PENDING'
        },
        {
          number: 2,
          title: 'Apply Finishing',
          description: 'Complete finishing process',
          status: 'PENDING'
        },
        {
          number: 3,
          title: 'Final Check',
          description: 'Verify finishing quality',
          status: 'PENDING'
        }
      ]
    case 'MOVE_REQUEST':
      return [
        {
          number: 1,
          title: 'Scan Item',
          description: `Find and scan item ${item.sku}`,
          status: 'PENDING',
          metadata: {
            required_action: 'SCAN',
            scan_type: 'ITEM_QR',
            sku: item.sku,
            location: item.location
          }
        },
        {
          number: 2,
          title: 'Scan New Location',
          description: 'Scan the destination location QR code',
          status: 'PENDING',
          metadata: {
            required_action: 'SCAN',
            scan_type: 'BIN_QR',
            required_bin_type: 'BIN'
          }
        },
        {
          number: 3,
          title: 'Confirm Move',
          description: 'Verify item has been moved to new location',
          status: 'PENDING',
          metadata: {
            required_action: 'CONFIRM',
            confirmation_type: 'MOVE_COMPLETE',
            sku: item.sku
          }
        }
      ]
    default:
      return []
  }
}

export async function createProductionRequest(options: ProductionRequestOptions): Promise<Request> {
  // Create the production request
  const request = await createMockRequest({
    request_type: 'PATTERN_REQUEST', // First stage of production
    status: 'PENDING',
    priority: options.priority,
    metadata: {
      sku: options.sku,
      quantity: options.quantity,
      order_id: options.order_id,
      customer_id: options.customer_id,
      due_date: options.due_date,
      notes: options.notes
    },
    steps: [
      {
        number: 1,
        title: 'Create Pattern',
        description: `Create pattern for ${options.sku}`,
        status: 'PENDING',
        metadata: {
          sku: options.sku,
          quantity: options.quantity
        }
      },
      {
        number: 2,
        title: 'Review Pattern',
        description: 'Review and approve pattern',
        status: 'PENDING'
      },
      {
        number: 3,
        title: 'Submit for Cutting',
        description: 'Submit approved pattern for cutting',
        status: 'PENDING'
      }
    ]
  })

  // Create notification for pattern team
  addNotification({
    title: 'New Pattern Request',
    description: `Pattern needed for ${options.quantity}x ${options.sku}`,
    type: 'REQUEST',
    team: 'PATTERN'
  })

  return request
}

export async function commitOrderItems(orderId: string): Promise<void> {
  const order = await getMockOrder(orderId)
  if (!order) throw new Error('Order not found')

  for (const item of order.items) {
    // Check if item needs production
    const inventoryItem = await findAvailableInventoryItem(item.sku)
    
    if (!inventoryItem) {
      // Create production request if no inventory available
      await createProductionRequest({
        sku: item.sku,
        quantity: item.quantity,
        priority: 'MEDIUM',
        order_id: order.id,
        customer_id: order.customer_id,
        notes: `Order #${order.number}`
      })
    }
  }
}

export async function handleQCFailure(
  request: Request, 
  item: InventoryItem, 
  reason: string
): Promise<void> {
  // Create remake request
  await createProductionRequest({
    sku: item.sku,
    quantity: 1,
    priority: 'HIGH',
    order_id: item.order_id,
    notes: `Remake needed - QC Failed: ${reason}`
  })

  // Update item status
  await updateMockInventoryItem({
    ...item,
    status1: 'REMAKE',
    status2: 'PENDING_PRODUCTION'
  })
} 