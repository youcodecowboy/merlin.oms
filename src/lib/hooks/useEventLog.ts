import { useCallback } from 'react'
import { useEventLogStore, type EventType } from '@/lib/stores/eventLogStore'

export function useEventLog() {
  const addEvent = useEventLogStore(state => state.addEvent)
  const getEventsByEntity = useEventLogStore(state => state.getEventsByEntity)

  const logOrderEvent = useCallback((
    orderId: string,
    type: EventType,
    message: string,
    metadata?: Record<string, any>
  ) => {
    addEvent({
      type,
      entityId: orderId,
      entityType: 'ORDER',
      message,
      metadata: metadata || {}
    })
  }, [addEvent])

  const logInventoryEvent = useCallback((
    itemId: string,
    type: EventType,
    message: string,
    metadata?: Record<string, any>
  ) => {
    addEvent({
      type,
      entityId: itemId,
      entityType: 'INVENTORY',
      message,
      metadata: metadata || {}
    })
  }, [addEvent])

  return {
    logOrderEvent,
    logInventoryEvent,
    getEventsByEntity
  }
}