import { useEffect, useState } from 'react'
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
import { getBatches, type ProductionBatch } from '@/lib/services/batches'
import { generateBatchQRPdf } from '@/lib/utils/qr-generator'
import { Printer } from 'lucide-react'

export function BatchesTable() {
  const [batches, setBatches] = useState<ProductionBatch[]>([])

  useEffect(() => {
    setBatches(getBatches())
  }, [])

  const handlePrintQR = async (batch: ProductionBatch) => {
    // Generate QR codes for the batch
    const qrPdfBlob = await generateBatchQRPdf(
      Array(batch.quantity).fill({ id: batch.id, sku: batch.sku }), 
      batch.id
    )
    
    // Create download link
    const url = URL.createObjectURL(qrPdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch-${batch.id}-qr-codes.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
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
        {batches.map((batch) => (
          <TableRow 
            key={batch.id}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell className="font-mono">{batch.id}</TableCell>
            <TableCell>{batch.sku}</TableCell>
            <TableCell>{batch.quantity}</TableCell>
            <TableCell>
              <Badge variant={
                batch.status === 'PATTERN_REQUESTED' ? 'warning' :
                batch.status === 'CUTTING' ? 'secondary' :
                'default'
              }>
                {batch.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(batch.created_at).toLocaleString()}</TableCell>
            <TableCell>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePrintQR(batch)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print QR
              </Button>
            </TableCell>
          </TableRow>
        ))}

        {batches.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
              No production batches
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}