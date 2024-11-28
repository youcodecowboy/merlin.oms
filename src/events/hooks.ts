import { useState, useEffect } from 'react'
import { eventLogger } from './logger'
import type { EventLog, EventType } from './types'

export function useEvents(filters?: Partial<EventLog>) {
  const [events, setEvents] = useState<EventLog[]>([])

  useEffect(() => {
    setEvents(eventLogger.getEvents(filters))
  }, [filters])

  return events
}

export function useEventsByType(type: EventType) {
  const [events, setEvents] = useState<EventLog[]>([])

  useEffect(() => {
    setEvents(eventLogger.getEventsByType(type))
  }, [type])

  return events
}

export function useLatestEvent(type: EventType) {
  const events = useEventsByType(type)
  return events[events.length - 1]
} 