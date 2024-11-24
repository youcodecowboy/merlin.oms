import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'

export interface ProductionLogEntry {
  id: string
  type: 'REQUEST_CREATED' | 'STATUS_CHANGED' | 'ORDER_LINKED'
  timestamp: string
  details: {
    sku: string
    universalSku?: string
    quantity?: number
    orderId?: string
    orderNumber?: number
    customerName?: string
    status?: string
    message: string
  }
}

interface ProductionLogger {
  logs: ProductionLogEntry[]
  addLog: (entry: Omit<ProductionLogEntry, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  getLogsByOrderId: (orderId: string) => ProductionLogEntry[]
  getLogsBySku: (sku: string) => ProductionLogEntry[]
}

export const useProductionLogger = create<ProductionLogger>()(
  immer((set, get) => ({
    logs: [],

    addLog: (entry) => {
      set((state) => {
        state.logs.unshift({
          ...entry,
          id: uuidv4(),
          timestamp: new Date().toISOString()
        })
      })
    },

    clearLogs: () => {
      set((state) => {
        state.logs = []
      })
    },

    getLogsByOrderId: (orderId) => {
      return get().logs.filter(log => log.details.orderId === orderId)
    },

    getLogsBySku: (sku) => {
      return get().logs.filter(log => 
        log.details.sku === sku || log.details.universalSku === sku
      )
    }
  }))
)