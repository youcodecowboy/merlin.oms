import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockDB } from '@/lib/mock-db/store'
import { formatDate } from '@/lib/utils/date'
import { Eye, CheckCircle2, XCircle } from 'lucide-react'

export function QCResultsTable() {
  const completedQCs = mockDB.requests.filter(req => 
    req.request_type === 'QC' && 
    req.status === 'COMPLETED'
  )

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item ID</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Inspector</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {completedQCs.map((qc) => (
            <TableRow key={qc.id}>
              <TableCell className="font-mono">{qc.item_id}</TableCell>
              <TableCell>{qc.metadata?.order_number}</TableCell>
              <TableCell>
                <Badge variant={
                  qc.metadata?.result === 'PASS' ? 'success' : 'destructive'
                }>
                  {qc.metadata?.result === 'PASS' ? (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {qc.metadata?.result}
                </Badge>
              </TableCell>
              <TableCell>{qc.metadata?.inspector}</TableCell>
              <TableCell>{formatDate(qc.metadata?.completed_at)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {qc.metadata?.notes || '-'}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {completedQCs.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No QC results available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 