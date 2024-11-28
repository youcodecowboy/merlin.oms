import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { StepsCard } from '@/components/requests/StepsCard'
import { EventTimeline } from '@/components/events/EventTimeline'
import { Package, Clock } from "lucide-react"
import { mockDB } from '@/lib/mock-db/store'
import { formatDate } from '@/lib/utils/date'

interface QCRequestDrawerProps {
  requestId: string | null
  onClose: () => void
}

export function QCRequestDrawer({ requestId, onClose }: QCRequestDrawerProps) {
  const [request, setRequest] = useState<any>(null)
  const [item, setItem] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (requestId) {
      const foundRequest = mockDB.requests.find(r => r.id === requestId)
      setRequest(foundRequest)

      if (foundRequest) {
        const foundItem = mockDB.inventory_items.find(i => i.id === foundRequest.item_id)
        setItem(foundItem)

        const relatedEvents = mockDB.events.filter(e => 
          (e.item_id === foundRequest.item_id && e.created_at >= foundRequest.created_at) ||
          e.metadata?.request_id === foundRequest.id
        )
        setEvents(relatedEvents)
      }
    }
  }, [requestId])

  if (!request || !item) return null

  return (
    <Sheet open={!!requestId} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-4">
            QC Request {request.id}
            <Badge variant={
              request.status === 'COMPLETED' ? 'success' :
              request.status === 'IN_PROGRESS' ? 'default' :
              'secondary'
            }>
              {request.status}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Item Details Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-4">Item Details</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{item.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current SKU: </span>
                    <span className="font-mono">{item.current_sku}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target SKU: </span>
                    <span className="font-mono">{item.target_sku}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location: </span>
                    <Badge variant="outline">{item.location}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Request Details Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Request Details</h2>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Created: </span>
                <span>{formatDate(request.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Priority: </span>
                <Badge variant={request.priority === 'HIGH' ? 'destructive' : 'outline'}>
                  {request.priority}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Order: </span>
                <span className="font-mono">{request.metadata?.order_number}</span>
              </div>
            </div>
          </Card>

          {/* Steps Card */}
          <StepsCard
            requestId={request.id}
            steps={request.metadata?.steps || []}
            status={request.status}
          />

          {/* Event Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Event History</h2>
            <EventTimeline events={events} />
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
} 