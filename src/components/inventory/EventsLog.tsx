import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Event {
  id: string
  timestamp: string
  event: string
  user: string
  details?: string
}

interface EventsLogProps {
  itemId: string
}

export function EventsLog({ itemId }: EventsLogProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEvents: Event[] = [
      {
        id: 'e1',
        timestamp: new Date().toISOString(),
        event: 'Created',
        user: 'System',
        details: 'Initial creation'
      }
    ]

    setEvents(mockEvents)
    setLoading(false)
  }, [itemId])

  if (loading) {
    return <div className="p-4">Loading events...</div>
  }

  if (events.length === 0) {
    return <div className="p-4 text-muted-foreground">No events found</div>
  }

  return (
    <div className="p-4 space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex gap-4 text-sm">
          <div className="w-32 flex-shrink-0 text-muted-foreground">
            {format(new Date(event.timestamp), 'PP p')}
          </div>
          <div>
            <p>{event.event}</p>
            {event.details && (
              <p className="text-xs text-muted-foreground">{event.details}</p>
            )}
            <p className="text-xs text-muted-foreground">by {event.user}</p>
          </div>
        </div>
      ))}
    </div>
  )
}