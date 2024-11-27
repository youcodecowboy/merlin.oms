import { useState, useEffect } from 'react'
import { getInventoryEvents } from '@/lib/functions/events/getInventoryEvents'
import type { InventoryEvent, TimelineStage } from '../types'
import { useToast } from '@/components/ui/use-toast'

export function useInventoryMetadata(itemId: string) {
  const [events, setEvents] = useState<InventoryEvent[]>([])
  const [timeline, setTimeline] = useState<TimelineStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMetadata = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch events
      const eventsData = await getInventoryEvents(itemId)
      if (!eventsData) {
        throw new Error('Failed to fetch events')
      }

      // Sort events by date
      const sortedEvents = [...eventsData].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setEvents(sortedEvents)

      // Build timeline from events
      const timelineData = buildTimelineFromEvents(sortedEvents)
      setTimeline(timelineData)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load metadata'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper to build timeline from events
  const buildTimelineFromEvents = (events: InventoryEvent[]): TimelineStage[] => {
    const timeline: TimelineStage[] = []
    
    // Process events to build timeline
    events.forEach(event => {
      if (event.type === 'PRODUCTION_STAGE_CHANGE') {
        const stage = event.metadata.stage as TimelineStage['stage']
        const status = event.metadata.status as TimelineStage['status']
        const existingStage = timeline.find(t => t.stage === stage)

        if (existingStage) {
          existingStage.status = status
          if (status === 'COMPLETED') {
            existingStage.completedAt = event.created_at
          }
          existingStage.metadata = {
            ...existingStage.metadata,
            ...event.metadata
          }
        } else {
          timeline.push({
            stage,
            status,
            completedAt: status === 'COMPLETED' ? event.created_at : undefined,
            metadata: event.metadata
          })
        }
      }
    })

    return timeline.sort((a, b) => 
      PRODUCTION_STAGES.indexOf(a.stage) - PRODUCTION_STAGES.indexOf(b.stage)
    )
  }

  useEffect(() => {
    if (itemId) {
      fetchMetadata()
    }
  }, [itemId])

  return {
    events,
    timeline,
    loading,
    error,
    refresh: fetchMetadata
  }
} 