import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'

export type EventType = 
  | 'COMMITMENT_CREATED'
  | 'COMMITMENT_FULFILLED'
  | 'ITEM_ASSIGNED'
  | 'ITEM_UNASSIGNED'
  | 'ORDER_STATUS_CHANGED'
  | 'INVENTORY_STATUS_CHANGED'

export interface EventLog {
  id: string
  type: EventType
  entityId: string // Order ID or Inventory Item ID
  entityType: 'ORDER' | 'INVENTORY'
  message: string
  timestamp: string
  metadata: Record<string, any>
}

interface EventLogStore {
  events: EventLog[]
  addEvent: (data: Omit<EventLog, 'id' | 'timestamp'>) => void
  getEventsByEntity: (entityId: string, entityType: 'ORDER' | 'INVENTORY') => EventLog[]
  getLatestEvents: (limit?: number) => EventLog[]
}

export const useEventLogStore = create<EventLogStore>()(
  immer((set, get) => ({
    events: [],

    addEvent: (data) => {
      set((state) => {
        state.events.unshift({
          ...data,
          id: uuidv4(),
          timestamp: new Date().toISOString()
        })
      })
    },

    getEventsByEntity: (entityId, entityType) => {
      return get().events
        .filter(e => e.entityId === entityId && e.entityType === entityType)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },

    getLatestEvents: (limit = 10) => {
      return get().events
        .slice(0, limit)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }
  }))
)