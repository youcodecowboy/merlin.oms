// Re-export all mock API functions
export {
  getMockInventoryItems,
  getMockInventoryEvents,
  addMockInventoryItems,
  updateMockInventoryItem
} from './inventory'

export {
  getMockProducts,
  getMockProductBySKU
} from './products'

export {
  getMockOrders,
  createMockOrder
} from './orders'

export {
  getMockCustomers,
  createMockCustomer
} from './customers'

export {
  getMockPendingProduction,
  getMockActiveProduction,
  createMockPendingProduction,
  acceptMockProductionRequest,
  moveToNextMockStage,
  updateMockPendingProduction
} from './production'

export {
  getMockBatches,
  getMockBatchDetails,
  updateMockBatchStatus
} from './batches'

export {
  getMockEvents,
  createMockEvent
} from './events'

export {
  getMockRequests,
  createMockRequest,
  updateMockRequest
} from './requests'

// Export types
export type { 
  Order,
  Product,
  Customer,
  InventoryItem,
  InventoryEvent,
  PendingProduction,
  ProductionRequest,
  Batch,
  Event,
  Request
} from '../schema'