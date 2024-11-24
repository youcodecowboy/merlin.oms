import { useState } from 'react'
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
import { useRequests } from '@/contexts/RequestsContext'
import { RequestDetailsDialog } from './RequestDetailsDialog'
import type { Request } from '@/lib/schema'

interface RequestsTableProps {
  type: 'all' | 'STOCK_PULL' | 'WASH_TRANSFER' | 'MOVE_REQUEST'
}

export function RequestsTable({ type }: RequestsTableProps) {
  const { requests, loading } = useRequests()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (loading) {
    return <div>Loading requests...</div>
  }

  const filteredRequests = requests ? (
    type === 'all' 
      ? requests 
      : requests.filter(request => request.request_type === type)
  ) : []

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono">{request.id}</TableCell>
                <TableCell>
                  <Badge>
                    {request.request_type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    request.status === 'COMPLETED' ? 'success' :
                    request.status === 'IN_PROGRESS' ? 'warning' :
                    request.status === 'CANCELLED' ? 'destructive' :
                    'default'
                  }>
                    {request.status}
                  </Badge>
                </TableCell>
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
                <TableCell>
                  {request.assigned_to || 'Unassigned'}
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request)
                      setDetailsOpen(true)
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedRequest && (
        <RequestDetailsDialog
          request={selectedRequest}
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false)
            setSelectedRequest(null)
          }}
        />
      )}
    </>
  )
}