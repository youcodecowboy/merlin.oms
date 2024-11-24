import { useState, useEffect } from "react"
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
import { ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { getMockProductionBatches, type ProductionBatch } from '@/lib/mock-api/production'

export function ProductionBatchesTable() {
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const loadBatches = async () => {
    try {
      setLoading(true)
      console.log('Loading production batches...')
      const result = await getMockProductionBatches()
      console.log('Loaded production batches:', result)
      setBatches(result || [])
    } catch (error) {
      console.error('Failed to load production batches:', error)
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [])

  const handleBatchClick = (batch: ProductionBatch) => {
    setSelectedBatch(batch)
    setIsDetailsOpen(true)
  }

  if (loading) {
    return <div>Loading batches...</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch ID</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches && batches.length > 0 ? (
            batches.map((batch) => (
              <TableRow 
                key={batch.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleBatchClick(batch)}
              >
                <TableCell className="font-mono">{batch.id}</TableCell>
                <TableCell className="font-mono">{batch.sku}</TableCell>
                <TableCell>{batch.quantity}</TableCell>
                <TableCell>
                  <Badge variant={
                    batch.status === 'COMPLETED' ? 'success' :
                    batch.status === 'IN_PROGRESS' ? 'warning' :
                    'default'
                  }>
                    {batch.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(batch.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No batches found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedBatch && (
        <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Production Batch {selectedBatch.id}</SheetTitle>
              <SheetDescription>
                Created {format(new Date(selectedBatch.created_at), 'PPP p')}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Batch Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-mono font-medium">{selectedBatch.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{selectedBatch.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedBatch.status === 'COMPLETED' ? 'success' :
                    selectedBatch.status === 'IN_PROGRESS' ? 'warning' :
                    'default'
                  }>
                    {selectedBatch.status}
                  </Badge>
                </div>
              </div>

              {/* QR Codes List */}
              <div>
                <h3 className="text-sm font-medium mb-2">QR Codes</h3>
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {selectedBatch.qr_codes.map((code, index) => (
                      <div 
                        key={code}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-mono">Unit {index + 1}</span>
                        <span className="font-mono">{code}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Notes */}
              {selectedBatch.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Notes</h3>
                  <div className="text-sm p-4 bg-muted rounded-md">
                    {selectedBatch.notes}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
} 