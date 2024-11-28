import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StepsCard } from '@/components/requests/StepsCard'
import { EventTimeline } from '@/components/events/EventTimeline'
import { ArrowLeft, Package } from "lucide-react"
import { mockDB } from '@/lib/mock-db/store'
import { formatDate } from '@/lib/utils/date'

export function QCRequest() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('QCRequest mounted, id:', id)
    console.log('mockDB.requests:', mockDB.requests)
  }, [id])

  // Find the QC request
  const request = mockDB.requests.find(r => {
    console.log('Checking request:', r.id, r.request_type, 'against:', id)
    return r.id === id && r.request_type === 'QC'
  })
  
  // Find associated inventory item
  const item = request ? mockDB.inventory_items.find(i => i.id === request.item_id) : null

  console.log('Found request:', request)
  console.log('Found item:', item)
  
  // Find associated events
  const events = mockDB.events.filter(e => 
    (e.item_id === request?.item_id && e.created_at >= request?.created_at) ||
    e.metadata?.request_id === request?.id
  )

  // Always render the layout, even if we don't find the request
  return (
    <PageLayout>
      {!request || !item ? (
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/qc')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to QC
          </Button>
          <h1 className="text-xl font-bold">Request Not Found</h1>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/qc')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to QC
            </Button>
            <h1 className="text-xl font-bold">QC Request {request.id}</h1>
            <Badge variant={
              request.status === 'COMPLETED' ? 'success' :
              request.status === 'IN_PROGRESS' ? 'default' :
              'secondary'
            }>
              {request.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Item Details Card */}
              <Card className="p-6">
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

              {/* Event Timeline */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Event History</h2>
                <EventTimeline events={events} />
              </Card>
            </div>

            {/* Right Column - Steps */}
            <div>
              <StepsCard
                requestId={request.id}
                steps={request.metadata?.steps || []}
                status={request.status}
              />
            </div>
          </div>
        </>
      )}
    </PageLayout>
  )
} 