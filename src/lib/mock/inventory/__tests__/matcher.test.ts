import { findAndCommitInventory } from '../matcher'
import { mockStore } from '../store'
import { parseSKU } from '@/lib/sku'

describe('Inventory Matcher', () => {
  beforeEach(() => {
    // Reset mock store before each test
    mockStore.inventoryItems = [
      {
        id: '1',
        sku: 'ST-26-X-30-RAW',
        status1: 'STOCK',
        status2: 'UNCOMMITTED',
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        sku: 'ST-26-X-32-RAW',
        status1: 'STOCK',
        status2: 'UNCOMMITTED',
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        sku: 'ST-26-X-30-STA',
        status1: 'STOCK',
        status2: 'COMMITTED',
        updated_at: new Date().toISOString()
      }
    ]
    mockStore.commitments = []
    mockStore.pendingProduction = []
    mockStore.notifications = []
  })

  describe('findAndCommitInventory', () => {
    const orderId = 'test-order-1'

    it('finds and commits exact match', async () => {
      const result = await findAndCommitInventory('ST-26-X-30-RAW', orderId)
      
      expect(result.type).toBe('EXACT')
      expect(result.item?.sku).toBe('ST-26-X-30-RAW')
      expect(result.item?.status2).toBe('COMMITTED')
      expect(result.item?.orderId).toBe(orderId)
    })

    it('finds and commits universal match with higher inseam', async () => {
      const result = await findAndCommitInventory('ST-26-X-30-STA', orderId)
      
      expect(result.type).toBe('UNIVERSAL')
      expect(result.item?.sku).toBe('ST-26-X-32-RAW')
      expect(result.item?.status2).toBe('COMMITTED')
    })

    it('creates production request when no match found', async () => {
      const result = await findAndCommitInventory('ST-28-X-30-RAW', orderId)
      
      expect(result.type).toBe('PRODUCTION')
      expect(result.productionRequest).toBeDefined()
      expect(result.productionRequest?.sku).toBe('ST-28-X-30-RAW')
      expect(result.productionRequest?.orderId).toBe(orderId)
    })

    it('updates commitments when match found', async () => {
      await findAndCommitInventory('ST-26-X-30-RAW', orderId)
      
      const commitment = mockStore.commitments.find(c => c.sku === 'ST-26-X-30-RAW')
      expect(commitment?.committedQuantity).toBe(1)
      expect(commitment?.uncommittedQuantity).toBe(0)
    })

    it('creates notification for production request', async () => {
      await findAndCommitInventory('ST-28-X-30-RAW', orderId)
      
      expect(mockStore.notifications.length).toBe(1)
      expect(mockStore.notifications[0].type).toBe('PRODUCTION_REQUEST')
    })

    it('handles wash compatibility correctly', async () => {
      // RAW can become STA
      const result = await findAndCommitInventory('ST-26-X-30-STA', orderId)
      expect(result.type).toBe('UNIVERSAL')
      expect(result.item?.sku).toContain('RAW')

      // STA cannot become RAW
      mockStore.inventoryItems = [{
        id: '4',
        sku: 'ST-26-X-30-STA',
        status1: 'STOCK',
        status2: 'UNCOMMITTED',
        updated_at: new Date().toISOString()
      }]
      
      const result2 = await findAndCommitInventory('ST-26-X-30-RAW', orderId)
      expect(result2.type).toBe('PRODUCTION')
    })
  })
})</content>