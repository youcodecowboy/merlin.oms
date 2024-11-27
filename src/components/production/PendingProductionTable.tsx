import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AcceptProductionDialog } from './AcceptProductionDialog'
import { getPendingRequests, acceptMockProductionRequest } from '@/lib/services/production'
import { toast } from "@/components/ui/use-toast"
import { getMockOrder } from '@/lib/mock-api/orders'
import { getWaitlistForSku } from '@/lib/services/waitlist'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { PendingProduction, Order, WaitlistEntry } from '@/lib/schema'

export function PendingProductionTable() {
  const [requests, setRequests] = useState<PendingProduction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PendingProduction | null>(null)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [requestDetails, setRequestDetails] = useState<Record<string, { order?: Order, waitlist?: WaitlistEntry[] }>>({})

  const loadRequests = async () => {
    try {
      setLoading(true)
      const result = await getPendingRequests()
      console.log('Loaded pending requests:', result)
      setRequests(result)

      // Load details for each request
      const details: Record<string, { order?: Order, waitlist?: WaitlistEntry[] }> = {}
      for (const request of result) {
        if (request.order_id) {
          const order = await getMockOrder(request.order_id)
          if (order) details[request.id] = { order }
        }
        const waitlist = await getWaitlistForSku(request.sku)
        if (waitlist.length) {
          details[request.id] = { ...details[request.id], waitlist }
        }
      }
      setRequestDetails(details)
    } catch (error) {
      console.error('Failed to load pending production:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleAcceptClick = (request: PendingProduction) => {
    setSelectedRequest(request)
    setAcceptDialogOpen(true)
  }

  const handleAccept = async (batchId: string) => {
    if (!selectedRequest) return

    try {
      await acceptMockProductionRequest(selectedRequest.id, batchId)
      toast({
        title: "Production Request Accepted",
        description: "Production batch created successfully"
      })
      setAcceptDialogOpen(false)
      setSelectedRequest(null)
      loadRequests() // Reload the table
    } catch (error) {
      console.error('Failed to accept request:', error)
      toast({
        title: "Error",
        description: "Failed to accept production request",
        variant: "destructive"
      })
    }
  }

  const toggleExpanded = (requestId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }))
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <>
              <TableRow key={request.id}>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleExpanded(request.id)}
                  >
                    {expandedRows[request.id] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                </TableCell>
                <TableCell>{request.sku}</TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>
                  <Badge>{request.priority}</Badge>
                </TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>{new Date(request.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    onClick={() => handleAcceptClick(request)}
                  >
                    Accept
                  </Button>
                </TableCell>
              </TableRow>
              {expandedRows[request.id] && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-muted/30 p-4">
                    <div className="space-y-4">
                      {requestDetails[request.id]?.order && (
                        <div>
                          <h4 className="font-medium mb-2">Order Details</h4>
                          <div className="space-y-1 text-sm">
                            <div>Order #{requestDetails[request.id].order?.number}</div>
                            <div>Customer: {requestDetails[request.id].order?.customer.name}</div>
                          </div>
                        </div>
                      )}
                      {requestDetails[request.id]?.waitlist && (
                        <div>
                          <h4 className="font-medium mb-2">Waitlist Entries</h4>
                          <div className="space-y-2">
                            {requestDetails[request.id].waitlist?.map((entry, i) => (
                              <div key={i} className="text-sm">
                                <div>Position #{entry.position}</div>
                                <div className="text-muted-foreground">
                                  Original SKU: {entry.sku}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}

          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                No pending production requests
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AcceptProductionDialog
        request={selectedRequest}
        open={acceptDialogOpen}
        onClose={() => {
          setAcceptDialogOpen(false)
          setSelectedRequest(null)
        }}
        onAccept={handleAccept}
      />
    </>
  )
}