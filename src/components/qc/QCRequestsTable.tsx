import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockDB } from '@/lib/mock-db/store'
import { formatDate } from '@/lib/utils/date'
import { Eye } from 'lucide-react'

export function QCRequestsTable() {
  const navigate = useNavigate()
  const qcRequests = mockDB.requests.filter(req => 
    req.request_type === 'QC' && 
    req.status !== 'COMPLETED'
  )

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Item ID</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qcRequests.map((request) => (
            <TableRow 
              key={request.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/qc/requests/${request.id}`)}
            >
              <TableCell className="font-mono">{request.id}</TableCell>
              <TableCell className="font-mono">{request.item_id}</TableCell>
              <TableCell>{request.metadata?.order_number}</TableCell>
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
                <Badge variant={request.priority === 'HIGH' ? 'destructive' : 'outline'}>
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(request.created_at)}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/qc/requests/${request.id}`)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {qcRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No QC requests pending
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 