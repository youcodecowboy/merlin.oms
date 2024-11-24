import { MockInventoryStore } from './types'

// Initialize mock data store
export const mockStore: MockInventoryStore = {
  inventoryItems: [
    {
      id: '1',
      sku: 'ST-32-S-32-RAW',
      status1: 'STOCK',
      status2: 'UNCOMMITTED',
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      sku: 'ST-32-S-32-RAW',
      status1: 'STOCK',
      status2: 'UNCOMMITTED',
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      sku: 'SL-30-R-34-BLK',
      status1: 'STOCK',
      status2: 'UNCOMMITTED',
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      sku: 'ST-28-X-30-RAW',
      status1: 'PRODUCTION',
      status2: 'UNCOMMITTED',
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      sku: 'SL-32-S-32-BLK',
      status1: 'STOCK',
      status2: 'COMMITTED',
      updated_at: new Date().toISOString()
    }
  ],
  commitments: [
    {
      sku: 'ST-32-S-32-RAW',
      committedQuantity: 0,
      uncommittedQuantity: 2,
      updated_at: new Date().toISOString()
    },
    {
      sku: 'SL-30-R-34-BLK',
      committedQuantity: 0,
      uncommittedQuantity: 1,
      updated_at: new Date().toISOString()
    }
  ],
  orders: [],
  pendingProduction: [],
  notifications: []
}

// Helper function to update store
export function updateStore(newState: Partial<MockInventoryStore>) {
  Object.assign(mockStore, newState)
}
// Add to store functionality
export function addToStore(store, item) {
  if (!store || !Array.isArray(store)) {
    throw new Error('Store must be an array.');
  }
  store.push(item);
  return store;
}

// Ensure this is part of the named exports
export { findInventoryItemById };
export function updateInStore(store, id, updatedData) {
  const index = store.findIndex((item) => item.id === id);
  if (index !== -1) {
    store[index] = { ...store[index], ...updatedData };
    return store[index];
  }
  throw new Error(`Item with id ${id} not found in store.`);
}

// Helper function to add notification
export function addNotification(type: 'PRODUCTION_REQUEST' | 'STOCK_ALERT', message: string) {
  const notification = {
    id: crypto.randomUUID(),
    type,
    message,
    created_at: new Date().toISOString(),
    read: false
  }

  mockStore.notifications = [notification, ...mockStore.notifications]
  return notification
}
