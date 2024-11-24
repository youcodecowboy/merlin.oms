import { 
  findSKUMatch, 
  createUniversalSKU, 
  isWashCompatible 
} from '../matcher'
import { 
  InvalidSKUError, 
  IncompatibleWashError, 
  UniversalSKUError 
} from '../types'
import { useProductionStore } from '@/lib/stores/productionStore'
import { useProductionLogger } from '@/lib/stores/productionLogger'

describe('Universal SKU System', () => {
  beforeEach(() => {
    useProductionStore.setState({ requests: [] })
    useProductionLogger.setState({ logs: [] })
  })

  describe('findSKUMatch', () => {
    it('creates production request with universal SKU when no match found', () => {
      const result = findSKUMatch(
        'ST-32-S-30-STA',
        'order-1',
        1001,
        'John Doe'
      )

      expect(result.matched).toBe(false)
      expect(result.type).toBe('NONE')
      expect(result.productionRequired).toBe(true)
      expect(result.universalSku).toBe('ST-32-S-36-RAW')

      // Verify production request was created
      const requests = useProductionStore.getState().requests
      expect(requests.length).toBe(1)
      expect(requests[0].sku).toBe('ST-32-S-30-STA')
      expect(requests[0].universalSku).toBe('ST-32-S-36-RAW')
      expect(requests[0].orderId).toBe('order-1')
    })

    it('logs search and request creation', () => {
      findSKUMatch('ST-32-S-30-STA', 'order-1', 1001)

      const logs = useProductionLogger.getState().logs
      expect(logs.length).toBe(2) // Search log + request creation log
      expect(logs[0].type).toBe('SKU_SEARCH')
      expect(logs[1].type).toBe('PRODUCTION_REQUEST')
    })
  })

  describe('createUniversalSKU', () => {
    it('creates universal SKU with maximum flexibility', () => {
      const components = {
        style: 'ST',
        waist: 32,
        shape: 'S',
        inseam: 30,
        wash: 'STA'
      }

      const universalSku = createUniversalSKU(components)
      expect(universalSku).toBe('ST-32-S-36-RAW')
    })

    it('maintains fixed attributes', () => {
      const components = {
        style: 'SL',
        waist: 28,
        shape: 'R',
        inseam: 32,
        wash: 'BLK'
      }

      const universalSku = createUniversalSKU(components)
      expect(universalSku).toMatch(/^SL-28-R-/)
    })

    it('handles brown wash variants correctly', () => {
      const components = {
        style: 'ST',
        waist: 32,
        shape: 'S',
        inseam: 30,
        wash: 'ONX'
      }

      const universalSku = createUniversalSKU(components)
      expect(universalSku).toMatch(/-BRW$/)
    })
  })

  describe('isWashCompatible', () => {
    it('allows same wash', () => {
      expect(isWashCompatible('RAW', 'RAW')).toBe(true)
      expect(isWashCompatible('STA', 'STA')).toBe(true)
    })

    it('allows RAW to be processed into other washes', () => {
      expect(isWashCompatible('RAW', 'STA')).toBe(true)
      expect(isWashCompatible('RAW', 'IND')).toBe(true)
      expect(isWashCompatible('RAW', 'BLK')).toBe(true)
    })

    it('allows BRW to be processed into specific washes', () => {
      expect(isWashCompatible('BRW', 'ONX')).toBe(true)
      expect(isWashCompatible('BRW', 'JAG')).toBe(true)
    })

    it('prevents incompatible wash conversions', () => {
      expect(isWashCompatible('STA', 'RAW')).toBe(false)
      expect(isWashCompatible('BLK', 'IND')).toBe(false)
      expect(isWashCompatible('ONX', 'BRW')).toBe(false)
    })

    it('throws error for invalid wash', () => {
      expect(() => isWashCompatible('INVALID', 'RAW'))
        .toThrow(IncompatibleWashError)
    })
  })
})