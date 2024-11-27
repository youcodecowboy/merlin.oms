import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getWashRequests } from '@/lib/functions/wash/getWashRequests'
import { RequestDrawer } from '@/components/requests/RequestDrawer'
import { InventoryItemLink } from '@/components/inventory/InventoryItemLink'
import { mockDB } from '@/lib/mock-db/store'
import type { DBRequest } from '@/lib/schema/database'
import { OrderLink } from '@/components/orders/OrderLink'

// Define wash bin types
const WASH_BINS = {
  STA: 'STARDUST',
  IND: 'INDIGO',
  ONX: 'ONYX',
  JAG: 'JAGGER'
} as const

type WashBin = keyof typeof WASH_BINS

export function Wash() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<DBRequest[]>(getWashRequests())
  const [selectedRequest, setSelectedRequest] = useState<DBRequest | null>(null)
  const [selectedBinTab, setSelectedBinTab] = useState<WashBin>('STA')

  const handleClearWashRequests = () => {
    try {
      // Clear all wash requests
      mockDB.requests = mockDB.requests.filter(r => r.request_type !== 'WASHING')
      // Update local state
      setRequests([])
    } catch (error) {
      console.error("Failed to clear wash requests", error)
    }
  }

  // Calculate steps progress
  const getStepsProgress = (request: DBRequest) => {
    const steps = request.metadata?.steps || []
    const completed = steps.filter(step => step.status === 'COMPLETED').length
    const total = steps.length
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    }
  }

  // Get items in each bin
  const getBinItems = (binCode: WashBin) => {
    return mockDB.inventory_items.filter(item => 
      item.location === `WASH-${binCode}`
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <h1 className="text-2xl font-bold">Wash Department</h1>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">REQUESTS</TabsTrigger>
          <TabsTrigger value="bins">BINS</TabsTrigger>
          <TabsTrigger value="laundry">LAUNDRY</TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card className="p-6">
            <div className="flex justify-end mb-4">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClearWashRequests}
              >
                Clear All Wash Requests
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const progress = getStepsProgress(request)
                  return (
                    <TableRow 
                      key={request.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>{request.id}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={progress.percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {progress.completed} of {progress.total} steps completed
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'PENDING' ? 'secondary' :
                          request.status === 'IN_PROGRESS' ? 'default' :
                          'outline'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          request.priority === 'HIGH' ? 'destructive' :
                          request.priority === 'MEDIUM' ? 'default' :
                          'secondary'
                        }>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Bins Tab */}
        <TabsContent value="bins">
          <Card className="p-6">
            <Tabs value={selectedBinTab} onValueChange={(v) => setSelectedBinTab(v as WashBin)}>
              <TabsList className="mb-4">
                {Object.entries(WASH_BINS).map(([code, name]) => (
                  <TabsTrigger key={code} value={code}>
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(WASH_BINS).map((binCode) => (
                <TabsContent key={binCode} value={binCode}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item ID</TableHead>
                        <TableHead>Order #</TableHead>
                        <TableHead>Added to Bin</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getBinItems(binCode as WashBin).map((item) => (
                        <TableRow 
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell>
                            <InventoryItemLink 
                              item={item} 
                              className="font-mono"
                            >
                              {item.id}
                            </InventoryItemLink>
                          </TableCell>
                          <TableCell>
                            {item.order_id && (
                              <OrderLink order={item} />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {new Date(item.updated_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <InventoryItemLink item={item}>
                              View Details
                            </InventoryItemLink>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getBinItems(binCode as WashBin).length === 0 && (
                        <TableRow>
                          <TableCell 
                            colSpan={4} 
                            className="text-center text-muted-foreground py-4"
                          >
                            No items in this bin
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </TabsContent>

        {/* Laundry Tab */}
        <TabsContent value="laundry">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              No active laundry items
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Drawer */}
      <RequestDrawer
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  )
} 