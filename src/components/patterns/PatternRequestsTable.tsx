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
import { Checkbox } from "@/components/ui/checkbox"
import { getMockRequests, createMockRequest } from '@/lib/mock-api/requests'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Request, RequestType } from '@/lib/schema'
import { updateBatchToCutting } from '@/lib/services/production'
import { toast } from "@/components/ui/use-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"

export function PatternRequestsTable() {
  const [requests, setRequests] = useState<Request[]>([])
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      setLoading(true)
      const allRequests = await getMockRequests()
      const patternRequests = allRequests.filter(r => r.request_type === 'PATTERN_REQUEST')
      setRequests(patternRequests)
    } catch (error) {
      console.error('Failed to load pattern requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadRequests()
  }, [])

  // Refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(loadRequests, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId)
      }
      return [...prev, requestId]
    })
  }

  const handleCreateCuttingRequest = async () => {
    if (selectedRequests.length === 0) return

    try {
      // Get selected pattern requests
      const selectedItems = requests.filter(r => selectedRequests.includes(r.id))
      const totalQuantity = selectedItems.reduce((sum, item) => sum + (item.metadata?.quantity || 0), 0)

      // Create the cutting request
      const cuttingRequest = await createMockRequest({
        request_type: 'CUTTING_REQUEST' as RequestType,
        status: 'PENDING',
        priority: 'MEDIUM',
        metadata: {
          pattern_requests: selectedRequests,
          pattern_details: selectedItems.map(item => ({
            id: item.id,
            sku: item.metadata?.sku,
            quantity: item.metadata?.quantity
          })),
          total_quantity: totalQuantity,
          notes: `Combined cutting request for ${selectedRequests.length} patterns`
        }
      })

      // Update status of all related batches
      for (const item of selectedItems) {
        if (item.metadata?.batch_id) {
          await updateBatchToCutting(item.metadata.batch_id)
        }
      }

      // Clear selections and refresh
      setSelectedRequests([])
      loadRequests()

      toast({
        title: "Cutting Request Created",
        description: `Created cutting request for ${selectedRequests.length} patterns`
      })

    } catch (error) {
      console.error('Failed to create cutting request:', error)
      toast({
        title: "Error",
        description: "Failed to create cutting request",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div>Loading pattern requests...</div>
  }

  return (
    <Tabs defaultValue="patterns" className="space-y-4">
      <TabsList>
        <TabsTrigger value="patterns">Pattern Requests</TabsTrigger>
        <TabsTrigger value="cutting">Cutting Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="patterns">
        <div className="space-y-4">
          {selectedRequests.length > 0 && (
            <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
              <div>
                <span className="font-medium">{selectedRequests.length} items selected</span>
              </div>
              <Button onClick={handleCreateCuttingRequest}>
                Create Cutting Request
              </Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRequests.includes(request.id)}
                      onCheckedChange={() => handleSelectRequest(request.id)}
                    />
                  </TableCell>
                  <TableCell>{request.metadata?.sku}</TableCell>
                  <TableCell>{request.metadata?.quantity}</TableCell>
                  <TableCell>{new Date(request.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      request.status === 'COMPLETED' ? 'success' :
                      request.status === 'IN_PROGRESS' ? 'warning' :
                      'default'
                    }>
                      {request.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No pattern requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="cutting">
        <CuttingRequestsTable />
      </TabsContent>
    </Tabs>
  )
}

function CuttingRequestsTable() {
  const [requests, setRequests] = useState<Request[]>([])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadCuttingRequests = async () => {
      const allRequests = await getMockRequests()
      const cuttingRequests = allRequests.filter(r => r.request_type === 'CUTTING_REQUEST')
      setRequests(cuttingRequests)
    }
    loadCuttingRequests()
  }, [])

  const toggleExpanded = (requestId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Request ID</TableHead>
          <TableHead>Total Quantity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
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
              <TableCell>{request.id}</TableCell>
              <TableCell>{request.metadata?.total_quantity}</TableCell>
              <TableCell>
                <Badge>{request.status}</Badge>
              </TableCell>
              <TableCell>{new Date(request.created_at).toLocaleString()}</TableCell>
            </TableRow>
            {expandedRows[request.id] && (
              <TableRow>
                <TableCell colSpan={5} className="bg-muted/30 p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Included SKUs</h4>
                      <div className="space-y-2">
                        {request.metadata?.pattern_requests?.map((patternId: string) => {
                          const pattern = requests.find(r => r.id === patternId)
                          return (
                            <div key={patternId} className="flex items-center justify-between">
                              <div>
                                <span className="font-mono">{pattern?.metadata?.sku}</span>
                                <span className="ml-4 text-muted-foreground">
                                  Quantity: {pattern?.metadata?.quantity}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {pattern?.status}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {request.metadata?.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.metadata.notes}
                        </p>
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
            <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
              No cutting requests found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
} 