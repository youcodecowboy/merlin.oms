import { validateAllExports, ExportValidationError } from '../lib/utils/export-validation'

describe('Export Validation', () => {
  it('should validate all required exports', () => {
    expect(() => validateAllExports()).not.toThrow()
  })

  it('should detect missing required exports', () => {
    // Mock a module with missing exports
    jest.mock('../mock-api/orders', () => ({
      // Missing createMockOrder
      updateOrderStatus: () => {}
    }))

    expect(() => validateAllExports()).toThrow(ExportValidationError)
  })

  it('should warn about missing optional exports', () => {
    const consoleSpy = jest.spyOn(console, 'warn')
    validateAllExports()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should validate inventory exports', () => {
    const inventoryModule = require('../mock-api/inventory')
    expect(inventoryModule.commitInventoryToOrder).toBeDefined()
    expect(typeof inventoryModule.commitInventoryToOrder).toBe('function')
  })

  it('should validate request exports', () => {
    const requestsModule = require('../mock-api/requests')
    expect(requestsModule.getMockRequests).toBeDefined()
    expect(typeof requestsModule.getMockRequests).toBe('function')
    expect(requestsModule.createMockRequest).toBeDefined()
    expect(typeof requestsModule.createMockRequest).toBe('function')
  })

  it('should validate production exports', () => {
    const productionModule = require('../mock-api/production')
    expect(productionModule.createMockRequest).toBeDefined()
    expect(typeof productionModule.createMockRequest).toBe('function')
    expect(productionModule.createProductionRequest).toBeDefined()
    expect(typeof productionModule.createProductionRequest).toBe('function')
  })

  it('should validate order exports', () => {
    const ordersModule = require('../mock-api/orders')
    expect(ordersModule.getMockOrder).toBeDefined()
    expect(typeof ordersModule.getMockOrder).toBe('function')
    expect(ordersModule.createMockOrder).toBeDefined()
    expect(typeof ordersModule.createMockOrder).toBe('function')
  })

  it('should validate pattern request exports', () => {
    const requestsModule = require('../mock-api/requests')
    expect(requestsModule.createMockPatternRequest).toBeDefined()
    expect(typeof requestsModule.createMockPatternRequest).toBe('function')
  })
}) 