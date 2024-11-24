import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Scissors, ChevronRight } from "lucide-react"
import type { Request } from "@/lib/schema"
import { CreateCuttingBatchDialog } from './CreateCuttingBatchDialog'
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { useProduction } from '@/contexts/ProductionContext'

interface CuttingBatchEvent {
  timestamp: string
  event: string
  user?: string
}

interface CuttingBatch {
  id: string
  created_at: string
  patterns: Request[]
  cuttingStatus: 'PICK_UP' | 'CUTTING' | 'ORGANIZING' | 'COMPLETE'
  fabricCode: string
  layers: number
  notes?: string
  assignedTo?: string
  events: CuttingBatchEvent[]
}

interface PatternRequestsTableProps {
  requests: Request[]
  onEdit?: (request: Request) => void
  onCreateBatch?: (selectedRequests: Request[]) => void
}

export function PatternRequestsTable({ 
  requests: initialRequests, 
  onEdit,
  onCreateBatch 
}: PatternRequestsTableProps) {
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set())
  const { cuttingBatches, addCuttingBatch } = useProduction()
  const [selectedBatch, setSelectedBatch] = useState<CuttingBatch | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [createBatchDialogOpen, setCreateBatchDialogOpen] = useState(false)

  const toggleSelection = (requestId: string) => {
    const newSelection = new Set(selectedRequests)
    if (newSelection.has(requestId)) {
      newSelection.delete(requestId)
    } else {
      newSelection.add(requestId)
    }
    setSelectedRequests(newSelection)
  }

  const handleCreateBatchClick = () => {
    setCreateBatchDialogOpen(true)
  }

  const handleCreateBatchSubmit = (formData: { fabricCode: string; layers: number; notes?: string }) => {
    const selectedItems = requests.filter(request => 
      selectedRequests.has(request.id!)
    )
    
    const newBatch: CuttingBatch = {
      id: `batch_${Date.now()}`,
      created_at: new Date().toISOString(),
      patterns: selectedItems,
      cuttingStatus: 'PICK_UP',
      fabricCode: formData.fabricCode,
      layers: formData.layers,
      notes: formData.notes,
      events: [{
        timestamp: new Date().toISOString(),
        event: 'Batch created',
        user: 'System'
      }]
    }
    
    addCuttingBatch(newBatch)
    const remainingRequests = requests.filter(
      request => !selectedRequests.has(request.id!)
    )
    setRequests(remainingRequests)
    onCreateBatch?.(selectedItems)
    setSelectedRequests(new Set())
  }

  const handleBatchClick = (batch: CuttingBatch) => {
    setSelectedBatch(batch)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">Pattern Requests</TabsTrigger>
          <TabsTrigger value="batches">Cutting Batches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          {selectedRequests.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm">
                {selectedRequests.size} request{selectedRequests.size > 1 ? 's' : ''} selected
              </span>
              <Button
                onClick={handleCreateBatchClick}
                className="flex items-center gap-2"
              >
                <Scissors className="h-4 w-4" />
                Create Cutting Batch
              </Button>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedRequests.size === requests.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRequests(new Set(requests.map(r => r.id!)))
                      } else {
                        setSelectedRequests(new Set())
                      }
                    }}
                  />
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow 
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedRequests.has(request.id!)}
                      onCheckedChange={() => toggleSelection(request.id!)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-mono">{request.inventory_item_id || 'N/A'}</TableCell>
                  <TableCell>{request.pattern_details?.quantity || 1}</TableCell>
                  <TableCell>
                    <Badge variant={
                      request.priority === 'URGENT' ? 'destructive' :
                      request.priority === 'HIGH' ? 'warning' :
                      request.priority === 'LOW' ? 'secondary' :
                      'default'
                    }>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.created_at && new Date(request.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="batches">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead>Fabric Code</TableHead>
                <TableHead>Layers</TableHead>
                <TableHead>Cutting Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuttingBatches.map((batch) => (
                <TableRow 
                  key={batch.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleBatchClick(batch)}
                >
                  <TableCell className="font-mono">{batch.id}</TableCell>
                  <TableCell>
                    {batch.patterns.reduce((total, pattern) => 
                      total + (pattern.pattern_details?.quantity || 1), 0
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{batch.fabricCode}</TableCell>
                  <TableCell>{batch.layers}</TableCell>
                  <TableCell>
                    <Badge variant={
                      batch.cuttingStatus === 'COMPLETE' ? 'success' :
                      batch.cuttingStatus === 'CUTTING' ? 'warning' :
                      batch.cuttingStatus === 'ORGANIZING' ? 'info' :
                      'default'
                    }>
                      {batch.cuttingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(batch.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cutting Batch {selectedBatch?.id}</SheetTitle>
            <SheetDescription>
              Created {selectedBatch?.created_at && format(new Date(selectedBatch.created_at), 'PPP p')}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Batch Status and Assignment */}
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={
                  selectedBatch?.cuttingStatus === 'COMPLETE' ? 'success' :
                  selectedBatch?.cuttingStatus === 'CUTTING' ? 'warning' :
                  selectedBatch?.cuttingStatus === 'ORGANIZING' ? 'info' :
                  'default'
                }>
                  {selectedBatch?.cuttingStatus}
                </Badge>
              </div>
              <div className="text-sm">
                {selectedBatch?.assignedTo ? (
                  <span>Assigned to: <span className="font-medium">{selectedBatch.assignedTo}</span></span>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>

            {/* Batch Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Fabric Code</p>
                <p className="font-mono font-medium">{selectedBatch?.fabricCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Layers</p>
                <p className="font-medium">{selectedBatch?.layers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patterns</p>
                <p className="font-medium">{selectedBatch?.patterns.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
                <p className="font-medium">
                  {selectedBatch?.patterns.reduce((total, pattern) => 
                    total + (pattern.pattern_details?.quantity || 1), 0
                  )}
                </p>
              </div>
            </div>

            {/* Patterns List */}
            <div>
              <h3 className="text-sm font-medium mb-2">Patterns in Batch</h3>
              <ScrollArea className="h-[120px] rounded-md border">
                <div className="p-4 space-y-2">
                  {selectedBatch?.patterns.map((pattern) => (
                    <div 
                      key={pattern.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-mono">{pattern.inventory_item_id}</span>
                      <span>× {pattern.pattern_details?.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Cutting Notes */}
            {selectedBatch?.notes && (
              <div>
                <h3 className="text-sm font-medium mb-2">Cutting Notes</h3>
                <div className="text-sm p-4 bg-muted rounded-md">
                  {selectedBatch.notes}
                </div>
              </div>
            )}

            {/* Events Timeline */}
            <div>
              <h3 className="text-sm font-medium mb-2">Events</h3>
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4 space-y-4">
                  {selectedBatch?.events?.map((event, index) => (
                    <div key={index} className="flex gap-4 text-sm">
                      <div className="w-32 flex-shrink-0 text-muted-foreground">
                        {format(new Date(event.timestamp), 'PP p')}
                      </div>
                      <div>
                        <p>{event.event}</p>
                        {event.user && (
                          <p className="text-xs text-muted-foreground">by {event.user}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CreateCuttingBatchDialog
        open={createBatchDialogOpen}
        onClose={() => setCreateBatchDialogOpen(false)}
        selectedPatterns={requests.filter(request => selectedRequests.has(request.id!))}
        onCreateBatch={handleCreateBatchSubmit}
      />
    </div>
  )
} 