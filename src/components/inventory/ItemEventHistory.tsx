import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useInventoryData } from '@/lib/hooks/useInventoryData'
import { Loader2 } from 'lucide-react'
import type { DBEvent } from '@/lib/schema/database'

interface ItemEventHistoryProps {
  itemId: string
}

export function ItemEventHistory({ itemId }: ItemEventHistoryProps) {
  const { events, loading, error } = useInventoryData(itemId)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        {error}
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <div className="p-4 space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{event.event_type}</Badge>
                  <Badge>{event.classifier}</Badge>
                </div>
                {event.metadata && (
                  <div className="text-sm text-muted-foreground">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(event.created_at).toLocaleString()}
              </div>
            </div>
          </Card>
        ))}

        {events.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No events found
          </div>
        )}
      </div>
    </ScrollArea>
  )
} 