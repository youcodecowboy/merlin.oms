import { findSKUMatch, isWashCompatible } from '../matcher'
import { mockStore } from '../../mock/inventory'
import { IncompatibleWashError } from '../types'

describe('SKU Matcher', () => {
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
  })

  describe('findSKUMatch', () => {
    it('finds exact match', () => {
      const result = findSKUMatch('ST-26-X-30-RAW')
      expect(result.matched).toBe(true)
      expect(result.type).toBe('EXACT')
      expect(result.item?.sku).toBe('ST-26-X-30-RAW')
    })

    it('finds universal match with higher inseam', () => {
      const result = findSKUMatch('ST-26-X-30-STA')
      expect(result.matched).toBe(true)
      expect(result.type).toBe('UNIVERSAL')
      expect(result.item?.sku).toBe('ST-26-X-32-RAW')
    })

    it('returns no match when none available', () => {
      const result = findSKUMatch('ST-28-X-30-RAW')
      expect(result.matched).toBe(false)
      expect(result.type).toBe('NONE')
      expect(result.productionRequired).toBe(true)
    })

    it('ignores committed items', () => {
      const result = findSKUMatch('ST-26-X-30-STA')
      expect(result.item?.sku).not.toBe('ST-26-X-30-STA')
    })
  })

  describe('isWashCompatible', () => {
    it('returns true for same wash', () => {
      expect(isWashCompatible('RAW', 'RAW')).toBe(true)
      expect(isWashCompatible('STA', 'STA')).toBe(true)
    })

    it('returns true for compatible washes', () => {
      expect(isWashCompatible('RAW', 'STA')).toBe(true)
      expect(isWashCompatible('RAW', 'IND')).toBe(true)
    })

    it('returns false for incompatible washes', () => {
      expect(isWashCompatible('STA', 'RAW')).toBe(false)
      expect(isWashCompatible('IND', 'STA')).toBe(false)
    })

    it('throws error for invalid wash', () => {
      expect(() => isWashCompatible('INVALID', 'RAW'))
        .toThrow(IncompatibleWashError)
    })
  })
})</content>