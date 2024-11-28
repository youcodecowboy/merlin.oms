interface EventLog {
  event_type: string
  timestamp: Date
  actor_id: string
  metadata: Record<string, any>
}

export const eventLogger = {
  async logEvent(event: EventLog) {
    // Log to localStorage for now
    const events = JSON.parse(localStorage.getItem('events') || '[]')
    events.push(event)
    localStorage.setItem('events', JSON.stringify(events))
    
    // Later can be expanded to proper backend logging
  }
} 