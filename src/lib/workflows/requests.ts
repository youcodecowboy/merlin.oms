import type { Request, Order, InventoryItem } from '@/lib/schema'
import { createMockRequest } from '@/lib/mock-api/requests'

export type RequestType = 
  | 'STOCK_PULL' // Pull from stock
  | 'WASH_TRANSFER' // Move to wash area
  | 'QC_CHECK' // Quality control
  | 'PATTERN_REQUEST' // Pattern creation
  | 'CUTTING_REQUEST' // Cutting
  | 'PRODUCTION_REQUEST' // Production status update
  | 'MOVE_REQUEST' // General movement request

interface WorkflowContext {
  order: Order
  inventoryItem?: InventoryItem
  previousRequest?: Request
}

// Define team assignments
export const TEAM_ASSIGNMENTS = {
  STOCK_PULL: 'warehouse',
  WASH_TRANSFER: 'washing',
  QC_CHECK: 'quality',
  PATTERN_REQUEST: 'pattern',
  CUTTING_REQUEST: 'cutting',
  PRODUCTION_REQUEST: 'production',
  MOVE_REQUEST: 'warehouse'
} as const

// Define the workflow triggers
export async function handleOrderCreated(context: WorkflowContext) {
  const { order } = context

  // For each order item, check inventory and create appropriate requests
  for (const item of order.items) {
    if (item.status === 'COMMITTED' && item.inventory_items?.length) {
      // Create stock pull request for each committed inventory item
      for (const inventoryId of item.inventory_items) {
        await createMockRequest({
          type: 'STOCK_PULL',
          status: 'PENDING',
          priority: order.priority || 'MEDIUM',
          assignedTeam: TEAM_ASSIGNMENTS.STOCK_PULL,
          metadata: {
            orderId: order.id,
            orderItemSku: item.sku,
            inventoryId,
            nextRequestType: 'WASH_TRANSFER'
          }
        })
      }
    }
  }
}

// Handle request completion and trigger next steps
export async function handleRequestCompleted(request: Request) {
  const { type, metadata } = request

  switch (type) {
    case 'STOCK_PULL':
      // When stock pull is complete, create wash transfer request
      if (metadata.nextRequestType === 'WASH_TRANSFER') {
        await createMockRequest({
          type: 'WASH_TRANSFER',
          status: 'PENDING',
          priority: request.priority,
          assignedTeam: TEAM_ASSIGNMENTS.WASH_TRANSFER,
          metadata: {
            orderId: metadata.orderId,
            inventoryId: metadata.inventoryId,
            previousRequestId: request.id,
            nextRequestType: 'QC_CHECK'
          }
        })
      }
      break

    case 'WASH_TRANSFER':
      // When wash transfer is complete, create QC check request
      await createMockRequest({
        type: 'QC_CHECK',
        status: 'PENDING',
        priority: request.priority,
        assignedTeam: TEAM_ASSIGNMENTS.QC_CHECK,
        metadata: {
          orderId: metadata.orderId,
          inventoryId: metadata.inventoryId,
          previousRequestId: request.id
        }
      })
      break

    // Add other request type handlers...
  }
}

// Handle request assignment
export async function assignRequestToTeamMember(request: Request, teamMemberId: string) {
  // Update request with assigned team member
  await updateMockRequest(request.id!, {
    assignedTo: teamMemberId,
    status: 'IN_PROGRESS',
    metadata: {
      ...request.metadata,
      assignedAt: new Date().toISOString()
    }
  })

  // Create notification for team member
  await createMockNotification({
    userId: teamMemberId,
    type: 'REQUEST_ASSIGNED',
    title: `New ${request.type} Request`,
    message: `You have been assigned a new ${request.type} request`,
    metadata: {
      requestId: request.id,
      requestType: request.type
    }
  })
} 