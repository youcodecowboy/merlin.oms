import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import type { EventLog } from '@/lib/stores/eventLogStore'

interface EventLogTimelineProps {
  events: EventLog[]
  className?: string
}

export function EventLogTimeline({ events, className }: EventLogTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No events recorded
      </div>
    )
  }

  return (
    <ScrollArea className={cn("h-[400px]", className)}>
      <div className="relative pl-6 border-l-2 border-muted space-y-4 p-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="relative"
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
                        event.type.includes('COMMITMENT') && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        event.type.includes('ASSIGNED') && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                        event.type.includes('STATUS') && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      )}
                    >
                      {event.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {event.entityType}
                    </span>
                  </div>
                  <p className="font-medium">{event.message}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.timestamp), 'PPp')}
                </p>
              </div>

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
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
    </ScrollArea>
  )
}