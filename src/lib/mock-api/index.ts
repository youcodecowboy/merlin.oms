// Core exports
export * from './inventory'
export * from './orders'
export * from './requests'
export * from './locations'
export * from './events'
export * from './production'
export * from './customers'

// Types
export type {
  Order,
  InventoryItem,
  Request,
  Location,
  Customer,
  Event,
  Production
} from '../types'

// Export QR handling function
export { handleInventoryQRScan } from './qr-handling'

export {
  createMockInventoryItem,
  updateMockInventoryItem,
  getMockInventoryItems,
  findMatchingInventory,
  commitInventoryToOrder
} from './inventory'

export {
  createMockRequest,
  createMockPatternRequest,
  getMockRequests,
  createRequest,
  updateRequestSteps,
  getRequestById,
  handleRequestCompletion
} from './requests'

export {
  createMockRequest as createMockProductionRequest,
  createProductionRequest,
  updateProductionStatus,
  getProductionQueue,
  handleProductionCompletion
} from './production'

export {
  createMockOrder,
  getMockOrder,
  updateOrderStatus,
  getOrderById,
  processOrder,
  handleStockAssignment,
  handleProductionWaitlist
} from './orders'