export * from './types'
export { eventLogger } from './logger'
export * from './hooks'

// Re-export common event creators
export const createInventoryEvent = (params: Omit<InventoryEventLog, 'event_id' | 'timestamp'>) => {
  return eventLogger.logEvent(params)
}

export const createOrderEvent = (params: Omit<OrderEventLog, 'event_id' | 'timestamp'>) => {
  return eventLogger.logEvent(params)
}

export const createRequestEvent = (params: Omit<RequestEventLog, 'event_id' | 'timestamp'>) => {
  return eventLogger.logEvent(params)
}

export const createBinEvent = (params: Omit<BinEventLog, 'event_id' | 'timestamp'>) => {
  return eventLogger.logEvent(params)
} 