import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import { parseSKU } from '@/lib/sku'
import { getUniversalSKU } from '@/lib/sku/universal'
import { useProductionLogger } from './productionLogger'

export interface Commitment {
  id: string
  sku: string
  universalSku: string
  orderId: string
  orderNumber: number
  quantity: number
  createdAt: string
  updatedAt: string
}

interface CommitmentsStore {
  commitments: Commitment[]
  addCommitment: (data: {
    sku: string
    orderId: string
    orderNumber: number
    quantity: number
  }) => Commitment
  removeCommitment: (id: string) => void
  getCommitmentsByOrder: (orderId: string) => Commitment[]
  getCommitmentsBySku: (sku: string) => Commitment[]
  getTotalCommitments: (sku: string) => number
}

export const useCommitmentsStore = create<CommitmentsStore>()(
  immer((set, get) => ({
    commitments: [],

    addCommitment: (data) => {
      const components = parseSKU(data.sku)
      if (!components) {
        throw new Error(`Invalid SKU format: ${data.sku}`)
      }

      const universalComponents = getUniversalSKU(components)
      const universalSku = `${universalComponents.style}-${universalComponents.waist}-${universalComponents.shape}-${universalComponents.inseam}-${universalComponents.wash}`

      const commitment: Commitment = {
        id: uuidv4(),
        sku: data.sku,
        universalSku,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        quantity: data.quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      set((state) => {
        state.commitments.push(commitment)
      })

      // Log the commitment
      useProductionLogger.getState().addLog({
        type: 'ORDER_LINKED',
        details: {
          sku: data.sku,
          universalSku,
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          quantity: data.quantity,
          message: `Committed ${data.quantity} units of ${data.sku} (Universal SKU: ${universalSku}) to Order #${data.orderNumber}`
        }
      })

      return commitment
    },

    removeCommitment: (id) => {
      set((state) => {
        state.commitments = state.commitments.filter(c => c.id !== id)
      })
    },

    getCommitmentsByOrder: (orderId) => {
      return get().commitments
        .filter(c => c.orderId === orderId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    },

    getCommitmentsBySku: (sku) => {
      return get().commitments
        .filter(c => c.sku === sku || c.universalSku === sku)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    },

    getTotalCommitments: (sku) => {
      return get().commitments
        .filter(c => c.sku === sku || c.universalSku === sku)
        .reduce((total, commitment) => total + commitment.quantity, 0)
    }
  }))
)