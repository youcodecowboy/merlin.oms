import type { InventoryItem, Request, RequestType } from '../schema'

interface StageTransition {
  nextStatus: InventoryStatus1
  nextStage: string
  nextRequestType: RequestType | null
}

export function getNextStage(currentRequest: Request): StageTransition {
  switch (currentRequest.request_type) {
    case 'WASH_REQUEST':
      return {
        nextStatus: 'WASH',
        nextStage: 'QC',
        nextRequestType: 'QC_REQUEST'
      }
    case 'QC_REQUEST':
      return {
        nextStatus: 'QC',
        nextStage: 'FINISHING',
        nextRequestType: 'FINISHING_REQUEST'
      }
    case 'FINISHING_REQUEST':
      return {
        nextStatus: 'COMPLETE',
        nextStage: 'COMPLETE',
        nextRequestType: null
      }
    default:
      throw new Error(`Unknown request type: ${currentRequest.request_type}`)
  }
}

export function createNextRequest(
  currentRequest: Request, 
  requestType: RequestType,
  inventoryItem: InventoryItem
): Partial<Request> {
  // Base request structure
  const baseRequest = {
    inventory_item: inventoryItem,
    order: currentRequest.order,
    customer: currentRequest.customer,
    priority: currentRequest.priority
  }

  // Request-specific steps and metadata
  switch (requestType) {
    case 'QC_REQUEST':
      return {
        ...baseRequest,
        steps: [
          {
            number: 1,
            title: 'Scan Item',
            description: 'Scan item QR code to begin QC',
            status: 'PENDING'
          },
          {
            number: 2,
            title: 'Quality Check',
            description: 'Perform quality inspection',
            status: 'PENDING'
          }
        ],
        metadata: {
          previous_request: currentRequest.id
        }
      }
    case 'FINISHING_REQUEST':
      return {
        ...baseRequest,
        steps: [
          {
            number: 1,
            title: 'Scan Item',
            description: 'Scan item to begin finishing',
            status: 'PENDING'
          },
          {
            number: 2,
            title: 'Apply Finishing',
            description: 'Complete finishing process',
            status: 'PENDING'
          }
        ],
        metadata: {
          previous_request: currentRequest.id
        }
      }
    default:
      throw new Error(`Unknown request type: ${requestType}`)
  }
} 