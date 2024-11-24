import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import { parseSKU } from '@/lib/sku'
import { canConvertToSKU } from '@/lib/sku/universal'
import { useCommitmentsStore } from './commitmentsStore'
import { useProductionLogger } from './productionLogger'

interface Assignment {
  id: string
  inventoryItemId: string
  orderId: string
  orderNumber: number
  sku: string
  assignedAt: string
}

interface AssignmentStore {
  assignments: Assignment[]
  assignInventoryItem: (data: {
    inventoryItemId: string
    sku: string
    status1: string
    status2: string
  }) => Assignment | null
  removeAssignment: (id: string) => void
  getAssignmentsByOrder: (orderId: string) => Assignment[]
  getAssignmentsByItem: (inventoryItemId: string) => Assignment | null
}

export const useAssignmentStore = create<AssignmentStore>()(
  immer((set, get) => ({
    assignments: [],

    assignInventoryItem: (data) => {
      // Only process items that are newly marked as STOCK
      if (data.status1 !== 'STOCK' || data.status2 !== 'UNCOMMITTED') {
        return null
      }

      const itemComponents = parseSKU(data.sku)
      if (!itemComponents) return null

      // Get all commitments sorted by creation date
      const commitments = useCommitmentsStore.getState().commitments
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      // Find first matching commitment
      const matchingCommitment = commitments.find(commitment => {
        const commitmentComponents = parseSKU(commitment.sku)
        return commitmentComponents && canConvertToSKU(itemComponents, commitmentComponents)
      })

      if (!matchingCommitment) return null

      // Create assignment
      const assignment: Assignment = {
        id: uuidv4(),
        inventoryItemId: data.inventoryItemId,
        orderId: matchingCommitment.orderId,
        orderNumber: matchingCommitment.orderNumber,
        sku: data.sku,
        assignedAt: new Date().toISOString()
      }

      set((state) => {
        state.assignments.push(assignment)
      })

      // Log the assignment
      useProductionLogger.getState().addLog({
        type: 'ITEM_ASSIGNED',
        details: {
          sku: data.sku,
          inventoryItemId: data.inventoryItemId,
          orderId: matchingCommitment.orderId,
          orderNumber: matchingCommitment.orderNumber,
          message: `Inventory item ${data.inventoryItemId} (${data.sku}) assigned to Order #${matchingCommitment.orderNumber}`
        }
      })

      // Remove or update commitment
      if (matchingCommitment.quantity === 1) {
        useCommitmentsStore.getState().removeCommitment(matchingCommitment.id)
      } else {
        // Update commitment quantity
        // Note: This would need to be implemented in the commitments store
      }

      return assignment
    },

    removeAssignment: (id) => {
      set((state) => {
        state.assignments = state.assignments.filter(a => a.id !== id)
      })
    },

    getAssignmentsByOrder: (orderId) => {
      return get().assignments.filter(a => a.orderId === orderId)
    },

    getAssignmentsByItem: (inventoryItemId) => {
      return get().assignments.find(a => a.inventoryItemId === inventoryItemId) || null
    }
  }))
)