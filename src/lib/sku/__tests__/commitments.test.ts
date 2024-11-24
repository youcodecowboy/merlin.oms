import { useCommitmentsStore } from '@/lib/stores/commitmentsStore'
import { useProductionLogger } from '@/lib/stores/productionLogger'

describe('Commitments System', () => {
  beforeEach(() => {
    useCommitmentsStore.setState({ commitments: [] })
    useProductionLogger.setState({ logs: [] })
  })

  describe('addCommitment', () => {
    it('creates commitment with universal SKU', () => {
      const store = useCommitmentsStore.getState()
      const commitment = store.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      expect(commitment.universalSku).toBe('ST-32-S-36-RAW')
      expect(commitment.sku).toBe('ST-32-S-30-STA')
    })

    it('logs commitment creation', () => {
      const store = useCommitmentsStore.getState()
      store.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      const logs = useProductionLogger.getState().logs
      expect(logs.length).toBe(1)
      expect(logs[0].type).toBe('ORDER_LINKED')
      expect(logs[0].details.sku).toBe('ST-32-S-30-STA')
      expect(logs[0].details.universalSku).toBe('ST-32-S-36-RAW')
    })
  })

  describe('getCommitmentsByOrder', () => {
    it('returns commitments in chronological order', () => {
      const store = useCommitmentsStore.getState()
      
      // Add commitments in reverse order
      store.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      // Wait 1ms to ensure different timestamps
      jest.advanceTimersByTime(1)

      store.addCommitment({
        sku: 'ST-32-S-32-RAW',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      const commitments = store.getCommitmentsByOrder('order-1')
      expect(commitments[0].sku).toBe('ST-32-S-30-STA')
      expect(commitments[1].sku).toBe('ST-32-S-32-RAW')
    })
  })

  describe('getTotalCommitments', () => {
    it('includes both exact and universal SKU matches', () => {
      const store = useCommitmentsStore.getState()
      
      store.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 2
      })

      store.addCommitment({
        sku: 'ST-32-S-32-RAW',
        orderId: 'order-2',
        orderNumber: 1002,
        quantity: 3
      })

      const total = store.getTotalCommitments('ST-32-S-36-RAW')
      expect(total).toBe(5) // Both commitments use the same universal SKU
    })
  })
})