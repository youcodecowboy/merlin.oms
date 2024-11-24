export interface AssignmentResult {
  success: boolean
  type: 'ASSIGNED' | 'PARTIALLY_ASSIGNED' | 'PRODUCTION_REQUESTED'
  items?: MockInventoryItem[]
  productionRequest?: PendingProductionRequest
  message: string
}

export interface MockInventoryItem {
  id: string
  sku: string
  status1: 'STOCK' | 'PRODUCTION'
  status2: 'UNCOMMITTED' | 'COMMITTED'
  orderId?: string
  updated_at: string
}

export interface PendingProductionRequest {
  id: string
  sku: string
  quantity: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  orderId?: string
  requestedDate: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  created_at: string
  updated_at: string
}

// Error types
export class InventoryError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message)
    this.name = 'InventoryError'
  }
}

export class OrderNotFoundError extends InventoryError {
  constructor(orderId: string) {
    super(
      'ORDER_NOT_FOUND',
      `Order not found with ID: ${orderId}`,
      404
    )
  }
}

export class InvalidQuantityError extends InventoryError {
  constructor(message: string) {
    super('INVALID_QUANTITY', message, 400)
  }
}

export class NoInventoryAvailableError extends InventoryError {
  constructor(sku: string) {
    super(
      'NO_INVENTORY',
      `No available inventory for SKU: ${sku}`,
      404
    )
  }
}

export class IncompatibleWashError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IncompatibleWashError';
    }
}
