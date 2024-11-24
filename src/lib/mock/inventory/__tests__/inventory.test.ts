import { 
  mockStore, 
  getCommitments,
  updateCommitments,
  assignInventoryToOrder,
  placeOrder,
  NoInventoryAvailableError,
  OrderNotFoundError,
  InvalidQuantityError
} from '../'

describe('Inventory Management System', () => {
  beforeEach(() => {
    // Reset mock store before each test
    mockStore.inventoryItems = [
      {
        id: '1',
        sku: 'TEST-SKU-1',
        status1: 'STOCK',
        status2: 'UNCOMMITTED',
        updated_at: new Date().toISOString()
      }
    ]
    mockStore.commitments = [
      {
        sku: 'TEST-SKU-1',
        committedQuantity: 0,
        uncommittedQuantity: 1,
        updated_at: new Date().toISOString()
      }
    ]
    mockStore.orders = []
    mockStore.pendingProduction = []
    mockStore.notifications = []
  })

  describe('getCommitments', () => {
    it('returns default commitment for new SKU', () => {
      const result = getCommitments('NEW-SKU')
      expect(result.committedQuantity).toBe(0)
      expect(result.uncommittedQuantity).toBe(0)
      expect(result.sku).toBe('NEW-SKU')
    })

    it('returns existing commitment', () => {
      const result = getCommitments('TEST-SKU-1')
      expect(result.committedQuantity).toBe(0)
      expect(result.uncommittedQuantity).toBe(1)
    })
  })

  describe('updateCommitments', () => {
    it('updates committed and uncommitted quantities', () => {
      const result = updateCommitments('TEST-SKU-1', 1, -1)
      expect(result.committedQuantity).toBe(1)
      expect(result.uncommittedQuantity).toBe(0)
    })

    it('throws error for negative quantities', () => {
      expect(() => updateCommitments('TEST-SKU-1', -1, 0))
        .toThrow(InvalidQuantityError)
      expect(() => updateCommitments('TEST-SKU-1', 0, -2))
        .toThrow(InvalidQuantityError)
    })
  })

  describe('assignInventoryToOrder', () => {
    beforeEach(() => {
      mockStore.orders.push({
        id: 'order-1',
        items: [{ sku: 'TEST-SKU-1', quantity: 1 }],
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })

    it('assigns inventory item to order', () => {
      const result = assignInventoryToOrder('TEST-SKU-1', 'order-1')
      expect(result.success).toBe(true)
      expect(result.type).toBe('ASSIGNED')
      expect(result.item?.status2).toBe('ASSIGNED')
      expect(result.item?.orderId).toBe('order-1')
    })

    it('creates production request when no inventory available', () => {
      mockStore.inventoryItems[0].status2 = 'ASSIGNED'
      const result = assignInventoryToOrder('TEST-SKU-1', 'order-1', 2)
      expect(result.success).toBe(true)
      expect(result.type).toBe('PRODUCTION_REQUESTED')
      expect(result.productionRequest?.sku).toBe('TEST-SKU-1')
      expect(result.productionRequest?.quantity).toBe(2)
    })

    it('throws error for non-existent order', () => {
      expect(() => assignInventoryToOrder('TEST-SKU-1', 'invalid-order'))
        .toThrow(OrderNotFoundError)
    })

    it('creates notification for production request', () => {
      mockStore.inventoryItems[0].status2 = 'ASSIGNED'
      assignInventoryToOrder('TEST-SKU-1', 'order-1')
      expect(mockStore.notifications.length).toBe(1)
      expect(mockStore.notifications[0].type).toBe('PRODUCTION_REQUEST')
    })
  })

  describe('placeOrder', () => {
    it('creates new order and updates commitments', () => {
      const order = {
        id: 'order-1',
        items: [
          { sku: 'TEST-SKU-1', quantity: 1 }
        ]
      }

      const result = placeOrder(order)
      expect(result.status).toBe('PENDING')
      
      const commitment = getCommitments('TEST-SKU-1')
      expect(commitment.committedQuantity).toBe(1)
    })
  })
})