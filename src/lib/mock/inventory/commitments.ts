import { mockStore, updateStore } from './store'
import { InvalidQuantityError } from './types'
import { IncompatibleWashError } from '/src/lib/mock/inventory/types';

export interface Commitment {
  sku: string
  committedQuantity: number
  uncommittedQuantity: number
  updated_at: string
}

export function getCommitments(sku: string): Commitment {
  // Count current inventory status
  const items = mockStore.inventory.filter(item => item.sku === sku)
  const committed = items.filter(item => item.status2 === 'COMMITTED').length
  const uncommitted = items.filter(item => item.status2 === 'UNCOMMITTED').length
  
  return {
    sku,
    committedQuantity: committed,
    uncommittedQuantity: uncommitted,
    updated_at: new Date().toISOString()
  }
}

export function updateCommitments(
  sku: string, 
  committedChange: number = 0,
  uncommittedChange: number = 0
): Commitment {
  const current = getCommitments(sku)
  const newCommitted = current.committedQuantity + committedChange
  const newUncommitted = current.uncommittedQuantity + uncommittedChange

  // Validate new quantities
  if (newCommitted < 0) {
    throw new InvalidQuantityError(
      `Cannot update commitments: resulting committed quantity (${newCommitted}) would be negative`
    )
  }

  if (newUncommitted < 0) {
    throw new InvalidQuantityError(
      `Cannot update commitments: resulting uncommitted quantity (${newUncommitted}) would be negative`
    )
  }

  // Update store
  const commitments = mockStore.commitments.filter(c => c.sku !== sku)
  commitments.push({
    sku,
    committedQuantity: newCommitted,
    uncommittedQuantity: newUncommitted,
    updated_at: new Date().toISOString()
  })
  updateStore({ commitments })

  return getCommitments(sku)
}
export class NoInventoryAvailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoInventoryAvailableError';
    }
}