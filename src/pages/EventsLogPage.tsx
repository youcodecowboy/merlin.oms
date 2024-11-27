import { PageLayout } from '@/components/PageLayout'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from 'react'
import type { TrackingEvent, EventClassifier } from '@/lib/schema/events'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from 'lucide-react'
import { eventTracker } from '@/lib/services/event-tracking'
import { cn } from "@/lib/utils"

const classifierStyles: Record<EventClassifier, string> = {
  creation: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  update: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  movement: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  request: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  completion: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  scan: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  system: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
}

export function EventsLogPage() {
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const loadAllEvents = async () => {
    try {
      setLoading(true)
      console.log('Loading events...')
      const allEvents = eventTracker.getAllEvents()
      console.log('Loaded events:', allEvents)
      setEvents(allEvents)
    } catch (error) {
      console.error('Failed to load events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllEvents()
    // Refresh every 5 seconds
    const interval = setInterval(loadAllEvents, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.type !== filter) return false
    if (search && !JSON.stringify(event).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const uniqueEventTypes = Array.from(new Set(events.map(e => e.type)))

  const debugEvents = () => {
    console.log('Local Storage:', localStorage.getItem('tracking-events'))
    console.log('Current Events:', events)
    eventTracker.debug()
  }

  return (
    <PageLayout title="Event Log">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {uniqueEventTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={loadAllEvents}
            >
              Refresh
            </Button>
            <Button variant="outline" onClick={debugEvents}>Debug</Button>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {event.type}
                      </Badge>
                      <Badge className={cn(
                        "text-xs",
                        classifierStyles[event.classifier]
                      )}>
                        {event.classifier}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {/* Operator info - safely access with optional chaining */}
                    {event.metadata.operator && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>By: {event.metadata.operator.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.metadata.operator.type}
                        </Badge>
                      </div>
                    )}

                    {/* Display metadata fields */}
                    {Object.entries(event.metadata).map(([key, value]) => {
                      // Skip operator since we display it separately
                      if (key === 'operator') return null
                      return (
                        <div key={key} className="text-xs">
                          <span className="font-medium">{key}:</span> {
                            typeof value === 'object' ? JSON.stringify(value) : value
                          }
                        </div>
                      )
                    })}

                    {/* Related events */}
                    {event.related_events && event.related_events.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Related Events: {event.related_events.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No events found
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </PageLayout>
  )
} 