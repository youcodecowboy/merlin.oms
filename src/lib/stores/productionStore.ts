import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import { parseSKU, buildSKU } from '@/lib/sku'

export interface ProductionRequest {
  id: string
  sku: string
  universalSku: string | null
  quantity: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  orderId?: string
  orderNumber?: number
  customerName?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface ProductionStore {
  requests: ProductionRequest[]
  addRequest: (request: Omit<ProductionRequest, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateRequest: (id: string, updates: Partial<ProductionRequest>) => void
  removeRequest: (id: string) => void
  getUniversalSku: (sku: string) => string
}

export const useProductionStore = create<ProductionStore>()(
  immer((set, get) => ({
    requests: [],

    addRequest: (request) => {
      set((state) => {
        const universalSku = get().getUniversalSku(request.sku)
        state.requests.push({
          ...request,
          id: uuidv4(),
          universalSku,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })
    },

    updateRequest: (id, updates) => {
      set((state) => {
        const index = state.requests.findIndex(r => r.id === id)
        if (index !== -1) {
          state.requests[index] = {
            ...state.requests[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      })
    },

    removeRequest: (id) => {
      set((state) => {
        state.requests = state.requests.filter(r => r.id !== id)
      })
    },

    getUniversalSku: (sku) => {
      const components = parseSKU(sku)
      if (!components) return sku

      // Universal SKU rules:
      // 1. Use maximum inseam (36)
      // 2. Use RAW wash for maximum flexibility
      return buildSKU({
        ...components,
        inseam: 36,
        wash: 'RAW'
      })
    }
  }))
)