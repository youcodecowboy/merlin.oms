import { Clock, Tag, MapPin, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { DBEvent } from "@/lib/schema/events"

interface EventTimelineProps {
  events?: DBEvent[]
}

export function EventTimeline({ events = [] }: EventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events recorded
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id}
          className="flex gap-4 p-4 border rounded-lg bg-card"
        >
          {/* Timeline Indicator */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-2 flex items-center justify-center">
              {getEventIcon(event.event_type)}
            </div>
            <div className="w-0.5 h-full bg-border" />
          </div>

          {/* Event Content */}
          <div className="flex-1 space-y-2">
            {/* Header - Responsive Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{event.event_type}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
              {event.created_by && (
                <Badge variant="secondary" className="self-start sm:self-auto">
                  {event.created_by}
                </Badge>
              )}
            </div>

            {/* Metadata Grid - Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(event.metadata)
                .filter(([_, value]) => value !== null && value !== undefined)
                .map(([key, value]) => (
                  <div 
                    key={key} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-muted-foreground mb-1 sm:mb-0">
                      {formatKey(key)}:
                    </span>
                    <span className="font-medium break-all">
                      {formatValue(value)}
                    </span>
                  </div>
              ))}
            </div>

            {/* Mobile Timeline Indicator */}
            <div className="flex sm:hidden items-center gap-2 mt-2 text-sm text-muted-foreground">
              <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                {getEventIcon(event.event_type)}
              </div>
              <span>{getEventDescription(event.event_type)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'ORDER_STATUS_CHANGED':
    case 'ITEM_STATUS_CHANGED':
      return <Tag className="h-4 w-4" />
    case 'ITEM_LOCATION_CHANGED':
      return <MapPin className="h-4 w-4" />
    case 'WASH_REQUEST_CREATED':
    case 'WASH_COMPLETED':
      return <Clock className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

function getEventDescription(eventType: string): string {
  return eventType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

function formatKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
} 