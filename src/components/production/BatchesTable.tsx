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
import { useProduction } from "@/contexts/ProductionContext"

export function BatchesTable() {
  const { cuttingBatches } = useProduction()

  return (
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
  )
}