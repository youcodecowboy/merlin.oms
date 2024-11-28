import { EventType, EventLog, BaseEventLog } from './types'
import { persistState } from '@/lib/mock-db/store'

class EventLogger {
  private events: EventLog[] = []
  private STORAGE_KEY = 'eventLogs'

  constructor() {
    this.loadEvents()
  }

  private loadEvents() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.events = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  private persistEvents() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events))
      persistState() // Also persist to mock-db
    } catch (error) {
      console.error('Failed to persist events:', error)
    }
  }

  async logEvent(event: Omit<EventLog, 'event_id'>) {
    const eventLog: EventLog = {
      ...event,
      event_id: crypto.randomUUID(),
      timestamp: new Date()
    }

    this.events.push(eventLog)
    this.persistEvents()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${event.event_type}]`, event)
    }

    return eventLog
  }

  getEvents(filters?: Partial<EventLog>): EventLog[] {
    if (!filters) return this.events

    return this.events.filter(event => {
      return Object.entries(filters).every(([key, value]) => 
        event[key as keyof EventLog] === value
      )
    })
  }

  getEventsByType(type: EventType): EventLog[] {
    return this.events.filter(event => event.event_type === type)
  }

  getEventsByTimeRange(start: Date, end: Date): EventLog[] {
    return this.events.filter(event => {
      const timestamp = new Date(event.timestamp)
      return timestamp >= start && timestamp <= end
    })
  }

  clearEvents() {
    this.events = []
    this.persistEvents()
  }
}

export const eventLogger = new EventLogger() 