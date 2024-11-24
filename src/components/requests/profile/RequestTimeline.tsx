import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"

interface TimelineEvent {
  id: string
  type: string
  description: string
  timestamp: Date
  user: string
}

interface RequestTimelineProps {
  events: TimelineEvent[]
}

export function RequestTimeline({ events }: RequestTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
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
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-muted-foreground">
                      by {event.user}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(event.timestamp, 'PPp')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}