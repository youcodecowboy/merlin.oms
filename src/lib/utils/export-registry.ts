export interface ModuleExports {
  path: string
  required: string[]
  optional?: string[]
  types?: string[]
}

export const REQUIRED_EXPORTS: ModuleExports[] = [
  {
    path: 'mock-api/orders',
    required: [
      'createMockOrder',
      'getMockOrder',
      'updateOrderStatus',
      'getOrderById',
      'processOrder',
      'handleStockAssignment',
      'handleProductionWaitlist'
    ],
    types: [
      'CreateOrderParams',
      'OrderStatus',
      'OrderMetadata'
    ]
  },
  {
    path: 'mock-api/inventory',
    required: [
      'createMockInventoryItem',
      'updateMockInventoryItem',
      'getMockInventoryItems',
      'findMatchingInventory',
      'commitInventoryToOrder'
    ],
    types: [
      'CreateInventoryParams',
      'UpdateInventoryParams'
    ]
  },
  {
    path: 'mock-api/requests',
    required: [
      'createMockRequest',
      'createMockPatternRequest',
      'getMockRequests',
      'createRequest',
      'updateRequestSteps',
      'getRequestById',
      'handleRequestCompletion'
    ],
    types: [
      'RequestType',
      'RequestStatus',
      'StepUpdateParams',
      'RequestFilters',
      'PatternRequestMetadata'
    ]
  },
  {
    path: 'mock-api/production',
    required: [
      'createMockRequest',
      'createProductionRequest',
      'updateProductionStatus',
      'getProductionQueue',
      'handleProductionCompletion'
    ],
    types: [
      'ProductionRequest',
      'ProductionStatus',
      'ProductionMetadata'
    ]
  },
  {
    path: 'mock-api/requests',
    required: [
      'createMockRequest',
      'createRequest',
      'updateRequestSteps',
      'getRequestById',
      'handleRequestCompletion'
    ],
    types: [
      'RequestType',
      'RequestStatus',
      'StepUpdateParams'
    ]
  },
  {
    path: 'mock-db/store',
    required: [
      'mockDB',
      'createEvent',
      'persistState',
      'loadPersistedState',
      'updateRequestSteps',
      'createInventoryItem',
      'createRandomInventoryItem',
      'createRandomOrder',
      'createTestQCRequest',
      'createTestWashRequest',
      'resetMockData',
      'assignItemToBin'
    ],
    types: [
      'Event',
      'RequestStep',
      'StepUpdate',
      'CreateInventoryParams',
      'BinAssignmentResult'
    ]
  }
] 