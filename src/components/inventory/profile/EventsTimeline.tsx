import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"

interface Event {
  id: string
  type: string
  description: string
  timestamp: string
  user: string
  metadata?: Record<string, any>
}

interface EventsTimelineProps {
  itemId: string
}

export function EventsTimeline({ itemId }: EventsTimelineProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchEvents = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEvents([
        {
          id: '1',
          type: 'MOVEMENT',
          description: 'Moved to Bin STA-001',
          timestamp: new Date().toISOString(),
          user: 'John Smith'
        },
        {
          id: '2',
          type: 'STATUS_CHANGE',
          description: 'Status updated to WASH',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Jane Doe'
        }
      ])
      setLoading(false)
    }

    fetchEvents()
  }, [itemId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Events Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Events Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l-2 border-muted space-y-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                "relative pb-4",
                index === events.length - 1 && "pb-0"
              )}
            >
              {/* Timeline dot */}
              <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-background border-2 border-primary" />
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          event.type === 'MOVEMENT' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                          event.type === 'STATUS_CHANGE' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                          event.type === 'DEFECT' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        )}
                      >
                        {event.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        by {event.user}
                      </span>
                    </div>
                    <p className="font-medium">{event.description}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.timestamp), 'PPp')}
                  </p>
                </div>

                {event.metadata && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}